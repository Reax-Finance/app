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
} from "@chakra-ui/react";
import { MdOutlineSwapVert } from "react-icons/md";
import { useAppData } from "../context/AppDataProvider";
import { ADDRESS_ZERO, NATIVE, SUPPORTS_ROLLUP_GASFEES, WETH_ADDRESS, defaultChain, dollarFormatter, tokenFormatter } from "../../src/const";
import SelectBody from "./SelectBody";
import Big from "big.js";
import { formatInput } from "../utils/number";
import { AiOutlineWallet } from "react-icons/ai";
import { useAccount } from "wagmi";
import Settings from "./Settings";
import { VARIANT } from "../../styles/theme";
import { FaBoltLightning } from "react-icons/fa6";

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
    switchTokens,
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
    steps
}: any) {
    const { account } = useAppData();

	const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure()
    const { address, isConnected } = useAccount();

    const inputValue = Big(Number(inputAmount) || 0).mul(tokens[inputAssetIndex].price).div(10**8).toNumber()
    const outputValue = Big(Number(outputAmount) || 0).mul(tokens[outputAssetIndex].price).div(10**8).toNumber()

	const isWrap = (tokens[inputAssetIndex]?.id == WETH_ADDRESS(defaultChain?.id ?? defaultChain.id) && tokens[outputAssetIndex]?.id == ADDRESS_ZERO) || (tokens[outputAssetIndex]?.id == WETH_ADDRESS(defaultChain.id) && tokens[inputAssetIndex]?.id == ADDRESS_ZERO);
    const valid = inputAmount > 0 && outputAmount > 0 && !isWrap;
	const { colorMode } = useColorMode();

    const handleMax = () => {
        updateInputAmount(
            tokens[inputAssetIndex]
                ? Big(tokens[inputAssetIndex].balance.toString())
                        .div(10**(tokens[inputAssetIndex]?.decimals ?? 18))
                        .toString()
                : 0
        );
    }

  return (
    <>
        <Box className={`${VARIANT}-${colorMode}-containerBody`} maxW={'540px'}>
            <Box className={`${VARIANT}-${colorMode}-containerHeader`} px={5} py={4}>
                <Flex align={'center'} justify={'space-between'}>
                    <Flex align={'center'} gap={4}>
                        <Heading size={'sm'}>Market</Heading>
                        <Tooltip label={'Coming Soon'} placement={'top'}>
                        <Heading cursor={'pointer'} size={'sm'} color={'whiteAlpha.400'}>Limit</Heading>
                        </Tooltip>
                        <Tooltip label={'Coming Soon'} placement={'top'}>
                        <Heading cursor={'pointer'} size={'sm'} color={'whiteAlpha.400'}>SL/TP</Heading>
                        </Tooltip>
                    </Flex>
                    <Flex>
                        <Settings maxSlippage={maxSlippage} setMaxSlippage={setMaxSlippage} deadline={deadline} setDeadline={setDeadline} />
                    </Flex>
                </Flex>
            </Box>

            <Divider />

            {/* Input */}
            <Box px={{base: "4", md: "5"}} bg={colorMode == 'dark' ? 'darkBg.400' : 'lightBg.600'} pb={12} pt={10}>
                <Flex align="center" justify={"space-between"}>
                    <InputGroup width={{base: '60%', md: '70%'}}>
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
                    color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
                    justify={"space-between"}
                    align="center"
                    mt={4}
                >
                    <Text>
                        {dollarFormatter.format(inputValue)}
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
                                    ? Big(tokens[inputAssetIndex].balance.toString())
                                            .div(10**(tokens[inputAssetIndex]?.decimals ?? 18))
                                            .toNumber()
                                    : 0
                            )}
                        </Text>
                    </Flex>}
                </Flex>
            </Box>

            {/* Switch */}
            <Flex px={{base: "4", md: "5"}} my={-4} align='center'>
                {/* <Divider w={'10px'} border='1px' borderColor={colorMode == 'dark' ? 'darkBg.200' : 'blackAlpha.200'} /> */}
                <Button
                    _hover={{ bg: colorMode == 'dark' ? "whiteAlpha.50" : 'blackAlpha.100' }}
                    rounded={'0'}
                    onClick={switchTokens}
                    variant="unstyled"
                    size={'sm'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg={colorMode == 'dark' ? 'darkBg.200' : 'blackAlpha.200'}
                    transform={"rotate(45deg)"}
                    mx={1.5}
                >
                    <Box  transform="rotate(-45deg)">
                    <MdOutlineSwapVert size={"20px"} />
                    </Box>
                </Button>
                {/* <Divider border='1px' borderColor={colorMode == 'dark' ? 'darkBg.200' : 'blackAlpha.200'} /> */}
            </Flex>

            {/* Output */}
            <Box px={{base: "4", md: "5"}} pt={10} pb={14} bg={colorMode == 'dark' ? 'darkBg.600' : 'lightBg.600'}>
                <Flex align="center" justify={"space-between"}>
                    <InputGroup width={{base: '60%', md: '70%'}}>
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
                    color={colorMode == 'dark' ? "whiteAlpha.700" : "blackAlpha.700"}
                    justify={"space-between"}
                    align="center"
                    mt={4}
                    mb={-4}
                >
                    <Text>
                        {dollarFormatter.format(outputValue)}
                    </Text>
                    {isConnected && <Flex align={'center'} gap={1}>
                        <AiOutlineWallet size={"16px"} />
                        <Text>
                            {" "}
                            {tokenFormatter.format(
                                tokens[outputAssetIndex]
                                    ? Big(tokens[outputAssetIndex].balance.toString())
                                            .div(10**(tokens[outputAssetIndex].decimals))
                                            .toNumber()
                                    : 0
                            )}
                        </Text>
                    </Flex>}
                </Flex>
            </Box>


            <Box px="5" pb={'1px'} pt={'1px'} >

            {valid && <Box>
                <Flex
                    justify="space-between"
                    align={"center"}
                    // mb={!isOpen ? !account ? '-4' : '-6' : '0'}
                    bg={colorMode == 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
                    color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}
                    px={4}
                    py={2}
                    // cursor="pointer"
                    {...getButtonProps()}
                    _hover={{ bg: colorMode == 'dark' ? "whiteAlpha.100" : "blackAlpha.100" }}
                >
                    <Flex align={"center"} gap={2} fontSize="md">
                        <FaBoltLightning color="#FFAE2D" />
                        <Text>
                            1 {tokens[inputAssetIndex].symbol} ={" "}
                            {tokenFormatter.format(
                                (Big(Number(outputAmount) || 0).div(Number(inputAmount) || 0).toNumber())   
                            )}{" "}
                            {tokens[outputAssetIndex].symbol}
                        </Text>
                        <Text fontSize={'sm'} >
                            (
                            {dollarFormatter.format(
                                tokens[inputAssetIndex]?.price / 10**8
                            )}
                            )
                        </Text>
                    </Flex>
                </Flex>
                {steps.length > 0 && <Box>
                    {steps.map((step: any, index: number) => (<>
                        <Flex align={'center'} px={0} border={'1px'} borderColor={'whiteAlpha.300'} my={2} h={'40px'}>
                            <Flex justify={'center'} w={'40px'}>
                                <Text color={'whiteAlpha.500'}>{index + 1}</Text>
                            </Flex>
                            <Divider orientation="vertical" />
                            <Flex align={'center'} justify={'space-between'} gap={1} ml={3} w={'100%'}>
                                <Text>{(step.type == "APPROVAL" || step.type == "PERMIT") ? "Approve " + step.data.token.symbol + " for use" : "Delegate Mint"}</Text>
                                <Button rounded={0} onClick={step.execute}>
                                    {step.type == "APPROVAL" ? "Approve" : step.type == "PERMIT" ? "Sign Message" : "Delegate"}
                                </Button>
                            </Flex>
                        </Flex>
                    </>))}
                </Box>}
                </Box>}
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
