import { ConnectButton } from "thirdweb/react";
import { generatePayload, isLoggedIn, login, logout } from "../../app/connect/actions/auth";
import { client } from "../../lib/client";

export const CustomConnectButton = () => {
  return (
    <ConnectButton
      client={client}
      auth={{
        isLoggedIn: async (address) => {
          console.log("checking if logged in!", { address });
          return await isLoggedIn();
        },
        doLogin: async (params) => {
          console.log("logging in!");
          await login(params);
        },
        getLoginPayload: async ({ address }) => generatePayload({ address }),
        doLogout: async () => {
          console.log("logging out!");
          await logout();
        },
      }}
    />
  );
};

// return (
//   <ConnectButton.Custom>
//     {({
//       account,
//       chain,
//       openAccountModal,
//       openChainModal,
//       openConnectModal,
//       authenticationStatus,
//       mounted,
//     }) => {
//       console.log(authenticationStatus, "authenticationStatus");
//       // Note: If your app doesn't use authentication, you
//       // can remove all 'authenticationStatus' checks
//       const ready = mounted && authenticationStatus !== 'loading';
//       const connected =
//         ready &&
//         account &&
//         chain &&
//         (!authenticationStatus ||
//           authenticationStatus === 'authenticated');
//       return (
//         <Box >
//           {(() => {
//             if (!connected) {
//               return (
//                   <Box className={`${VARIANT}-${colorMode}-primaryButton`} >
//                 <Button size={'md'} onClick={openConnectModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }} w={'100%'}>
//                   Connect Wallet
//                 </Button>
//                 </Box>
//               );
//             }
//             if (!isSupportedChain(chain.id)) {
//               return (
//                 <Box className={`${VARIANT}-${colorMode}-errorButton`} >
//                 <Button size={'md'}  onClick={openChainModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
//                 Wrong network
//                 </Button>
//                 </Box>
//               );
//             }
//             return (
//               <Flex >
//                 <Button onClick={openChainModal} rounded={'full'} size={'sm'} py={'18px'} px={'8px'} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
//                   {chain.hasIcon ? <Image src={`${chain.iconUrl}`} w={'25px'} alt='' /> : chain.name}
//                 </Button>
//                 <Button rounded={0} size={'sm'} py={'18px'} onClick={openAccountModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
//                   {user?.user?.username || account.displayName}
//                   <Box>
//                     <RiArrowDropDownLine />
//                   </Box>
//                 </Button>
//               </Flex>
//             );
//           })()}
//         </Box>
//       );
//     }}
//   </ConnectButton.Custom>
// );
