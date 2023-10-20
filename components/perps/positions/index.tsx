import { Box, Flex, Heading, TabPanel, useColorMode } from '@chakra-ui/react'
import React from 'react'
import {
	Tabs,
	TabList,
	TabPanels,
	Tab,
    Divider,
} from "@chakra-ui/react";
import { usePerpsData } from '../../context/PerpsDataProvider'
import Position from './Position';
import { VARIANT } from '../../../styles/theme';
import Open from './Open';
import Closed from './Closed';

export default function Positions() {
    const {positions} = usePerpsData();
    const { colorMode } = useColorMode();

    return (   
        <Box className={`${VARIANT}-${colorMode}-containerBody`} mt={4} pb={8} mb={10}>

            <Tabs variant={"enclosed"}>
				<TabList className={VARIANT + "-" + colorMode + "-" + "containerHeader"}>
					<Tab
                        color={'whiteAlpha.600'}
						_selected={{
							color: "white",
						}}
						rounded={0}
						border={0}
						p={3}
                        pl={6}
						fontWeight={'medium'}
					>
						Open Positions
					</Tab>
                    {/* <Divider orientation="vertical" h={'50px'} /> */}
					<Tab
						color={'whiteAlpha.600'}
						_selected={{
							color: "white",
						}}
						rounded={0}
						border={0}
						p={3}
                        px={8}
						fontWeight={'medium'}
					>
						History
					</Tab>
				</TabList>

				<TabPanels>
                    <TabPanel p={0}>
                        <Open />
                    </TabPanel>
                    <TabPanel p={0}>
                        <Closed />
                    </TabPanel>
				</TabPanels>
			</Tabs>
        </Box>
    )
}
