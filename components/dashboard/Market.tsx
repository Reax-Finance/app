import React, { useContext, useEffect, useState } from "react";
import Info from "../infos/Info";
import { Flex, Text, Box, Heading, Button, useToast, Divider } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IoMdAnalytics, IoMdCash } from "react-icons/io";
import IconBox from "./IconBox";
import { TbReportMoney } from "react-icons/tb";
import Big from "big.js";
import { useAppData } from "../context/AppDataProvider";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { ESYX_PRICE, dollarFormatter } from "../../src/const";
import PoolSelector from "./PoolSelector";
import APRInfo from "../infos/APRInfo";
import { TokenContext } from "../context/TokenContext";
import { useAccount, useNetwork } from "wagmi";
import { getContract } from "../../src/contract";

export default function Market() {
	const { pools, tradingPool, account } = useAppData();
    const [totalDebt, setTotalDebt] = useState<any>('0.00');
    const [totalCollateral, setTotalCollateral] = useState<any>('0.00');

    useEffect(() => {
        if(!pools?.[tradingPool]) return;
        let _totalDebt = Big(0);
        for(let i in pools[tradingPool].synths){
            _totalDebt = _totalDebt.plus(Big(pools[tradingPool].synths[i].totalSupply).div(10**18).mul(pools[tradingPool].synths[i].priceUSD));
        }
        setTotalDebt(_totalDebt.toFixed(2));

        let _totalCollateral = Big(0);
        for(let i in pools[tradingPool].collaterals){
            _totalCollateral = _totalCollateral.plus(Big(pools[tradingPool].collaterals[i].totalDeposits).div(10**pools[tradingPool].collaterals[i].token.decimals).mul(pools[tradingPool].collaterals[i].priceUSD));
        }
        setTotalCollateral(_totalCollateral.toFixed(2));
    }, [pools, tradingPool])

	const esSyxApr = () => {
		if (!pools[tradingPool]) return "0";
		if (Big(pools[tradingPool]?.totalDebtUSD).eq(0)) return "0";
		return Big(pools[tradingPool]?.rewardSpeeds[0])
			.div(1e18)
			.mul(365 * 24 * 60 * 60 * ESYX_PRICE)
			.div(pools[tradingPool]?.totalDebtUSD)
			.mul(100)
			.toFixed(2);
	};

	const debtBurnApr = () => {
		if (!pools[tradingPool]) return "0";
		if (Big(pools[tradingPool]?.totalDebtUSD).eq(0)) return "0";
		return Big(pools[tradingPool]?.averageDailyBurn ?? 0)
			.mul(365)
			.div(pools[tradingPool]?.totalDebtUSD)
			.mul(100)
			.toFixed(2);
	};

	const [synAccrued, setSynAccrued] = useState<any>(null);
	const [claiming, setClaiming] = useState(false);
	const { chain: connectedChain } = useNetwork();
	const { address, isConnected } = useAccount();

	const { claimed } = useContext(TokenContext);
	const toast = useToast();

	useEffect(() => {
		if (connectedChain && pools[tradingPool]) {
			if (
				isConnected &&
				!(connectedChain as any).unsupported &&
				pools.length > 0
			) {
				getContract("SyntheX", connectedChain!.id).then((synthex) => {
					synthex.callStatic
						.getRewardsAccrued(
							[pools[0].rewardTokens[0].id],
							address,
							[pools[tradingPool].id]
						)
						.then((result) => {
							setSynAccrued(result[0].toString());
						})
						.catch((err) => {
							console.log("Failed to getRewardsAccrued", err);
						})
				});
			}
		}
	}, [connectedChain, synAccrued, isConnected, pools, address, tradingPool]);

	const claim = async () => {
		setClaiming(true);
		const synthex = await getContract("SyntheX", connectedChain!.id);
		synthex["claimReward"](
			[pools[0].rewardTokens[0].id],
			address,
			pools.map((pool: any) => pool.id)
		)
			.then(async (result: any) => {
				await result.wait(1);
				setClaiming(false);
				setSynAccrued("0");
				claimed((synAccrued / 1e18).toString());
				toast({
					title: "Claimed!",
					description: "Your rewards have been claimed.",
					status: "success",
					duration: 10000,
					isClosable: true,
					position: "top-right",
				});
			})
			.catch((err: any) => {
				console.log(err);
				setClaiming(false);
				toast({
					title: "Error",
					description: "There was an error claiming your rewards.",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right",
				});
			});
	};

	return (
		<>
			<Box
				w="100%"
				display={{ sm: "block", md: "flex" }}
				justifyContent={"space-between"}
				alignContent={"start"}
				mt={10}
				mb={6}
			>
				<Box>
					<PoolSelector />

					<Flex mt={7} mb={4} gap={10}>
						<Flex gap={2}>
							<Heading size={"sm"} color={"primary.400"}>
								Total Supply
							</Heading>
							<Heading size={"sm"}>$ {totalCollateral}</Heading>
						</Flex>

						<Flex gap={2}>
							<Heading size={"sm"} color={"secondary.400"}>
								Total Debt
							</Heading>
							<Heading size={"sm"}>$ {totalDebt}</Heading>
						</Flex>

						<Flex gap={2}>
							<Heading size={"sm"} color={"secondary.400"}>
								APR
							</Heading>
							<APRInfo
								debtBurnApr={debtBurnApr()}
								esSyxApr={esSyxApr()}
							>
								<Box cursor={"help"}>
									<Heading size={"sm"}>
										{(
											Number(debtBurnApr()) +
											Number(esSyxApr())
										).toFixed(2)}
										%
									</Heading>
								</Box>
							</APRInfo>
						</Flex>
					</Flex>
				</Box>

				{
					(pools[tradingPool]
					?.userDebt > 0 || synAccrued > 0) &&
					<Box textAlign={"right"}>
					<Heading size={"sm"} color={"whiteAlpha.600"}>
						Rewards
					</Heading>
					<Box gap={20} mt={2}>
						<Flex justify={"end"} align={"center"} gap={2}>
							<Text fontSize={"2xl"}>{synAccrued ? Big(synAccrued).div(10**18).toFixed(2) : '-'} </Text>
							<Text fontSize={"2xl"} color={"whiteAlpha.400"}>
								veREAX
							</Text>
						</Flex>
						<Box mt={2} w={'100%'} className="outlinedButton">
						<Button
							onClick={claim}
							bg={'transparent'}
							w="100%"
							rounded={0}
							size={"sm"}
                            isLoading={claiming}
                            loadingText={"Claiming"}
                            isDisabled={synAccrued == null || Number(synAccrued) == 0}
							_hover={{ bg: "transparent" }}
						>
							Claim
						</Button>
						</Box>
					</Box>
				</Box>}
			</Box>
		</>
	);
}