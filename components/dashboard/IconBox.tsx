import { Flex } from "@chakra-ui/react";

export default function IconBox({ children }: any) {
	return (
		<Flex
			align={"center"}
			justify="center"
			h={"40px"}
			w={"40px"}
			bg="whiteAlpha.200"
			rounded={0}
		>
			{children}
		</Flex>
	);
}