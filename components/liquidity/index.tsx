import { useRouter } from "next/router";
import React, { useEffect } from "react";
import AddLiquidity from "./AddLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import PoolPosition from "./PoolPosition";
import PoolLiquidity from "./PoolLiquidity";
import { VARIANT } from "../../styles/theme";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useAppData } from "../context/AppDataProvider";
import { Account } from "../utils/types";
import { Image } from "@chakra-ui/react";
import { ArrowDownIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ONE_ETH, dollarFormatter, tokenFormatter } from "../../src/const";
import Big from "big.js";
import { BsBank, BsCash } from "react-icons/bs";

export default function Liquidity() {
  const [updatedAccount, setUpdatedAccount] = React.useState<
    Account | undefined
  >();
  const [account, setAccount] = React.useState<Account | undefined>();

  const { synths } = useAppData();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const [tabIndex, setTabIndex] = React.useState(0);

  const [marketIndex, setMarketIndex] = React.useState(0);

  useEffect(() => {
    const action = router.query.action;
    if (action === "add") {
      setTabIndex(0);
    } else if (action === "remove") {
      setTabIndex(1);
    }
  }, [router.query.action]);

  const onChangeTab = (index: number) => {
    setUpdatedAccount(account as any);
    setTabIndex(index);
    let _router = { ...router };
    router.query.action = index === 0 ? "add" : "remove";
    router.push(_router);
  };

  const onChangeMarket = (index: number) => {
    setUpdatedAccount(account as any);
    setMarketIndex(index);
    let _router = { ...router };
    router.query.market =
      index === 0 ? "reax-ethereum" : index === 3 ? "reax-usd" : "reax-lp";
    router.push(_router);
  };

  useEffect(() => {
    if (synths[marketIndex] && !updatedAccount && !account) {
      console.log("Setting updated account");
      setUpdatedAccount(synths[marketIndex].market);
      setAccount(synths[marketIndex].market);
    }
  }, [synths, updatedAccount]);

  if (!updatedAccount || !account) return <></>;

  return (
    <>
      <Flex
        w={"100%"}
        className={`${VARIANT}-${colorMode}-containerBody2`}
        order={{ base: 1, md: 0 }}
        h={"90px"}
        mb={2}
      >
        {/* menu */}

        <Menu matchWidth>
          <MenuButton
            as={Button}
            h={"100%"}
            rightIcon={<ChevronDownIcon w={8} h={6} />}
            className={`${VARIANT}-${colorMode}-containerBody`}
            w={{ base: "100%", md: "25%" }}
            p={4}
            gap={4}
            display={"flex"}
            cursor={"pointer"}
            background="transparent"
            _hover={"transparent"}
            _active={"transparent"}
          >
            <Flex gap={4} alignItems={"center"}>
              <Image
                src={`/icons/${synths[marketIndex]?.synth.symbol}.svg`}
                alt="icon"
                boxSize={16}
              />
              <Box textAlign={"start"}>
                <Text fontSize={"sm"} color={"whiteAlpha.600"}>
                  {synths[marketIndex]?.synth.name}
                </Text>
                <Heading size={"md"}>
                  {synths[marketIndex]?.synth.symbol}
                </Heading>
              </Box>
            </Flex>
          </MenuButton>
          <MenuList backgroundColor={"#191D25"}>
            {synths.map((item, index) => (
              <>
                {item.market.exists === true ? (
                  <MenuItem
                    minH="40px"
                    key={index}
                    onClick={() => onChangeMarket(index)} //added route switch
                    // onClick={() => setMarketIndex(index)}
                    backdropBlur={"10px"}
                    backgroundColor={"#191D25"}
                    _hover={{ bg: "#252B36" }}
                  >
                    <Flex
                      w={{ base: "100%", md: "25%" }}
                      p={4}
                      gap={4}
                      h={"100%"}
                      align={"center"}
                      cursor={"pointer"}
                    >
                      <Image
                        src={`/icons/${item?.synth.symbol}.svg`}
                        alt="icon"
                        boxSize={12}
                      />
                      <Box>
                        <Text
                          fontSize={"sm"}
                          color={"whiteAlpha.600"}
                          w={"100%"}
                          whiteSpace={"nowrap"}
                        >
                          {item?.synth.name}
                        </Text>
                        <Heading size={"md"} w={"100%"}>
                          {item?.synth.symbol}
                        </Heading>
                      </Box>
                    </Flex>
                  </MenuItem>
                ) : null}
              </>
            ))}
          </MenuList>
        </Menu>

        {/* menu end  */}

        <Divider orientation={"vertical"} />
        <Flex
          w={{ base: "100%", md: "50%" }}
          justify={"start"}
          align={"center"}
          gap={4}
          px={4}
        >
          <Box mr={"auto"}>
            <Text fontSize={"sm"} color={"whiteAlpha.600"}>
              Price
            </Text>
            <Heading size={"md"}>
              {dollarFormatter.format(
                Big(synths[marketIndex]?.synth?.price?.toString() || 0)
                  .div(100_000_000)
                  .toNumber()
              )}
            </Heading>
          </Box>
          {/* <Divider orientation={"vertical"} /> */}
          <Box>
            <Text fontSize={"sm"} color={"whiteAlpha.600"}>
              Total Deposits
            </Text>
            <Heading size={"md"}>
              {dollarFormatter.format(
                Big(
                  synths[marketIndex]?.market?.totalAssetsUSD?.toString() || 0
                )
                  .div(ONE_ETH)
                  .toNumber()
              )}
            </Heading>
          </Box>
          {/* <Divider orientation={"vertical"} /> */}
          <Box>
            <Text fontSize={"sm"} color={"whiteAlpha.600"}>
              Total Debt
            </Text>
            <Heading size={"md"}>
              {dollarFormatter.format(
                Big(synths[marketIndex]?.market?.totalDebtUSD?.toString() || 0)
                  .div(ONE_ETH)
                  .toNumber()
              )}
            </Heading>
          </Box>
          {/* <Divider orientation={"vertical"} /> */}
        </Flex>
        <Divider orientation={"vertical"} />
        <Flex
          w={{ base: "100%", md: "25%" }}
          justify={"space-between"}
          align={"center"}
          px={4}
        >
          <Text fontSize={"10px"} maxW={"60%"} color={"whiteAlpha.600"}>
            Borrow APY is the annual percentage yield you pay to borrow assets
            from REAX.
          </Text>
          <Box textAlign={"right"}>
            <Text fontSize={"sm"} color={"whiteAlpha.600"}>
              Borrow APY
            </Text>
            <Heading size={"md"}>
              {tokenFormatter.format(
                Big(synths[marketIndex]?.market?.interestRate?.toString() || 0)
                  .div(100)
                  .toNumber()
              )}
              %
            </Heading>
          </Box>
        </Flex>
      </Flex>

      <Flex flexDir={{ base: "column", md: "row" }} gap={"2"}>
        <Box
          w={{ base: "100%", md: "25%" }}
          className={`${VARIANT}-${colorMode}-containerBody`}
          order={{ base: 1, md: 0 }}
        >
          <PoolPosition updatedAccount={updatedAccount} account={account} />
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
                  <Heading size={"sm"} my={1}>
                    Add Liquidity
                  </Heading>
                </Tab>
                <Tab
                  _selected={{
                    color: "secondary.400",
                    borderColor: "secondary.400",
                  }}
                >
                  <Heading size={"sm"} my={1}>
                    Remove Liquidity
                  </Heading>
                </Tab>
              </TabList>
            </Box>

            <TabPanels>
              <TabPanel p={0}>
                <AddLiquidity
                  updatedAccount={updatedAccount}
                  setUpdatedAccount={setUpdatedAccount}
                  account={account}
                  tabIndex={tabIndex}
                  marketIndex={marketIndex}
                />
              </TabPanel>
              <TabPanel p={0}>
                <RemoveLiquidity
                  updatedAccount={updatedAccount}
                  setUpdatedAccount={setUpdatedAccount}
                  account={account}
                  tabIndex={tabIndex}
                  marketIndex={marketIndex}
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
          <PoolLiquidity marketIndex={marketIndex} />
        </Box>
      </Flex>
    </>
  );
}
