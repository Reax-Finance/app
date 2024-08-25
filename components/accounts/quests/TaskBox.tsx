import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { BsCheck } from "react-icons/bs";
import "swiper/swiper.min.css";
import Dark400Box2C from "../../ui/boxes/Dark400Box2C";
import Dark600Box2C from "../../ui/boxes/Dark600Box2C";
import axios from "axios";
import { useUserData } from "../../context/UserDataProvider";
import { Task, UserTask } from "@prisma/client";
import { VARIANT } from "../../../styles/theme";

const successMessages = [
  "Bravo! 🎉",
  "You're on fire! 🔥",
  "That was easy! 🚀",
  "You're a pro! 🏆",
  "Let's go! 🚀",
  "Reax on! 🤘",
  "You're a legend! 🦄",
  "Wagmi! 🔥",
  "No stopping you! 🚀",
]

export default function TaskBox({...task}: Task) {
  const toast = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const { colorMode } = useColorMode();
  const { updateUser, user } = useUserData();

  const userTask = user?.user?.userTasks?.find((t: UserTask) => t.taskId === task.id); 

  const cta = async () => {
    window.open(
      task.redirectUrl,
      "_blank"
    );

    if(task.taskIdentifier === "FOLLOW"){
      setIsLoading(true);
      axios
        .post("/api/tasks/twitter", {taskId: task.id})
        .then((res) => {
          updateUser();
          toast({
            title: "Bravo! 🎉",
            description: "Task completed successfully 🛰️",
            status: "success",
            duration: 9000,
            isClosable: true,
            position: "bottom",
          });
          setIsLoading(false);
        })
        .catch((err) => {
          toast({
            title: "Err, something went wrong 🚨🤒",
            description: JSON.stringify(err.response.data).slice(0, 100),
            status: "error",
            duration: 9000,
            isClosable: true,
            position: "bottom",
          });
          setIsLoading(false);
        });
      } else {
        
      }
  };

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
              <Heading size={"md"}>{task.name}</Heading>
              <Text color={"whiteAlpha.600"} mt={1}>
                {task.description}
              </Text>
            </Box>
            {userTask?.completed ? (
              <Flex color={"green.400"} align={"center"}>
                <BsCheck size={"24px"} />
              </Flex>
            ) : (
              <Flex gap={2} align={"center"}>
                <Heading fontSize={"lg"} color={"secondary.400"}>
                  +{task.points}
                </Heading>
                <Text color={"secondary.400"} mt={0.5}>
                  XP
                </Text>
              </Flex>
            )}
          </Dark400Box2C>
          {userTask?.completed ? (
            <Box
              mt={0}
              p={4}
              pt={2}
              gap={2}
              alignItems={"start"}
              justifyContent={"start"}
            >
              <Text fontSize={'sm'} fontFamily={'MonumentExtended'} casing={'uppercase'} fontWeight={'semibold'} color={'green.400'}>Completed</Text>
              {/* <Text fontSize={'md'} fontFamily={'MonumentExtended'} fontWeight={'semibold'} casing={'uppercase'} color={"primary.400"} size={"md"}>
                {successMessages[task.id % successMessages.length]}
              </Text> */}
            </Box>
          ) : (
            <Flex align={"center"} mt={4} p={4} pt={2}>
              <Box className={`${VARIANT}-${colorMode}-input`} w={"100%"}>
                <Box
                  className={`${VARIANT}-${colorMode}-twitterFollowEnabled`}
                  _hover={{ opacity: 0.8 }}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Button
                    rounded={0}
                    _hover={{ opacity: 0.8 }}
                    bg={"transparent"}
                    textColor={"black"}
                    onClick={cta}
                    isLoading={isLoading}
                  >
                    {task.cta}
                  </Button>
                </Box>
              </Box>
            </Flex>
          )}
        </>
      </Dark600Box2C>
    </>
  );
}
