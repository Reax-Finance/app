import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserData } from "../components/context/UserDataProvider";
import { ChevronRightIcon } from "@chakra-ui/icons";
import axios from "axios";

export default function Account() {
  const { address } = useAccount();
  const { user } = useUserData();
  const [username, setUsername] = React.useState("");
  const [usernameAdded, setUsernameAdded] = React.useState(false);
  const toast = useToast();

  const [isValidInput, setIsValidInput] = React.useState(false);
  const balance = user?.user?.balance;

  useEffect(() => {
    const data = async () => {
      await fetch(`/api/user/validate-username?username=${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Username is valid") {
            setIsValidInput(true);
          } else {
            setIsValidInput(false);
          }
        });
    };
  }, []);

  const submitUsername = async () => {
    await axios
      .post("/api/user/add-username", { username, address, balance })
      .then((res) => {
        toast({
          title: "Username added",
          description: "You have earned 100 XP",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setUsernameAdded(true);
      })
      .catch((err) => {
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

  return (
    <Box>
      <Flex gap={10}>
        <Box>
          <Heading>Account</Heading>
          <Text>{address}</Text>
        </Box>
        <Box>
          <Heading>{user?.user?.balance}</Heading>
          <Text>XP</Text>
        </Box>
      </Flex>

      <Divider my={4} />
      <Text>
        Joined on:{" "}
        {new Date(user?.user?.createdAt?.toString() as any).toDateString()}
      </Text>
      <Divider my={4} />
      <Box>
        {user?.user?.username ? (
          <Text>Username: {user?.username}</Text>
        ) : (
          <Box>
            <Flex justify={"space-between"}>
              <Heading size={"md"}>Select an username</Heading>
              <Box>
                <Text>Earn</Text>
                <Text>100 XP</Text>
              </Box>
            </Flex>
            <Flex>
              <Input
                mt={2}
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />
              <IconButton
                aria-label="Join"
                icon={<ChevronRightIcon />}
                rounded={0}
                isDisabled={!isValidInput}
                bg={"secondary.400"}
                _hover={{ opacity: 0.6 }}
                onClick={submitUsername}
              />
            </Flex>
            <Text mt={4}>{!isValidInput && "Username is invalid"}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
