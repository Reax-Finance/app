import { Box, useDisclosure, Text, Flex, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { ADDRESS_ZERO, ONE_ETH, isSupportedChain } from "../../src/const";
import { useToast } from "@chakra-ui/react";
import useUpdateData from "../utils/useUpdateData";
import LiquidityLayout from "./AddLiquidityLayout";
import Big from "big.js";
import { formatInput, parseInput } from "../utils/number";
import { useAppData } from "../context/AppDataProvider";
import { ArrowRightIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { BigNumber, ethers } from "ethers";
import TokenSelector from "../swap/TokenSelector";
import { useRouter } from "next/router";
import useApproval from "../context/useApproval";
import useDelegate from "../context/useDelegate";
import useChainData from "../context/useChainData";
import { Account } from "../utils/types";

interface ApprovalStep {
  type: "APPROVAL" | "PERMIT" | "DELEGATION";
  loading: boolean;
  data: any;
  execute: any;
}

interface AddLiquidityProps {
  updatedAccount: Account;
  setUpdatedAccount: (account: Account) => void;
  account: Account;
  tabIndex: number;
  marketIndex: number;
}

function AddLiquidity({
  updatedAccount,
  setUpdatedAccount,
  account,
  tabIndex,
  marketIndex,
}: AddLiquidityProps) {
  const [inputAssetIndex, setInputAssetIndex] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const { isConnected, address } = useAccount();
  const [isInputMax, setIsInputMax] = useState(false);
  const [isOutputMax, setIsOutputMax] = useState(false);

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
  const { chain } = useAccount();

  const {
    approve,
    loading: approvalLoading,
    data: approvalData,
    deadline: approvalDeadline,
    approvedAmount,
    reset: resetApproval,
  } = useApproval({});
  const {
    delegate,
    loading: delegationLoading,
    data: delegationData,
    deadline: delegationDeadline,
    delegatedAmount,
    reset: resetDelegation,
  } = useDelegate({});

  const tokens = synths[marketIndex]
    ? synths[marketIndex].market.vaults.map((vault) => vault.asset)
    : [];

  const outToken = synths[marketIndex]?.synth;
  const inToken = tokens[inputAssetIndex];

  const debtToken = synths[marketIndex]?.market.debtToken;
  const { getContract, send } = useChainData();

  useEffect(() => {
    if (tabIndex == 0) {
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
    if (!account || !synths[marketIndex]?.market?.vaults || !outToken) return;

    const inUsdScaled = Big(Number(inputAmount) || 0)
      .mul(Big(inToken.price.toString()).div(10 ** 8))
      .mul(ONE_ETH);
    let userTotalBalanceUSD = Big(account.userTotalBalanceUSD.toString()).add(
      inUsdScaled
    );
    let userAdjustedBalanceUSD = Big(
      account.userAdjustedBalanceUSD.toString()
    ).add(
      inUsdScaled.mul(
        Big(
          synths[marketIndex]?.market?.vaults[
            inputAssetIndex
          ].config.baseLTV.toString()
        ).div(10000)
      )
    );
    let userThresholdBalanceUSD = Big(
      account.userThresholdBalanceUSD.toString()
    ).add(
      inUsdScaled.mul(
        Big(
          synths[marketIndex]?.market?.vaults[
            inputAssetIndex
          ].config.liquidationThreshold.toString()
        ).div(10000)
      )
    );
    let userTotalDebtUSD = Big(account.userDebtUSD.toString()).add(
      Big(Number(outputAmount) || 0).mul(Big(outToken.price.toString()))
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
    setIsInputMax(false);
  };

  const updateOutputAmount = (value: any) => {
    value = parseInput(value);
    setOutputAmount(value);
    setIsOutputMax(false);
  };

  const onInputTokenSelected = (e: number) => {
    const _router = { ...router };
    _router.query.inputCurrency = tokens[e].id;
    router.push(_router);
    setInputAssetIndex(e);
    setInputAmount("" as any);
    onInputClose();
  };

  const add = async () => {
    if (!routerAddress) return;
    setLoading(true);
    const updateData = await getUpdateData();
    const updateFee = await getUpdateFee();
    let calls = [];
    let value = "0";
    const rxRouter = getContract("ReaxRouter", routerAddress);
    if (Number(outputAmount) > 0) {
      calls.push(
        rxRouter.interface.encodeFunctionData("updateOracleData", [updateData])
      );
      value = Big(value).add(updateFee).toString();
    }
    if (Number(inputAmount) > 0) {
      console.log("inputAmount", inputAmount, inToken);
      if (Big(approvedAmount).gt(0)) {
        const { v, r, s } = ethers.utils.splitSignature(approvalData);
        calls.push(
          rxRouter.interface.encodeFunctionData("permit", [
            address,
            rxRouter.address,
            inToken.id,
            approvedAmount,
            approvalDeadline,
            v,
            r,
            s,
          ])
        );
        calls.push(
          rxRouter.interface.encodeFunctionData("stake", [
            debtToken.id,
            inToken.id,
            isInputMax
              ? ethers.constants.MaxUint256
              : Big(inputAmount).mul(Big(10).pow(inToken.decimals)).toFixed(),
          ])
        );
      } else if (inToken.id == ADDRESS_ZERO) {
        value = Big(inputAmount).mul(ONE_ETH).toString();
        calls.push(
          rxRouter.interface.encodeFunctionData("stakeEth", [
            debtToken.id,
            ethers.constants.MaxUint256,
          ])
        );
      } else
        calls.push(
          rxRouter.interface.encodeFunctionData("stake", [
            debtToken.id,
            inToken.id,
            isInputMax
              ? ethers.constants.MaxUint256
              : Big(inputAmount).mul(Big(10).pow(inToken.decimals)).toFixed(),
          ])
        );
    }
    if (Number(outputAmount) > 0) {
      if (Big(delegatedAmount).gt(0)) {
        const {
          v: _v,
          r: _r,
          s: _s,
        } = ethers.utils.splitSignature(delegationData);
        calls.push(
          rxRouter.interface.encodeFunctionData("permitDelegation", [
            address,
            rxRouter.address,
            debtToken.id,
            delegatedAmount,
            delegationDeadline,
            _v,
            _r,
            _s,
          ])
        );
      }

      calls.push(
        rxRouter.interface.encodeFunctionData("mint", [
          debtToken.id,
          Big(outputAmount).mul(Big(10).pow(outToken.decimals)).toFixed(0),
          address,
          address,
        ])
      );
    }
    send(rxRouter, "multicall", [calls], value)
      .then(async (res: any) => {
        await res.wait();
        setLoading(false);
        setInputAmount("");
        setOutputAmount("");
        toast({
          title: "Liquidity Added",
          description: (
            <Box>
              <Text>
                {`You have minted ${outputAmount} ${outToken.symbol}`}
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

  const maxMint = (): number => {
    if (outToken.price.eq(0)) return 0;
    let _outputAmount = Big(updatedAccount.userAdjustedBalanceUSD.toString())
      .sub(account.userDebtUSD.toString())
      .mul(10 ** 8)
      .div(outToken.price.toString())
      .div(ONE_ETH)
      .mul(0.99);
    return _outputAmount.toNumber();
  };

  const getSteps = () => {
    let steps: ApprovalStep[] = [];
    if (!inToken || !debtToken) return steps;

    if (
      inToken.id !== ADDRESS_ZERO &&
      Big(approvedAmount)
        .add(inToken.approvalToRouter.toString())
        .lt(Big(Number(inputAmount) || 0).mul(10 ** inToken.decimals))
    ) {
      steps.push({
        type: "APPROVAL",
        loading: approvalLoading,
        data: {
          amount: inputAmount,
          token: inToken,
        },
        execute: () => approve(inToken, routerAddress!),
      });
    }
    if (
      // Number(inputAmount) > 0 &&
      Number(outputAmount) > 0 &&
      Big(delegatedAmount)
        .add(debtToken.approvalToRouter.toString())
        .lt(Big(Number(outputAmount) || 0).mul(10 ** debtToken.decimals))
    ) {
      steps.push({
        type: "DELEGATION",
        loading: delegationLoading,
        data: {
          amount: inputAmount,
          token: debtToken,
        },
        execute: () => delegate(debtToken, routerAddress!),
      });
    }
    return steps;
  };

  const validate = () => {
    if (!isConnected)
      return { valid: false, message: "Please connect your wallet" };
    else if (!chain || !isSupportedChain(chain?.id))
      return { valid: false, message: "Unsupported Chain" };
    else if (loading) return { valid: false, message: "Loading..." };
    else if (
      (Number(inputAmount) || 0) <= 0 &&
      (Number(outputAmount) || 0) <= 0
    )
      return { valid: false, message: "Enter Amount" };
    else if (
      (Number(inputAmount) || 0) > 0 &&
      Big(inputAmount)
        .mul(Big(10).pow(inToken.decimals))
        .gt(Big(inToken.walletBalance.toString()))
    )
      return {
        valid: false,
        message: `Insufficient ${inToken.symbol} Balance`,
      };
    else if (
      Big(updatedAccount.userAdjustedBalanceUSD.toString())
        .sub(updatedAccount.userDebtUSD.toString())
        .lt(0)
    )
      return { valid: false, message: "Insufficient Staked Balance" };
    else if (getSteps().length > 0)
      return {
        valid: false,
        message: getSteps()[0].type == "APPROVAL" ? "Approve" : "Delegate",
      };
    //Max Mint Button
    else if (isInputMax && isOutputMax)
      return {
        valid: true,
        message: "Mint Maximum",
      };
    //stake
    else if ((Number(inputAmount) || 0) > 0 && Number(outputAmount) === 0) {
      return {
        valaid: true,
        message: "Stake",
      };
    } else return { valid: true, message: "Mint" };
  };

  return (
    <>
      <LiquidityLayout
        inputAmount={inputAmount}
        updateInputAmount={updateInputAmount}
        inputAssetIndex={inputAssetIndex}
        onInputOpen={onInputOpen}
        outputAmount={outputAmount}
        updateOutputAmount={updateOutputAmount}
        maxMint={maxMint}
        exchange={add}
        validate={validate}
        loading={loading}
        tokens={tokens}
        outToken={outToken}
        steps={getSteps()}
        isInputMax={isInputMax}
        isOutputMax={isOutputMax}
        setIsInputMax={setIsInputMax}
        setIsOutputMax={setIsOutputMax}
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

export default AddLiquidity;
