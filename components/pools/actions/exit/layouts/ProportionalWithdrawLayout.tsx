import React, { useEffect, useState } from "react";
import { usePriceData } from "../../../../context/PriceContext";
import {
	Box,
	Button,
	Divider,
	Flex,
	Image,
	InputGroup,
	Select,
	Text,
} from "@chakra-ui/react";
import {
	WETH_ADDRESS,
	defaultChain,
	dollarFormatter,
	tokenFormatter,
} from "../../../../../src/const";
import { EditIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { useAccount, useNetwork } from "wagmi";
import { NumberInput, NumberInputField } from "@chakra-ui/react";
import { formatInput, parseInput } from "../../../../utils/number";
import ValuesTable from "../../others/ValuesTable2";

export default function ProportionalWithdrawLayout({
	pool,
	amounts,
	isNative,
	setIsNative,
	setAmount,
	setMax,
	values,
	maxSlippage,
	setMaxSlippage,
	validate,
	loading,
	bptIn,
	withdraw,
}: any) {
	const poolTokens = pool.tokens.filter(
		(token: any) => token.token.id !== pool.address
	);
	const { chain } = useNetwork();
	const { prices } = usePriceData();
	return (
		<>
			{amounts.map((amount: any, i: number) => {
				const _isNativeToken =
					poolTokens[i].token.id == WETH_ADDRESS(chain?.id!) &&
					isNative;
				return (
					<Box key={i}>
						<Box px={4}>
							<InputGroup
								mt={5}
								variant={"unstyled"}
								display="flex"
								placeholder="Enter amount"
							>
								<NumberInput
									w={"100%"}
                                    value={formatInput(amount)}
									onChange={(valueString) =>
										setAmount(valueString, i)
									}
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
											fontFamily={"Chakra Petch"}
										/>
										<Text
											fontSize="sm"
											textAlign={"left"}
											color={"whiteAlpha.600"}
										>
											{dollarFormatter.format(
												(prices[
													poolTokens[i].token.id
												] ?? 0) * (Number(amount) || 0)
											)}
										</Text>
									</Box>

									<Box>
										<Flex
											justify={"end"}
											align={"center"}
											gap={2}
											mt={2}
										>
											<Image
												rounded={"full"}
												src={`/icons/${
													_isNativeToken
														? "MNT"
														: poolTokens[i].token
																.symbol
												}.svg`}
												alt=""
												width={"30px"}
											/>
											{poolTokens[i].token.id ==
											WETH_ADDRESS(
												chain?.id ?? defaultChain.id
											) ? (
												<>
													<Select
														mr={-2}
														w={"110px"}
														value={
															isNative
																? "ETH"
																: "WETH"
														}
														variant={"unstyled"}
														onChange={(e) =>
															e.target.value ==
															"ETH"
																? setIsNative(
																		true
																  )
																: setIsNative(
																		false
																  )
														}
													>
														<option value="ETH">
															ETH
														</option>
														<option value="WETH">
															WETH
														</option>
													</Select>
												</>
											) : (
												<Text mr={2}>
													{poolTokens[i].token.symbol}
												</Text>
											)}
										</Flex>
										<Flex justify={"end"} mt={2}>
											<Button
												variant={"unstyled"}
												fontSize="sm"
												fontWeight={"bold"}
												onClick={() => setMax(0.5)}
											>
												50%
											</Button>
											<Button
												variant={"unstyled"}
												fontSize="sm"
												fontWeight={"bold"}
												onClick={() => setMax(0.9999 - pool.swapFee)}
											>
												MAX
											</Button>
										</Flex>
									</Box>
								</NumberInput>
							</InputGroup>

							{i !== amounts.length - 1 && (
								<Flex my={5} align={"center"}>
									<Divider borderColor={"whiteAlpha.400"} />
									<PlusSquareIcon color={"whiteAlpha.400"} />
									<Divider borderColor={"whiteAlpha.400"} />
								</Flex>
							)}
						</Box>
					</Box>
				);
			})}

			<Divider mt={8} mb={4} />
			<ValuesTable bptIn={bptIn} values={values} pool={pool} />
			<Box className="swapButton" m={4}>
				<Button
					size={"lg"}
					isLoading={loading}
					loadingText="Loading"
					isDisabled={!validate().valid}
					bg={"transparent"}
					_hover={{ bg: "transparent" }}
					rounded={0}
					w={"100%"}
					onClick={withdraw}
				>
					{validate().message}
				</Button>
			</Box>
		</>
	);
}