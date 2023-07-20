import { Flex, Image, Box, Text } from "@chakra-ui/react";
import React from "react";
import { ADDRESS_ZERO, WETH_ADDRESS, tokenFormatter } from "../../../src/const";
import Big from "big.js";
import { useBalanceData } from "../../context/BalanceProvider";
import { useNetwork } from "wagmi";

export default function TokenInfo({ token, color = 'primary.200' }: any) {
	const { walletBalances } = useBalanceData();
	const { chain } = useNetwork();

	return (
		<>
			<Flex gap={2.5} ml={"-2px"} textAlign="left">
				<Image
					src={`/icons/${token.symbol}.svg`}
					width="32px"
					alt=""
				/>
				<Box>
					<Text color={"white"}>{token.symbol}</Text>
					<Flex color="whiteAlpha.600" fontSize={"sm"} gap={1}>
						<Text color={color}>
							{tokenFormatter.format(
								(token.id == WETH_ADDRESS(chain?.id!)?.toLowerCase() ? Big(walletBalances[token.id] ?? 0).add(walletBalances[ADDRESS_ZERO] ?? 0) : Big(walletBalances[token.id] ?? 0))
									.div(10 ** token.decimals)
									.toNumber()
							)}{" "}
							in wallet
						</Text>
					</Flex>
				</Box>
			</Flex>
		</>
	);
}
