import { Box, Button, Flex, FlexProps, useColorMode } from "@chakra-ui/react";
import React from "react";
import { FaCopy, FaXTwitter } from "react-icons/fa6";
import { VARIANT } from "../../../../styles/theme";

const ShareTweetPill = ({ ...args }: { args?: FlexProps }) => {
  const { colorMode } = useColorMode();
  return (
    <Flex {...args}>
      <Box
        className={`${VARIANT}-${colorMode}-copyButton`}
        _hover={{ opacity: 0.8 }}
      >
        <Button
          leftIcon={<FaCopy />}
          rounded={0}
          bg={"transparent"}
          _hover={"none"}
        >
          Copy Message
        </Button>
      </Box>
      <Box
        className={`${VARIANT}-${colorMode}-shareTweetButton`}
        _hover={{ opacity: 0.8 }}
      >
        <Button
          leftIcon={<FaXTwitter />}
          rounded={0}
          _hover={"none"}
          bg={"transparent"}
          textColor={"black"}
        >
          Share
        </Button>
      </Box>
    </Flex>
  );
};

export default ShareTweetPill;
