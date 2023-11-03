import React, { useState } from 'react'
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
import { formatInput, parseInput } from '../../../utils/number';
import { useBalanceData } from '../../../context/BalanceProvider';
import { ethers } from 'ethers';
import { usePriceData } from '../../../context/PriceContext';
import { useAccount, useNetwork } from 'wagmi';
import Big from 'big.js';
import { VARIANT } from '../../../../styles/theme';
import { usePerpsData } from '../../../context/PerpsDataProvider';
import { getABI, send } from '../../../../src/contract';
import useUpdateData from '../../../utils/useUpdateData';

export default function CloseModal({details}: any) {
    const [inAmount, setInputAmount] = React.useState("");
    const [outAmount, setOutputAmount] = React.useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [outAssetIndex, setOutAssetIndex] = React.useState(0);
	const { prices } = usePriceData();
    const { chain } = useNetwork();
    const { positions, addPosition } = usePerpsData();
	const [isMax, setIsMax] = useState(false);
    const {address} = useAccount();

    const { getUpdateData } = useUpdateData();
    const close = async () => {
        let calls = [];

        let position = new ethers.Contract(details?.position?.id, getABI("PerpPosition", chain?.id!));
        let pool = new ethers.Contract(details?.position?.factory?.lendingPool, getABI("LendingPool", chain?.id!));
        let supplied = new ethers.Contract(details?.collaterals?.[selectedIndex]?.market?.inputToken?.id, getABI("MockToken", chain?.id!));
        let borrowed = new ethers.Contract(details?.debts?.[outAssetIndex]?.market?.inputToken?.id, getABI("MockToken", chain?.id!));

        const priceFeedUpdateData = await getUpdateData();
        calls.push(position.interface.encodeFunctionData("updatePythData", [priceFeedUpdateData]));
        calls.push(position.interface.encodeFunctionData("call", [borrowed.address, borrowed.interface.encodeFunctionData("approve", [details?.position?.factory?.lendingPool, ethers.constants.MaxUint256]), 0]));
        calls.push(position.interface.encodeFunctionData("closePosition", [borrowed.address, Big(outAmount).mul(isMax ? 10 : 1).mul(10**details?.debts?.[outAssetIndex]?.market?.inputToken?.decimals).toFixed(0), supplied.address]));

        if(isMax && details?.debts.length == 1){
            // Withdraw all collaterals
            for(let i = 0; i < details?.collaterals.length; i++){
                calls.push(position.interface.encodeFunctionData("call", [pool.address, pool.interface.encodeFunctionData("withdraw", [details?.collaterals[i].market.inputToken.id, ethers.constants.MaxUint256, address, []]), 0]));
            }
        }

        console.log(calls);
        
        send(position, "multicall", [calls])
        .then((res: any) => {
            console.log(res);
            onClose();
        })
        .catch((err: any) => {
            console.log(err);
        })
    }

    const _setInputAmount = (e: string) => {
        e = parseInput(e);
        setInputAmount(e);
        const inToken = details.collaterals[selectedIndex].market.inputToken.id;
        const outToken = details.debts[outAssetIndex].market.inputToken.id;
        const _outAmount = Big(e).mul(prices[inToken]).div(prices[outToken]);
        setOutputAmount(_outAmount.toString());
        setIsMax(false);
        if(_outAmount.gt(details.debts[outAssetIndex].debt)){
            setInputAmount(Big(details.debts[outAssetIndex].debt).mul(prices[outToken]).div(prices[inToken]).toString());
            setOutputAmount(details.debts[outAssetIndex].debt);
            setIsMax(true);
        }
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
            <ModalHeader>Partial Close</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                {/* In asset */}
                <Text fontSize={'sm'} color={'whiteAlpha.600'}>Closing Position</Text>
                <NumberInput
                    size={"xl"}
                    onChange={_setInputAmount}
                    value={formatInput(inAmount)}
                >
                    <Flex>
                        <NumberInputField rounded={0} p={2} />
                        <Flex
                            bg={"darkBg.200"}
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
                            <Select rounded={0} border={'0'} bg={"transparent"} color={"whiteAlpha.800"} _focusVisible={{borderColor: 'transparent'}} value={selectedIndex} onChange={(e) => setSelectedIndex(Number(e.target.value))}>
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
                            bg={isMax ? "secondary.400" : "transparent"}
                            _hover={{ bg: isMax && "secondary.400" }}
                        >
                            {isMax ? "Close" : "100%"}
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
                            bg={"darkBg.200"}
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
                            <Select rounded={0} border={'0'} bg={"transparent"} color={"whiteAlpha.800"}
                                _focusVisible={{borderColor: 'transparent'}}
                                value={outAssetIndex} onChange={(e) => setOutAssetIndex(Number(e.target.value))}>
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
                <Box w={'100%'} className={`${VARIANT}-${colorMode}-primaryButton`}>
                <Button bg={'transparent'} _hover={{bg: 'transparent'}} rounded={0} w={'100%'} size={'lg'} onClick={close}>
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
