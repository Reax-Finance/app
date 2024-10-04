"use client";

import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Head from "next/head";
import Liquidity from "../../components/liquidity/index";
import { useEffect } from "react";
import { checkUser } from "../../components/auth/checkUser";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  useEffect(() => {
    const authenticate = async () => {
      try {
        await checkUser();
      } catch (error) {
        router.push("/connect");
      }
    };

    authenticate();
  }, [router]);

  return (
    <div>
      <Head>
        <title>Liquidity | {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}</title>
        <link
          rel="icon"
          type="image/x-icon"
          href={`/${process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL}.svg`}
        ></link>
      </Head>
      <Flex>
        <Box w="100%" py={20}>
          <Flex justify={"center"} align="center">
            <Box w="100%">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.45 }}
              >
                <Box
                  animation={"fadeIn 0.5s ease-in-out"}
                  boxShadow={"xl"}
                  p={0}
                  paddingBottom={"1px"}
                  border={"0"}
                >
                  <Liquidity />
                </Box>
              </motion.div>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </div>
  );
};

export default Page;
