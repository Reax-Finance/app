import React from "react";
import { usePriceData } from "../../../../context/PriceContext";
import {
	Box,
	Button,
	Divider,
	Flex,
	Image,
	InputGroup,
	NumberInput,
	NumberInputField,
	Select,
	Text,
    useToast,
} from "@chakra-ui/react";
import { NATIVE, WETH_ADDRESS, defaultChain, dollarFormatter } from "../../../../../src/const";
import { useAccount, useNetwork } from "wagmi";
import { formatInput, parseInput } from "../../../../utils/number";
import ValuesTable from "../../others/ValuesTable";
import ValuesTable2 from "../../others/ValuesTable2";

export default function StableWithdrawLayout({
    pool,
    amount,
    setAmount,
    tokenSelectedIndex,
    isNative,
    onSelectUpdate,
    setMax,
    values,
    maxSlippage, 
    setMaxSlippage,
    loading,
    validate,
    withdraw,
    bptIn
}: any) {

    const { chain } = useNetwork();
    const { prices } = usePriceData();

    const _isNativeToken = pool.tokens[tokenSelectedIndex].token.id == WETH_ADDRESS(chain?.id!) && isNative;

    return (
    <>
    <Divider />
        <Box>
            <Box bg={'bg.600'} py={4} pb={6} px={4}>
                <InputGroup
                    variant={"unstyled"}
                    display="flex"
                    placeholder="Enter amount"
                >
                    <NumberInput
                        w={"100%"}
                        value={formatInput(amount)}
                        onChange={setAmount}
                        min={0}
                        step={0.01}
                        display="flex"
                        alignItems="center"
                        justifyContent={"center"}
                    >
                        <Box ml={0}>
                            <NumberInputField
                                textAlign={"left"}
                                pr={0}
                                fontSize={"4xl"}
                                placeholder="0"
                                fontFamily={'Chakra Petch'}
                            />
                            <Text
                                fontSize="sm"
                                textAlign={"left"}
                                color={"whiteAlpha.600"}
                            >
                                {dollarFormatter.format(((prices[pool.tokens[tokenSelectedIndex].token.id] ?? 0) * (Number(amount) || 0)) ?? 0)}
                            </Text>
                        </Box>

                        <Box>
                        <Flex justify={'end'} align={'center'} gap={2} mt={6}>
                        <Flex cursor={'pointer'} className="outlinedBox" w={'125px'} p={2} py={2} pl={3} justify={'end'} align={'center'} gap={2} mt={2}>

                            <Image rounded={'full'} src={`/icons/${_isNativeToken ? NATIVE : pool.tokens[tokenSelectedIndex].token.symbol}.svg`} alt="" width={"30px"} />
                            <Select mr={-2} w={'110px'} value={tokenSelectedIndex + '-' + (isNative ? 'ETH' : pool.tokens[tokenSelectedIndex].token.symbol)} variant={'unstyled'} onChange={onSelectUpdate}>
                                {pool.tokens.map((token: any, i: number) => {
                                    if(token.token.id !== pool.address) return <>
                                        <option key={i} value={i + '-' + token.token.symbol}>{token.token.symbol}</option>
                                        {token.token.id == WETH_ADDRESS(chain?.id!) && 
                                            <option key={i+100} value={i + '-' + NATIVE}>{NATIVE}</option>
                                        }
                                    </>
                                }
                                )}
                            </Select>
                            </Flex>
                        </Flex>
                        <Flex justify={'end'} mt={0}>
                            <Button
                                variant={"unstyled"}
                                fontSize="sm"
                                fontWeight={"normal"}
                                textDecor={'underline'}
                                textDecorationStyle="dashed"
                                onClick={() => setMax(0.5)}
                            >
                                50%
                            </Button>
                            <Button
                                variant={"unstyled"}
                                fontSize="sm"
                                fontWeight={"normal"}
                                textDecor={'underline'}
                                textDecorationStyle="dashed"
                                onClick={() => setMax(0.999)}
                            >
                                MAX
                            </Button>
                        </Flex>
                        </Box>
                        
                    </NumberInput>
                </InputGroup>
            </Box>
        </Box>
        <Divider mb={4}/>
        <ValuesTable2 values={values} pool={pool} bptIn={bptIn} />
        <Box className="swapButton" m={4}>
        <Button size={'lg'} isLoading={loading} loadingText='Loading' isDisabled={!validate().valid} bg={'transparent'} _hover={{bg: 'transparent'}} rounded={0} w={'100%'} onClick={withdraw}>
            {validate().message}
        </Button>
        </Box>
    </>
  )
}
