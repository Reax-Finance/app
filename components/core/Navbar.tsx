import {
  Flex,
  Box,
  Image,
  useDisclosure,
  Collapse,
  IconButton,
  Text,
  useColorMode,
  Button,
  Link,
  Divider,
  Heading,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import "../../styles/Home.module.css";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import NavLocalLink from "./NavLocalLink";
import { CustomConnectButton } from "./ConnectButton";
import { MdFeedback, MdOpenInNew } from "react-icons/md";
import { RiFeedbackLine } from "react-icons/ri";
import { useUserData } from "../context/UserDataProvider";
import { useRouter, usePathname } from "next/navigation";
import UserAccount from "../utils/useUserAccount";

function NavBar() {
  const { isOpen: isToggleOpen, onToggle } = useDisclosure();
  const { isConnected } = UserAccount();

  const { user } = useUserData();

  const { colorMode } = useColorMode();

  const router = useRouter();
  const pathname = usePathname();

  if (pathname == "/connect" || pathname.includes("/callback")) {
    return null;
  }
  if (!isConnected) {
    return null;
  }

  return (
    <>
      <Flex
        mt={{ base: 0, md: 6 }}
        align="center"
        justify={"space-between"}
        w={"100%"}
      >
        <Box minW="0" w={"100%"} maxW="100%" mx={{ base: 0, md: 6 }}>
          <Flex align={"center"} justify="space-between">
            <Flex justify="space-between" align={"center"} w="100%">
              <Flex gap={10} align="center">
                <Image
                  src={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}-logo-${colorMode}.svg`}
                  alt="reax logo"
                  height="30px"
                />
                <Flex align="center" display={{ sm: "none", md: "flex" }}>
                  <NavLocalLink path={"/"} title="Swap"></NavLocalLink>

                  <NavLocalLink
                    path={"/liquidity"}
                    title={"Liquidity"}
                  ></NavLocalLink>
                </Flex>
              </Flex>

              <Flex display={{ sm: "flex", md: "none" }} my={4} gap={2}>
                <IconButton
                  onClick={onToggle}
                  icon={
                    isToggleOpen ? (
                      <CloseIcon w={3} h={3} />
                    ) : (
                      <HamburgerIcon w={5} h={5} />
                    )
                  }
                  variant={"ghost"}
                  aria-label={"Toggle Navigation"}
                  rounded={0}
                />
              </Flex>
            </Flex>

            <Flex
              display={{ sm: "none", md: "flex" }}
              justify="flex-end"
              align={"center"}
              gap={2}
              w="100%"
            >
              <Flex mr={2}>
                <Box>
                  <Button
                    color={"white"}
                    bg={"transparent"}
                    _hover={{ bg: "transparent" }}
                    rounded={0}
                    size={"sm"}
                  >
                    <Link
                      href={"https://forms.gle/qD8bE1gGMqAxujpz7"}
                      target={"_blank"}
                    >
                      <Flex gap={2} align={"center"} color="whiteAlpha.600">
                        <RiFeedbackLine size={"20"} />
                        <Heading size={"sm"}>Feedback</Heading>
                      </Flex>
                    </Link>
                  </Button>
                </Box>
              </Flex>
              <Box>
                {isConnected &&
                  process.env.NEXT_PUBLIC_NETWORK == "testnet" && (
                    <>
                      <NavLocalLink
                        path={"/faucet"}
                        title="Faucet"
                      ></NavLocalLink>
                    </>
                  )}
              </Box>

              <NavLocalLink
                path={"/account"}
                title={user?.user?.balance + " XP"}
              ></NavLocalLink>
              <Box>
                <CustomConnectButton />
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Flex>
      <Box zIndex={10}>
        <Collapse in={isToggleOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </Box>
    </>
  );
}

const MobileNav = ({}: any) => {
  const { colorMode } = useColorMode();
  const { user } = useUserData();
  return (
    <Flex
      w={"100%"}
      border={"1px"}
      borderColor={"whiteAlpha.400"}
      h={"100%"}
      align={"center"}
      wrap={"wrap"}
      gap={0}
      zIndex={10}
    >
      <NavLocalLink path={"/"} title={"Swap"}></NavLocalLink>
      <Divider orientation={"vertical"} />
      <NavLocalLink path={"/liquidity"} title={"Liquidity"}></NavLocalLink>
      <Divider orientation={"vertical"} />
      <CustomConnectButton />
      <Divider orientation={"vertical"} />
      <NavLocalLink
        path={"/account"}
        title={user?.user?.balance + " XP"}
      ></NavLocalLink>
      <Divider orientation={"vertical"} />

      <Flex>
        <Box>
          <Button color={"white"} bg={"transparent"} rounded={0} size={"sm"}>
            <Link
              href={"https://forms.gle/qD8bE1gGMqAxujpz7"}
              target={"_blank"}
            >
              <Flex gap={2}>
                <MdFeedback />
              </Flex>
            </Link>
          </Button>
        </Box>
      </Flex>
      <Divider orientation={"vertical"} />
    </Flex>
  );
};

export default NavBar;
