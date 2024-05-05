import { useRouter } from "next/router";
import React, { useEffect } from "react";
import AddLiquidity from "./AddLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";
import { Box, Flex, Heading, useColorMode } from "@chakra-ui/react";
import PoolPosition from "./PoolPosition";
import PoolLiquidity from "./PoolLiquidity";
import { VARIANT } from "../../styles/theme";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useAppData } from "../context/AppDataProvider";

export default function Liquidity() {
	const [updatedAccount, setUpdatedAccount] = React.useState();
    const { account } = useAppData();
	const router = useRouter();
	const { colorMode } = useColorMode();

    useEffect(() => {
        if(account) {
            setUpdatedAccount(account as any);
        }
    }, [account])

    if(!updatedAccount) return <></>;

	return (
		<>
			<Flex gap={"4"} w={"1200px"}>
				<Box
					w={"25%"}
					className={`${VARIANT}-${colorMode}-containerBody`}
				>
					<PoolPosition updatedAccount={updatedAccount} />
				</Box>

				<Box
					w={"48%"}
					minH={"500px"}
					flex={1}
					className={`${VARIANT}-${colorMode}-containerBody`}
				>
					<Tabs isFitted colorScheme="orange">
						<Box
							className={`${VARIANT}-${colorMode}-containerHeader`}
							px={0}
							py={0}
						>
							<TabList>
								<Tab
								_selected={{
									color: "primary.400",
									borderColor: "primary.400",
								}}
								>
									<Heading size={"sm"}>Add Liquidity</Heading>
								</Tab>
								<Tab
									_selected={{
										color: "secondary.400",
										borderColor: "secondary.400",
									}}
								>
									<Heading size={"sm"}>
										Remove Liquidity
									</Heading>
								</Tab>
							</TabList>
							</Box>

							<TabPanels>
								<TabPanel p={0}>
									<AddLiquidity updatedAccount={updatedAccount} setUpdatedAccount={setUpdatedAccount} />
								</TabPanel>
								<TabPanel p={0}>
									<RemoveLiquidity updatedAccount={updatedAccount} setUpdatedAccount={setUpdatedAccount} />
								</TabPanel>
							</TabPanels>

						<Box></Box>
					</Tabs>
				</Box>

				<Box
					w={"25%"}
					className={`${VARIANT}-${colorMode}-containerBody`}
				>
					<PoolLiquidity />
				</Box>
			</Flex>
		</>
	);
}
