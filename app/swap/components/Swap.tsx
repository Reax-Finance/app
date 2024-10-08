"use client";
import { Box, useDisclosure, Text, Flex, Link } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Head from "next/head";
import TokenSelector from "./TokenSelector";
import {
  ADDRESS_ZERO,
  isSupportedChain,
  tokenFormatter,
} from "../../../src/const";
import SwapSkeleton from "./Skeleton";
import { useToast } from "@chakra-ui/react";
import useUpdateData from "../../../components/utils/useUpdateData";
import SwapLayout from "./SwapLayout";
import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { parseInput } from "../../../components/utils/number";
import useHandleError, {
  PlatformType,
} from "../../../components/utils/useHandleError";
import { useAppData } from "../../../components/context/AppDataProvider";
import { useRouter, useSearchParams } from "next/navigation";
import useApproval from "../../../components/context/useApproval";
import useChainData from "../../../components/context/useChainData";
import {
  useActiveAccount,
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
} from "thirdweb/react";

interface ApprovalStep {
  type: "APPROVAL" | "PERMIT" | "DELEGATION";
  loading: boolean;
  data: any;
  execute: any;
}

function Swap() {
  const [inputAssetIndex, setInputAssetIndex] = useState(2);
  const [outputAssetIndex, setOutputAssetIndex] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [gas, setGas] = useState(0);
  const [error, setError] = useState("");

  const connectionStatus = useActiveWalletConnectionStatus();
  const activeAccount = useActiveAccount();
  const isConnected = connectionStatus == "connected" ? true : false;
  const address = activeAccount?.address;
  const chain = useActiveWalletChain();
  const searchParams = useSearchParams();
  const inCurrency = searchParams?.get("inCurrency");
  const outCurrency = searchParams?.get("outCurrency");
  const {
    isOpen: isInputOpen,
    onOpen: onInputOpen,
    onClose: onInputClose,
  } = useDisclosure();
  const {
    isOpen: isOutputOpen,
    onOpen: onOutputOpen,
    onClose: onOutputClose,
  } = useDisclosure();

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [swapData, setSwapData] = useState<any>(null);
  const [maxSlippage, setMaxSlippage] = useState(0.5);
  const [deadline_m, setDeadline_m] = useState(20);
  const { getUpdateData, getUpdateFee } = useUpdateData();
  const { getContract, send } = useChainData();

  const {
    approve,
    loading: approvalLoading,
    data,
    deadline,
    approvedAmount,
    reset,
  } = useApproval({});

  const router = useRouter();

  const { liquidityData } = useAppData();

  const tokens = liquidityData
    ? liquidityData.synths.concat([
        {
          ...liquidityData.lpToken,
          price: liquidityData.lpToken.price.div("10000000000"),
        },
      ])
    : [];
  const inToken = tokens[inputAssetIndex];
  const outToken = tokens[outputAssetIndex];
  useEffect(() => {
    if (tokens.length > 1) {
      const inAssetIndex = tokens.findIndex(
        (token) =>
          token.id.toLowerCase() == inCurrency?.toString().toLowerCase()
      );
      const outAssetIndex = tokens.findIndex(
        (token) =>
          token.id.toLowerCase() == outCurrency?.toString().toLowerCase()
      );
      if (inAssetIndex >= 0) setInputAssetIndex(inAssetIndex);
      if (outAssetIndex >= 0) setOutputAssetIndex(outAssetIndex);
    }
  }, [tokens]);

  const handleError = useHandleError(PlatformType.DEX);

  const updateInputAmount = (value: any) => {
    value = parseInput(value);
    setInputAmount(value);
    if (isNaN(Number(value)) || Number(value) == 0) {
      setOutputAmount("0");
      return;
    }
    setOutputAmount(
      Big(value)
        .mul(inToken.price.toString())
        .div(outToken.price.toString())
        .toString()
    );
  };

  const updateOutputAmount = (value: any) => {
    value = parseInput(value);
    setOutputAmount(value);
    if (isNaN(Number(value)) || Number(value) == 0) return;
    setInputAmount(
      Big(value)
        .mul(outToken.price.toString())
        .div(inToken.price.toString())
        .toString()
    );
  };

  const onInputTokenSelected = (e: number) => {
    if (outputAssetIndex == e) {
      setOutputAssetIndex(inputAssetIndex);
    }
    setInputAssetIndex(e);
    const inToken = tokens[e].id;
    const params = new URLSearchParams(searchParams?.toString());
    params.set("inCurrency", inToken);
    router.push(`?${params.toString()}`);
    setInputAmount("" as any);
    setOutputAmount("0");
    onInputClose();
    setSwapData(null);
    setGas(0);
    reset();
  };

  const onOutputTokenSelected = (e: number) => {
    if (inputAssetIndex == e) {
      setInputAssetIndex(outputAssetIndex);
    }
    setOutputAssetIndex(e);
    const outToken = tokens[e].id;
    const params = new URLSearchParams(searchParams?.toString());
    params.set("outCurrency", outToken);
    setInputAmount("");
    setOutputAmount("0");
    onOutputClose();
    setSwapData(null);
    reset();
    setGas(0);
  };

  const switchTokens = () => {
    let temp = inputAssetIndex;
    const inCurrency = tokens[outputAssetIndex].id;
    const outCurrency = tokens[temp].id;
    const params = new URLSearchParams(searchParams?.toString());
    params.set("inCurrency", inCurrency);
    params.set("outCurrency", outCurrency);
    router.push(`?${params.toString()}`);
    setInputAssetIndex(outputAssetIndex);
    setOutputAssetIndex(temp);
    setInputAmount("");
    setOutputAmount("0");
    setSwapData(null);
    setGas(0);
    reset();
  };

  const exchange = async () => {
    setLoading(true);
    const updateData = await getUpdateData();
    const updateFee = await getUpdateFee();
    const calls = [];
    const rxRouter = getContract("ReaxRouter");
    calls.push(
      rxRouter.interface.encodeFunctionData("updateOracleData", [updateData])
    );
    if (Big(approvedAmount ?? 0).gt(0)) {
      const { v, r, s } = ethers.utils.splitSignature(data);
      calls.push(
        rxRouter.interface.encodeFunctionData("permit", [
          address,
          rxRouter.address,
          inToken.id,
          approvedAmount,
          deadline,
          v,
          r,
          s,
        ])
      );
    }
    calls.push(
      rxRouter.interface.encodeFunctionData("swap", [
        inToken.id,
        outToken.id,
        Big(inputAmount).mul(Big(10).pow(inToken.decimals)).toFixed(0),
        address,
      ])
    );

    send(rxRouter, "multicall", [calls], updateFee)
      .then(async (res: any) => {
        await res.wait();
        setLoading(false);
        toast({
          title: "Transaction submitted",
          description: (
            <Box>
              <Text>
                {`You have swapped ${inputAmount} ${inToken?.symbol} for ${outToken?.symbol}`}
              </Text>
              <Link
                // href={chain?.blockExplorers?.default.url + "/tx/" + res.hash}
                href={chain?.blockExplorers![0]?.url + "/tx/" + res.hash}
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
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
        setInputAmount("");
        setOutputAmount("0");
        setSwapData(null);
        if (Big(approvedAmount ?? 0).gt(0)) {
          reset();
        }
      })
      .catch((err: any) => {
        setLoading(false);
        handleError(err);
      });
  };

  const getSteps = () => {
    let steps: ApprovalStep[] = [];
    if (!inToken) return steps;
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
        execute: () => approve(inToken, getContract("ReaxRouter").address!),
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
    else if (error.length > 0) return { valid: false, message: error };
    else if (Number(inputAmount) <= 0)
      return { valid: false, message: "Enter Amount" };
    else if (Number(outputAmount) <= 0)
      return { valid: false, message: "Insufficient Liquidity" };
    else if (
      Big(Number(inputAmount) || 0)
        .mul(Big(10).pow(inToken.decimals))
        .gt(inToken.walletBalance.toString())
    )
      return { valid: false, message: "Insufficient Balance" };
    else if (getSteps().length > 0) return { valid: false, message: "Approve" };
    else if (Number(deadline_m) == 0)
      return { valid: false, message: "Please set deadline" };
    else if (maxSlippage == 0)
      return { valid: false, message: "Please set slippage" };
    else return { valid: true, message: "Swap" };
  };

  return (
    <div>
      <Head>
        <title>
          {" "}
          {tokenFormatter.format(
            inToken?.price?.toNumber() / outToken?.price?.toNumber() || 0
          )}{" "}
          {outToken?.symbol}/{inToken?.symbol} |{" "}
          {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
        </title>
        <link
          rel="icon"
          type="image/x-icon"
          href={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`}
        ></link>
      </Head>
      <Box>
        <Flex justify={"center"} align="center">
          <Box>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.45 }}
            >
              <Box
                animation={"fadeIn 0.5s ease-in-out"}
                boxShadow={"xl"}
                minW={{ base: "100%", md: "500px" }}
              >
                {tokens.length > 1 ? (
                  <SwapLayout
                    inputAmount={inputAmount}
                    updateInputAmount={updateInputAmount}
                    inputAssetIndex={inputAssetIndex}
                    onInputOpen={onInputOpen}
                    outputAmount={outputAmount}
                    updateOutputAmount={updateOutputAmount}
                    outputAssetIndex={outputAssetIndex}
                    onOutputOpen={onOutputOpen}
                    switchTokens={switchTokens}
                    exchange={exchange}
                    validate={validate}
                    loading={loading}
                    gas={gas}
                    maxSlippage={maxSlippage}
                    setMaxSlippage={setMaxSlippage}
                    deadline={deadline_m}
                    setDeadline={setDeadline_m}
                    swapData={swapData}
                    tokens={tokens}
                    steps={getSteps()}
                  />
                ) : (
                  <SwapSkeleton />
                )}

                <TokenSelector
                  isOpen={isInputOpen}
                  onOpen={onInputOpen}
                  onClose={onInputClose}
                  onTokenSelected={onInputTokenSelected}
                  tokens={tokens}
                />
                <TokenSelector
                  isOpen={isOutputOpen}
                  onOpen={onOutputOpen}
                  onClose={onOutputClose}
                  onTokenSelected={onOutputTokenSelected}
                  tokens={tokens}
                />
              </Box>
            </motion.div>
          </Box>
        </Flex>
      </Box>
    </div>
  );
}

export default Swap;
