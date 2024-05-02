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
    useColorMode,
    Tooltip,
    IconButton,
    Fade,
    Collapse,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAppData } from "../context/AppDataProvider";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { ADDRESS_ZERO, NATIVE, SUPPORTS_ROLLUP_GASFEES, WETH_ADDRESS, defaultChain, dollarFormatter, tokenFormatter } from "../../src/const";
import { CloseIcon, InfoOutlineIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import SelectBody from "./SelectBody";
import { useBalanceData } from "../context/BalanceProvider";
import { usePriceData } from "../context/PriceContext";
import Big from "big.js";
import { formatInput } from "../utils/number";
import { AiOutlineWallet } from "react-icons/ai";
import { useAccount, useFeeData, useNetwork } from "wagmi";
import Settings from "./Settings";
import { BigNumber, ethers } from "ethers";
import RouteDetails from "./RouteDetails";
import { VARIANT } from "../../styles/theme";
import { BsPlus } from "react-icons/bs";
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
    exchange,
    validate,
    loading,
    gas,
    maxSlippage,
    setMaxSlippage,
    deadline,
    setDeadline,
    swapData,
    tokens,
    outToken
}: any) {
    const { prices } = usePriceData();
    const { account } = useAppData();
    const { chain } = useNetwork();
    const [gasPrice, setGasPrice] = useState(0);
    useEffect(() => {
        let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
        if(SUPPORTS_ROLLUP_GASFEES){ 
            provider.send('rollup_gasPrices', [])
            .then((res: any) => {
                setGasPrice(BigNumber.from(res.l1GasPrice).toNumber() / 1e18);
            })
        }
        else {
            provider.getGasPrice()
                .then((res: any) => {
                    let gas = res.toNumber() / 1e18;
                    setGasPrice(gas);
                })
        }
    }, [])

	const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure()
	const [hidden, setHidden] = useState(!isOpen);
    const { address, isConnected } = useAccount();

    const { isOpen: isStakeOpen, onOpen: onStakeOpen, onClose: onStakeClose } = useDisclosure({
        onClose: () => {
            updateInputAmount("");
        },
        defaultIsOpen: true
    });
    const { isOpen: isMintOpen, onOpen: onMintOpen, onClose: onMintClose } = useDisclosure({
        onClose: () => {
            updateOutputAmount("");
        },
        defaultIsOpen: true
    });

    const inputValue = (Number(inputAmount) || 0) * prices[tokens[inputAssetIndex]?.id];
    const outputValue = (Number(outputAmount) || 0) * prices[tokens[outputAssetIndex]?.id];

    const priceImpact = (100*((outputValue - inputValue)/inputValue) || 0);
	const isWrap = (tokens[inputAssetIndex]?.id == WETH_ADDRESS(chain?.id ?? defaultChain.id) && tokens[outputAssetIndex]?.id == ADDRESS_ZERO) || (tokens[outputAssetIndex]?.id == WETH_ADDRESS(chain?.id ?? defaultChain.id) && tokens[inputAssetIndex]?.id == ADDRESS_ZERO);
    const valid = inputAmount > 0 && outputAmount > 0 && !isWrap;
	const { colorMode } = useColorMode();

    return (
    <>
        <Box pt={2}>

            

            {/* Input */}
            <Box bg={colorMode == 'dark' ? 'darkBg.400' : 'lightBg.600'} border={'1px'} borderColor={'whiteAlpha.200'} m={4} py={2} px={4}>
                <Flex align={'center'} gap={2}>
                    <Text>Stake Collateral</Text>
                    {isStakeOpen ? <IconButton icon={<CloseIcon w={'10px'} />} onClick={onStakeClose} aria-label={""} size={'xs'} /> : <IconButton icon={<BsPlus size={20} />} onClick={onStakeOpen} aria-label={""} size={'xs'} />}
                </Flex>

                {isStakeOpen && <>
                    <Flex align="center" justify={"space-between"} mt={2}>
                    <Box width={{base: '60%', md: '70%'}}>
                        <InputGroup >
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
                    </Box>

                    <SelectBody
                        onOpen={onInputOpen}
                        asset={tokens[inputAssetIndex]}
                    />
                </Flex>

                <Flex
                    fontSize={"sm"}
                    color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
                    justify={"space-between"}
                    align="center"
                    mt={4}
                >
                    <Text>
                        {dollarFormatter.format(
                            inputAmount * (tokens[inputAssetIndex]?.price?.div(10**8).toNumber() ?? 0)
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
                                    ? tokens[inputAssetIndex].balance / 10**tokens[inputAssetIndex].decimals
                                    : 0
                            )}
                        </Text>
                    </Flex>}
                </Flex> </>}
            </Box>

            {/* Output */}
            <Box bg={colorMode == 'dark' ? 'darkBg.400' : 'lightBg.600'} border={'1px'} borderColor={'whiteAlpha.200'} m={4} py={2} px={4}>
                <Flex align={'center'} gap={2}>
                    <Text>Mint LP</Text>
                    {isMintOpen ? <IconButton icon={<CloseIcon w={'10px'} />} onClick={onMintClose} aria-label={""} size={'xs'} /> : <IconButton icon={<BsPlus size={20} />} onClick={onMintOpen} aria-label={""} size={'xs'} />}
                </Flex>
                {isMintOpen && <><Flex align="center" justify={"space-between"}>
                    <Box width={{base: '60%', md: '70%'}}>
                    <InputGroup>
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
                    </Box>

                    <SelectBody
                        asset={outToken}
                    />
                </Flex>

                <Flex
                    fontSize={"sm"}
                    color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
                    justify={"space-between"}
                    align="center"
                    mt={4}
                >
                    <Text>
                        {dollarFormatter.format(
                            outputAmount * (outToken?.price?.div(ethers.constants.WeiPerEther).toNumber() ?? 0)
                        )}
                    </Text>
                    {isConnected && <Flex align={'center'} gap={1}>
                        <Text>Max</Text>
                        <Text>
                            {" "}
                            {tokenFormatter.format(
                                account.availableToMintUSD.toString()
                            )}
                        </Text>
                    </Flex>}
                </Flex> </>}
            </Box>
            


            <Box px="5" pb={'1px'} pt={'1px'} >

            {/* {valid && <Box>
                {priceImpact < -10 && priceImpact > -100 && <Flex align={'center'} gap={2} px={4} py={2} my={2} bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'} color={'orange'}>
                    <WarningTwoIcon/>
                    <Text>Warning: High Price Impact ({(priceImpact).toFixed(2)}%)</Text>
                    </Flex>}
                <Flex
                    justify="space-between"
                    align={"center"}
                    // mb={!isOpen ? !account ? '-4' : '-6' : '0'}
                    bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
                    color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}
                    px={4}
                    py={2}
                    cursor="pointer"
                    {...getButtonProps()}
                    _hover={{ bg: colorMode == 'dark' ? "whiteAlpha.100" : "blackAlpha.100" }}
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
                        animate={{ height: isOpen ? '144px' : 0 }}
                        style={{
                            width: '100%'
                        }}
                    >
                    {isOpen && 	<>
                        <Divider borderColor={colorMode == 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400'} /> 
                        <Flex bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'} flexDir={'column'} gap={1} px={3} py={2} fontSize='sm' color={colorMode == 'dark' ? 'whiteAlpha.800' : 'blackAlpha.800'}>
                            <Flex color={priceImpact > 0 ? 'green.400' : priceImpact < -2 ? 'orange.400' : 'whiteAlpha.800'} justify={'space-between'}>
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
                            <Text>~{dollarFormatter.format((3000 * 0.5 * gasPrice))}</Text>
                            </Flex>
                            <RouteDetails swapData={swapData} />
                        </Flex></>}
                    </motion.div>
                </Box>
                </Box>} */}
                <Box mt={3} mb={5} className={validate().valid ? `${VARIANT}-${colorMode}-primaryButton` : `${VARIANT}-${colorMode}-disabledPrimaryButton`}>
                <Button
                    size="lg"
                    fontSize={"xl"}
                    width={"100%"}
                    onClick={exchange}
                    bg={'transparent'}
                    isDisabled={!validate().valid}
                    loadingText="Loading"
                    isLoading={loading}
                    _hover={{ opacity: 0.6 }}
                    color="white"
                    height={"55px"}
                >
                    {validate().message}
                </Button>
                </Box>
            </Box>
        </Box>
    </>
  )
}
