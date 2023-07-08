import { Box, Divider, Flex, Text, Image, Tooltip } from "@chakra-ui/react";
import React, { useState } from "react";
import { FcPlus } from "react-icons/fc";
import { TbMoneybag } from "react-icons/tb";

export default function APRInfo({ debtBurnApr, esSyxApr, children }: any) {
	const [isLabelOpen, setIsLabelOpen] = useState(false);

	return (
		<>
			<Tooltip
				bg={"transparent"}
				p={0}
				rounded={8}
				label={
					<APRInfoBox debtBurnApr={debtBurnApr} esSyxApr={esSyxApr} />
				}
				isOpen={isLabelOpen}
			>
				<Box
					onMouseEnter={() => setIsLabelOpen(true)}
					onMouseLeave={() => setIsLabelOpen(false)}
					onClick={() => setIsLabelOpen(true)}
				>
					{children}
				</Box>
			</Tooltip>
		</>
	);
}

function APRInfoBox({ debtBurnApr, esSyxApr }: any) {
	return (
		<>
			<Box
				rounded={0}
				className="containerBody"
				color={'white'}
				shadow={'2xl'}
			>
				<Box px={3} py={2} className="containerHeader">
					<Text color={"whiteAlpha.700"}>Total APY</Text>
					<Text fontSize={"lg"}>
						{(Number(debtBurnApr)
						 // + Number(esSyxApr)
						 ).toFixed(2)} %
					</Text>
				</Box>

				<Divider />
				<Box px={3} py={1} roundedBottom={8}>
					<Flex align={"center"} gap={2} mb={2} mt={2}>
						{/* <TbMoneybag size={"20px"} /> */}
						<Flex gap={2}>
							<Text>{debtBurnApr} %</Text>
							<Text color={"whiteAlpha.700"}>Debt Burn</Text>
						</Flex>
					</Flex>
					{/* <Flex align={"center"} gap={2} mb={2}>
						<Image src="/veREAX.svg" w={5} alt={"veREAX"} />
						<Flex gap={2}>
							<Text>{esSyxApr} %</Text>
							<Text color={"whiteAlpha.700"}>veREAX</Text>
						</Flex>
					</Flex> */}
				</Box>
			</Box>
		</>
	);
}
