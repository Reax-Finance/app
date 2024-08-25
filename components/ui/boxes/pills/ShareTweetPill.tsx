import {
  Box,
  Button,
  Flex,
  FlexProps,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import React, { use } from "react";
import { FaCopy, FaXTwitter } from "react-icons/fa6";
import { VARIANT } from "../../../../styles/theme";
import { useUserData } from "../../../context/UserDataProvider";
import { useRouter } from "next/router";

const ShareTweetPill = ({ ...args }: { args?: FlexProps }) => {
  const { colorMode } = useColorMode();
  const { user } = useUserData();
  const toast = useToast();

  const copyTweetMessage = () => {
    navigator.clipboard.writeText(shareTweetMessage);
    toast({
      title: "Copied to clipboard!",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "bottom",
    });
  };

  const codes = user?.user?.accessCodes.map((code) => code.id.toUpperCase());

  const allCodes: string[] = [];

  codes?.map((code) => {
    allCodes.push(code);
  });

  const shareTweetMessage = `GM fam!\n\nI've got a front row ticket for you to the future of DeFi! 😎\n\nUse these codes to join Reax's Testnet and earn rewards for owning RWAs 🚀\n\nSee you inside 🔗 https://testnet.reax.fi 🪐 \n\n1️⃣${allCodes[0]}\n2️⃣${allCodes[1]}\n3️⃣${allCodes[2]}\n4️⃣${allCodes[3]}\n5️⃣${allCodes[4]}`;

  const shareTweetRoute = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTweetMessage)}`;

  const router = useRouter();
  return (
    <Flex {...args} mt={{ sm: 4, md: 0, lg: 0 }} h={'100%'}>
      <Box
        className={`${VARIANT}-${colorMode}-copyButton`}
        _hover={{ opacity: 0.8 }}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Button
          leftIcon={<FaCopy />}
          rounded={0}
          bg={"transparent"}
          _hover={"none"}
          onClick={copyTweetMessage}
        >
          Copy Message
        </Button>
      </Box>
      <Box
        className={`${VARIANT}-${colorMode}-shareTweetButton`}
        _hover={{ opacity: 0.8 }}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Button
          leftIcon={<FaXTwitter />}
          rounded={0}
          _hover={"none"}
          bg={"transparent"}
          textColor={"black"}
          onClick={() => window.open(shareTweetRoute, "_blank")}
        >
          Share
        </Button>
      </Box>
    </Flex>
  );
};

export default ShareTweetPill;
