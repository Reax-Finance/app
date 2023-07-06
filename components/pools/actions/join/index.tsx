import React from "react";
import {
	Divider,
	Flex,
	Heading,
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
import ProportionalJoin from "./Proportional";
import SingleTokenJoin from "./SingleToken";

export default function Join({ pool, isOpen, onClose }: any) {
	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose}>
			<ModalOverlay bg='blackAlpha.800' backdropFilter='blur(10px)' />
			<ModalContent w={"30rem"} bgColor="bg1" rounded={0} mx={2}>
				<ModalCloseButton rounded={"0"} mt={1} />
				<ModalHeader>
					<Flex justify={"center"} gap={2} pt={1} align={"center"}>
						<Flex ml={-2}>
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
						<Heading size={'md'}>{pool.symbol}</Heading>
					</Flex>
				</ModalHeader>
				<ModalBody p={0} m={0}>
					<Divider />
					<Tabs size={"sm"} isFitted colorScheme="secondary">
						<TabList>
							<Tab>Pool Tokens</Tab>
							<Tab py={2}>Single Token</Tab>
						</TabList>

						<TabPanels>
							<TabPanel p={0}>
								<ProportionalJoin pool={pool} />
							</TabPanel>
							<TabPanel p={0}>
								<SingleTokenJoin pool={pool} />
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
