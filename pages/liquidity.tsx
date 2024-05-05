import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import Liquidity from "../components/liquidity/index";
import Head from "next/head";
import SwapSkeleton from "../components/swap/Skeleton";
import { useAppData } from "../components/context/AppDataProvider";

export default function SwapPage() {
	const { colorMode } = useColorMode();
	const { reserveData } = useAppData();

	return (
		<>
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
				<Box w="100%">
					<Flex justify={"center"} align="center" h={{base: "100%", md: '86vh'}}>
						<Flex justify={'center'} zIndex={-10} position={"absolute"} w={'100%'} h={'100%'}>
							<Box bgImage={"/background-1.svg"} bgRepeat={'no-repeat'} bgSize={'cover'} w={"100%"} h={"100%"} position={"absolute"} bottom={0} zIndex={-10} />
							<Box bgImage={"/background-2.svg"} bgRepeat={'no-repeat'} bgSize={'cover'} w={"100%"} h={"60%"} position={"absolute"} bottom={0} zIndex={-8} />
							<Box bgGradient={`linear(to-t, ${colorMode == 'dark' ? 'black' : 'white'}Alpha.400, ${colorMode == 'dark' ? 'black' : 'white'}Alpha.800)`} bgSize={"cover"} w={"100%"} h={"100%"} position={"absolute"} bottom={0} zIndex={-9} />
						</Flex>
						<Box w="100%" my={20}>
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
									{reserveData ? (
										<Liquidity />
									) : (
										<SwapSkeleton />
									)}
								</Box>
							</motion.div>
						</Box>
					</Flex>
				</Box>
			</Flex>
		</>
	);
}
