import { Box, Flex, Image, Text, useColorMode } from '@chakra-ui/react';
import React from 'react'
import { RiArrowDropDownLine } from 'react-icons/ri';
import { useAppData } from '../../context/AppDataProvider';
import { SynthData } from '../../utils/types';

export default function SelectBody2({ asset, onOpen }: { asset: SynthData, onOpen: () => void }) {
	const { colorMode } = useColorMode();

	return (
		<Flex flexDir={'column'} align={'center'} cursor="pointer" onClick={onOpen} bg={colorMode + "Bg.200"} px={2} py={'16px'} mt={"-6px"} pr={1}>
				<Flex
					justify={"space-between"}
					align={"center"}
					gap={1}
				>
					<Image
						src={"/icons/" + asset.synth.symbol + ".svg"}
						height={30}
						style={{margin: "4px"}}
						width={30}
						alt={asset.synth.symbol}
					/>
					
					<Text fontSize="xl" fontWeight={'medium'} color={colorMode == 'dark' ? "whiteAlpha.800" : "blackAlpha.800"}>
						{asset.synth.symbol}
					</Text>
					<Box>
						<RiArrowDropDownLine size={20} />
					</Box>
				</Flex>
		</Flex>
	);
}