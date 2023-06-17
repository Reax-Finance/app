import {
	Box,
	Flex,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import SupplyTable from "../components/dashboard/lending/SupplyTable";
import BorrowTable from "../components/dashboard/lending/BorrowTable";
import { motion } from "framer-motion";
import Head from "next/head";
import YourSupplies from "../components/dashboard/lending/YourSupplies";
import YourBorrows from "../components/dashboard/lending/YourBorrows";
import LendingMarket from "../components/dashboard/lending/Market";
import LendingPosition from "../components/dashboard/lending/Position";

export default function TempPage() {
	const { pools, tradingPool, account } = useContext(AppDataContext);

	const [hydrated, setHydrated] = React.useState(false);

	React.useEffect(() => {
		setHydrated(true);
	}, []);

	if (!hydrated) return <></>;

	return (
		<>
			<Head>
				<title>REAX | Dashboard</title>
				<link rel="icon" type="image/x-icon" href="/REAX.svg"></link>
			</Head>
				<Box w={'100%'}>
				
				<Box mt={20}>
					<LendingMarket />
				</Box>

				<Box>
					<LendingPosition />
				</Box>

				<Box mt={5} w='100%'>
					<Flex
						flexDir={{ sm: "column", md: "row" }}
						align={"stretch"}
						gap={"2%"}
						zIndex={1}
					>
						<Box
							w={{ sm: "100%", md: "49%" }}
							
						>
							<motion.div
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 15 }}
								transition={{ duration: 0.25 }}
								style={{
									height: "100%",
								}}
							>
								<Box className="tableStyle" h={'100%'}>
									<YourSupplies />
								</Box>
							</motion.div>
						</Box>
						<Box w={{ sm: "100%", md: "49%" }} alignSelf="stretch">
							<motion.div
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 15 }}
								transition={{ duration: 0.25 }}
								style={{
									height: "100%",
								}}
							>
								<Box className="tableStyle" h={'100%'}>
									<YourBorrows />
								</Box>
							</motion.div>
						</Box>
					</Flex>
				</Box>

				<Box pb={"70px"} w='100%'>
					<Flex
						flexDir={{ sm: "column", md: "row" }}
						align={"stretch"}
						gap={"2%"}
						zIndex={1}
						mt={5}
					>
						<Box
							w={{ sm: "100%", md: "49%" }}
							alignSelf="stretch"
						>
							<motion.div
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 15 }}
								transition={{ duration: 0.25 }}
								key={tradingPool}
								style={{
									height: "100%",
								}}
							>
								<Box className="tableStyle" h={'100%'}>
									<SupplyTable />
								</Box>
							</motion.div>
						</Box>
						<Box w={{ sm: "100%", md: "49%" }}>
							<motion.div
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 15 }}
								transition={{ duration: 0.25 }}
								key={tradingPool + 2}
							>
								<Box className="tableStyle" h={'100%'}>
									<BorrowTable />
								</Box>
							</motion.div>
						</Box>
					</Flex>
				</Box>
				</Box>
		</>
	);
}
