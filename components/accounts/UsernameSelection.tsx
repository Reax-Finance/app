import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useUserData } from "../context/UserDataProvider";
import { ChevronRightIcon } from "@chakra-ui/icons";
import "swiper/swiper.min.css";
import Dark600Box2C from "../ui/boxes/Dark600Box2C";
import Dark400Box2C from "../ui/boxes/Dark400Box2C";
import axios from "axios";
import { useAccount } from "wagmi";
import { USERNAME_XP_REWARD } from "../../src/const";
import { BsCheck } from "react-icons/bs";
import { VARIANT } from "../../styles/theme";

export default function UsernameSelection() {
  const { user, updateUser } = useUserData();
  const [error, setError] = React.useState<string | null>(null);
  const isValidInput = error === null;
  const [username, setUsername] = React.useState("");
  const toast = useToast();
  const { address } = useAccount();
  const [loading, setLoading] = React.useState(false);

  const submitUsername = async () => {
    setLoading(true);
    await axios
      .post("/api/user/add-username", { username })
      .then((res) => {
        setLoading(false);
        updateUser();
        toast({
          title: "Username added",
          description: "You have earned 100 RXP",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      })
      .catch((err) => {
        setLoading(false);
        toast({
          title: "Error",
          description: "An error occurred",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.error(err);
      });
  };

  const _setUsername = (e: any) => {
    // validate username
    // >3 chars
    if (e.length >= 3) {
      setUsername(e);
      setError(null);
    } else {
      setError("Username must be at least 3 characters long");
    }
  };

  const { colorMode } = useColorMode();
  return (
    <>
      <Dark600Box2C flexDir={"column"} justify={"space-between"} flex={1}>
        <>
          <Dark400Box2C
            justify={"space-between"}
            p={4}
            flexDir={"row"}
            gap={10}
          >
            <Box>
              <Heading size={"md"}>Select Username</Heading>
              <Text color={"whiteAlpha.600"} mt={1}>
                Pick a unique id for your profile
              </Text>
            </Box>
            {user?.user?.username ? (
              <Flex color={"green.400"} align={"center"}>
                <BsCheck size={"24px"} />
              </Flex>
            ) : (
              <Flex gap={2} align={"center"}>
                <Heading fontSize={"lg"} color={"secondary.400"}>
                  +100
                </Heading>
                <Text color={"secondary.400"} mt={0.5}>
                  RXP
                </Text>
              </Flex>
            )}
          </Dark400Box2C>
          {user?.user?.username ? (
            <Flex mt={4} p={4} pt={2} gap={2} align={"flex-end"} justify={'start'}>
              <Text fontSize={'sm'} fontFamily={'MonumentExtended'} casing={'uppercase'} fontWeight={'semibold'} color={'green.400'}>Completed</Text>
            </Flex>
          ) : (
            <Flex align={"center"} mt={4} p={4} pt={2}>
              <Box className={`${VARIANT}-${colorMode}-input`} w={"100%"}>
                <Input
                  placeholder="Username"
                  onChange={(e) => _setUsername(e.target.value)}
                  rounded={0}
                  size={"lg"}
                  borderRadius={0}
                  bg={"transparent"}
                  errorBorderColor={"transparent"}
                  focusBorderColor={"transparent"}
                  border={"transparent"}
                ></Input>
              </Box>
              <Box
                className={
                  !isValidInput
                    ? `${VARIANT}-${colorMode}-rightCutInactive`
                    : `${VARIANT}-${colorMode}-rightCutActive`
                }
              >
                <IconButton
                  aria-label="Join"
                  icon={<ChevronRightIcon />}
                  rounded={0}
                  isDisabled={!isValidInput}
                  bg={"transparent"}
                  _hover={{ bg: "transparent" }}
                  size={"lg"}
                  isLoading={loading}
                  onClick={submitUsername}
                />
              </Box>
              {/* <Input
                placeholder="Username"
                onChange={(e) => _setUsername(e.target.value)}
                rounded={0}
                size={"lg"}
              />
              <IconButton
                aria-label="Join"
                icon={<ChevronRightIcon />}
                rounded={0}
                isDisabled={!isValidInput}
                bg={"secondary.400"}
                _hover={{ opacity: 0.6 }}
                onClick={submitUsername}
                size={"lg"}
                isLoading={loading}
              /> */}
            </Flex>
          )}
          {!isValidInput && <Text pb={4} ml={4} fontSize={"sm"} color={"whiteAlpha.600"}>
            {error}
          </Text>}
        </>
      </Dark600Box2C>
    </>
  );
}
