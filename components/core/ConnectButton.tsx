import { Box, Button, Flex, useColorMode, Image, Text, IconButton } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RiArrowDropDownLine, RiDropdownList } from 'react-icons/ri';
import { VARIANT } from '../../styles/theme';
import { isSupportedChain } from '../../src/const';
import { useRouter } from 'next/router';
import { useUserData } from '../context/UserDataProvider';
import EthIdenticonGenerator from '../connect/EthIdenticonGenerator';
import { BsWalletFill } from 'react-icons/bs';
import { IoIosArrowDropdown } from "react-icons/io";
import Link from 'next/link';

export const CustomConnectButton = () => {
	const { colorMode } = useColorMode();
  const router = useRouter();
  const {user} = useUserData();


  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
        
      }) => {
        console.log(authenticationStatus, "authenticationStatus");
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');
        return (
          <Box >
            {(() => {
              if (!connected) {
                return (
                    <Box className={`${VARIANT}-${colorMode}-primaryButton`} >
                  <Button size={'md'} onClick={openConnectModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }} w={'100%'}>
                    Connect Wallet
                  </Button>
                  </Box>
                );
              }
              if (!isSupportedChain(chain.id)) {
                return (
                  <Box className={`${VARIANT}-${colorMode}-errorButton`} >
                  <Button size={'md'}  onClick={openChainModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
                  Wrong network
                  </Button>
                  </Box>
                );
              }
              return (
                <Flex gap={2} align={'center'}>
                  <Button onClick={openChainModal} rounded={'full'} size={'sm'} py={'18px'} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
                    {chain.hasIcon ? <Image src={`${chain.iconUrl}`} w={'25px'} alt='' /> : chain.name}
                  </Button>
                  <Link href={'/account'} passHref>
                  <Flex rounded={0} py={'auto'} bg={'transparent'} _hover={{ opacity: 0.6 }}>
                    <EthIdenticonGenerator ethAddress={account.address} size={30} cellSize={3} />
                    <Box ml={3} textAlign={'left'}>

                    <Text fontSize={'xs'} fontWeight={'light'}>
                    My Account
                    </Text>
                    <Text mt={-1} fontSize={'sm'} fontWeight={'bold'}>
                    {user?.user?.username ? "rx."+user?.user?.username : account.displayName}
                    </Text>
                    </Box>
                  </Flex>
                  </Link>
                  <IconButton onClick={openAccountModal} icon={<IoIosArrowDropdown size={'20px'} />} aria-label={''} variant={'ghost'} />                  
                </Flex>
              );
            })()}
          </Box>
        );
      }}
    </ConnectButton.Custom>
  );
};