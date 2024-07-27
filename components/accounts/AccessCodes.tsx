import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    IconButton,
    Input,
    Text,
    useToast,
  } from "@chakra-ui/react";
  import React, { useEffect } from "react";
  import AccessCode from "../ui/access-code/AccessCode";
  import "swiper/swiper.min.css";
  import Dark600Box2C from "../ui/boxes/Dark600Box2C";
  import { tokenFormatter } from "../../src/const";
import { useUserData } from "../context/UserDataProvider";
import { FaXTwitter } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa";

export default function AccessCodes() {

    const { user } = useUserData();
  return (
    <div>
        <Dark600Box2C p={4} mt={4}>
        <Flex align={'start'} justify={'space-between'}>
          <Box maxW={'80%'}>

        <Heading size={'md'}>Access Codes</Heading>
        <Text color={'whiteAlpha.600'} mt={2} fontSize={'sm'}>
          Use these access codes to invite your frens to try out the app.
          You earn 50 XP for each user that signs up using your access code and they earn 50 XP too.
        </Text>
          </Box>
          <Flex>
            <Box bg={'primary.800'} p={2} minW={'80px'}>
              <Text fontSize={'xs'}>They Earn</Text>
              <Heading size={'sm'} fontWeight={'bold'}>50 XP</Heading>
            </Box>
            <Box bg={'secondary.800'} p={2} minW={'80px'}>
              <Text fontSize={'xs'}>You Earn</Text>
              <Heading size={'sm'} fontWeight={'bold'}>50 XP</Heading>
            </Box>
          </Flex>
        </Flex>
        <Flex justify={'space-between'}>

        <Flex gap={4} mt={6} align={'center'}>
          {user?.user?.accessCodes?.map((code, i) => (<Box key={i}>
            {code && <AccessCode code={code} />}
            </Box>
          ))}
          </Flex>

          <Flex align={'end'}>
            <Button leftIcon={<FaCopy />} rounded={0}>
                Copy Message
            </Button>
            <Button leftIcon={<FaXTwitter />} colorScheme={'twitter'} rounded={0}>
                Share
            </Button>
          </Flex>

        </Flex>

      </Dark600Box2C>
    </div>
  )
}
