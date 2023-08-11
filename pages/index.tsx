import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import Swap from "../components/swap/index";

export default function swap() {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { colorMode } = useColorMode();
	return (
		<Flex >
			<Box w='100%' h={'100%'} >
			<Flex justify={"center"} align="center" h={"86vh"}>
				<Flex justify={'center'} zIndex={-10} position={"absolute"} w={'100%'} h={'100%'}>
					<Box bgImage={"/background-1.svg"} bgRepeat={'no-repeat'} bgSize={'cover'} w={"80%"} h={"60%"} position={"absolute"} bottom={0} zIndex={-10} />
					<Box bgImage={"/background-2.svg"} bgRepeat={'no-repeat'} bgSize={'cover'} w={"100%"} h={"60%"} position={"absolute"} bottom={0} zIndex={-8} />
					<Box bgGradient={`linear(to-t, ${colorMode == 'dark' ? 'black' : 'white'}Alpha.800, transparent)`} bgSize={"cover"} w={"100%"} h={"50%"} position={"absolute"} bottom={0} zIndex={-9} />
				</Flex>
				<Box w={"43%"} minW="400px" >
					<motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						transition={{ duration: 0.45 }}
					>
						<Box
							animation={"fadeIn 0.5s ease-in-out"}
							boxShadow={'xl'}
							p={0}
							paddingBottom={'1px'}
							border={'0'}
						>
							<Swap />
						</Box>
					</motion.div>
				</Box>
			</Flex>
			</Box>

		</Flex>
	);
}
