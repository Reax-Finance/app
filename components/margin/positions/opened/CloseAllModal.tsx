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
import { ethers } from 'ethers';
import { usePriceData } from '../../../context/PriceContext';
import { useAccount, useNetwork } from 'wagmi';
import Big from 'big.js';
import { VARIANT } from '../../../../styles/theme';
import { usePerpsData } from '../../../context/PerpsDataProvider';
import { getABI, send } from '../../../../src/contract';
import useUpdateData from '../../../utils/useUpdateData';
import { dollarFormatter, tokenFormatter } from '../../../../src/const';

export default function CloseAllModal({details}: any) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [outAssetIndex, setOutAssetIndex] = React.useState(0);
	const { prices } = usePriceData();
    const { chain } = useNetwork();
    const { openPositions } = usePerpsData();
	const [isMax, setIsMax] = useState(false);
    const {address} = useAccount();

    const { getUpdateData } = useUpdateData();
    const close = async () => {
        let calls: any[] = [];

        let position = new ethers.Contract(details?.position?.id, getABI("PerpPosition", chain?.id!));
        let pool = new ethers.Contract(details?.position?.factory?.lendingPool, getABI("LendingPool", chain?.id!));
        let supplied = new ethers.Contract(details?.collaterals?.[selectedIndex]?.market?.inputToken?.id, getABI("MockToken", chain?.id!));
        let borrowed = new ethers.Contract(details?.debts?.[outAssetIndex]?.market?.inputToken?.id, getABI("MockToken", chain?.id!));

        const priceFeedUpdateData = await getUpdateData();
        calls.push(position.interface.encodeFunctionData("updatePythData", [priceFeedUpdateData]));
        calls.push(position.interface.encodeFunctionData("call", [borrowed.address, borrowed.interface.encodeFunctionData("approve", [details?.position?.factory?.lendingPool, ethers.constants.MaxUint256]), 0]));
        const closes: any[] = calculateClose();
        for(let i in closes){
            calls.push(position.interface.encodeFunctionData("closePosition", [closes[i].token1, closes[i].token1Amount, closes[i].token0]));
        }

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

    const calculateClose = () : any[] => {
        if(!details) return [];
        const detailsCopy = JSON.parse(JSON.stringify(details));
        const actions: any[] = [];
        // sort collaterals and debts by amount
        detailsCopy.collaterals.sort((a: any, b: any) => {
            return - (a.collateral * prices[a.market.inputToken.id]) + (b.collateral * prices[b.market.inputToken.id]);
        });
        detailsCopy.debts.sort((a: any, b: any) => {
            return  - (b.debt * prices[b.market.inputToken.id]) + (a.debt * prices[a.market.inputToken.id]);
        });
        for(let i = 0; i < detailsCopy?.collaterals?.length; i++){
            for(let j = 0; j < detailsCopy?.debts?.length; j++){
                // find min of collateral and debt
                const collateralAmountUSD = Big(detailsCopy.collaterals[i].collateral).mul(prices[detailsCopy.collaterals[i].market.inputToken.id]);
                const debtAmountUSD = Big(detailsCopy.debts[j].debt).mul(prices[detailsCopy.debts[j].market.inputToken.id]);
                const min = collateralAmountUSD.gt(debtAmountUSD) ? debtAmountUSD : collateralAmountUSD;
                // subtract min from both collateral and debt
                detailsCopy.debts[j].debt = Big(detailsCopy.debts[j].debt).sub(Big(min).div(prices[detailsCopy.debts[j].market.inputToken.id])).toString();
                detailsCopy.collaterals[i].collateral = Big(detailsCopy.collaterals[i].collateral).sub(Big(min).div(prices[detailsCopy.collaterals[i].market.inputToken.id])).toString();

                actions.push({
                    token0: detailsCopy.collaterals[i].market.inputToken.id,
                    token1: detailsCopy.debts[j].market.inputToken.id,
                    token1Amount: Big(detailsCopy.debts[j].debt).eq(0)? ethers.constants.MaxUint256 : min.div(prices[detailsCopy.debts[j].market.inputToken.id]).mul(10**detailsCopy.debts[j].market.inputToken.decimals).toFixed(0)
                })
                // if collateral is 0, check next collateral
                if(detailsCopy.collaterals[i].collateral == 0){
                    break;
                }
            }
        }

        return actions;
    }

    console.log(calculateClose());

    const { colorMode } = useColorMode();

    return (
    <>
        <Button rounded={0} size={'sm'} onClick={onOpen}>Close All</Button>
        <Modal isCentered isOpen={isOpen} onClose={onClose}>
            <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(30px)" />
            <ModalContent width={"30rem"} bgColor="transparent" shadow={'none'} rounded={0} mx={2}>
                <Box className={`${VARIANT}-${colorMode}-containerBody2`}>
            <ModalHeader>Close Position</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                {/* Show all collaterals */}
                <Text fontSize={'sm'} color={'whiteAlpha.600'}>Closing Position ({dollarFormatter.format(details.collateral)})</Text>
                {details?.collaterals?.map((collateral: any, index: number) => (
                    <Flex my={1} gap={1} key={index}>
                        <Image src={`/icons/${collateral.market.inputToken.symbol}.svg`} w={'22px'} alt="" />
                        {tokenFormatter.format(collateral.collateral)} {collateral.market.inputToken.symbol} 
                        <Text fontSize={'sm'} color={'whiteAlpha.600'}>
                            ({dollarFormatter.format(Big(collateral.collateral).mul(prices[collateral.market.inputToken.id]).toNumber())})
                        </Text>
                    </Flex>
                ))}

                {/* Divider */}
                <Flex
                    my={2}
                    align={"center"}
                    justify={"space-between"}
                >
                </Flex>
                
                {/* Out asset */}
                <Text fontSize={'sm'} color={'whiteAlpha.600'}>Repaying Margin ({dollarFormatter.format(details.debt)})</Text>
                {details?.debts?.map((collateral: any, index: number) => (
                    <Flex my={1} gap={1} key={index}>
                        <Image src={`/icons/${collateral.market.inputToken.symbol}.svg`} w={'22px'} alt="" />
                        {tokenFormatter.format(collateral.debt)} {collateral.market.inputToken.symbol}
                        <Text fontSize={'sm'} color={'whiteAlpha.600'}>
                            ({dollarFormatter.format(Big(collateral.debt).mul(prices[collateral.market.inputToken.id]).toNumber())})
                        </Text>
                    </Flex>
                ))}
                <Flex mt={4} align={'center'} gap={1}>
                <Text fontSize={'sm'} color={'whiteAlpha.600'}>You will receive</Text>
                {
                    details?.collaterals?.map((collateral: any, index: number) => (
                        <Flex key={index} gap={1}>
                            <Text>{tokenFormatter.format((details.collateral - details.debt) * (Big(collateral.collateral).mul(prices[collateral.market.inputToken.id]).toNumber() / details.collateral) / prices[collateral.market.inputToken.id])}</Text>
                            <Text>{collateral.market.inputToken.symbol}</Text>
                            {index !== details.collaterals.length - 1 && <Text>+</Text>}
                        </Flex>
                    ))
                }
                <Text fontSize={'sm'} color={'whiteAlpha.600'}>({dollarFormatter.format(details.collateral - details.debt)})</Text>
                </Flex>

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
