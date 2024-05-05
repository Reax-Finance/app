import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import Swap from "../components/swap/index";
import useUpdateData from "../components/utils/useUpdateData";

export default function SwapPage() {
	const { colorMode } = useColorMode();

	return (
			<Box >
				<Flex justify={"center"} align="center" >
					<Box >
						<motion.div
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 15 }}
							transition={{ duration: 0.45 }}
						>
							<Box
								animation={"fadeIn 0.5s ease-in-out"}
								boxShadow={"xl"}
							>
								<Swap />
							</Box>
						</motion.div>
					</Box>
				</Flex>
			</Box>
	);
}
