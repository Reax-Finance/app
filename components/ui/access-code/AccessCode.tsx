import { CheckIcon, CloseIcon, CopyIcon } from "@chakra-ui/icons";
import { Box, Flex, Text, useColorMode, useToast } from "@chakra-ui/react";
import React from "react";
import { VARIANT } from "../../../styles/theme";
import { AccessCode } from "@prisma/client";
import Dark400Box2C from "../boxes/Dark400Box2C";

const AccessCodeComponent = ({ code }: { code: AccessCode }) => {
  const { colorMode } = useColorMode();
  const [copied, setCopied] = React.useState(false);
  const [isUsedAccessCode, setIsUsedAccessCode] = React.useState(false); //if its used by some user it gets disabled
  const toast = useToast();
  const copyCode = () => {
    if (!isUsedAccessCode) {
      navigator.clipboard.writeText(code.id);
      toast({
        title: "Copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => {
        setCopied(true);
      }, 10000);
      setCopied(false);
    } else {
      toast({
        title: "Access code has already been used",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Dark400Box2C>
      {!isUsedAccessCode ? (
        <Box
          px={6}
          py={2}
          rounded={0}
          onClick={copyCode}
          className={`${VARIANT}-${colorMode}-containerBody1`}
          as="button"
        >
          <Flex justifyContent={"center"} alignItems={"center"} gap={4}>
            <Text>{code?.id?.toUpperCase()}</Text>
            {copied ? <CopyIcon /> : <CheckIcon />}
          </Flex>
        </Box>
      ) : (
        <Box
          px={6}
          py={2}
          rounded={0}
          onClick={copyCode}
          className={`${VARIANT}-${colorMode}-containerBody2`}
          as="button"
          opacity={0.5}
        >
          <Flex justifyContent={"center"} alignItems={"center"} gap={4}>
            <Text>{code?.id?.toUpperCase()}</Text>
            <CloseIcon />
          </Flex>
        </Box>
      )}
    </Dark400Box2C>
  );
};

export default AccessCodeComponent;
