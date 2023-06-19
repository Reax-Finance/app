import { Box, Button } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';


export const CustomConnectButton = () => {
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
          <div
            // {...(!ready && {
            //   'aria-hidden': true,
            //   'style': {
            //     opacity: 0,
            //     pointerEvents: 'none',
            //     userSelect: 'none',
            //   },
            // })}
          >
            {(() => {
              if (!connected) {
                console.log('not connected');
                return (
                    <Box className='swapButton' >
                  <Button size={'md'} onClick={openConnectModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
                    Connect Wallet
                  </Button>
                  </Box>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }
              return (
                <Box >
                  <Button rounded={0} size={'sm'} py={'18px'} onClick={openAccountModal} type='button' bg={'transparent'} _hover={{ opacity: 0.6 }}>
                    {account.displayName}
                  </Button>
                </Box>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};