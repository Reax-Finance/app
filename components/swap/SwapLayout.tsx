import {
	Box,
	Text,
	Flex,
	Input,
	Button,
	InputGroup,
	useDisclosure,
	Divider,
	Link,
	Heading,
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdOutlineSwapVert } from "react-icons/md";
import { useAppData } from "../context/AppDataProvider";
import { RiArrowDropDownLine, RiArrowDropUpLine, RiArrowUpFill } from "react-icons/ri";
import { ADDRESS_ZERO, NATIVE, WETH_ADDRESS, defaultChain, dollarFormatter, tokenFormatter } from "../../src/const";
import { InfoOutlineIcon, SettingsIcon, WarningIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import SelectBody from "./SelectBody";
import { useBalanceData } from "../context/BalanceProvider";
import { usePriceData } from "../context/PriceContext";
import Big from "big.js";
import { formatInput } from "../utils/number";
import { AiOutlineWallet } from "react-icons/ai";
import { useAccount, useFeeData, useNetwork } from "wagmi";
import Settings from "./Settings";
import { ethers } from "ethers";
import RouteDetails from "./RouteDetails";

const inputStyle = {
	variant: "unstyled",
	fontSize: "3xl",
	borderColor: "transparent",
	fontFamily: "Chakra Petch",
	_hover: { borderColor: "transparent" },
	borderRadius: "0",
	pr: "4.5rem",
	height: "50px",
	type: "number",
	placeholder: "Enter amount",
};

export default function SwapLayout({
    inputAmount,
    updateInputAmount,
    inputAssetIndex,
    onInputOpen,
    outputAmount,
    updateOutputAmount,
    outputAssetIndex,
    onOutputOpen,
    handleMax,
    switchTokens,
    exchange,
    validate,
    loading,
    gas,
    maxSlippage,
    setMaxSlippage,
    deadline,
    setDeadline,
    swapData
}: any) {
    const { walletBalances, tokens: _tokens } = useBalanceData();
    const { prices } = usePriceData();
    const { account } = useAppData();
    const { chain } = useNetwork();
    const tokens: any[] = _tokens.concat({ id: ethers.constants.AddressZero, symbol: chain?.nativeCurrency.symbol ?? 'MNT', name: chain?.nativeCurrency.name ?? 'Mantle', decimals: chain?.nativeCurrency.decimals ?? 18, balance: walletBalances[ethers.constants.AddressZero] });

	const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure()
	const [hidden, setHidden] = useState(!isOpen);
    const { data } = useFeeData();
    const { address, isConnected } = useAccount();

    const inputValue = (Number(inputAmount) || 0) * prices[tokens[inputAssetIndex]?.id];
    const outputValue = (Number(outputAmount) || 0) * prices[tokens[outputAssetIndex]?.id];

    const priceImpact = (100*((outputValue - inputValue)/inputValue) || 0);
	const isWrap = (tokens[inputAssetIndex]?.id == WETH_ADDRESS(chain?.id ?? defaultChain.id) && tokens[outputAssetIndex]?.id == ADDRESS_ZERO) || (tokens[outputAssetIndex]?.id == WETH_ADDRESS(chain?.id ?? defaultChain.id) && tokens[inputAssetIndex]?.id == ADDRESS_ZERO);
    const valid = inputAmount > 0 && outputAmount > 0 && !isWrap;

  return (
    <>
        <Box>
            <Box p={5}>
                <Flex align={'center'} justify={'space-between'}>
                    <Box>
                        <Heading size={'md'}>Trade</Heading>
                        <Text color={'whiteAlpha.500'} mt={1} fontSize={'sm'}>
                            With lowest slippage and fees
                        </Text>
                    </Box>
                    <Flex>
                        <Settings maxSlippage={maxSlippage} setMaxSlippage={setMaxSlippage} deadline={deadline} setDeadline={setDeadline} />
                    </Flex>
                </Flex>
            </Box>

            {/* Input */}
            <Box px="5" bg={'blackAlpha.400'} pb={12} pt={10}>
                <Flex align="center" justify={"space-between"}>
                    <InputGroup width={"70%"}>
                        <NumberInput
                            w={"100%"}
                            value={formatInput(inputAmount)}
                            onChange={updateInputAmount}
                            min={0}
                            step={0.01}
                            {...inputStyle}
                        >
                            <NumberInputField
                                pr={0}
                                fontSize={"4xl"}
                                placeholder="0"
                                border={0}
                            />
                        </NumberInput>
                    </InputGroup>

                    <SelectBody
                        onOpen={onInputOpen}
                        asset={tokens[inputAssetIndex]}
                    />
                </Flex>

                <Flex
                    fontSize={"sm"}
                    color="whiteAlpha.700"
                    justify={"space-between"}
                    align="center"
                    mt={4}
                    mr={2}
                >
                    <Text>
                        {dollarFormatter.format(
                            inputAmount * (prices[tokens[inputAssetIndex]?.id] ?? 0)
                        )}
                    </Text>
                    {isConnected && <Flex align={'center'} gap={1}>
                        <Text>Max</Text>
                        <Text
                            onClick={handleMax}
                            _hover={{ textDecor: "underline" }}
                            cursor="pointer"
                            textDecor={'underline'} style={{textUnderlineOffset: '2px'}}
                        >
                            {" "}
                            {tokenFormatter.format(
                                tokens[inputAssetIndex]
                                    ? Big(walletBalances[tokens[inputAssetIndex].id] ?? 0)
                                            .div(10**(tokens[inputAssetIndex]?.decimals ?? 18))
                                            .toNumber()
                                    : 0
                            )}
                        </Text>
                    </Flex>}
                </Flex>
            </Box>

            {/* Switch */}
            <Flex px="5" my={-4} align='center'>
                <Divider w={'10px'} border='1px' borderColor={'whiteAlpha.300'} />
                <Button
                    _hover={{ bg: "whiteAlpha.50" }}
                    rounded={'0'}
                    onClick={switchTokens}
                    variant="unstyled"
                    size={'sm'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg={'whiteAlpha.300'}
                    transform={"rotate(45deg)"}
                    mx={1.5}
                >
                    <Box  transform="rotate(-45deg)">
                    <MdOutlineSwapVert size={"20px"} />
                    </Box>
                </Button>
                <Divider border='1px' borderColor={'whiteAlpha.300'} />
            </Flex>

            {/* Output */}
            <Box px="5" pt={10} pb={14} bg={'blackAlpha.400'}>
                <Flex align="center" justify={"space-between"}>
                    <InputGroup width={"70%"}>
                        <NumberInput
                            w={"100%"}
                            value={formatInput(outputAmount)}
                            onChange={updateOutputAmount}
                            min={0}
                            step={0.01}
                            {...inputStyle}
                        >
                            <NumberInputField
                                pr={0}
                                fontSize={"4xl"}
                                placeholder="0"
                                border={0}
                            />
                        </NumberInput>
                    </InputGroup>

                    <SelectBody
                        onOpen={onOutputOpen}
                        asset={tokens[outputAssetIndex]}
                    />
                </Flex>

                <Flex
                    fontSize={"sm"}
                    color="whiteAlpha.700"
                    justify={"space-between"}
                    align="center"
                    mt={4}
                    mb={-4}
                    mr={2}
                >
                    <Text>
                        {dollarFormatter.format(
                            outputAmount * (prices[tokens[outputAssetIndex]?.id] ?? 0)
                        )}
                    </Text>
                    {isConnected && <Flex align={'center'} gap={1}>
                        <AiOutlineWallet size={"16px"} />
                        <Text>
                            {" "}
                            {tokenFormatter.format(
                                tokens[outputAssetIndex]
                                    ? Big(walletBalances[tokens[outputAssetIndex].id] ?? 0)
                                            .div(10**(tokens[outputAssetIndex]?.decimals ?? 18))
                                            .toNumber()
                                    : 0
                            )}
                        </Text>
                    </Flex>}
                </Flex>
            </Box>

            <Box px="5">


            {valid && <Box pb={10} mt={5}>
                {priceImpact < -10 && priceImpact > -100 && <Flex align={'center'} gap={2} px={4} py={2} bg={'whiteAlpha.50'} color={'orange'}>
                    <WarningTwoIcon/>
                    <Text>Warning: High Price Impact ({(priceImpact).toFixed(2)}%)</Text>
                    </Flex>}
                <Flex
                    justify="space-between"
                    align={"center"}
                    mt={2}
                    mb={!isOpen ? !account ? '-4' : '-6' : '0'}
                    bg="whiteAlpha.50"
                    color="whiteAlpha.800"
                    // rounded={16}
                    px={4}
                    py={2}
                    cursor="pointer"
                    {...getButtonProps()}
                    _hover={{ bg: "whiteAlpha.100" }}
                >
                    <Flex align={"center"} gap={2} fontSize="md">
                        <InfoOutlineIcon />
                        <Text>
                            1 {tokens[inputAssetIndex].symbol} ={" "}
                            {tokenFormatter.format(
                                (outputValue / inputValue) || 0
                            )}{" "}
                            {tokens[outputAssetIndex].symbol}
                        </Text>
                        <Text fontSize={'sm'} >
                            (
                            {dollarFormatter.format(
                                ((outputValue / inputValue) || 0) * prices[tokens[inputAssetIndex]?.id]
                            )}
                            )
                        </Text>
                    </Flex>
                    <Flex mr={-2}>
                        {!isOpen ? <RiArrowDropDownLine size={30} /> : <RiArrowDropUpLine size={30} />}
                    </Flex>
                </Flex>
                <Box>
                    <motion.div
                        {...getDisclosureProps()}
                        hidden={hidden}
                        initial={false}
                        onAnimationStart={() => setHidden(false)}
                        onAnimationComplete={() => setHidden(!isOpen)}
                        animate={{ height: isOpen ? 90 : 0 }}
                        style={{
                            height: 75,
                            width: '100%'
                        }}
                    >
                    {isOpen && 	<>
                        <Divider />
                        <Flex bg={'whiteAlpha.50'} flexDir={'column'} gap={1} mt={0} px={3} py={2} fontSize='sm' color={'whiteAlpha.800'}>
                            <Flex color={priceImpact > 0 ? 'green.400' : priceImpact < -2 ? 'red.400' : 'orange.400'} justify={'space-between'}>
                            <Text>{priceImpact > 0 ? 'Bonus' : 'Price Impact'}</Text>
                            <Text>{(priceImpact).toFixed(2)}%</Text>
                            </Flex>
                            
                            <Flex justify={'space-between'}>
                            <Text>Minimum Out</Text>
                            <Text>{tokenFormatter.format(outputAmount - outputAmount * maxSlippage/100)} {tokens[outputAssetIndex].symbol}</Text>
                            </Flex>

                            <Flex justify={'space-between'}>
                            <Text>Expected Out</Text>
                            <Text>{tokenFormatter.format(outputAmount)} {tokens[outputAssetIndex].symbol}</Text>
                            </Flex>

                            <Flex justify={'space-between'}>
                            <Text>Network Fee</Text>
                            <Text>{dollarFormatter.format((gas * (Number(data?.formatted.gasPrice) + 40000))/1e10)}</Text>
                            </Flex>
                            <RouteDetails swapData={swapData} />
                        </Flex></>}
                    </motion.div>
                </Box>
                </Box>}
                <Box mt={!valid ? 6 : 0.5} mb={5} className="swapButton">
                <Button
                    size="lg"
                    fontSize={"xl"}
                    width={"100%"}
                    rounded={0}
                    onClick={exchange}
                    bg={'transparent'}
                    isDisabled={!validate().valid}
                    loadingText="Loading"
                    isLoading={loading}
                    _hover={{ opacity: 0.6 }}
                    color="white"
                    height={"55px"}
                    _disabled={{
                        color: 'whiteAlpha.700',
                    }}
                >
                    {validate().message}
                </Button>
                </Box>
            </Box>
        </Box>
    </>
  )
}
