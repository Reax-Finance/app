import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import Liquidity from "../components/liquidity/index";
import Head from "next/head";
import { useAppData } from "../components/context/AppDataProvider";
import OnlyAuthenticated from "../components/auth/OnlyAuthenticated";

export default function SwapPage() {
	const { colorMode } = useColorMode();
	const { reserveData } = useAppData();

	return (
		<OnlyAuthenticated>
			<Head>
				<title>
					Liquidity | {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
				</title>
				<link
					rel="icon"
					type="image/x-icon"
					href={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`}
				></link>
			</Head>
			<Flex>
			<Box w="100%" py={20}>
				<Flex justify={"center"} align="center" >
					<Box w="100%">
						<motion.div
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 15 }}
							transition={{ duration: 0.45 }}
						>
							<Box
								animation={"fadeIn 0.5s ease-in-out"}
								boxShadow={"xl"}
								p={0}
								paddingBottom={"1px"}
								border={"0"}
							>
								<Liquidity />
							</Box>
						</motion.div>
					</Box>
				</Flex>
			</Box>
		</Flex>
		</OnlyAuthenticated>
	);
}
