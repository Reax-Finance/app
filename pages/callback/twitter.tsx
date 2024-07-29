import React, { useEffect } from 'react'
import axios from 'axios';
import { useRouter } from 'next/router';
import { Flex, Text, useToast } from '@chakra-ui/react';
import { useUserData } from '../../components/context/UserDataProvider';

export default function TwitterCallback() {

  const { updateUser } = useUserData();
  const router = useRouter();

  const toast = useToast();

  useEffect(() => {
    if(router.query.error){
      toast({
        title: "An error occurred.",
        description: router.query.error,
        status: "error",
        duration: 9000,
        isClosable: true,
      })
      router.push("/");
    }
    console.log("Query", router.query);
    if(!router.query.code) return;
    // Post with the code and state and error to the server
    axios.post("/api/auth/twitter/callback", {
      state: router.query.state,
      code: router.query.code,
      error: router.query.error
    }).then((response) => {
      // Redirect to the dashboard
      if(response.status === 200){
        toast({
          title: "Success",
          description: "You have successfully connected your X account.",
          status: "success",
          duration: 9000,
          isClosable: true,
        
        })
        // Update userData
        updateUser();
        router.push("/");
      }
    }).catch((error: any) => {
      console.log("Error", error);
      toast({
        title: "An error occurred.",
        description: error?.response?.data?.message || "Please try again later.",
        status: "error",
        duration: 9000,
        isClosable: true,
      })
      router.push("/");
    })
  }, [router.query])
;
  return (
    <Flex bgImage={'/images/whitelist-page-bg.svg'} bgSize={'cover'} bgRepeat={'no-repeat'} minH={'100vh'} w={'100%'} justifyContent={'center'} alignItems={'center'}>
      <Flex w={'100%'} justifyContent={'center'} alignItems={'center'}>
        <Text color={'white'} fontSize={'2xl'}>Loading...</Text>
      </Flex>
    </Flex>
  )
}
