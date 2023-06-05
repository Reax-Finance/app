import { Flex, Heading, Text } from "@chakra-ui/react";
import React from "react";
import { useAppData } from "../context/AppDataProvider";

export default function Paused() {
	const { pools, tradingPool } = useAppData();
	return (
		<>
			<Flex
				gap={3}
				bg={"bg2"}
				rounded="16"
				flexDir={"column"}
				h="360px"
				w={"100%"}
				align="center"
				justify={"center"}
				border="2px"
				borderColor={"whiteAlpha.200"}
			>
				<Heading fontSize={"24px"}>Market Paused</Heading>
				<Text
					textAlign={"center"}
					color="whiteAlpha.700"
					maxW={"500px"}
					my={4}
				>
					Equity and ETF assets are traded only during 9:30AM to 4:00PM EDT Monday
					through Friday
				</Text>

				<Text
					textAlign={"center"}
					color="whiteAlpha.700"
					maxW={"500px"}
					mt={0}
				>
					Forex markets are traded
					only from 5PM EDT on Sunday through 4PM EDT on Friday.
					Additionally, some currencies might trade only during local
					banking hours.
				</Text>
			</Flex>
		</>
	);
}
