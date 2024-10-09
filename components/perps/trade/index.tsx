import React from "react";
import {
  Box,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
} from "@chakra-ui/react";
import Long from "./Long";
import Short from "./Short";
import { PairData } from "../../utils/types";

export default function Trade({ pair }: { pair: PairData }) {
  const { colorMode } = useColorMode();
  return (
    <Box bg={`${colorMode}Bg.400`}>
      <Tabs>
        <TabList>
          <Tab>Long</Tab>
          <Tab>Short</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0} m={0}>
            <Long pair={pair} />
          </TabPanel>
          <TabPanel>{/* <Short pair={pair} /> */}</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
