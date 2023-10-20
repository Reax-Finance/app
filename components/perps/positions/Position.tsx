import { ethers } from 'ethers';
import React, { useEffect } from 'react'
import { useLendingData } from '../../context/LendingDataProvider';
import { usePriceData } from '../../context/PriceContext';
import { useBalanceData } from '../../context/BalanceProvider';
import Big from 'big.js';
import { Td, Flex, Text, Box, Image, Divider, IconButton, Tr, Button, Heading, useDisclosure, NumberInput, NumberInputField,  } from '@chakra-ui/react';
import { MdOpenInNew } from 'react-icons/md';
import { ESYX_PRICE, defaultChain, dollarFormatter, tokenFormatter } from '../../../src/const';
import { usePerpsData } from '../../context/PerpsDataProvider';
import { getABI } from '../../../src/contract';
import { useNetwork } from 'wagmi';
import CloseModal from './CloseModal';


export default function Position({position, index}: any) {
    const {protocols: lendingProtocols, pools} = useLendingData();
    const {positions } = usePerpsData();
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
            let collaterals = [];
            let debts = [];
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
    
    
            for(let i in markets){   
                let inputTokenHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "address"], [markets[i].inputToken.id, position.id]));
                let outputTokenHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "address"], [markets[i].outputToken.id, position.id]));
                let vTokenHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "address"], [markets[i]._vToken.id, position.id]));
                let sTokenHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "address"], [markets[i]._sToken.id, position.id]));

                if(!walletBalances[outputTokenHash] || !prices[markets[i].inputToken.id]) continue;
                let collateralValue = Big(walletBalances[outputTokenHash]).div(10**markets[i].outputToken.decimals);
                let variableDebt = Big(walletBalances[vTokenHash]).div(10**markets[i]._vToken.decimals);
                let stableDebt = Big(walletBalances[sTokenHash]).div(10**markets[i]._sToken.decimals);
                _totalCollateral = _totalCollateral.add(collateralValue.mul(prices[markets[i].inputToken.id]));
                _adjustedCollateral = _adjustedCollateral.plus(collateralValue.mul(prices[markets[i].inputToken.id]).mul(markets[i].maximumLTV).div(100));
                _totalDebt = _totalDebt.add(variableDebt.mul(prices[markets[i].inputToken.id]));
                _totalStableDebt = _totalStableDebt.add(stableDebt.mul(prices[markets[i].inputToken.id]));
    
                netApy = netApy.add(collateralValue.mul(prices[markets[i].inputToken.id]).mul(markets[i].rates.find((rate: any) => rate.side == 'LENDER').rate));
                rewardApy = rewardApy.add(collateralValue.mul(prices[markets[i].inputToken.id]).mul(rewardAPY(markets[i], 'DEPOSIT')));
                totalValue = totalValue.add(collateralValue.mul(prices[markets[i].inputToken.id]));
                netApy = netApy.add(variableDebt.mul(prices[markets[i].inputToken.id]).mul(markets[i].rates.find((rate: any) => rate.side == 'BORROWER' && rate.type == 'VARIABLE').rate).neg());
                rewardApy = rewardApy.add(variableDebt.mul(prices[markets[i].inputToken.id]).mul(rewardAPY(markets[i], 'BORROW')));
                totalValue = totalValue.add(variableDebt.mul(prices[markets[i].inputToken.id]));
                netApy = netApy.add(stableDebt.mul(prices[markets[i].inputToken.id]).mul(markets[i].rates.find((rate: any) => rate.side == 'BORROWER' && rate.type == 'STABLE').rate).neg());
                rewardApy = rewardApy.add(stableDebt.mul(prices[markets[i].inputToken.id]).mul(rewardAPY(markets[i], 'BORROW', 'STABLE')));
                totalValue = totalValue.add(stableDebt.mul(prices[markets[i].inputToken.id]));
    
                let pos = {
                    market: markets[i],
                    collateral: collateralValue.toString(),
                    debt: stableDebt.add(variableDebt).toString(),
                }
    
                if(Number(pos.collateral) > 0){
                    collaterals.push(pos);
                }
                if(Number(pos.debt) > 0){
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
                <Box>
                    <Flex align={'center'} cursor={'pointer'}  onClick={() => window.open(defaultChain.blockExplorers.default.url + '/address/' + position.id)}>
                        {position.data.map((token: any) => (<>
                            <Image mr={-3} src={`/icons/${token.tokenSymbol}.svg`} w={'30px'} />
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
                    <Flex fontSize={'lg'}>
                        <Text>{position.leverage}x</Text>
                    </Flex>
                    <Box fontSize={'xs'} ml={2} color={'whiteAlpha.600'}>
                        <Text> / Liq {position.liqLeverage}x</Text>
                    </Box>
                </Flex>
            </Td>

            <Td>
                <Text fontSize={'sm'}>{(leverage * details?.apy).toFixed(2)} %</Text>
                <Flex gap={1} align={'center'}>
                    <Text color={'whiteAlpha.700'} fontSize={'sm'}>{(leverage * details?.rewardAPY).toFixed(2)} %</Text>
                    <Image src='/veREAX.svg' boxSize={'16px'} rounded={'full'} alt='veREAX' />
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
                <Flex justify={'end'} align={'center'} gap={2}>
                    <CloseModal details={details} />
                </Flex>
            </Td>
        </Tr>    
    </>
    )
}
