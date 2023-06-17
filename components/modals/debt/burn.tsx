import React, { useState } from "react";
import {
	Button,
	Box,
	Text,
	Flex,
	useDisclosure,
	Divider,
	Link,
	Tooltip
} from "@chakra-ui/react";
import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext } from "../../context/AppDataProvider";
import { useAccount, useNetwork } from "wagmi";
import { PYTH_ENDPOINT, dollarFormatter, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import Response from "../_utils/Response";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useToast } from '@chakra-ui/react';
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceContext";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";

const Burn = ({ asset, amount, setAmount, amountNumber }: any) => {
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const { address } = useAccount();
	const { chain } = useNetwork();
	const toast = useToast();
	const {walletBalances, updateBalance} = useBalanceData();
	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position();
	
	const max = () => {
		if(!address) return '0';
		if(!prices[asset.token.id] || prices[asset.token.id] == 0) return '0';
		// minimum of both
		const v1 = Big(pos.debt ?? 0).div(prices[asset.token.id] ?? 0);
		const v2 = Big(walletBalances[asset.token.id] ?? 0).div(10 ** 18);
		return (v1.gt(v2) ? v2 : v1).toString();
	}

	const {
		pools,
		tradingPool,
		updatePoolBalance
	} = useContext(AppDataContext);

	const {getUpdateData} = useUpdateData();

	const burn = async () => {
		if (!amount) return;
		setLoading(true);
		setConfirmed(false);
		setHash(null);
		setResponse("");
		setMessage("");

		
		let pool = await getContract("Pool", chain?.id!, pools[tradingPool].id);
		let value = Big(amount)
		.times(10 ** 18)
		.toFixed(0);
		
		let args = [
			asset.token.id, 
			value
		];
		
		const priceFeedUpdateData = await getUpdateData();
		if(priceFeedUpdateData.length > 0) args.push(priceFeedUpdateData);

		send(
			pool,
			"burn",
			args
		)
			.then(async (res: any) => {
				const response = await res.wait(1);
				const decodedLogs = response.logs.map((log: any) =>
				{
					try {
						return pool.interface.parseLog(log)
					} catch (e) {
						console.log(e)
					}
				});
				if(chain?.id! == 280){
					decodedLogs.pop();
				}
				console.log("decodedLogs", decodedLogs);
				console.log(decodedLogs[decodedLogs.length - 1].args.value.toString(), decodedLogs[decodedLogs.length - 2].args.value.toString(), decodedLogs[decodedLogs.length - 3].args.value.toString());
				const amountUSD = Big(decodedLogs[decodedLogs.length - 2].args.value.toString()).mul(asset.priceUSD).div(10 ** 18).mul(1 - asset.burnFee/10000).toFixed(4);
				updatePoolBalance(pools[tradingPool].id, decodedLogs[decodedLogs.length - 1].args.value.toString(), amountUSD, true);
				updateBalance(asset.token.id, decodedLogs[decodedLogs.length - 2].args.value.toString(), true);
				setAmount('0');
				setConfirmed(true);

				setLoading(false);
				toast({
					title: "Burn Successful!",
					description: <Box>
						<Text>
					{`You have burned ${amount} ${asset.token.symbol}`}
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
					position: "top-right"
				});
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

	const { isConnected } = useAccount();

	return (
		<Box px={5} pb={5} pt={0.5} bg='bg2'>
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
				<Box  >
						<Box>
						<Text mt={6} fontSize={"sm"} color='whiteAlpha.600' fontWeight={'bold'}>
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
								{Number(pos.collateral) > 0 ? <Text fontSize={"md"}>{(Big(pos.debt).div(pos.collateral).mul(100)).toFixed(1)} % {"->"} {Big(pos.debt).sub(amount*prices[asset.token.id]).div(pos.collateral).mul(100).toFixed(1)}%</Text> : <Text fontSize={"md"}>-</Text>}
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="whiteAlpha.600">
									Available to issue
								</Text>
								{/* <Text fontSize={"md"}>{dollarFormatter.format(pools[tradingPool].adjustedCollateral - pools[tradingPool].userDebt)} {"->"} {dollarFormatter.format(pools[tradingPool].adjustedCollateral + amount*asset.priceUSD - pools[tradingPool].userDebt)}</Text> */}
								<Text fontSize={"md"}>{dollarFormatter.format(Number(pos.adjustedCollateral) - Number(pos.debt))} {"->"} {dollarFormatter.format(Number(pos.adjustedCollateral) + amount*prices[asset.token.id] - Number(pos.debt))}</Text>
							</Flex>
						</Box>
					</Box>

						<Flex mt={2} justify="space-between">
						</Flex>
						<Button
							isDisabled={
								loading ||
								!isConnected ||
								chain?.unsupported ||
								!amount ||
								amountNumber == 0 ||
								Big(amountNumber > 0 ? amount : amountNumber).gt(max()) 
							}
							isLoading={loading}
							loadingText="Please sign the transaction"
							bgColor="secondary.400"
							width="100%"
							color="white"
							mt={4}
							onClick={burn}
							size="lg"
							rounded={0}
							_hover={{
								opacity: "0.5",
							}}
						>
							{isConnected && !chain?.unsupported ? (
								Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ? (
									<>Insufficient Collateral</>
								) : !amount || amountNumber == 0 ? (
									<>Enter amount</>
								) : (
									<>Burn</>
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
		</Box>
	);
};

export default Burn;
