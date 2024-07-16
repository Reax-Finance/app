import { Box, useDisclosure, Text, Flex, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { ADDRESS_ZERO, ONE_ETH } from "../../src/const";
import { useToast } from "@chakra-ui/react";
import useUpdateData from "../utils/useUpdateData";
import Big from "big.js";
import { formatInput, parseInput } from "../utils/number";
import { useAppData } from "../context/AppDataProvider";
import { ArrowRightIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { BigNumber, ethers } from "ethers";
import TokenSelector from "../swap/TokenSelector";
import { useRouter } from "next/router";
import useApproval from "../context/useApproval";
import RemoveLiquidityLayout from "./RemoveLiquidityLayout";
import { Account, Asset } from "../utils/types";
import useChainData from "../context/useChainData";

interface ApprovalStep {
  type: "APPROVAL" | "PERMIT" | "DELEGATION";
  execute: any;
  loading?: boolean;
  data: {
    token: Asset;
    amount: string;
  };
}

interface RemoveLiquidityProps {
  updatedAccount: Account | undefined;
  setUpdatedAccount: (account: Account) => void;
  account: Account | undefined;
  tabIndex: number;
  marketIndex: number;
}

function RemoveLiquidity({
  updatedAccount,
  setUpdatedAccount,
  account,
  tabIndex,
  marketIndex,
}: RemoveLiquidityProps) {
  const [inputAssetIndex, setInputAssetIndex] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const { isConnected, address, chain } = useAccount();

  const {
    isOpen: isInputOpen,
    onOpen: onInputOpen,
    onClose: onInputClose,
  } = useDisclosure();

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { getUpdateData, getUpdateFee } = useUpdateData();
  const { synths, routerAddress } = useAppData();
  const router = useRouter();

  const {
    approve,
    loading: approvalLoading,
    data: approvalData,
    deadline: approvalDeadline,
    approvedAmount,
    reset: resetApproval,
  } = useApproval({});
  // approve lp tokens
  const {
    approve: approveLp,
    loading: approvalLpLoading,
    data: approvalLpData,
    deadline: approvalLpDeadline,
    approvedAmount: approvedLpAmount,
    reset: resetApprovalLp,
  } = useApproval({});
  const { getContract, send, rxRouter } = useChainData();

  // only if vaults[i].userBalance > 0
  const tokens = synths[marketIndex]
    ? synths[marketIndex].market.vaults
        .filter(
          (vault) =>
            (Big(vault.vaultToken.walletBalance.toString()).gt(0) ||
              Big(account?.userTotalBalanceUSD?.toString() || 0).eq(0)) &&
            vault.asset.id !== ethers.constants.AddressZero
        )
        .map((vault) => ({
          ...vault.vaultToken,
          name: vault.asset.name,
          symbol: vault.asset.symbol,
          decimals: vault.asset.decimals,
          asset: vault.asset,
        }))
    : [];

  const outToken = synths[marketIndex]?.synth;
  const inToken = tokens[inputAssetIndex];
  const debtToken = synths[marketIndex]?.market.debtToken;

  useEffect(() => {
    if (tabIndex == 1) {
      setInputAmount("");
      setOutputAmount("");
    }
  }, [tabIndex]);

  useEffect(() => {
    if (tokens.length > 1) {
      const assetIndex = tokens.findIndex(
        (token) =>
          token.id.toLowerCase() ==
          router.query?.inputCurrency?.toString().toLowerCase()
      );
      if (assetIndex >= 0) setInputAssetIndex(assetIndex);
    }
  }, [tokens, inputAssetIndex]);

  useEffect(() => {
    if (!account || !synths[marketIndex] || !outToken) return;

    const inUsdScaled = inToken
      ? Big(Number(inputAmount) || 0)
          .mul(Big(inToken.asset.price.toString()).div(10 ** 8))
          .mul(ONE_ETH)
      : Big(0);
    // console.log("inUsdScaled", inUsdScaled.toString(), inToken);
    let userTotalBalanceUSD = Big(account.userTotalBalanceUSD.toString()).sub(
      inUsdScaled
    );
    // console.log("inUsdScaled-userTotalBalanceUSD", userTotalBalanceUSD.toString());
    let userAdjustedBalanceUSD = Big(
      account.userAdjustedBalanceUSD.toString()
    ).sub(
      inUsdScaled.mul(
        Big(
          synths[marketIndex].market.vaults[
            inputAssetIndex
          ].config.baseLTV.toString()
        ).div(10000)
      )
    );
    let userThresholdBalanceUSD = Big(
      account.userThresholdBalanceUSD.toString()
    ).sub(
      inUsdScaled.mul(
        Big(
          synths[marketIndex].market.vaults[
            inputAssetIndex
          ].config.liquidationThreshold.toString()
        ).div(10000)
      )
    );
    let userTotalDebtUSD = Big(account.userDebtUSD.toString()).sub(
      Big(Number(outputAmount) || 0)
        .mul(ONE_ETH)
        .mul(Big(outToken.price.toString()))
        .div(10 ** 8)
    );
    let healthFactor = Big(ethers.constants.MaxUint256.toString());
    if (userTotalDebtUSD.gt(0))
      healthFactor = userThresholdBalanceUSD.div(userTotalDebtUSD).mul(ONE_ETH);
    setUpdatedAccount({
      accountHealth: BigNumber.from(healthFactor.toFixed(0)),
      userTotalBalanceUSD: BigNumber.from(userTotalBalanceUSD.toFixed(0)),
      userAdjustedBalanceUSD: BigNumber.from(userAdjustedBalanceUSD.toFixed(0)),
      userThresholdBalanceUSD: BigNumber.from(
        userThresholdBalanceUSD.toFixed(0)
      ),
      userDebtUSD: BigNumber.from(userTotalDebtUSD.toFixed(0)),
    });
  }, [inputAmount, outputAmount]);

  if (!account || !synths[marketIndex] || !outToken) return <></>;

  const updateInputAmount = (value: any) => {
    value = parseInput(value);
    setInputAmount(value);
  };

  const updateOutputAmount = (value: any) => {
    value = parseInput(value);
    setOutputAmount(value);
  };

  const onInputTokenSelected = (e: number) => {
    router.query.inputCurrency = tokens[e].id;
    router.push(router);
    setInputAssetIndex(e);
    setInputAmount("" as any);
    onInputClose();
  };

  const remove = async () => {
    if (!routerAddress) return;
    setLoading(true);

    const updateData = await getUpdateData();
    const updateFee = await getUpdateFee();
    let calls = [];
    let value = "0";

    const router = getContract("ReaxRouter", routerAddress);
    calls.push(
      router.interface.encodeFunctionData("updateOracleData", [updateData])
    );
    if (Number(outputAmount) > 0) {
      value = Big(value).add(updateFee).toFixed(0);
      if (Big(approvedLpAmount).gt(0)) {
        const { v, r, s } = ethers.utils.splitSignature(approvalLpData);
        calls.push(
          router.interface.encodeFunctionData("permit", [
            address,
            router.address,
            outToken.id,
            approvedLpAmount,
            approvalLpDeadline,
            v,
            r,
            s,
          ])
        );
      }
      calls.push(
        router.interface.encodeFunctionData("burn", [
          debtToken.id,
          Big(outputAmount).mul(Big(10).pow(outToken.decimals)).toFixed(0),
          address,
        ])
      );
    }
    if (Number(inputAmount) > 0) {
      if (Big(approvedAmount).gt(0)) {
        const { v, r, s } = ethers.utils.splitSignature(approvalData);
        calls.push(
          router.interface.encodeFunctionData("permit", [
            address,
            router.address,
            inToken.id,
            approvedAmount,
            approvalDeadline,
            v,
            r,
            s,
          ])
        );
        calls.push(
          router.interface.encodeFunctionData("unstake", [
            debtToken.id,
            inToken.asset.id,
            Big(inputAmount).mul(Big(10).pow(inToken.decimals)).toFixed(0),
          ])
        );
      }
    }

    send(router, "multicall", [calls], value)
      .then(async (res: any) => {
        await res.wait();
        setLoading(false);
        setInputAmount("");
        setOutputAmount("");
        toast({
          title: "Liquidity Removed",
          description: (
            <Box>
              <Text>
                {`You have burned ${outputAmount} ${outToken.symbol}`}
              </Text>
              <Link
                href={chain?.blockExplorers?.default.url + "/tx/" + res.hash}
                target="_blank"
              >
                <Flex align={"center"} gap={2}>
                  <ExternalLinkIcon />
                  <Text>View Transaction</Text>
                </Flex>
              </Link>
            </Box>
          ),
          status: "success",
          duration: 10000,
          isClosable: true,
          position: "top-right",
        });
      })
      .catch((err: any) => {
        console.log("Error adding liquidity:", err);
        setLoading(false);
      });
  };

  const getSteps = () => {
    let steps: ApprovalStep[] = [];
    if (!inToken || !outToken) return steps;

    if (
      Number(outputAmount) > 0 &&
      Big(approvedLpAmount)
        .add(outToken.approvalToRouter.toString())
        .lt(Big(Number(outputAmount) || 0).mul(10 ** outToken.decimals))
    ) {
      steps.push({
        type: "APPROVAL",
        execute: () => approveLp(outToken, routerAddress!),
        data: {
          token: outToken,
          amount: outputAmount,
        },
        loading: approvalLpLoading,
      });
    }
    if (
      Number(inputAmount) > 0 &&
      Big(approvedAmount)
        .add(inToken.approvalToRouter.toString())
        .lt(Big(Number(inputAmount) || 0).mul(10 ** inToken.decimals))
    ) {
      steps.push({
        type: "APPROVAL",
        execute: () => approve(inToken, routerAddress!),
        data: {
          token: inToken,
          amount: inputAmount,
        },
        loading: approvalLoading,
      });
    }

    return steps;
  };

  const validate = () => {
    if (!isConnected)
      return { valid: false, message: "Please connect your wallet" };
    // else if (chain?.)
    // 	return { valid: false, message: "Unsupported Chain" };
    if (loading) return { valid: false, message: "Loading..." };
    else if (
      (Number(inputAmount) || 0) <= 0 &&
      (Number(outputAmount) || 0) <= 0
    )
      return { valid: false, message: "Enter Amount" };
    else if (
      (Number(outputAmount) || 0) > 0 &&
      Big(outputAmount).mul(ONE_ETH).gt(outToken.walletBalance.toString())
    )
      return {
        valid: false,
        message: `Insufficient ${outToken.symbol} Balance`,
      };
    else if (
      Big(updatedAccount?.userAdjustedBalanceUSD?.toString() || 0)
        .sub(updatedAccount?.userDebtUSD?.toString() || 0)
        .lt(0)
    )
      return { valid: false, message: "Insufficient Staked Balance" };
    else if (getSteps().length > 0)
      return {
        valid: false,
        message: getSteps()[0].type == "APPROVAL" ? "Approve" : "Delegate",
      };
    else return { valid: true, message: "Remove" };
  };

  return (
    <>
      <RemoveLiquidityLayout
        inputAmount={inputAmount}
        updateInputAmount={updateInputAmount}
        inputAssetIndex={inputAssetIndex}
        onInputOpen={onInputOpen}
        outputAmount={outputAmount}
        updateOutputAmount={updateOutputAmount}
        exchange={remove}
        validate={validate}
        loading={loading}
        tokens={tokens}
        outToken={outToken}
        steps={getSteps()}
        updatedAccount={updatedAccount}
        account={account}
        debtToken={debtToken}
        config={synths[marketIndex].market.vaults[inputAssetIndex]?.config}
      />

      <TokenSelector
        isOpen={isInputOpen}
        onOpen={onInputOpen}
        onClose={onInputClose}
        onTokenSelected={onInputTokenSelected}
        tokens={tokens}
      />
    </>
  );
}

export default RemoveLiquidity;
