import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	Divider,
	Switch,
	Collapse,
	Input,
	Tooltip,
	useToast,
	Link,
} from "@chakra-ui/react";
import { getContract, send } from "../../../src/contract";
import { useContext, useEffect } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { PYTH_ENDPOINT, dollarFormatter, numOrZero, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import InfoFooter from "../_utils/InfoFooter";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { base58 } from "ethers/lib/utils.js";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceContext";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";

const Issue = ({ asset, amount, setAmount, amountNumber }: any) => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");

	const [useReferral, setUseReferral] = useState(false);
	const [referral, setReferral] = useState<string | null>(null);

	const { isConnected, address } = useAccount();
	const { chain } = useNetwork();
	const {getUpdateData} = useUpdateData();
	const { walletBalances, updateBalance } = useBalanceData();
	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position();
	
	const {
		pools,
		tradingPool,
		updatePoolBalance,
		account,
	} = useContext(AppDataContext);

	useEffect(() => {
		if (referral == null) {
			const { ref: refCode } = router.query;
			if (refCode) {
				setReferral(refCode as string);
				setUseReferral(true);
			} else {
				setUseReferral(false);
			}
		}
	});

	const max = () => {
		if(!address) return '0';
		if(!prices[asset.token.id] || prices[asset.token.id] == 0) return '0';
		return (
			Big(pos.adjustedCollateral)
				.sub(pos.debt)
				.div(prices[asset.token.id] ?? 0)
				.gt(0)
				? Big(pos.adjustedCollateral)
						.sub(pos.debt)
						.div(prices[asset.token.id] ?? 0)
				: 0
		).toString();
	};

	const toast = useToast();

	const mint = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");

		// let synth = await getContract("ERC20X", chain?.id!, asset.token.id);
		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		let value = Big(amount)
			.times(10 ** 18)
			.toFixed(0);
		// let _referral = useReferral ? BigNumber.from(base58.decode(referral!)).toHexString() : ethers.constants.AddressZero;

		
		let args = [
			asset.token.id, 
			value, 
			address
		];
		
		const priceFeedUpdateData = await getUpdateData();
		if(priceFeedUpdateData.length > 0) args.push(priceFeedUpdateData);
		console.log(args);

		send(pool, "mint", args)
			.then(async (res: any) => {
				// decode logs
				const response = await res.wait(1);
				const decodedLogs = response.logs.map((log: any) => {
					try {
						return pool.interface.parseLog(log);
					} catch (e) {
						console.log(e);
					}
				});
				if(chain?.id == 280){
					decodedLogs.pop();
				}
				console.log(decodedLogs[decodedLogs.length - 3].args.value.toString(), decodedLogs[decodedLogs.length - 2].args.value.toString(), decodedLogs[decodedLogs.length - 1].args.value.toString());

				let amountUSD = Big(decodedLogs[decodedLogs.length - 2].args.value.toString())
					.mul(prices[asset.token.id] ?? 0)
					.div(10 ** 18)
					.mul(1 + asset.mintFee / 10000);
				// add fee
				amountUSD = amountUSD.mul(1 + asset.mintFee / 10000);

				updatePoolBalance(
					pools[tradingPool].id,
					decodedLogs[decodedLogs.length - 1].args.value.toString(),
					amountUSD.toString(),
					false
				);
				updateBalance(
					asset.token.id,
					decodedLogs[decodedLogs.length - 2].args.value.toString(),
					false
				);
				setAmount("0");

				setLoading(false);
				toast({
					title: "Mint Successful",
					description: <Box>
						<Text>
							{`You have minted ${amount} ${asset.token.symbol}`}
						</Text>
						<Link href={chain?.blockExplorers?.default.url + "/tx/" + res.hash} target="_blank">
							<Flex align={'center'} gap={2}>
							<ExternalLinkIcon />
							<Text>View Transaction</Text>
							</Flex>
						</Link>
					</Box>,
					status: "success",
					duration: 10000,
					isClosable: true,
					position: "top-right",
				})
			})
			.catch((err: any) => {
				console.log(err);
				if(err?.reason == "user rejected transaction"){
					toast({
						title: "Transaction Rejected",
						description: "You have rejected the transaction",
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top-right"
					})
				} else {
					toast({
						title: "Transaction Failed",
						description: err?.data?.message || JSON.stringify(err).slice(0, 100),
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "top-right"
					})
				}
				setLoading(false);
			});
	};

	const isValid = () => {
		if (referral == "" || referral == null) return true;
		try {
			const decodedString = BigNumber.from(
				base58.decode(referral!)
			).toHexString();
			return ethers.utils.isAddress(decodedString);
		} catch (err) {
			return false;
		}
	};

	return (
		<Box px={5} pb={5} pt={0.5} bg="bg2">
			<Box
				mt={6}
				rounded={8}
			>
				<Tooltip label={`Fee for Minting and Burning ${asset.token.symbol}`}>
				<Flex justify="space-between">
						<Text fontSize={"md"} color="whiteAlpha.600" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Mint / Burn Fee
						</Text>

						<Text fontSize={"md"}>
							{tokenFormatter.format(
								Number(
									asset.mintFee / 100
								) 
							)} {'%'} / {tokenFormatter.format(
								Number(
									asset.burnFee / 100
								) 
							)} {'%'}
						</Text>
					</Flex> 
					</Tooltip>
			</Box>

			<Box>
				<Text
					mt={6}
					fontSize={"sm"}
					color="whiteAlpha.600"
					fontWeight={"bold"}
				>
					Transaction Overview
				</Text>
				<Box
					my={4}
					rounded={8}
				>
					<Flex justify="space-between">
						<Text fontSize={"md"} color="whiteAlpha.600">
							Health Factor
						</Text>
						<Text fontSize={"md"}>
							{(Big(pos.collateral).gt(0) ? 
								Big(100).mul(pos.debt ?? 0).div(pos.collateral ?? 0).toNumber() : 0).toFixed(1)}{" "}
							% {"->"}{" "}
							{numOrZero(
								(Big(pos.collateral ?? 0).gt(0) ? Big(pos.debt ?? 0).add(
										Big(amount || 0).mul(prices[asset.token.id] ?? 0)).div(pos.collateral)
									.toNumber() : 0) * 100
							).toFixed(1)}
							%
						</Text>
					</Flex>
					<Divider my={2} />
					<Flex justify="space-between">
						<Text fontSize={"md"} color="whiteAlpha.600">
							Available to issue
						</Text>
						<Text fontSize={"md"}>
							{dollarFormatter.format(
								Big(pos.adjustedCollateral ?? 0).sub(pos.debt ?? 0).toNumber()
							)}{" "}
							{"->"}{" "}
							{dollarFormatter.format(
								Big(pos.adjustedCollateral ?? 0).sub(Big(amount || 0).mul(prices[asset.token.id] ?? 0)).sub(pos.debt ?? 0).toNumber()
							)}
						</Text>
					</Flex>
				</Box>
			</Box>

			<Flex mt={2} justify="space-between"></Flex>
			<Button
				isDisabled={
					loading ||
					!isConnected ||
					chain?.unsupported ||
					!amount ||
					amountNumber == 0 ||
					Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ||
					!isValid()
				}
				isLoading={loading}
				loadingText="Please sign the transaction"
				bgColor="primary.400"
				width="100%"
				color="white"
				mt={4}
				onClick={mint}
				size="lg"
				rounded={0}
				_hover={{
					opacity: "0.5",
				}}
			>
				{isConnected && !chain?.unsupported ? (
					isValid() ? (
						Big(amountNumber > 0 ? amount : amountNumber).gt(
							max()
						) ? (
							<>Insufficient Collateral</>
						) : !amount || amountNumber == 0 ? (
							<>Enter amount</>
						) : (
							<>Mint</>
						)
					) : (
						<>Invalid Referral Code</>
					)
				) : (
					<>Please connect your wallet</>
				)}
			</Button>

			<Response
				response={response}
				message={message}
				hash={hash}
				confirmed={confirmed}
			/>
		</Box>
	);
};

export default Issue;
