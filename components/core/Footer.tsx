import {
  Box,
  Container,
  Flex,
  Link,
  Stack,
  Switch,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { BsBook } from "react-icons/bs";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import UserAccount from "../utils/useUserAccount";

export default function Footer() {
  // const [block, setBlock] = useState(0);
  // const block = useBlockNumber({
  //   // watch: true,
  // });

  const { colorMode, toggleColorMode } = useColorMode();
  const { chain, block } = UserAccount();

  return (
    <Box
      color={"whiteAlpha.400"}
      bg="transparent"
      pb={2}
      // position={"fixed"}
      bottom={0}
      w={"100%"}
    >
      <Box
        borderTopWidth={1}
        borderStyle={"solid"}
        borderColor={"whiteAlpha.200"}
      >
        <Container
          as={Stack}
          maxW={"100%"}
          pt={2}
          direction={{ base: "column", md: "row" }}
          spacing={4}
          justify={{ md: "space-between" }}
          align={{ md: "center" }}
          color={colorMode == "dark" ? "whiteAlpha.800" : "blackAlpha.800"}
        >
          <Flex
            zIndex={1000}
            flexDir={{ base: "column", md: "row" }}
            align={"center"}
            gap={1}
          >
            <Flex align={"center"} gap={1}>
              <Box
                h={2}
                w={2}
                bgColor={Number(block?.toString()) == 0 ? "red" : "green.400"}
                rounded="100"
              ></Box>
              <Text fontSize={"xs"}>
                {chain?.name} (
                {Number(block?.toString()) == 0
                  ? "Not Connected"
                  : block?.toString()}
                )
              </Text>
            </Flex>
            <Text fontSize={"xs"} color={"whiteAlpha.600"}>
              v0.1.0-testnet
            </Text>
          </Flex>
          <Stack
            direction={"row"}
            align={"center"}
            justify={{ base: "center", md: "start" }}
            spacing={4}
          >
            <Flex gap={2} align={"center"}>
              {colorMode == "dark" ? <MdDarkMode /> : <MdLightMode />}
              <Switch zIndex={1000} size="sm" onChange={toggleColorMode} />
              <Text>|</Text>
            </Flex>
            <Link
              zIndex={1000}
              target={"_blank"}
              href={process.env.NEXT_PUBLIC_TWITTER_LINK}
            >
              <FaTwitter />
            </Link>
            <Link
              zIndex={1000}
              target={"_blank"}
              href={process.env.NEXT_PUBLIC_DOCS_LINK}
            >
              <BsBook />
            </Link>
            <Link
              zIndex={1000}
              target={"_blank"}
              href={process.env.NEXT_PUBLIC_DISCORD_LINK}
            >
              <FaDiscord />
            </Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
