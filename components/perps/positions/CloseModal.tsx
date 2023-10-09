import React from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Select,
    useColorMode,
} from '@chakra-ui/react'
import { Flex, Text, Box, Image, Divider, IconButton, Tr, Button, Heading, useDisclosure, NumberInput, NumberInputField,  } from '@chakra-ui/react';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { AiOutlineDownSquare } from 'react-icons/ai';
import { formatInput, parseInput } from '../../utils/number';
import { useBalanceData } from '../../context/BalanceProvider';
import { ethers } from 'ethers';
import { usePriceData } from '../../context/PriceContext';
import { useNetwork } from 'wagmi';
import Big from 'big.js';
import { VARIANT } from '../../../styles/theme';

export default function CloseModal({details}: any) {
    const [inAmount, setInputAmount] = React.useState("");
    const [outAmount, setOutputAmount] = React.useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [outAssetIndex, setOutAssetIndex] = React.useState(0);
	const { prices } = usePriceData();
    const { chain } = useNetwork();

    const {
		walletBalances,
		updateFromTx,
		tokens: _tokens,
		allowances,
		nonces,
		addNonce,
	} = useBalanceData();

    const tokens: any[] = [
		{
			id: ethers.constants.AddressZero,
			symbol: chain?.nativeCurrency.symbol ?? "MNT",
			name: chain?.nativeCurrency.name ?? "Mantle",
			decimals: chain?.nativeCurrency.decimals ?? 18,
			balance: walletBalances[ethers.constants.AddressZero],
		},
	].concat(_tokens);

    const _setInputAmount = (e: string) => {
        e = parseInput(e);
        setInputAmount(e);
        setOutputAmount(Big(e).mul(prices[details.collaterals[selectedIndex].market.inputToken.id]).div(prices[details.debts[outAssetIndex].market.inputToken.id]).toString());
    }

    const _setOutputAmount = (e: string) => {
        e = parseInput(e);
        setOutputAmount(e);
        setInputAmount(e);
    }

    const setMax = (multiplier: number) => {
        _setInputAmount(Big(details?.collaterals?.[selectedIndex]?.collateral).mul(multiplier).toString());
    };

    const { colorMode } = useColorMode();

    return (
    <>
    <Button rounded={0} size={'sm'} onClick={onOpen}>Close</Button>
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
        <ModalContent width={"30rem"} bgColor="transparent" shadow={'none'} rounded={0} mx={2}>
			<Box className={`${VARIANT}-${colorMode}-containerBody2`}>
          <ModalHeader>Close Position</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* In asset */}
            <Text fontSize={'sm'} color={'whiteAlpha.600'}>Position</Text>
            <NumberInput
                size={"xl"}
                onChange={_setInputAmount}
                value={formatInput(inAmount)}
            >
                <Flex>
                    <NumberInputField rounded={0} p={2} />
                    <Flex
                        bg={"bg.200"}
                        align={"center"}
                        justify={"center"}
                        w={"50%"}
                        p={1}
                        pl={4}
                        _hover={{ cursor: "pointer" }}
                    >
                        <Image
                            src={`/icons/${
                                details?.collaterals?.[selectedIndex]?.market?.inputToken?.symbol ?? ''
                            }.svg`}
                            w={"26"}
                            h={"26"}
                            alt={details?.collaterals?.[selectedIndex]?.market?.inputToken?.symbol ?? ''}
                            mr={-2}
                        />
                        <Select rounded={0} border={'0'} bg={"transparent"} color={"whiteAlpha.800"} value={selectedIndex} onChange={(e) => setSelectedIndex(Number(e.target.value))}>
                            {details?.collaterals?.map((collateral: any, index: number) => (
                                <option
                                    key={index}
                                    value={index}
                                >
                                    {collateral?.market?.inputToken?.symbol ?? ''}
                                </option>
                            ))}
                        </Select>
                    </Flex>
                </Flex>
            </NumberInput>

            {/* Divider */}
            <Flex
                my={2}
                align={"center"}
                justify={"space-between"}
            >
                <AiOutlineDownSquare />
                <Flex align={"center"} gap={1}>
                    <Button
                        variant={"ghost"}
                        size={"xs"}
                        onClick={() => setMax(0.5)}
                    >
                        50%
                    </Button>
                    <Button
                        variant={"ghost"}
                        size={"xs"}
                        onClick={() => setMax(1)}
                    >
                        100%
                    </Button>
                </Flex>
            </Flex>
            
            {/* Out asset */}
            <Text fontSize={'sm'} color={'whiteAlpha.600'}>Repaying Margin</Text>
            <NumberInput
                size={"xl"}
                onChange={_setOutputAmount}
                value={formatInput(outAmount)}
            >
                <Flex>
                    <NumberInputField rounded={0} p={2} />
                    <Flex
                        bg={"bg.200"}
                        align={"center"}
                        justify={"center"}
                        w={"50%"}
                        p={1}
                        pl={4}
                        _hover={{ cursor: "pointer" }}
                    >
                        <Image
                            src={`/icons/${
                                details?.debts?.[outAssetIndex]?.market?.inputToken?.symbol ?? ''
                            }.svg`}
                            w={"26"}
                            h={"26"}
                            alt={details?.debts?.[outAssetIndex]?.market?.inputToken?.symbol ?? ''}
                            mr={-2}
                        />
                        <Select rounded={0} border={'0'} bg={"transparent"} color={"whiteAlpha.800"} value={outAssetIndex} onChange={(e) => setOutAssetIndex(Number(e.target.value))}>
                            {details?.debts?.map((debt: any, index: number) => (
                                <option
                                    key={index}
                                    value={index}
                                >
                                    {debt?.market?.inputToken?.symbol ?? ''}
                                </option>
                            ))}
                        </Select>
                    </Flex>
                </Flex>
            </NumberInput>

          </ModalBody>

          <ModalFooter pb={6}>
            <Box w={'100%'} className='primaryButton'>
            <Button bg={'transparent'} _hover={{bg: 'transparent'}} rounded={0} w={'100%'} size={'lg'} onClick={onClose}>
              Confirm
            </Button>
            </Box>
          </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </>
    )
}
