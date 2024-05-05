import {
	Box,
	useDisclosure,
	Text,
	Flex,
	Link,
	useColorMode,
	Heading,
	Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import Head from "next/head";
import { ADDRESS_ZERO, ONE_ETH } from "../../src/const";
import SwapSkeleton from "./Skeleton";
import { useToast } from "@chakra-ui/react";
import useUpdateData from "../utils/useUpdateData";
import { usePriceData } from "../context/PriceContext";
import LiquidityLayout from "./RemoveLiquidityLayout";
import Big from "big.js";
import { formatInput, parseInput } from "../utils/number";
import useHandleError, { PlatformType } from "../utils/useHandleError";
import { useAppData } from "../context/AppDataProvider";
import { VARIANT } from "../../styles/theme";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { ArrowRightIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { BigNumber, ethers } from "ethers";
import { getContract, send } from "../../src/contract";
import TokenSelector from "../swap/TokenSelector";
import { useRouter } from "next/router";
import useApproval from "../context/useApproval";
import useDelegate from "../context/useDelegate";
import RemoveLiquidityLayout from "./RemoveLiquidityLayout";
import { Asset } from "../utils/types";

interface ApprovalStep {
	type: "APPROVAL" | "PERMIT" | "DELEGATION";
	execute: any;
	loading?: boolean;
	data: {
		token: Asset;
		amount: string;
	}
}

function RemoveLiquidity({ updatedAccount, setUpdatedAccount }: any) {
	const [inputAssetIndex, setInputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState("");
	const [outputAmount, setOutputAmount] = useState("");
	const { chain } = useNetwork();
	const { isConnected, address } = useAccount();

	const {
		isOpen: isInputOpen,
		onOpen: onInputOpen,
		onClose: onInputClose,
	} = useDisclosure();

	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const { getUpdateData, getUpdateFee } = useUpdateData();
	const { liquidityData, reserveData, account } = useAppData();
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

	// only if vaults[i].userBalance > 0
	const tokens = reserveData
		? reserveData.vaults.filter((vault) => (Big(vault.userBalance.toString()).gt(0) && vault.asset.id !== ethers.constants.AddressZero)).map((vault) => ({...vault.vaultToken, name: vault.asset.name, symbol: vault.asset.symbol, decimals: vault.asset.decimals, asset: vault.asset }))
		: [];
	const outToken = liquidityData?.lpToken;
	const inToken = tokens[inputAssetIndex];

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
		if (!account || !reserveData || !liquidityData || !outToken) return;

		const inUsdScaled = outToken
			? Big(Number(inputAmount) || 0)
					.mul(Big(inToken.price.toString()).div(10 ** 8))
					.mul(ONE_ETH)
			: Big(0);
		let userTotalBalanceUSD = Big(account.userTotalBalanceUSD).sub(
			inUsdScaled
		);
		let userAdjustedBalanceUSD = Big(account.userAdjustedBalanceUSD).sub(
			inUsdScaled.mul(
				Big(
					reserveData.vaults[
						inputAssetIndex
					].config.baseLTV.toString()
				).div(10000)
			)
		);
		let userThresholdBalanceUSD = Big(account.userThresholdBalanceUSD).sub(
			inUsdScaled.mul(
				Big(
					reserveData.vaults[
						inputAssetIndex
					].config.liquidationThreshold.toString()
				).div(10000)
			)
		);
		let userTotalDebtUSD = Big(account.userTotalDebtUSD).sub(
			Big(Number(outputAmount) || 0).mul(Big(outToken.price.toString()))
		);
		let healthFactor = Big(ethers.constants.MaxUint256.toString());
		if (userTotalDebtUSD.gt(0))
			healthFactor = userThresholdBalanceUSD
				.div(userTotalDebtUSD)
				.mul(ONE_ETH);
		let availableToMintUSD = userAdjustedBalanceUSD.sub(userTotalDebtUSD);
		setUpdatedAccount({
			healthFactor: healthFactor.toString(),
			availableToMintUSD: availableToMintUSD.toString(),
			userTotalBalanceUSD: userTotalBalanceUSD.toString(),
			userAdjustedBalanceUSD: userAdjustedBalanceUSD.toString(),
			userTotalDebtUSD: userTotalDebtUSD.toString(),
			userThresholdBalanceUSD: userThresholdBalanceUSD.toString(),
		});
	}, [inputAmount, outputAmount]);

	if (!account || !reserveData || !liquidityData || !outToken) return <></>;

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
		setLoading(true);
		const router = getContract(
			"ReaxRouter",
			process.env.NEXT_PUBLIC_ROUTER_ADDRESS!
		);
		const updateData = await getUpdateData();
		const updateFee = await getUpdateFee();
		let calls = [];
		let value = "0";
		calls.push(router.interface.encodeFunctionData("updateOracleData", [updateData]));
		if (Number(outputAmount) > 0) {
			value = Big(value).add(updateFee).toString();
			if (Big(approvedLpAmount).gt(0)) {
				const { v, r, s } = ethers.utils.splitSignature(approvalLpData);
				calls.push(
					router.interface.encodeFunctionData("permit", [
						address,
						router.address,
						liquidityData.debtToken.id,
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
					address,
					Big(outputAmount)
						.mul(Big(10).pow(outToken.decimals))
						.toFixed(),
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
						inToken.asset.id,
						Big(inputAmount)
							.mul(Big(10).pow(inToken.decimals))
							.toFixed()
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
								href={
									chain?.blockExplorers?.default.url +
									"/tx/" +
									res.hash
								}
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
		if (!inToken || !liquidityData.debtToken) return steps;
		if (
			Number(outputAmount) > 0 &&
			Big(approvedLpAmount)
				.add(liquidityData.lpToken.approvalToRouter.toString())
				.lt(
					Big(Number(outputAmount) || 0).mul(
						10 ** liquidityData.debtToken.decimals
					)
				)
		) {
			steps.push({
				type: "APPROVAL",
				execute: () =>
					approveLp(
						liquidityData.lpToken,
						process.env.NEXT_PUBLIC_ROUTER_ADDRESS!
					),
				data: {
					token: liquidityData.lpToken,
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
				execute: () =>
					approve(inToken, process.env.NEXT_PUBLIC_ROUTER_ADDRESS!),
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
		else if (chain?.unsupported)
			return { valid: false, message: "Unsupported Chain" };
		if (loading) return { valid: false, message: "Loading..." };
		else if (
			(Number(inputAmount) || 0) <= 0 &&
			(Number(outputAmount) || 0) <= 0
		)
			return { valid: false, message: "Enter Amount" };
		else if (
			Big(outputAmount)
				.mul(ONE_ETH)
				.gt(outToken.balance.toString())
		)
			return {
				valid: false,
				message: `Insufficient ${outToken.symbol} Balance`,
			};
		else if (Big(updatedAccount.availableToMintUSD).lt(0))
			return { valid: false, message: "Insufficient Staked Balance" };
		else if (getSteps().length > 0)
			return {
				valid: false,
				message:
					getSteps()[0].type == "APPROVAL" ? "Approve" : "Delegate",
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
