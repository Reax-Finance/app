import React from "react";
import {
	Divider,
	Flex,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Text,
} from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import ProportionalWithdraw from "./Proportional";
import SingleTokenWithdraw from "./SingleToken";

export default function Withdraw({ pool, isOpen, onClose }: any) {
	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent width={"30rem"} bgColor="bg1" rounded={0} mx={2}>
				<ModalCloseButton rounded={"0"} mt={1} />
				<ModalHeader>
					<Flex justify={"center"} gap={2} pt={1} align={"center"}>
						<Flex ml={-4}>
							{pool.tokens.map((token: any, index: number) => {
								return (
									pool.address !== token.token.id && (
										<Flex
											ml={"-2"}
											key={index}
											align="center"
											gap={2}
										>
											<Image
												rounded={"full"}
												src={`/icons/${token.token.symbol}.svg`}
												alt=""
												width={"30px"}
											/>
										</Flex>
									)
								);
							})}
						</Flex>
						<Text>{pool.name}</Text>
					</Flex>
				</ModalHeader>
				<ModalBody p={0}>
					<Divider />
					<Tabs size={"sm"} isFitted colorScheme="secondary">
						<TabList>
							<Tab>In Proportion</Tab>
							<Tab py={2}>Single Token</Tab>
						</TabList>

						<TabPanels>
							<TabPanel p={0}>
								<ProportionalWithdraw pool={pool} />
							</TabPanel>
							<TabPanel p={0}>
								<SingleTokenWithdraw pool={pool} />
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
