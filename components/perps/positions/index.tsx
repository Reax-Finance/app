import { Box, Flex, Heading, TabPanel, useColorMode } from "@chakra-ui/react";
import React from "react";
import { Tabs, TabList, TabPanels, Tab, Divider } from "@chakra-ui/react";
import { VARIANT } from "../../../styles/theme";
import Open from "./opened/Open";
import Closed from "./closed/Closed";
import History from "./history/History";

export default function Positions() {
  const { colorMode } = useColorMode();

  return (
    <Box
      className={`${VARIANT}-${colorMode}-containerBody`}
      mt={4}
      pb={8}
      mb={10}
    >
      <Tabs variant={"enclosed"}>
        <TabList
          className={VARIANT + "-" + colorMode + "-" + "containerHeader"}
        >
          <Tab
            color={colorMode == "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
            _selected={{
              color: "primary.400",
              borderColor: "primary.400",
            }}
            rounded={0}
            borderX={0}
            borderTop={1}
            px={5}
            fontWeight={"medium"}
            fontSize={"sm"}
          >
            Open Positions
          </Tab>
          <Divider orientation="vertical" h={"40px"} />
          <Tab
            color={colorMode == "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
            _selected={{
              color: "primary.400",
              borderColor: "primary.400",
            }}
            rounded={0}
            borderX={0}
            borderTop={1}
            px={5}
            fontWeight={"medium"}
            fontSize={"sm"}
          >
            Closed Positions
          </Tab>
          <Divider orientation="vertical" h={"40px"} />
          <Tab
            color={colorMode == "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
            _selected={{
              color: "primary.400",
              borderColor: "primary.400",
            }}
            rounded={0}
            borderX={0}
            borderTop={1}
            px={5}
            fontWeight={"medium"}
            fontSize={"sm"}
          >
            History
          </Tab>
          <Divider orientation="vertical" h={"40px"} />
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Open />
          </TabPanel>
          <TabPanel p={0}>
            <Closed />
          </TabPanel>
          <TabPanel p={0}>
            <History />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
