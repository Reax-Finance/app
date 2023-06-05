import { Box, Flex, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function NavLink({
	path,
	title,
	target = "_parent",
	newTab = false,
	children,
	bg = "whiteAlpha.50",

}: any) {
	const [isPath, setIsPath] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// search path
		setIsPath(path == router.pathname);
	}, [setIsPath, router.pathname, path]);

	return ( <Flex flexDir={'column'} align='center'>
		<Flex align={"center"}>
			<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<Flex
					align={"center"}
					h={"32px"}
					px={2}
					cursor="pointer"
					rounded={100}
					flex='stretch'
					color={isPath ? "white" : "whitelpha.600"}
				>
					<Box
						fontWeight={"bold"}
						fontSize="sm"
					>
						<Flex align={"center"} gap={2}>
							{children}
							<Heading size={"xs"}>{title}</Heading>
						</Flex>
					</Box>
				</Flex>
			</motion.div>
		</Flex>
		{isPath && <Box w='80%' h={'2px'} rounded='0' bg='primary.400'></Box>}
		</Flex>
	);
};