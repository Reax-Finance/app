import {
  Box,
  Divider,
  Flex,
  Heading,
  Text,
  useColorMode,
  useToast,
  Tooltip
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserData } from "../components/context/UserDataProvider";
import Swiper, { Autoplay, Navigation } from "swiper";
import "swiper/swiper.min.css";
import UsernameSelection from "../components/accounts/UsernameSelection";
import Dark600Box2C from "../components/ui/boxes/Dark600Box2C";
import { tokenFormatter } from "../src/const";
import AccessCodes from "../components/accounts/AccessCodes";
import { BsClock } from "react-icons/bs";
import { VARIANT } from "../styles/theme";
import OnlyAuthenticated from "../components/auth/OnlyAuthenticated";
import { motion } from "framer-motion";
import DiscordConnectQuest from "../components/accounts/quests/DiscordConnectQuest";
import EthIdenticonGenerator from "../components/connect/EthIdenticonGenerator";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Task } from "@prisma/client";
import axios from 'axios';
import TaskBox from "../components/accounts/quests/TaskBox";
import Head from "next/head";
import { useRouter } from "next/router";

Swiper.use([Autoplay, Navigation]);

export const getServerSideProps = (async () => {
  // Fetch data from external API
  let tasks: Task[] = [];
  try{
    const res = await axios.get(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/tasks/get`);
    tasks = res.data.tasks;
  } catch(e) {
    console.log("Error", e);
  }
  // Pass data to the page via props
  return { props: { tasks } }
}) satisfies GetServerSideProps<{ tasks: Task[] }>

export default function Account({
  tasks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { address } = useAccount();
  const { user } = useUserData();
  const { colorMode } = useColorMode();
  const router = useRouter();

  if(!address) return null;

  if (router.isFallback) {
    return <>Loading...</>;
  }

  return (
    <OnlyAuthenticated>
      <Head>
        <title>
          {user?.user?.username
            ? `${user?.user?.username}`
            : `${address?.slice(0, 6)}...${address?.slice(-4)}`} | Reax
        </title>
        <link
          rel="icon"
          type="image/x-icon"
          href={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`}
        ></link>
      </Head>
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.25 }}
    >
      <Box maxW={{ base: "95vw", md: "1350px", lg: "1350px" }} my={20}>
        <OnlyAuthenticated />
        <Flex gap={10} justify={"space-between"}>
          <Flex gap={5} align={'center'}>
            <EthIdenticonGenerator ethAddress={address} size={80} cellSize={8} />
          <Box>
            <Heading fontFamily={'MonumentExtended'} fontSize={'3xl'}>
              {user?.user?.username
                ? <>
                  <Box fontSize={'xl'} color={'secondary.400'}>rx</Box>
                  {user?.user?.username}
                </>
                : address?.slice(0, 6) + "..." + address?.slice(-4)}
            </Heading>
            <Text mt={2} color={"whiteAlpha.600"}>
              Joined on:{" "}
              {new Date(
                user?.user?.createdAt?.toString() as any
              ).toDateString()}
            </Text>
          </Box>
          </Flex>
          <Box textAlign={"center"}>
            <Box
              className={`${VARIANT}-${colorMode}-SecondryRightCut`}
              px={6}
              py={2}
            >
              <Heading fontFamily={'MonumentExtended'} size={'lg'}>
                {tokenFormatter.format(Number(user?.user?.balance))}
              </Heading>
            </Box>
            <Box
              className={`${VARIANT}-${colorMode}-PrimaryLeftCut`}
              px={6}
              py={1}
            >
              <Text>XP</Text>
            </Box>
          </Box>
        </Flex>

        {/* <Divider my={4} /> */}
        

        <Divider my={6} />
        <Flex gap={6} mb={10} align={'end'}>
          <Heading size={"md"} >
            Quests
          </Heading>
          <Tooltip label="Coming Soon" aria-label="Coming Soon">
          <Heading size={"sm"} color={'whiteAlpha.600'} cursor={'pointer'}>
            Competitions
          </Heading>
          </Tooltip>
          <Tooltip label="Coming Soon" aria-label="Coming Soon">
          <Heading size={"sm"} color={'whiteAlpha.600'} cursor={'pointer'}>
            Activity
          </Heading>
          </Tooltip>
          <Tooltip label="Coming Soon" aria-label="Coming Soon">
          <Heading size={"sm"} color={'whiteAlpha.600'} cursor={'pointer'}>
            Rewards
          </Heading>
          </Tooltip>
          <Tooltip label="Coming Soon" aria-label="Coming Soon">
          <Heading size={"sm"} color={'whiteAlpha.600'} cursor={'pointer'}>
            Settings
          </Heading>
          </Tooltip>
        </Flex>

        <Flex
          gap={4}
          flexDirection={{ sm: "column", md: "row", lg: "row" }}
          maxW={{ sm: "100vw" }}
        >
          <Flex w={"100%"}>
            <UsernameSelection />
          </Flex>
          
          <Flex w={"100%"}>
            <DiscordConnectQuest />
          </Flex>
          {tasks.map((task: any, index) => (<Flex w={"100%"} key={index}>
            <TaskBox {...task} />
          </Flex>))}
          <Dark600Box2C
            align={"center"}
            justify={"center"}
            p={6}
            w={"100%"}
            textAlign={"center"}
          >
            <BsClock size={"30px"} />
            <Heading mt={4} mb={4} size={"md"}>
              1 Quest / Week
            </Heading>
            <Text>
              More quests coming soon! Stay tuned on our{" "}
              <a href="https://twitter.com/reaxfinance" target="_blank">
                Twitter
              </a>{" "}
            </Text>
          </Dark600Box2C>
        </Flex>
        <Box mt={8}>
          <AccessCodes />
        </Box>
      </Box>
    </motion.div>
    </OnlyAuthenticated>
  );
}
