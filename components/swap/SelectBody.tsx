import { Box, Flex, Image, Text } from '@chakra-ui/react';
import React from 'react'
import { RiArrowDropDownLine } from 'react-icons/ri';

export default function SelectBody({ asset, onOpen, size = 'lg' }: any) {
	return (
		<Box cursor="pointer" onClick={onOpen}>
			<Flex
				justify={"space-between"}
				align={"center"}
                bgGradient={'linear(45deg, transparent 0px, bg.200 0) bottom left'}
				_hover={{
					bgGradient: 'linear(45deg, transparent 0px, bg.400 0) bottom left',
				}}
				px={2}
				py={2}
				pr={2}
				gap={1.5}
				mr={-1}
			>
				<Image
					src={"/icons/" + asset?.symbol + ".svg"}
					height={26}
					style={{margin: "4px"}}
					width={26}
					alt={asset?.symbol}
				/>

				<Text fontSize={size} color="whiteAlpha.800">
					{asset?.symbol}
				</Text>
				<Box>
					<RiArrowDropDownLine size={20} />
				</Box>
			</Flex>
		</Box>
	);
}