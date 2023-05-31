import {
	Box,
	Heading,
	Text,
	Flex,
	Tag,
} from "@chakra-ui/react";
import React from "react";
import { Image } from "@chakra-ui/react";
import Head from "next/head";
import { motion } from "framer-motion";

export default function Earn() {
	return (
		<>
			<Head>
				<title>Earn | Reax</title>
				<link rel="icon" type="image/x-icon" href="/logo32.png"></link>
			</Head>
			<Box textAlign={"left"} pt="100px" maxW={"1200px"}>
				<motion.div
					initial={{ opacity: 0, y: 0 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
				>
					<Heading size={"lg"}>Earn Additional Yield</Heading>

					<Text mb={5} mt={2} color="whiteAlpha.700">
						Put your Synthetic Assets to work and earn additional
						yield on your holdings.
					</Text>
				</motion.div>

				<Flex justify={"start"} align={"center"} gap={1}></Flex>
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					style={{
						height: "100%",
					}}
				>
					<Box
						bg={"bg3"}
						border="2px"
						borderColor={"whiteAlpha.300"}
						rounded={16}
						mt={5}
						shadow="xl"
						px={6}
						py={6}
					>
						<Flex justify={"space-between"}>
							<Box>
								<Flex>
									<Image
										src="/icons/USDC.svg"
										w="40px"
										alt="USDC"
									/>
									<Image
										mx={-2}
										src="/icons/cUSD.svg"
										w="40px"
										alt="USDC"
									/>
									<Image
										src="/icons/fUSD.svg"
										w="40px"
										alt="USDC"
									/>
								</Flex>

								<Heading mt={4} size={"md"}>
									USDC - cUSD - fUSD
								</Heading>
							</Box>

							<Box>
								<Tag>Coming soon</Tag>
							</Box>
						</Flex>
					</Box>
				</motion.div>

        <motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					style={{
						height: "100%",
					}}
				>
					<Box
						bg={"bg3"}
						border="2px"
						borderColor={"whiteAlpha.300"}
						rounded={16}
						mt={5}
						shadow="xl"
						px={6}
						py={6}
					>
						<Flex justify={"space-between"}>
							<Box>
								<Flex>
									<Image
										src="/icons/ETH.svg"
										w="40px"
										alt="USDC"
									/>
									<Image
										mx={-2}
										src="/icons/cETH.svg"
										w="40px"
										alt="USDC"
									/>
								</Flex>

								<Heading mt={4} size={"md"}>
									ETH - cETH
								</Heading>
							</Box>

							<Box>
								<Tag>Coming soon</Tag>
							</Box>
						</Flex>
					</Box>
				</motion.div>

        <motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					style={{
						height: "100%",
					}}
				>
					<Box
						bg={"bg3"}
						border="2px"
						borderColor={"whiteAlpha.300"}
						rounded={16}
						mt={5}
						shadow="xl"
						px={6}
						py={6}
					>
						<Flex justify={"space-between"}>
							<Box>
								<Flex>
									<Image
										src="/icons/WBTC.svg"
										w="40px"
										alt="USDC"
									/>
									<Image
										mx={-2}
										src="/icons/cBTC.svg"
										w="40px"
										alt="USDC"
									/>
								</Flex>

								<Heading mt={4} size={"md"}>
                  WBTC - cBTC
								</Heading>
							</Box>

							<Box>
								<Tag>Coming soon</Tag>
							</Box>
						</Flex>
					</Box>
				</motion.div>

        <motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 15 }}
					transition={{ duration: 0.25 }}
					style={{
						height: "100%",
					}}
				>
					<Box
						bg={"bg3"}
						border="2px"
						borderColor={"whiteAlpha.300"}
						rounded={16}
						mt={5}
						shadow="xl"
						px={6}
						py={6}
					>
						<Flex justify={"space-between"}>
							<Box>
								<Flex>
									<Image
										src="/icons/EUROC.svg"
										w="40px"
										alt="USDC"
									/>
									<Image
										mx={-2}
										src="/icons/fEUR.svg"
										w="40px"
										alt="USDC"
									/>
								</Flex>

								<Heading mt={4} size={"md"}>
									EURC - fEUR
								</Heading>
							</Box>

							<Box>
								<Tag>Coming soon</Tag>
							</Box>
						</Flex>
					</Box>
				</motion.div>
			</Box>
		</>
	);
}
