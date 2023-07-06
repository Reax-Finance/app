import {
	Box,
	Flex,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AppDataContext } from "../components/context/AppDataProvider";
import CollateralTable from "../components/dashboard/CollateralTable";
import IssuanceTable from "../components/dashboard/IssuanceTable";
import { motion } from "framer-motion";
import Head from "next/head";
import Paused from "../components/dashboard/Paused";
import Position from "../components/dashboard/Position";
import Market from "../components/dashboard/Market";
import { isMarketOpen } from "../src/timings";

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
				<title>REAX | Synthetics</title>
				<link rel="icon" type="image/x-icon" href="/REAX.svg"></link>
			</Head>
				<Box w={'100%'}>
				
				<Box pt={10}>
					<Market/>
				</Box>
			
					<Position/>

				<Box pb={"70px"} mt={10} w='100%'>
					{(pools[tradingPool]?.paused || !isMarketOpen(pools[tradingPool]?.name ?? 'Crypto Market')) ?(
						<Paused />
					) : (
						<Flex
							flexDir={{ sm: "column", md: "row" }}
							align={"stretch"}
							gap={8}
							zIndex={1}
						>
							<Box
								w={{ sm: "100%", md: "33%" }}
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
										<CollateralTable />
									</Box>
								</motion.div>
							</Box>
							<Box w={{ sm: "100%", md: "67%" }}>
								<motion.div
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 15 }}
									transition={{ duration: 0.25 }}
									key={tradingPool + 2}
								>
									<Box className="tableStyle" h={'100%'}>
										<IssuanceTable />
									</Box>
								</motion.div>
							</Box>
						</Flex>
					)}
				</Box>
				</Box>
		</>
	);
}
