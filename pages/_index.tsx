import { Box, Button, Flex, Heading, Image, Progress, Text, useBreakpointValue, useColorMode, useMediaQuery, useToast } from '@chakra-ui/react';
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
import { defaultChain } from '../src/const';
import { usePriceData } from '../components/context/PriceContext';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from '@chakra-ui/react'
import Link from 'next/link';
import { MdOpenInNew } from 'react-icons/md';


export default function Index({ children }: any) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [refresh, setRefresh] = useState(0);

	// Show a first time message
	const [showMessage, setShowMessage] = useState(false);
	const [step, setStep] = useState(0);

	useEffect(() => {
		const lastMessageShown = localStorage.getItem('betaShutdownMessageShown');
		console.log("Last Message Shown", lastMessageShown);
		if(!lastMessageShown || (Date.now() - parseInt(lastMessageShown)) > 1000 * 60 * 60 * 24 * 7) {
			
			setShowMessage(true);
		}
	}, [])

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
	const { status: priceStatus } = usePriceData();

	const { chain } = useNetwork();

	useEffect(() => {
		setHydrated(true);
	}, []);

	const { chains, error, isLoading, pendingChainId, switchNetworkAsync } = useSwitchNetwork();
	const toast = useToast();

	const switchNetwork = async (chainId: number) => {
		switchNetworkAsync!(chainId)
		.catch(err => {
			console.log("Error", err);
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

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { colorMode } = useColorMode();
	
	return (
		<Box>
			{/* <Flex align={'center'} justify={'center'} bgColor={colorMode == 'dark' ? "bg.600" : 'lightBg.600'} color={colorMode == 'dark' ? 'whiteAlpha.700' : 'blackAlpha.700'}>
				<Text
					textAlign={'center'} 
					fontSize={'sm'}
					fontWeight="medium"
					p={2}
					px={4}>
					{process.env.NEXT_PUBLIC_NETWORK == 'testnet' ? "This is a testnet. Please do not send real assets to these addresses" : "We're still in beta. Even though we are audited, only deposit what you can afford to lose."}
				</Text>
			</Flex> */}
			<Flex display={{sm: 'block', md: 'none'}} align={'center'} justify={'center'} bgColor={colorMode == "dark" ? "darkBg.400" : "lightBg.400"} color={'whiteAlpha.700'}>
				<Text
					textAlign={'center'} 
					fontSize={'sm'}
					fontWeight="medium"
					p={1.5}>
					Not optimised for mobile view yet
				</Text>
			</Flex>

			<Flex align={'center'} justify={'center'} bgColor={colorMode == "dark" ? "orange.400" : "lightBg.400"} color={'white'}>
				<Text
					textAlign={'center'} 
					fontSize={'sm'}
					fontWeight="medium"
					p={1.5}>
					NOTICE: Beta is shutting down on 31st May 2024. Please withdraw your funds before then.
				</Text>
			</Flex>
			{chain?.id !== defaultChain.id && switchNetworkAsync && <Flex align={'center'} justify={'center'} bgColor="primary.600" color={'white'}>
				<Text
					textAlign={'center'} 
					fontSize={'sm'}
					fontWeight="medium"
					p={1.5}>
					Please switch to {defaultChain.name} Network to use this app
				</Text>
				<Button ml={2} size='xs' bg={'white'} _hover={{bg: 'whiteAlpha.800'}} color={'black'} rounded={'full'} my={1} onClick={() => switchNetwork(defaultChain.id)}>
					Switch to {defaultChain.name}
				</Button>
			</Flex>}
			{(status == Status.FETCHING || priceStatus !== Status.SUCCESS || loading) && <Progress bg={'blackAlpha.200'} colorScheme='primary' size='xs' isIndeterminate />}

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

			<Modal isOpen={showMessage} onClose={() => {
				setShowMessage(false);
			}} 
			isCentered
			
			>
				<ModalOverlay opacity={1} bg={'blackAlpha.700'} />
				<ModalContent minW={'600px'}>
				<ModalHeader textAlign={'center'}>
					{ step == 0 ? "Thank you for being a part of our Beta!" : step == 1 ? "We'd love to hear your feedback!" : "Thank you!"}
				</ModalHeader>
				{/* <ModalCloseButton /> */}
				<ModalBody p={0} bg={'blackAlpha.700'} py={6}>
					{
						step == 0 ? <Box mx={5} textAlign={'center'}>
							<Text>
								Reax was born 2 years ago to revolutionise the derivatives space. 🧑‍🚀 We launched Beta in July 2023 and have been live on mainnet for 10 months now. 🔥
							</Text>
							<Text my={2}>
								Since then, we have innovated to take Reax on the next phase, a truly game-changing the DeFi Derivatives platform! 🚀
							</Text>
							<Image src='/static/beta.jpeg' w={'100%'} my={6} />
							<Text>
								We will be shutting down Beta on 31st May 2024. Please withdraw your funds before then.
							</Text>
							
						</Box> : step == 1 ? <>
						<Flex flexDir={'column'} align={'center'} my={0} minH={'300px'} mx={4}>
								 <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSes7aa3khrpH_duozRG5llQRZA2V6j03mGswm3qXcMxwcKekQ/viewform?embedded=true" width="100%" height="400px">Loading…</iframe>
								<Box>
								 <Button colorScheme='orange' color={'white'} bg={'secondary.400'} mt={4} >
								 <Link href={'https://docs.google.com/forms/d/e/1FAIpQLSes7aa3khrpH_duozRG5llQRZA2V6j03mGswm3qXcMxwcKekQ/viewform'} target={'_blank'} >
									Open In New Tab <MdOpenInNew/>
								 </Link>
								 </Button>
								</Box>
							</Flex>
						</> : <Box textAlign={'center'} mx={5}>
							<Text mb={4}>
								Stay tuned for the next phase of Reax! 🚀  We now are taking off to the moon! 🌕
							</Text>

							<Image src={'/static/take-off.jpeg'} w={'100%'} />

							<Text mt={4}>
								Read our litepaper <Link style={{color: "orange"}} href={'https://reax.one/litepaper.pdf'} target={'_blank'}>here</Link>!
							</Text>
						</Box>
					}
				</ModalBody>

				<ModalFooter mx={'auto'}>
					{step !== 0 && <Button variant={'ghose'} mr={3} onClick={() => {
						setStep((prev) => prev - 1);
					}
					}>
						{"<"} Back
					</Button>}
					<Button colorScheme='orange' color={'white'} bg={'secondary.400'} mr={3} onClick={() => {
						if(step != 2) {
							setStep((prev) => prev + 1);
						} else {
							localStorage.setItem('betaShutdownMessageShown', Date.now().toString());
							setShowMessage(false);
						}
					}}>
					{
						step == 0 ? "Give Feedback >" : step == 1 ? "What's next?" : "LFG! 🚀"
					}
					</Button>
				</ModalFooter>
				</ModalContent>
			</Modal>

			
			{/* <Box bgGradient={'linear(to-b, #090B0F, #090B0F)'} zIndex={0}> */}
			<Box bgGradient={colorMode == 'dark' ? 'linear(to-b, blackAlpha.500, blackAlpha.800)' : 'linear(to-b, blackAlpha.200, blackAlpha.400)'} zIndex={0}>
				<Flex
					justify={'center'}
					flexDirection={{ sm: 'column', md: 'row' }}
					minH="97vh"
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
								{process.env.NEXT_PUBLIC_UNDER_MAINTAINANCE == "true" ? <Flex h={'80vh'} align={'center'} justify={'center'}>
									<Box textAlign={'center'}>
									<Heading>App in under maintainance</Heading>
									<Text color={'whiteAlpha.600'}>Please Check Back Again in a moment</Text>
									</Box>
								</Flex>:<>{children}</>}
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
