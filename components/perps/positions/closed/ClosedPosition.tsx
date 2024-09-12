import { ethers } from 'ethers';
import React, { useEffect } from 'react'
import { useLendingData } from '../../../context/LendingDataProvider';
import { usePriceData } from '../../../context/PriceContext';
import { useBalanceData } from '../../../context/BalanceProvider';
import Big from 'big.js';
import { Td, Flex, Text, Box, Image, Divider, IconButton, Tr, Button, Heading, useDisclosure, NumberInput, NumberInputField,  } from '@chakra-ui/react';
import { MdOpenInNew } from 'react-icons/md';
import { ESYX_PRICE, defaultChain, dollarFormatter, tokenFormatter } from '../../../../src/const';
import { usePerpsData } from '../../../context/PerpsDataProvider';
import { getABI } from '../../../../src/contract';
import { useNetwork } from 'wagmi';
import CloseModal from '../opened/CloseModal';


export default function ClosedPosition({position, index}: any) {
    const {protocols: lendingProtocols, pools} = useLendingData();
    const { openPositions } = usePerpsData();
    const {prices} = usePriceData();
    const {walletBalances} = useBalanceData();

    const [details, setDetails] = React.useState<any>({});

    useEffect(() => {
        const _setDetails = () => {
            const marketsIndex = lendingProtocols.map((protocol: any) => protocol._lendingPoolAddress == position.factory.lendingPool.toLowerCase() ? '1' : '0').indexOf('1');
            const wrapperAddress = lendingProtocols[marketsIndex]._wrapper;
            let markets = pools[marketsIndex];
    
            let _totalCollateral = Big(0);
            let _adjustedCollateral = Big(0);
            let _totalDebt = Big(0);
            let _totalStableDebt = Big(0);
            let collaterals: any[] = [];
            let debts: any[] = [];
            let netApy = Big(0);
            let totalValue = Big(0);
            let rewardApy = Big(0);
    
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
    
    
            for(let i in position.data){   
                let pos = {
                    market: {
                        inputToken: {
                            id: position.data[i].tokenAddress,
                            symbol: position.data[i].tokenSymbol,
                        }
                    },
                    collateral: position.data[i].depositAmount / prices[position.data[i].tokenAddress],
                    debt: position.data[i].borrowAmount / prices[position.data[i].tokenAddress],
                }

                
                if(Number(pos.collateral) > 0){
                    _totalCollateral = _totalCollateral.add(position.data[i].depositAmount);
                    collaterals.push(pos);
                }
                if(Number(pos.debt) > 0){
                    _totalDebt = _totalDebt.add(position.data[i].borrowAmount);
                    debts.push(pos);
                }
            }
    
            let availableToIssue = '0'
            if(_adjustedCollateral.sub(_totalDebt).sub(_totalStableDebt).gt(0)){
                availableToIssue = _adjustedCollateral.sub(_totalDebt).sub(_totalStableDebt).toString();
            }
    
            let debtLimit = Big(0);
            if(_totalCollateral.gt(0)){
                debtLimit = _totalDebt.add(_totalStableDebt).mul(100).div(_totalCollateral);
            }
            return {
                position,
                collateral: _totalCollateral.toString(),
                debt: _totalDebt.toString(),
                stableDebt: _totalStableDebt.toString(),
                adjustedCollateral: _adjustedCollateral.toString(),
                availableToIssue,
                debtLimit: debtLimit.toString(),
                collaterals,
                debts,
                apy: totalValue.gt(0) ? netApy.div(totalValue).toFixed(2) : '0',
                rewardAPY: totalValue.gt(0) ? rewardApy.div(totalValue).toFixed(2) : '0',
            }
        }

        setDetails(_setDetails());
    }, [lendingProtocols, pools, position, prices, walletBalances]);

    const leverage = (Number(details?.collateral) / (Number(details?.collateral) - Number(details?.debt)) || 0);

    return (<>
        <Tr>
            <Td>
                <Box cursor={'pointer'} onClick={() => window.open(defaultChain.blockExplorers.default.url + '/address/' + position.id)}>
                    <Flex align={'center'} >
                        {position.data.map((token: any) => (<>
                            {token.tokenSymbol && <Image mr={-3} src={`/icons/${token.tokenSymbol}.svg`} w={'30px'} />}
                        </>))}
                    </Flex>
                    <Flex align={'center'} gap={1} mt={1}>
                        <Text fontSize={'sm'}>{position.id.slice(0, 6)}...{position.id.slice(-4)}</Text>
                        <MdOpenInNew size={'14px'}/>
                    </Flex>
                </Box>
            </Td>
            <Td>
                <Flex flexDir={'row'} align={'center'}>
                    <Flex fontSize={'md'}>
                        <Text>{position.leverage}x</Text>
                    </Flex>
                </Flex>
            </Td>

            <Td>
                <Box>
                    <Flex gap={1} mb={1} align={'center'}>
                        <Text color={'whiteAlpha.600'} fontSize={'sm'}>Total</Text>
                        <Text fontSize={'sm'}>{dollarFormatter.format(Number(details?.collateral) || 0)}</Text>
                    </Flex>
                    {(details?.collaterals ?? []).map((pos: any, index: number) => ( <>
                        <Flex align={'center'} color={'whiteAlpha.600'} key={index} my={0} gap={1.5}>
                            <Text fontSize={'sm'}>{tokenFormatter.format(pos.collateral)} </Text>
                            <Text fontSize={'sm'} > {pos.market.inputToken.symbol} ({dollarFormatter.format(pos.collateral * prices[pos.market.inputToken.id])})</Text>
                        </Flex>
                        </>
                    ))}
                </Box>
            </Td>

            <Td>
                <Box>
                    <Flex gap={1} mb={1}>
                        <Text color={'whiteAlpha.600'} fontSize={'sm'}>Total:</Text>
                        <Text fontSize={'sm'}>{dollarFormatter.format(Number(details?.debt) || 0)}</Text>
                    </Flex>

                    {(details?.debts ?? []).map((pos: any, index: number) => ( <>
                        <Flex align={'center'} key={index} my={0} gap={1}>
                            <Text fontSize={'sm'} color={'whiteAlpha.600'}>{tokenFormatter.format(pos.debt)} </Text>
                            <Text fontSize={'sm'} color={'whiteAlpha.600'}> {pos.market.inputToken.symbol} ({dollarFormatter.format(pos.debt * prices[pos.market.inputToken.id])})</Text>
                        </Flex>
                        </>
                    ))}
                </Box>
            </Td>

            <Td>
                <Flex gap={0} flexDir={'column'}> 
                    <Heading mt={-1} fontSize={'md'} color={Number(position?.profitLoss) > 0 ? 'green.400' : 'red.400'}>{dollarFormatter.format(Number(position?.profitLoss))}</Heading>
                </Flex>
            </Td>

            <Td isNumeric>
                <Text fontSize={'sm'}>{(new Date(position.timestampClosed * 1000)).toLocaleString()}</Text>
            </Td>
        </Tr>    
    </>
    )
}
