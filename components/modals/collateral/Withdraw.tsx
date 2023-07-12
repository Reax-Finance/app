import React, { useState } from "react";

import {
	Flex,
	Image,
	Text,
	Box,
	useDisclosure,
	Button,
	Divider,
    Tooltip,
	useToast,
} from "@chakra-ui/react";
import Big from "big.js";
import InfoFooter from "../_utils/InfoFooter";
import Response from "../_utils/Response";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { getContract, send } from "../../../src/contract";
import { useContext } from "react";
import { AppDataContext, useAppData } from "../../context/AppDataProvider";
import { PYTH_ENDPOINT, compactTokenFormatter, dollarFormatter, numOrZero } from "../../../src/const";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import useUpdateData from "../../utils/useUpdateData";
import { useBalanceData } from "../../context/BalanceProvider";
import { usePriceData } from "../../context/PriceContext";
import { useSyntheticsData } from "../../context/SyntheticsPosition";
import useHandleError, { PlatformType } from "../../utils/useHandleError";

export default function Withdraw({ collateral, amount, setAmount, amountNumber, isNative }: any) {
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<string | null>(null);
	const [hash, setHash] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [message, setMessage] = useState("");
	const toast = useToast();
	const { prices } = usePriceData();
	const { position } = useSyntheticsData();
	const pos = position();
	const { pools, tradingPool, updateFromTx: updateFromSynthTx } = useAppData();

	const {updateFromTx} = useBalanceData();
	const {getUpdateData} = useUpdateData();
	const { address, isConnected } = useAccount();
	const { chain } = useNetwork();

	// adjustedDebt - pools[tradingPool]?.userDebt = assetAmount*assetPrice*ltv
	const max = () => {
		const v1 = prices[collateral.token.id] > 0 ? Big(pos.adjustedCollateral)
							.sub(pos.debt)
							.div(prices[collateral.token.id])
							.div(collateral.baseLTV)
							.mul(1e4)
					: Big(0);
		const v2 = Big(collateral.balance ?? 0).div(10 ** collateral.token.decimals);
		// min(v1, v2)
		return (v1.gt(v2) ? v2 : v1).toString();
	};

	const handleError = useHandleError(PlatformType.SYNTHETICS);

	const withdraw = async () => {
		setLoading(true);
		setMessage("")
		setConfirmed(false);
		setResponse(null);
		setHash(null);
		const poolId = pools[tradingPool].id;
		const pool = await getContract("Pool", chain?.id!, poolId);
		const _amount = Big(amount).mul(10**collateral.token.decimals).toFixed(0);

		let args = [collateral.token.id, _amount, isNative];
		
		const priceFeedUpdateData = await getUpdateData()
		if(priceFeedUpdateData.length > 0) args.push(priceFeedUpdateData);
		
		send(pool, "withdraw", args).then(async (res: any) => {
			const response = await res.wait();
			updateFromTx(response);
			updateFromSynthTx(response);
			setAmount('0');
			setLoading(false);
			toast({
				title: "Withdrawal Successful",
				description: <Box>
					<Text>
						{`You have withdrawn ${amount} ${collateral.token.symbol}`}
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
				position: 'top-right'
			})
		}).catch((err: any) => {
			handleError(err)
			setLoading(false);
		});
	};

	return (
		<>
			<Box px={5} py={5}>
				<Box>
					<Flex justify="space-between">
						<Tooltip label='Max capacity to have this asset as collateral'>
						<Text fontSize={"md"} color="whiteAlpha.600" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Capacity
						</Text>
						</Tooltip>

						<Text fontSize={"md"}>
							{compactTokenFormatter.format(
								Number(
									ethers.utils.formatUnits(
										collateral.totalDeposits ?? 0,
										collateral.token.decimals
									)
								)
							)}{" "}
							/{" "}
							{compactTokenFormatter.format(
								Number(
									ethers.utils.formatUnits(
										collateral.cap,
										collateral.token.decimals
									)
								)
							)}
						</Text>
					</Flex>
					<Divider my={2} />

					<Flex justify="space-between">
							<Flex gap={1}>
						<Tooltip label='Minimum Loan to Value Ratio'>

						<Text fontSize={"md"} color="whiteAlpha.600" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Base LTV
						</Text>
						</Tooltip>
						<Text fontSize={"md"} color="whiteAlpha.600">
						/ 
						</Text>
						<Tooltip label='Account would be liquidated if LTV reaches this threshold' >

						<Text fontSize={"md"} color="whiteAlpha.600" textDecor={'underline'} cursor={'help'} style={{textUnderlineOffset: '2px', textDecorationStyle: 'dotted'}}>
							Liq Threshold
						</Text>
						</Tooltip>
							</Flex>

						<Text fontSize={"md"}>
							{parseFloat(collateral.baseLTV) / 100} % /{" "}
							{parseFloat(collateral.liqThreshold) / 100} %
						</Text>
					</Flex>
				</Box>

				
                <Box>
						<Text mt={8} fontSize={"sm"} color='whiteAlpha.600' fontWeight={'bold'}>
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
								<Text fontSize={"md"}>{numOrZero(pools[tradingPool]?.userDebt/pools[tradingPool]?.userCollateral * 100).toFixed(1)} % {"->"} {(pools[tradingPool]?.userCollateral ?? 0) - numOrZero(pools[tradingPool]?.userDebt /(pools[tradingPool]?.userCollateral - (amount*collateral.priceUSD)) * 100)}%</Text>
							</Flex>
							<Divider my={2} />
							<Flex justify="space-between">
								<Text fontSize={"md"} color="whiteAlpha.600">
									Available to issue
								</Text>
								<Text fontSize={"md"}>{dollarFormatter.format((pools[tradingPool]?.adjustedCollateral ?? 0) - (pools[tradingPool]?.userDebt ?? 0))} {"->"} {dollarFormatter.format((pools[tradingPool]?.adjustedCollateral ?? 0) - (amount*prices[collateral.token.id]*collateral.baseLTV/10000) - (pools[tradingPool]?.userDebt ?? 0))}</Text>
							</Flex>
						</Box>
					</Box>
            
				<Box mt={6} className="primaryButton">
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
                    bgColor="transparent"
                    width="100%"
                    color="white"
                    onClick={withdraw}
                    size="lg"
                    rounded={0}
                    _hover={{
                        bg: "transparent",
                    }}
                >
                    {isConnected && !chain?.unsupported ? (
                        Big(amountNumber > 0 ? amount : amountNumber).gt(max()) ? (
                            <>Insufficient Collateral</>
                        ) : !amount || amountNumber == 0 ? (
                            <>Enter Amount</>
                        ) : (
                            <>Withdraw</>
                        )
                    ) : (
                        <>Please connect your wallet</>
                    )}
                </Button>
				</Box>

				<Response
					response={response}
					message={message}
					hash={hash}
					confirmed={confirmed}
				/>
			</Box>
		</>
	);
}
