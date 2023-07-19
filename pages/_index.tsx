import { Box, Button, Flex, Progress, Text, useBreakpointValue, useMediaQuery, useToast } from '@chakra-ui/react';
import React, { useContext } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/NavBar/Navbar';
import { useEffect } from 'react';
import { AppDataContext } from '../components/context/AppDataProvider';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { Status } from '../components/utils/status';

export default function Index({ children }: any) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const handleStart = (url: any) => {
			setLoading(true);
			setRefresh(Math.random());
		}
        const handleComplete = (url: any) => {
			setLoading(false);
			setRefresh(Math.random());
		}

        router.events.on('routeChangeStart', handleStart)
        router.events.on('routeChangeComplete', handleComplete)
        router.events.on('routeChangeError', handleComplete)

        return () => {
            router.events.off('routeChangeStart', handleStart)
            router.events.off('routeChangeComplete', handleComplete)
            router.events.off('routeChangeError', handleComplete)
        }
    }, [loading, refresh])

	const [hydrated, setHydrated] = useState(false);
	const { status, message } = useContext(AppDataContext);

	useEffect(() => {
		setHydrated(true);
	}, []);

	const { chains, error, isLoading, pendingChainId, switchNetworkAsync } = useSwitchNetwork();
	const toast = useToast();

	const switchNetwork = async (chainId: number) => {
		switchNetworkAsync!(chainId)
		.catch(err => {
			console.log("error", err);
			toast({
				title: 'Unable to switch network.',
				description: 'Please try switching networks from your wallet.',
				position: 'top-right',
				status: 'error',
				duration: 9000,
				isClosable: true,
			  })
		})
	}

	if(!hydrated) return <></>;

	// const [isLargerThan800] = useMediaQuery('(min-width: 800px)')
	// if(!isLargerThan800) return <>Not supported on Mobile Yet</>

	return (
		<Box>
			<Flex align={'center'} justify={'center'} bgColor="bg.600" color={'whiteAlpha.700'}>
				<Text
					textAlign={'center'} 
					fontSize={'sm'}
					fontWeight="medium"
					p={2}>
					{process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? "This is a testnet. Please do not send real assets to these addresses" : "We're still in beta. Even though we are audited, only deposit what you can afford to lose."}
				</Text>
			</Flex>
			<Flex display={{sm: 'block', md: 'none'}} align={'center'} justify={'center'} bgColor="bg.400" color={'whiteAlpha.700'}>
				<Text
					textAlign={'center'} 
					fontSize={'sm'}
					fontWeight="medium"
					p={1.5}>
					{"Not supported on Mobile Yet"}
				</Text>
			</Flex>
			{(status == Status.FETCHING || loading) && <Progress bg={'blackAlpha.200'} colorScheme='primary' size='xs' isIndeterminate />}

			<Box bgColor="gray.800" color={'gray.400'}>
			{status == Status.ERROR && (
				<Text
					textAlign={'center'}
					width="100%"
					fontSize={'sm'}
					fontWeight="bold"
					p={2}>
					{message}
				</Text>
			)}
			</Box>
			{/* <Box bgGradient={'linear(to-b, #090B0F, #090B0F)'} zIndex={0}> */}
			<Box bgGradient={'linear(to-b, blackAlpha.500, blackAlpha.800)'} zIndex={0}>

				<Flex
					justify={'center'}
					flexDirection={{ sm: 'column', md: 'row' }}
					minH="96vh"
					maxW={'100%'}
					>
					<Box zIndex={2} minW={{sm: '0', md: '0', lg: '1200px'}} w={'100%'} px={{sm: '4', md: '0'}}>
						<Flex justify='center'>
							<Box minW={'0'} w='100%' maxW={'1200px'}>
						<Navbar />
						<motion.div 
							initial={{opacity: 0, y: 15}}
							animate={{opacity: 1, y: 0}}
							exit={{opacity: 0, y: 15}}
							transition={{duration: 0.25}}
						>
							<Box zIndex={1}>
							{children}
							</Box>
						</motion.div>
						</Box>

						</Flex>

					</Box>
				</Flex>
						<Footer />
				<Box>
				</Box>

			</Box>
		</Box>
	);
}
