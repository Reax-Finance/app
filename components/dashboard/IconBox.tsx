import { Flex } from "@chakra-ui/react";

export default function IconBox({ children }: any) {
	return (
		<Flex
			align={"center"}
			justify="center"
			h={"30px"}
			w={"30px"}
			bg="whiteAlpha.200"
			rounded={0}
		>
			{children}
		</Flex>
	);
}