"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  const [tabIndex, setTabIndex] = React.useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "add") {
      setTabIndex(0);
    } else if (action === "remove") {
      setTabIndex(1);
    }
  });

  // const onChangeTab = (index: number) => {
  //   setUpdatedAccount(account as any);
  //   setTabIndex(index);
  //   let _router = { ...router };
  //   if (index === 0) {
  //     router.query.action = "add";
  //   } else {
  //     router.query.action = "remove";
  //   }
  //   router.push(_router);
  // };

  const onChangeTab = (index: number) => {
    setUpdatedAccount(account as any);
    setTabIndex(index);
    const params = new URLSearchParams(searchParams.toString());
    if (index === 0) {
      params.set("action", "add");
    } else {
      params.set("action", "remove");
    }
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    if (account && !updatedAccount) {
      console.log("Setting updated account");
      setUpdatedAccount(account as any);
    }
  }, [account, updatedAccount]);

  if (!updatedAccount) return <></>;

  return (
    <>
      <Flex flexDir={{ base: "column", md: "row" }} gap={"2"}>
        <Box
          w={{ base: "100%", md: "25%" }}
          className={`${VARIANT}-${colorMode}-containerBody`}
          order={{ base: 1, md: 0 }}
        >
          <PoolPosition updatedAccount={updatedAccount} />
        </Box>

        <Box
          w={{ base: "100%", md: "50%" }}
          className={`${VARIANT}-${colorMode}-containerBody`}
          order={{ base: 0, md: 1 }}
          minH={"500px"}
        >
          <Tabs
            isFitted
            colorScheme="orange"
            index={tabIndex}
            onChange={onChangeTab}
          >
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
                  <Heading size={"sm"} py={1}>
                    Add Liquidity
                  </Heading>
                </Tab>
                <Tab
                  _selected={{
                    color: "secondary.400",
                    borderColor: "secondary.400",
                  }}
                >
                  <Heading size={"sm"}>Remove Liquidity</Heading>
                </Tab>
              </TabList>
            </Box>

            <TabPanels>
              <TabPanel p={0}>
                <AddLiquidity
                  updatedAccount={updatedAccount}
                  setUpdatedAccount={setUpdatedAccount}
                  tabIndex={tabIndex}
                />
              </TabPanel>
              <TabPanel p={0}>
                <RemoveLiquidity
                  updatedAccount={updatedAccount}
                  setUpdatedAccount={setUpdatedAccount}
                  tabIndex={tabIndex}
                />
              </TabPanel>
            </TabPanels>

            <Box></Box>
          </Tabs>
        </Box>

        <Box
          w={{ base: "100%", md: "25%" }}
          className={`${VARIANT}-${colorMode}-containerBody`}
          order={{ base: 2, md: 2 }}
        >
          <PoolLiquidity />
        </Box>
      </Flex>
    </>
  );
}
