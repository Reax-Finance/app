
import { Flex, Modal, Image, Text, Button, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Tr, useDisclosure, ModalBody, Divider, Box, InputGroup, NumberInput, NumberInputField } from '@chakra-ui/react'
import React from 'react'
import TdBox from '../dashboard/TdBox';
import { dollarFormatter } from '../../src/const';
import { usePriceData } from '../context/PriceContext';

export default function PoolModal({pool}: any) {
    const [amounts, setAmounts] = React.useState(pool.tokens.map((token: any) => ''));
    const { prices } = usePriceData();
    
  return (
    <>
        <ModalBody p={0} m={0}>
            <Divider/>
            <Box mb={6} mt={4} px={8}>
                            {amounts.map((amount: any, i: number) => {
            return <InputGroup
							mt={5}
							variant={"unstyled"}
							display="flex"
							placeholder="Enter amount"
                            key={i}
						>
                                <NumberInput
								w={"100%"}
								value={amount}
								onChange={(valueString) => setAmounts([...amounts.slice(0, i), valueString, ...amounts.slice(i + 1)])}
								min={0}
								step={0.01}
								display="flex"
								alignItems="center"
								justifyContent={"center"}
							>
								<Box ml={10}>
									<NumberInputField
										textAlign={"center"}
										pr={0}
										fontSize={"5xl"}
										placeholder="0"
									/>

									<Text
										fontSize="sm"
										textAlign={"center"}
										color={"whiteAlpha.600"}
									>
										{dollarFormatter.format(
											(prices[pool.tokens[i].token.id] ?? 0) *
												amount
										)}
									</Text>
								</Box>

								<Box>
									<Button
										variant={"unstyled"}
										fontSize="sm"
										fontWeight={"bold"}
										// onClick={() => _setAmount(max())}
									>
										MAX
									</Button>
								</Box>
							</NumberInput>
						</InputGroup>
                            })}
							
            </Box>
        </ModalBody>
    </>
  )
}
