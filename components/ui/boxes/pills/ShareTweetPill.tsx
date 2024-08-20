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

  const shareTweetMessage = `GM fam!\nI've got a front row ticket for you to the future of DeFi! 😎 Use these codes to join Reax's Testnet and earn rewards and shoutouts for tinkering with RWAs 🚀\nSee you inside:\n${allCodes[0]}\n${allCodes[1]}\n${allCodes[2]}\n${allCodes[3]}\n${allCodes[4]}`;

  const shareTweetRoute = `https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.reax.pro%2F&text=GM%20fam%21%20%0AI%27ve%20got%20a%20front%20row%20ticket%20for%20you%20to%20the%20future%20of%20DeFi%21%20Use%20these%20codes%20to%20join%20Reax%27s%20Testnet%20and%20earn%20rewards%20and%20shoutouts%20for%20tinkering%20with%20RWAs.%0ASee%20you%20inside%3A%20%0A${allCodes[0]}%20%0A${allCodes[1]}%20%0A${allCodes[2]}%20%0A${allCodes[3]}%20%0A${allCodes[4]}%0A`;

  const router = useRouter();
  return (
    <Flex {...args} mt={{ sm: 4, md: 0, lg: 0 }}>
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
          onClick={() => router.push(shareTweetRoute)}
        >
          Share
        </Button>
      </Box>
    </Flex>
  );
};

export default ShareTweetPill;
