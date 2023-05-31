import { Flex } from "@chakra-ui/react";

export default function IconBox({ children }: any) {
	return (
		<Flex
			align={"center"}
			justify="center"
			h={"40px"}
			w={"40px"}
			bg="whiteAlpha.200"
			border={"2px"}
			borderColor="whiteAlpha.50"
			rounded={10}
		>
			{children}
		</Flex>
	);
}