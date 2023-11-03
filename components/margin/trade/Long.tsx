import React, { useEffect, useState } from "react";
import {
	Text,
	Image,
	TabPanel,
	Flex,
	useDisclosure,
	Box,
	Button,
    Divider,
    Select,
    useToast,
    Link,
	useColorMode,
  NumberInputStepper,
} from "@chakra-ui/react";

import {
	NumberInput,
	NumberInputField
} from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { useBalanceData } from "../../context/BalanceProvider";
import router from "next/router";
import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from "@chakra-ui/react";
import { usePriceData } from "../../context/PriceContext";
import { ADDRESS_ZERO, EIP712_VERSION, ESYX_PRICE, POOL, ROUTER_ENDPOINT, defaultChain, dollarFormatter, tokenFormatter } from "../../../src/const";
import { usePerpsData } from "../../context/PerpsDataProvider";
import { getABI, getAddress, getContract, send } from "../../../src/contract";
import { ExternalLinkIcon, InfoIcon, InfoOutlineIcon, WarningTwoIcon } from "@chakra-ui/icons";
import Big from "big.js";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import useUpdateData from "../../utils/useUpdateData";
import { useLendingData } from "../../context/LendingDataProvider";
import { formatInput, parseInput } from "../../utils/number";
import { VARIANT } from "../../../styles/theme";
import SelectBody2 from "./SelectBody2";
import TokenSelector from "../TokenSelector";
import { BsArrowDown } from "react-icons/bs";
import { AiOutlineDown } from "react-icons/ai";
import { useAppData } from "../../context/AppDataProvider";
import axios from 'axios';
import { motion } from "framer-motion";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import RouteDetails from "../../swap/RouteDetails";

const labelStyles = {
	mt: "-5px",
	ml: "-2.5",
	fontSize: "sm",
};

export default function Long() {
	const [inAmount, setInAmount] = React.useState("");
	const [outAmount, setOutAmount] = React.useState("");
	const [inAssetIndex, setInAssetIndex] = React.useState(6);
	const [leverage, setLeverage] = React.useState(5);
	const { chain } = useNetwork();
	const { pair }: any = router.query;
	const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPosition, setSelectedPosition] = React.useState(0);
  const { positions, addPosition, pairs } = usePerpsData();
	const { pools } = useLendingData();
  const [dataLoading, setDataLoading] = useState(false);

	const {
		walletBalances,
		updateFromTx,
		liquidTokens: tokens,
		allowances,
		nonces,
	} = useBalanceData();

	const { prices } = usePriceData();
  const [error, setError] = useState(null);

	const onInputTokenSelected = (i: number) => {
		setInAssetIndex(i);
    setInAmount('');
		setOutAmount('');
    setApprovedAmount('0');
    setData(null);
	};

	const setOutputAmount = (e: any) => {
		e = parseInput(e);
		setOutAmount(e);
		setLeverage(Big(e).mul(prices[pairs[pair].token0.id]).div(Big(inAmount).mul(prices[tokens[inAssetIndex].id])).toNumber());
	};

	const setMax = (multiplier: number) => {
		let v1 = Big(walletBalances[tokens[inAssetIndex].id]).div(10 ** tokens[inAssetIndex].decimals).mul(multiplier);
		let v2 = Big(availableLiquidity()).mul(0.99).div(prices[tokens[inAssetIndex].id]).div(leverage).mul(multiplier);
		let min = v1.lt(v2) ? v1 : v2;
		if(min.lt(0)) min = Big(0);
		setInputAmount(min.toString());
	};

  const setInputAmount = async (e: any) => {
    setError(null)
		e = parseInput(e);
		setInAmount(e);
    if(Number(e) == 0 || tokens[inAssetIndex]?.id == pairs[pair].token0.id) {
      setOutAmount(Big(Number(e)).mul(leverage).toString());
			return;
		}
    
    setDataLoading(true);
    axios.get(ROUTER_ENDPOINT, {
      params: {
        tokenIn: tokens[inAssetIndex]?.id,
        tokenOut: pairs[pair].token0.id,
        amount: e,
        kind: 0,
        sender: ADDRESS_ZERO,
        recipient: ADDRESS_ZERO,
        deadline: (Date.now()/1000).toFixed(0) + 5 * 60,
        slipage: maxSlippage
      }
    })
      .then((res: any) => {
        setDataLoading(false);
        const swapData = res.data.data;
        setSwapData(swapData);
        setOutAmount(
          Big(swapData.fData.estimatedOut).mul(leverage).div(10 ** pairs[pair].token0.decimals).toString()
        );
      })
      .catch((err: any) => {
        setDataLoading(false);
        setOutAmount('');
        setSwapData(null);
        console.log(err);
        setError(err.response?.data?.message ?? "Error fetching data")
      })
	};

	const _setLeverage = (e: number) => {
		setLeverage(e);
		if(!Number(inAmount)) return;
		setOutAmount(Big(e).mul(inAmount).mul(prices[tokens[inAssetIndex].id]).div(prices[pairs[pair as string].token0.id]).toString());
	}

	const { signTypedDataAsync } = useSignTypedData();
  const { address, isConnected } = useAccount();
	const [deadline, setDeadline] = useState('0');
	const [data, setData] = useState(null);
	const [approvedAmount, setApprovedAmount] = useState('0');
	const [approveLoading, setApproveLoading] = useState(false);
	const [loading, setLoading] = useState(false);
  const [swapData, setSwapData] = useState<any>(null);

  const toast = useToast();
  const handleError = useHandleError(PlatformType.LENDING);

  const approveTx = async () => {
		setApproveLoading(true);
		const collateralContract = await getContract("MockToken", chain?.id ?? defaultChain.id, positions[selectedPosition]?.id);
		send(
			collateralContract,
			"approve",
			[
				positions[selectedPosition]?.id,
				ethers.constants.MaxUint256
			]
		)
		.then(async (res: any) => {
			const response = await res.wait();
			updateFromTx(response);
			setApproveLoading(false);
			toast({
				title: "Approval Successful",
				description: <Box>
					<Text>
				{`You have approved ${tokens[inAssetIndex].symbol}`}
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
			})
		}).catch((err: any) => {
			handleError(err);
			setApproveLoading(false);
		})
	}

	const approve = async () => {
		setApproveLoading(true);
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * 20).toFixed(0);
		const value = ethers.constants.MaxUint256;
		signTypedDataAsync({
			domain: {
				name: tokens[inAssetIndex].name,
				version: EIP712_VERSION(tokens[inAssetIndex].id),
				chainId: defaultChain.id,
				verifyingContract: tokens[inAssetIndex].id,
			},
			types: {
				Permit: [
					{ name: "owner", type: "address" },
					{ name: "spender", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "nonce", type: "uint256" },
					{ name: "deadline", type: "uint256" },
				]
			},
			value: {
				owner: address!,
				spender: positions[selectedPosition]?.id,
				value,
				nonce: nonces[tokens[inAssetIndex].id] ?? 0,
				deadline: BigNumber.from(_deadline),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApproveLoading(false);
				setApprovedAmount(value.toString());
				toast({
					title: "Approval Signed",
					description: <Box>
						<Text>
							{`for ${tokens[inAssetIndex].symbol}`}
						</Text>
						<Text>
							{/* Please deposit to continue */}
						</Text>
					</Box>,
					status: "info",
					duration: 10000,
					isClosable: true,
					position: "top-right"
				})
			})
			.catch((err: any) => {
				handleError(err);
				setApproveLoading(false);
			});
	};

  const validate = () => {
    if(!isConnected){
      return {
        stage: 0,
        message: "Connect Wallet"
      }
    } else if (chain?.unsupported){
      return {
        stage: 0,
        message: "Unsupported Network"
      }
    } else if (error){
      return {
        stage: 0,
        message: error
      }
    }
    else if(Number(inAmount) == 0 || isNaN(Number(inAmount))){
      return {
        stage: 0,
        message: "Enter Amount"
      }
    } else if (Big(Number(inAmount)).gt(Big(walletBalances[tokens[inAssetIndex].id]).div(10**tokens[inAssetIndex].decimals))) {
      return {
        stage: 0,
        message: "Amount Exceeds Balance"
      }
    } 
    else if (Big(Number(outAmount)).mul(prices[pairs[pair].token0.id]).gt(availableLiquidity())) {
      return {
        stage: 0,
        message: "Insufficient Liquidity"
      }
    } 
    else if (!positions[selectedPosition]?.id || (!isSynth(tokens[inAssetIndex].id) && !swapData)) {
      return {
        stage: 0,
        message: "Loading..."
      }
    } 
    
    // check allowance if not native
    if (tokens[inAssetIndex].id !== ethers.constants.AddressZero && !data) {
      // if not approved
      if(Big(allowances[tokens[inAssetIndex].id]?.[positions[selectedPosition]?.id] ?? 0).add(Big(approvedAmount).mul(10 ** (tokens[inAssetIndex].decimals ?? 18))).lt(
        Big(inAmount).mul(10 ** (tokens[inAssetIndex].decimals ?? 18))
      )) {
        return {
          stage: 1,
          message: "Approve Use Of" + " " + tokens[inAssetIndex].symbol
        }
      } else if(Big(approvedAmount).gt(0) && !Big(approvedAmount).eq(inAmount)){
        return {
          stage: 1,
          message: "Approve Use Of" + " " + tokens[inAssetIndex].symbol
        }
      }
    } else {
      return {
        stage: 3,
        message: "Long"
      }
    }

  return {
    stage: 3,
    message: ""
  }
  }

  const { getUpdateData } = useUpdateData();
  const { isSynth } = useAppData();

  const open = async () => {
      let calls: any[] = [];
      setLoading(true);
      let position = new ethers.Contract(positions[selectedPosition]?.id, getABI("PerpPosition", chain?.id!));
      let erc20 = new ethers.Contract(tokens[inAssetIndex].id, getABI("MockToken", chain?.id!));
      let factory = new ethers.Contract(pairs[pair].perpFactory, getABI("PerpFactory", chain?.id!));
      let _amount = ethers.utils.parseUnits(Big(inAmount).toFixed(tokens[inAssetIndex].decimals, 0), tokens[inAssetIndex].decimals);
      let _leveragedAmount = ethers.utils.parseUnits(Big(inAmount).mul(leverage - 1).div(prices[pairs[pair].token0.id]).toFixed(tokens[inAssetIndex].decimals, 0), 18);
      let deadline_m = 5;
      let maxSlippage = 0.5;
      // 1. Transfer inAsset to position if doesn't have enough base asset balance
      if(data){
          // permit position to take cusd
          const {v, r, s} = ethers.utils.splitSignature(data!);
          calls.push(position.interface.encodeFunctionData("call", [tokens[inAssetIndex].id, erc20.interface.encodeFunctionData("permit", [address, position.address, ethers.constants.MaxUint256, deadline, v, r, s]), 0]));
      }
      calls.push(position.interface.encodeFunctionData("call", [tokens[inAssetIndex].id, erc20.interface.encodeFunctionData("transferFrom", [address, position.address, _amount]), 0]));

      // 2. Update pyth data
      const assetPriceToUpdate = [pairs[pair].token1.id, pairs[pair].token0.id];
      if(isSynth(tokens[inAssetIndex].id) && !assetPriceToUpdate.includes(tokens[inAssetIndex].id)){
        assetPriceToUpdate.push(tokens[inAssetIndex].id);
      }
      const pythUpdateData = await getUpdateData(assetPriceToUpdate);
      calls.push(position.interface.encodeFunctionData("updatePythData", [pythUpdateData]));

      // 3. Swap
      // Check if swap is needed
      if(tokens[inAssetIndex].id !== pairs[pair].token0.id){
        // if synthetic swap 
        if(isSynth(tokens[inAssetIndex].id)){
          // swap tx
          console.log("synth swap", [tokens[inAssetIndex].id, _amount, pairs[pair].token0.id]);
          calls.push(position.interface.encodeFunctionData("swap", [tokens[inAssetIndex].id, _amount, pairs[pair].token0.id]));
        } else {
          const router = await getContract("Router", chain?.id!);
          // approve for router
          calls.push(position.interface.encodeFunctionData("call", [
            tokens[inAssetIndex].id, 
            erc20.interface.encodeFunctionData("approve", [router.address, ethers.constants.MaxUint256]), 
            0
          ]));
          // swap tx
          let swapData = (await axios.get(ROUTER_ENDPOINT, {
            params: {
              tokenIn: tokens[inAssetIndex]?.id,
              tokenOut: pairs[pair].token0.id,
              amount: inAmount,
              kind: 0,
              sender: position.address,
              recipient: position.address,
              deadline: (Date.now()/1000).toFixed(0) + deadline_m * 60,
              slipage: maxSlippage
            }
          })).data.data;
          const tokenPricesToUpdate = swapData.swaps.filter((swap: any) => swap.isBalancerPool == false).map((swap: any) => swap.assets).flat();
          const pythData = await getUpdateData(tokenPricesToUpdate);
          calls.push(position.interface.encodeFunctionData("call", [
            router.address,
            router.interface.encodeFunctionData("swap", [swapData, pythData]),
            0
          ]));
        }
      }
      // 4. Approvals
      let baseHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "address"], [pairs[pair].token0.id, positions[selectedPosition].id]));
      let quoteHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "address"], [pairs[pair].token1.id, positions[selectedPosition].id]));
      if(Big(allowances[baseHash][POOL]).lt(ethers.constants.MaxUint256.div(2).toString())){
        // Position approves to supply ceth pool
        calls.push(position.interface.encodeFunctionData("call", [pairs[pair].token0.id, erc20.interface.encodeFunctionData("approve", [POOL, ethers.constants.MaxUint256]), 0]));
      }
      if(Big(allowances[baseHash][pairs[pair].token0.id]).lt(ethers.constants.MaxUint256.div(2).toString())){
        // For repayment of flashloan
        calls.push(position.interface.encodeFunctionData("call", [pairs[pair].token0.id, erc20.interface.encodeFunctionData("approve", [pairs[pair].token0.id, ethers.constants.MaxUint256]), 0]));
      }
                  
      // now we have eth in position contract; supply that to pool
      calls.push(position.interface.encodeFunctionData("supply", [pairs[pair].token0.id, ethers.constants.MaxUint256]));
      // now open position
      calls.push(position.interface.encodeFunctionData("openPosition", [pairs[pair].token0.id, _leveragedAmount, pairs[pair].token1.id]));

      let tx;
      if(selectedPosition == positions.length - 1){
        tx = send(factory, "newPosition", [calls], "10000")
      } else {
        tx = send(position, "multicall", [calls]);
      }

      tx.then(async (tx: any) => {
          tx = await tx.wait();
          updateFromTx(tx);
          setLoading(false);
      })
      .catch((err: any) => {
          handleError(err);
          setLoading(false);
      })
  }

	const availableLiquidity = () => {
		for(let i in pools){
			if(!pools[i] || !pools[i].length) continue;
			let market = pools[i].find((m: any) => m.inputToken.id == pairs[pair].token0.id);
			if(market){
				return Number(((Number(market.totalDepositBalanceUSD) - Number(market.totalBorrowBalanceUSD)) * 0.99).toFixed(2));
			}
		}
		return 0;
	}

	const netAPY = () => {
		let apy = Big(0);
		let rewardsApy = Big(0);
		let total = Big(0);

		const rewardAPY = (market: any, side: string, type = "VARIABLE") => {
			let index = market.rewardTokens.map((token: any) => token.id.split('-')[0] == side && token.id.split('-')[1] == type).indexOf(true);
			if(index == -1) return '0';
			let total = Number(side == 'DEPOSIT' ? market.totalDepositBalanceUSD : market.totalBorrowBalanceUSD);
			if(total == 0) return 'Infinity';
			return Big(market.rewardTokenEmissionsAmount[index])
				.div(1e18)
				.mul(365 * ESYX_PRICE)
				.div(total)
				.mul(100)
				.toFixed(2);
		}

		for(let i in pools){
			let markets = pools[i];
			for(let j in markets){
				let market = markets[j];
				if(market.inputToken.id == pairs[pair].token0.id){
					let amount = Big(Number(outAmount)).mul(prices[pairs[pair].token0.id] ?? 0);
					// supplying base for long
					apy = apy.plus(Big(market.rates.find((rate: any) => rate.side == 'LENDER').rate).mul(amount));
					rewardsApy = rewardsApy.add(amount.mul(rewardAPY(markets[i], 'DEPOSIT')));
					total = total.plus(amount);
				} else if(market.inputToken.id == pairs[pair].token1.id){
					let amount = Big(Number(inAmount)).mul(leverage - 1).mul(prices[pairs[pair].token1.id] ?? 0);
					// borrowing quote for long
					apy = apy.plus(Big(market.rates.find((rate: any) => rate.side == 'BORROWER' && rate.type == 'VARIABLE').rate).mul(amount).neg());
					rewardsApy = rewardsApy.add(amount.mul(rewardAPY(markets[i], 'BORROW')));
					total = total.plus(amount);
				}
			}
		}
		return {
			apy: total.gt(0) ? apy.mul(leverage - 1).div(total).toFixed(4) : '0',
			rewardsApy: total.gt(0) ? rewardsApy.mul(leverage - 1).div(total).toFixed(2) : '0'
		}
	}

  const switchPosition = (e: any) => {
		setSelectedPosition(Number(e.target.value))
		setApprovedAmount('0');
		setData(null);
	}

	const { colorMode } = useColorMode();

  const inputValue = (Number(inAmount) || 0) * prices[tokens[inAssetIndex].id];
  const outputValue = Number(outAmount) * prices[pairs[pair]?.token0?.id] / leverage

  const priceImpact = (100*((outputValue - inputValue)/inputValue) || 0);
	const { getButtonProps, getDisclosureProps, isOpen: isButtonOpen } = useDisclosure()
	const [hidden, setHidden] = useState(!isButtonOpen);
  const [maxSlippage, setMaxSlippage] = useState(0.5);

	return (
		<>
      <TabPanel>
        <>
          {/* Input Asset */}
          <Box mt={4}>
            <NumberInput
              size={"xl"}
              onChange={setInputAmount}
              value={formatInput(inAmount)}
            >
              <Flex align={'center'}>
                <Box>
                  <Text fontSize={'xs'} mb={-6} mx={2} color={'whiteAlpha.600'}>Margin ({dollarFormatter.format(inputValue)})</Text>
                  <NumberInputField rounded={0} p={2} py={2} pt={6} fontSize={'2xl'} placeholder="0" />
                </Box>
                
                <Box w="40%">
                  <SelectBody2
                    asset={tokens[inAssetIndex]}
                    onOpen={onOpen}
                    size={"md"}
                  />
                </Box>

                <NumberInputStepper mr={"40%"} mt={-1}>
                  <Button border={0} fontSize={'xs'} color={'whiteAlpha.600'} onClick={() => setMax(0.5)} variant={'unstyled'}>50%</Button>
                  <Divider my={-1} ml={2} />
                  <Button border={0} fontSize={'xs'} color={'whiteAlpha.600'} onClick={() => setMax(1)} variant={'unstyled'}>MAX</Button>
                </NumberInputStepper>
              </Flex>
            </NumberInput>
          </Box>

          {/* Divider */}
          <Box my={2} p={'5px'} bg={'darkBg.600'} w={'22px'} border={'1px'} borderColor={'whiteAlpha.200'}>
            <AiOutlineDown color="darkBg.400" size={'10px'} />
          </Box>

          {/* Output */}
          <Box mt={4}>
            <NumberInput
              size={"xl"}
              onChange={setOutputAmount}
              value={dataLoading ? '...' : formatInput(outAmount)}
            >
              <Flex align={'center'}>
                <Box>
                  <Text fontSize={'xs'} mb={-6} mx={2} color={'whiteAlpha.600'}>Position Size ({dollarFormatter.format(outputValue * leverage)})</Text>
                  <NumberInputField disabled={true} _disabled={{color: "white"}} rounded={0} p={2} py={2} pt={6} fontSize={'2xl'} placeholder="0" />
                </Box>
                
                <Box w="40%" h={'100%'}>
                <Flex
                  bg={`${colorMode}Bg.200`}
                  align={"center"}
                  justify={"center"}
                  gap={2}
                  py={'20px'}
                  mt={"-6px"}
                >
                  <Image
                    src={`/icons/${
                      (pair as string).split("-")[0]
                    }.svg`}
                    w={30}
                    h={30}
                    alt={(pair as string).split("-")[0]}
                  />
                  <Text
                    fontSize="xl" fontWeight={'semibold'}
                    color="whiteAlpha.800"
                  >
                    {(pair as string).split("-")[0]}
                  </Text>
                </Flex>
                </Box>
              </Flex>
            </NumberInput>
          </Box>

          {/* Leverage */}
          <Box mt={6} bg={colorMode + 'Bg.400'}>
            <Flex
              justify={"space-between"}
              align={"center"}
              border={"1px"}
              borderColor={"whiteAlpha.200"}
            >
              <Flex align={'center'} gap={1.5} bg={colorMode + 'Bg.600'} p={3}>
                <Text>Leverage</Text>
                {/* <InfoOutlineIcon /> */}
              </Flex>
              <Divider orientation="vertical" h={'48px'} />
              <Box w={'100%'} p={3} px={4} bg={colorMode + 'Bg.400'}>
                <Slider
                  onChange={(val) => _setLeverage(val/10)}
                  value={leverage * 10}
                  colorScheme="primary"
                  mb={"-1px"}
                >
                  <SliderMark value={25} {...labelStyles}>
                    <Box w={'10px'} h={'10px'} rounded={'full'} bg={leverage > 2.5 ? 'primary.200' : 'whiteAlpha.200'}></Box>
                  </SliderMark>
                  <SliderMark value={50} {...labelStyles}>
                  <Box w={'10px'} h={'10px'} rounded={'full'} bg={leverage > 5 ? 'primary.200' : 'whiteAlpha.200'}></Box>
                  </SliderMark>
                  <SliderMark value={75} {...labelStyles}>
                  <Box w={'10px'} h={'10px'} rounded={'full'} bg={leverage > 7.5 ? 'primary.200' : 'whiteAlpha.200'}></Box>
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb ml={"-7.5px"} />
                  <SliderMark
                    value={leverage * 10}
                    textAlign='center'
                    bg='primary.300'
                    color='black'
                    fontWeight={'medium'}
                    fontSize={'md'}
                    mt='-10'
                    ml='-5'
                    w='12'
                  >
                    {leverage}x
                  </SliderMark>
                </Slider>
              </Box>
            </Flex>
          </Box>

          <Divider my={4} mt={4} />
          {/* Select position */}
          {positions.length > 1 && <Flex mt={2} align={'center'} border={'1px'} borderColor={'whiteAlpha.300'}>
            <Text m={2} fontSize={'sm'} w={'60%'}>Select Position</Text>
            {positions.length > 0 && <Select bg={colorMode + "Bg.400"} rounded={0} placeholder='Select position' value={selectedPosition} onChange={switchPosition}>
              {positions.map((position: any, index: number) => <option key={position.id} value={index}>{(index !== (positions.length - 1)) ? position.id.slice(0, 6)+'..'+position.id.slice(-4) : 'New Position'}</option>)}
            </Select>}
          </Flex>}

          {swapData && <Box mt={4}>
            {priceImpact < -10 && priceImpact > -100 && <Flex align={'center'} gap={2} px={4} py={2} my={2} bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'} color={'orange'}>
                <WarningTwoIcon />
                <Text>Warning: High Price Impact ({(priceImpact).toFixed(2)}%)</Text>
              </Flex>}
              <Flex
                  justify="space-between"
                  align={"center"}
                  // mb={!isOpen ? !account ? '-4' : '-6' : '0'}
                  bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
                  color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}
                  px={4}
                  py={1.5}
                  cursor="pointer"
                  {...getButtonProps()}
                  _hover={{ bg: colorMode == 'dark' ? "whiteAlpha.100" : "blackAlpha.100" }}
              >
                  <Flex align={"center"} gap={2} fontSize="md">
                      <InfoOutlineIcon />
                      <Text>
                          1 {tokens[inAssetIndex].symbol} ={" "}
                          {tokenFormatter.format(
                              (Number(outAmount) / (leverage * Number(inAmount))) || 0
                          )}{" "}
                          {pairs[pair]?.token0?.symbol}
                      </Text>
                      <Text fontSize={'sm'} >
                          (
                          {dollarFormatter.format(
                              ((outputValue / inputValue) || 0) * prices[tokens[inAssetIndex].id]
                          )}
                          )
                      </Text>
                  </Flex>
                  <Flex mr={-2}>
                      {!isButtonOpen ? <RiArrowDropDownLine size={30} /> : <RiArrowDropUpLine size={30} />}
                  </Flex>
              </Flex>
              <Box>
                  <motion.div
                      {...getDisclosureProps()}
                      hidden={hidden}
                      initial={false}
                      onAnimationStart={() => setHidden(false)}
                      onAnimationComplete={() => setHidden(!isButtonOpen)}
                      animate={{ height: isButtonOpen ? '144px' : 0 }}
                      style={{
                          width: '100%'
                      }}
                  >
                  {isButtonOpen && 	<>
                      <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 
                      <Flex bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'} flexDir={'column'} gap={1} px={3} py={2} fontSize='sm' color={colorMode == 'dark' ? 'whiteAlpha.800' : 'blackAlpha.800'}>
                          <Flex color={priceImpact > 0 ? 'green.400' : priceImpact < -2 ? 'orange.400' : 'whiteAlpha.800'} justify={'space-between'}>
                          <Text>{priceImpact > 0 ? 'Bonus' : 'Price Impact'}</Text>
                          <Text>{(priceImpact).toFixed(2)}%</Text>
                          </Flex>
                          
                          <Flex justify={'space-between'}>
                          <Text>Minimum Out</Text>
                          <Text>{tokenFormatter.format(Number(outAmount) - Number(outAmount) * maxSlippage/100)} {pairs[pair]?.token0?.symbol}</Text>
                          </Flex>

                          <Flex justify={'space-between'}>
                          <Text>Expected Out</Text>
                          <Text>{tokenFormatter.format(Number(outAmount))} {pairs[pair]?.token0?.symbol}</Text>
                          </Flex>

                          <Flex justify={'space-between'}>
                          <Text>Network Fee</Text>
                          <Text>~{dollarFormatter.format((3000 * 0.5 * 0.0001))}</Text>
                          </Flex>
                          <RouteDetails swapData={swapData} />
                      </Flex></>}
                  </motion.div>
              </Box>
            </Box>}

          {/* Long */}
          <Box mt={4}>
            {validate().stage <= 2 && <Box mt={2} className={VARIANT + "-" + colorMode + "-" + ((validate().stage != 1 || approveLoading) ? "disabledSecondaryButton" : 'secondaryButton')}><Button
                isDisabled={validate().stage != 1}
                isLoading={approveLoading}
                loadingText="Please sign the transaction"
                color='white'
                width="100%"
                onClick={tokens[inAssetIndex].isPermit ? approve : approveTx}
                size="lg"
                rounded={0}
                bg={'transparent'}
                _hover={{ bg: "transparent" }}
            >
                {validate().message}
            </Button>
            </Box>}
                
            {validate().stage > 0 && <Box mt={2} className={VARIANT + "-" + colorMode + "-" + ((validate().stage < 2 || loading) ? "disabledSecondaryButton" : 'secondaryButton')} > <Button
                isDisabled={validate().stage < 2}
                isLoading={loading}
                loadingText="Please sign the transaction"
                width="100%"
                color="white"
                rounded={0}
                bg={'transparent'}
                onClick={open}
                size="lg"
                _hover={{ bg: "transparent" }}
            >
                Long
            </Button></Box>}
        </Box>

          {/* Fees and Liquidity */}
          <Divider mt={4} />
          <Flex mt={5} mb={0} flexDir={'column'} gap={0.5}>
            <Flex justify={'space-between'} fontSize={'sm'}>
              <Text >Available Liquidity</Text>
              <Text ml={"auto"}>{dollarFormatter.format(availableLiquidity())}</Text>
            </Flex>
            <Flex justify={'space-between'} fontSize={'sm'}>
              <Text>APR + Rewards</Text>
              <Flex gap={1} align={'center'}>
              <Text ml={"auto"}>
                {netAPY().apy} %
              </Text>
              <Text ml={"auto"} color={'whiteAlpha.700'}>
                + {netAPY().rewardsApy} %
              </Text>
              <Image ml={1} src="/veREAX.svg" w={'16px'} rounded={'0'} alt="veREAX" />
              </Flex>
            </Flex>
            <Flex justify={'space-between'} fontSize={'sm'}>
              <Text>Fees</Text>
              <Flex gap={1}>
                {/* <Text ml={"auto"}>{(0.25).toFixed(2)} %</Text> */}
                <Text ml={"auto"} color={'whiteAlpha.700'}>{dollarFormatter.format(Number(outAmount) * prices[pairs[pair].token0.id] * 0.25 / (leverage * 100))}</Text>
              </Flex>
            </Flex>
          </Flex>
        </>
      </TabPanel>

      <TokenSelector
				isOpen={isOpen}
				onClose={onClose}
				onTokenSelected={onInputTokenSelected}
			/>
		</>
	);
}
