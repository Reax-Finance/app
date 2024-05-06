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
import { useAccount, useSignTypedData } from "wagmi";
import Head from "next/head";
import {
	ADDRESS_ZERO,
	ONE_ETH,
	defaultChain,
} from "../../src/const";
import SwapSkeleton from "./Skeleton";
import { useToast } from "@chakra-ui/react";
import useUpdateData from "../utils/useUpdateData";
import LiquidityLayout from "./AddLiquidityLayout";
import Big from "big.js";
import { formatInput, parseInput } from "../utils/number";
import { useAppData } from "../context/AppDataProvider";
import { ArrowRightIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { BigNumber, ethers } from "ethers";
import { getContract, send } from "../../src/contract";
import TokenSelector from "../swap/TokenSelector";
import { useRouter } from "next/router";
import useApproval from "../context/useApproval";
import useDelegate from "../context/useDelegate";

interface ApprovalStep {
	type: "APPROVAL" | "PERMIT" | "DELEGATION";
	loading: boolean;
	data: any;
	execute: any;
}

function AddLiquidity({updatedAccount, setUpdatedAccount, tabIndex}: any) {
	const [inputAssetIndex, setInputAssetIndex] = useState(0);
	const [inputAmount, setInputAmount] = useState("");
	const [outputAmount, setOutputAmount] = useState("");
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

	const tokens = reserveData
		? reserveData.vaults.map((vault) => vault.asset)
		: [];
	const outToken = liquidityData?.lpToken;
	const inToken = tokens[inputAssetIndex];

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
		if (!account || !reserveData || !liquidityData || !outToken) return;

		const inUsdScaled = Big(Number(inputAmount) || 0)
					.mul(Big(inToken.price.toString()).div(10 ** 8))
					.mul(ONE_ETH);
		let userTotalBalanceUSD = Big(account.userTotalBalanceUSD).add(
			inUsdScaled
		);
		let userAdjustedBalanceUSD = Big(account.userAdjustedBalanceUSD).add(
			inUsdScaled.mul(
				Big(
					reserveData.vaults[
						inputAssetIndex
					].config.baseLTV.toString()
				).div(10000)
			)
		);
		let userThresholdBalanceUSD = Big(account.userThresholdBalanceUSD).add(
			inUsdScaled.mul(
				Big(
					reserveData.vaults[
						inputAssetIndex
					].config.liquidationThreshold.toString()
				).div(10000)
			)
		);
		let userTotalDebtUSD = Big(account.userTotalDebtUSD).add(
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
		const _router = {...router};
		_router.query.inputCurrency = tokens[e].id;
		router.push(_router);
		setInputAssetIndex(e);
		setInputAmount("" as any);
		onInputClose();
	};

	const add = async () => {
		setLoading(true);
		const router = getContract(
			"ReaxRouter",
			process.env.NEXT_PUBLIC_ROUTER_ADDRESS!
		);
		const updateData = await getUpdateData();
		const updateFee = await getUpdateFee();
		let calls = [];
		let value = "0";
		if(Number(outputAmount) > 0) {
			calls.push(router.interface.encodeFunctionData("updateOracleData", [updateData]))
			value = Big(value).add(updateFee).toString();
		};
		if (Number(inputAmount) > 0) {
			console.log("inputAmount", inputAmount, inToken);
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
					router.interface.encodeFunctionData("stake", [
						inToken.id,
						Big(inputAmount)
							.mul(Big(10).pow(inToken.decimals))
							.toFixed(),
					])
				);
			} else if (inToken.id == ADDRESS_ZERO) {
				value = Big(inputAmount).mul(ONE_ETH).toString();
				calls.push(
					router.interface.encodeFunctionData("stakeEth", [
						ethers.constants.MaxUint256,
					])
				);
			} else
				calls.push(
					router.interface.encodeFunctionData("stake", [
						inToken.id,
						Big(inputAmount)
							.mul(Big(10).pow(inToken.decimals))
							.toFixed(),
					])
				);
		}
		if (Number(outputAmount) > 0) {
			if (Big(delegatedAmount).gt(0)) {
				const { v, r, s } = ethers.utils.splitSignature(delegationData);
				calls.push(
					router.interface.encodeFunctionData("permitDelegation", [
						address,
						router.address,
						liquidityData.debtToken.id,
						delegatedAmount,
						delegationDeadline,
						v,
						r,
						s,
					])
				);
			}

			calls.push(
				router.interface.encodeFunctionData("mint", [
					Big(outputAmount)
						.mul(Big(10).pow(outToken.decimals))
						.toFixed(),
					address,
					address,
				])
			);
		}
		send(router, "multicall", [calls], value)
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
								href={
									defaultChain?.blockExplorers?.default.url +
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

	
	const maxMint = (): number => {
		let _outputAmount = Big(updatedAccount.userAdjustedBalanceUSD)
			.sub(account.userTotalDebtUSD)
			.div(outToken.price.toString())
			.mul(0.99);
		return _outputAmount.toNumber();
	};

	const getSteps = () => {
		let steps: ApprovalStep[] = [];
		if (!inToken || !liquidityData.debtToken) return steps;
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
				execute: () =>
					approve(inToken, process.env.NEXT_PUBLIC_ROUTER_ADDRESS!),
			});
		}
		if (
			Number(inputAmount) > 0 &&
			Number(outputAmount) > 0 &&
			Big(delegatedAmount)
				.add(liquidityData.debtToken.approvalToRouter.toString())
				.lt(
					Big(Number(outputAmount) || 0).mul(
						10 ** liquidityData.debtToken.decimals
					)
				)
		) {
			steps.push({
				type: "DELEGATION",
				loading: delegationLoading,
				data: {
					amount: inputAmount,
					token: liquidityData.debtToken,
				},
				execute: () =>
					delegate(
						liquidityData.debtToken,
						process.env.NEXT_PUBLIC_ROUTER_ADDRESS!
					),
			});
		}
		return steps;
	};

	const validate = () => {
		if (!isConnected)
			return { valid: false, message: "Please connect your wallet" };
		else if (chain?.id !== defaultChain.id)
			return { valid: false, message: "Unsupported Chain" };
		else if (loading) return { valid: false, message: "Loading..." };
		else if (
			(Number(inputAmount) || 0) <= 0 &&
			(Number(outputAmount) || 0) <= 0
		)
			return { valid: false, message: "Enter Amount" };
		else if (
			(Number(inputAmount) || 0) > 0 && Big(inputAmount)
				.mul(Big(10).pow(inToken.decimals))
				.gt(Big(inToken.balance.toString()))
		)
			return {
				valid: false,
				message: `Insufficient ${inToken.symbol} Balance`,
			};
		else if (Big(updatedAccount.availableToMintUSD).lt(0))
			return { valid: false, message: "Insufficient Staked Balance" };
		else if (getSteps().length > 0)
			return {
				valid: false,
				message:
					getSteps()[0].type == "APPROVAL" ? "Approve" : "Delegate",
			};
		else return { valid: true, message: "Mint" };
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