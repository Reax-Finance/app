import React, { useState } from "react";
import {
	Box,
	Button,
	Divider,
	Flex,
	Heading,
	Image,
	InputGroup,
	Link,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	NumberInput,
	NumberInputField,
	Text,
    useToast,
} from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { formatInput } from "../../../utils/number";
import { defaultChain, dollarFormatter, tokenFormatter } from "../../../../src/const";
import { AiOutlineWallet } from "react-icons/ai";
import { useBalanceData } from "../../../context/BalanceProvider";
import Big from "big.js";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import WithdrawAndHarvest from './WithdrawAndHarvest';
import Deposit from "./Deposit";
import Harvest from "./Harvest";

export default function Stake({ pool, isOpen, onClose }: any) {
    const [amount, setAmount] = useState('');
    const { walletBalances, nonces, allowances, updateFromTx, addNonce } = useBalanceData();
    const [loading, setLoading] = useState(false);
	const [approveLoading, setApproveLoading] = useState(false);
	const { chain } = useNetwork();
	const { address, isConnected } = useAccount();
	const [tabSelected, setTabSelected] = useState(0);

    const max = () => {
        if(tabSelected == 0) {
            return Big(walletBalances[pool.address] ?? 0).div(10**18).toFixed(18)
        } else if (tabSelected == 1) {
            return Big(pool.stakedBalance ?? 0).div(10**18).toFixed(18)
        } else {
            return '0'
        }
    }

	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose}>
			<ModalOverlay bg='blackAlpha.800' backdropFilter='blur(10px)' />
			<ModalContent w={"30rem"} bgColor="transparent" shadow={0} rounded={0} mx={2}>
				<Box className='containerBody2'>
				<ModalCloseButton rounded={"0"} mt={1} />
				<ModalHeader>
					<Flex justify={"start"} px={3} gap={2} pt={1} align={"center"}>
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
						<Heading fontSize={'22px'} fontWeight={'bold'}>{pool.symbol}</Heading>
					</Flex>
				</ModalHeader>
				<ModalBody p={0} m={0}>
					<Divider />
                    <Box bg={'bg.600'} px={4}>
                        <InputGroup
                            pt={7}
                            pb={7}
                            variant={"unstyled"}
                            display="flex"
                            placeholder="Enter amount"
                            
                        >
                            <NumberInput
                                w={"100%"}
                                value={tabSelected > 1 ? '0' : formatInput(amount)}
                                onChange={(valueString) => setAmount(valueString)}
                                min={0}
                                step={0.01}
                                display="flex"
                                alignItems="center"
                                justifyContent={"center"}
                                isDisabled={tabSelected > 1}
                            >
                                <Box ml={0}>
                                    <NumberInputField
                                        textAlign={"left"}
                                        pr={0}
                                        fontSize={"4xl"}
                                        placeholder="0"
                                        fontFamily={'Chakra Petch'}
                                    />
                                    <Text
                                        fontSize="sm"
                                        textAlign={"left"}
                                        color={"whiteAlpha.600"}
                                    >
                                        {dollarFormatter.format(0)}
                                    </Text>
                                </Box>

                                <Flex flexDir={'column'} align={'end'} w={'100%'}>
                                <Flex cursor={'pointer'} className="outlinedBox" maxW={'190px'} p={2} py={2} pl={3} justify={'end'} align={'center'} gap={2} mt={2}>
                                    <Text mr={5}>{pool.symbol} LP</Text>
                                    {pool.tokens.map((token: any, index: number) => {
                                        return (
                                            pool.address !== token.token.id && (
                                                <Flex
                                                    ml={"-5"}
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
                                <Flex mt={0} align={'center'} gap={1}>
                                <AiOutlineWallet />
                                <Button
                                    variant={"unstyled"}
                                    fontSize="sm"
                                    fontWeight={"normal"}
                                    textDecor={'underline'}
                                    textDecorationStyle="dashed"
                                    onClick={() => setAmount(max())}
                                >
                                    {tokenFormatter.format(Number(max()))}
                                </Button>
                                </Flex>
                                </Flex>
                            </NumberInput>
                        </InputGroup>
                    </Box>
                <Divider/>
                <Box className="containerFooter">
						<Tabs variant={'enclosed'} onChange={(e) => setTabSelected(e)}>
							<TabList>
								<Tab
									w={"50%"}
									_selected={{
										color: "primary.400",
										borderColor: "primary.400",
									}}
									rounded={0}
									border={0}
								>
									Deposit
								</Tab>
								<Divider orientation="vertical" h={'40px'} />
								<Tab
									w={"50%"}
									_selected={{
										color: "secondary.400",
										borderColor: "secondary.400",
									}}
									rounded={0}
									border={0}
								>
									Withdraw
								</Tab>
								<Divider orientation="vertical" h={'40px'} />
                                <Tab
									w={"50%"}
									_selected={{
										color: "secondary.400",
										borderColor: "secondary.400",
									}}
									rounded={0}
									border={0}
								>
									Harvest
								</Tab>
							</TabList>

							<TabPanels>
								<TabPanel m={0} p={0}>
									<Deposit
										pool={pool}
										amount={amount}
										setAmount={setAmount}
									/>
								</TabPanel>
								<TabPanel m={0} p={0}>
									<WithdrawAndHarvest
										pool={pool}
										amount={amount}
										setAmount={setAmount}
									/>
								</TabPanel>
                                <TabPanel m={0} p={0}>
									<Harvest
										pool={pool}
									/>
								</TabPanel>
							</TabPanels>
						</Tabs>
                    </Box>
				</ModalBody>
				</Box>
			</ModalContent>
		</Modal>
	);
}
