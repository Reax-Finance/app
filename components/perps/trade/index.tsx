import React from 'react'
import { Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Long from './Long'
import Short from './Short'
import { PairData } from '../../utils/types'

export default function Trade({ pair }: { pair: PairData }) {
	return (
		<Box>
			<Tabs>
				<TabList>
					<Tab>Long</Tab>
					<Tab>Short</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<Long pair={pair} />
					</TabPanel>
					<TabPanel>
						{/* <Short pair={pair} /> */}
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>
	)
}
