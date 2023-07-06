import { Box, Button, Flex, Heading, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
    Text,
    Image
} from "@chakra-ui/react";
import { AppDataContext } from "../components/context/AppDataProvider";
import { useEffect } from "react";

const nonMintable = ["MNT", "WETH", "cUSD", "sUSD", "cBTC", 'cETH', 'cBNB', 'sAAPL', 'sMSFT', 'sCOIN', 'sGOOGL', 'cXRP'];

const mintAmounts: any = {
	"USDC": "1000",
	"USDT": "1000",
	"DAI": "1000",
	"EUROC": "1000",
	"WETH": "1",
    "AAVE": "10",
    "WBTC": "0.1",
    "LINK": "10",
    "Link": "10",
    "wstETH": "10",
    "ARB": '10', 
    "ETH": "1"
};

import Head from "next/head";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'
import { getContract, send } from "../src/contract";
import { useAccount, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { useBalanceData } from "../components/context/BalanceProvider";
import Big from "big.js";
import { useDexData } from "../components/context/DexDataProvider";

export default function Faucet() {
	const { pools } = useContext(AppDataContext);
    const { updateBalance } = useBalanceData();
    const [loading, setLoading] = React.useState<any>(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [openedCollateral, setOpenedCollateral] = React.useState<any>(null);

    const {address, isConnected}  = useAccount();
    const {chain} = useNetwork();

    const { tokens, walletBalances } = useBalanceData();

    const _onOpen = (collateral: any) => {
        setOpenedCollateral(collateral);
        onOpen();
    }

    const toast = useToast();

    const mint = async () => {
        setLoading(true);
        const token = await getContract("MockToken", chain?.id!, openedCollateral.id);
        const amount = ethers.utils.parseUnits(mintAmounts[openedCollateral.symbol], openedCollateral.decimals);
        send(token, "mint", [address, amount])
            .then(async(res: any) => {
                await res.wait(1);
                setLoading(false);
                updateBalance(openedCollateral.id, amount.toString(), false);
                toast({
                    title: `Minted ${openedCollateral.symbol}`,
                    description: `${mintAmounts[openedCollateral.symbol]} ${openedCollateral.symbol} minted to your wallet.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right'
                })
                onClose();
            })
            .catch((err: any) => {
                console.log(err);
                setLoading(false);
            });
    };

    const addToMetamask = async (token: any) => {
        (window as any).ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', // Initially only supports ERC20, but eventually more!
              options: {
                address: token.id, // The address that the token is at.
                symbol: token.symbol, // A ticker symbol or shorthand, up to 5 chars.
                decimals: token.decimals, // The number of decimals in the token
                image: process.env.NEXT_PUBLIC_VERCEL_URL + '/icons/'+token.symbol+'.svg', // A string url of the token logo
              },
            }
        });
    }

    const validate = () => {
        if(!isConnected) return {valid: false, message: "Please connect your wallet."}
        else if(chain?.unsupported) return {valid: false, message: "Unsupported network"}
        else return {valid: true, message: "Mint"}
    }

	return (
		<>
        <Head>
				<title>Test Faucet | REAX</title>
				<link rel="icon" type="image/x-icon" href="/veREAX.png"></link>
			</Head>
			<Heading mt={'80px'} fontSize={"3xl"}>Faucet</Heading>
            <Text color={'gray.400'} mb={10}>
                Note: This is a testnet faucet. These tokens are not real and have no value.
            </Text>

			<TableContainer className="tableStyle" rounded={0}>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>Asset</Th>
							<Th>Mint Amount</Th>
							<Th isNumeric></Th>
						</Tr>
					</Thead>
					<Tbody>
                        {tokens.map((token: any, index: number) => {
                            if(nonMintable.includes(token.symbol)) return;
                            return <Tr  key={index}>
                                <Td style={index == token.length - 1 ? {border: 0} : {}}>
                                    <Flex gap={2}>
                                    <Image src={`/icons/${token.symbol}.svg`} w='34px'/>
                                        <Box>
                                            <Flex align={'center'} gap={2}>
                                                <Text>{token.symbol}</Text>
                                                <IconButton
                                                    icon={
                                                        <Image
                                                            src="https://cdn.consensys.net/uploads/metamask-1.svg"
                                                            w={"20px"}
                                                            alt=""
                                                        />
                                                    }
                                                    onClick={() => addToMetamask(token)}
                                                    size={"xs"}
                                                    rounded="full"
                                                    aria-label={""}
                                                />
                                            </Flex>
                                            <Text fontSize={'sm'} color='gray.500'>
                                            {Big(walletBalances[token.id] ?? 0).div(10**token.decimals).toNumber()} in wallet
                                            </Text>
                                        </Box>
                                        
                                    </Flex>
                                    
                                </Td>
                                <Td style={index == tokens.length - 1 ? {border: 0} : {}}>{mintAmounts[token.symbol]}</Td>
                                <Td style={index == tokens.length - 1 ? {border: 0} : {}} isNumeric>
                                    <Button size='sm' rounded='0' colorScheme={'secondary'} bg={'secondary.400'} color={'white'} onClick={() => _onOpen(token)}>Mint</Button>
                                </Td>
                            </Tr>
                        })}
					</Tbody>
				</Table>
			</TableContainer>

            {openedCollateral && <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent rounded={0} width={'400px'}>
            <ModalHeader>{openedCollateral.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody >
                <Flex gap={4}>

                <Image alt={openedCollateral.symbol} src={`/icons/${openedCollateral.symbol}.svg`} w='44px' mb={2}/>
                <Box  mb={2}>

                <Text color={'gray.400'}>
                    You are about to mint {mintAmounts[openedCollateral.symbol]} {openedCollateral.symbol} tokens.
                </Text>
                </Box>
                </Flex>
                
            </ModalBody>

            <ModalFooter justifyContent={'center'}>
                <Button isDisabled={!validate().valid} color={'white'} size={'md'} loadingText="Minting" isLoading={loading} colorScheme='secondary' bg={'secondary.400'} mb={0} rounded={0} onClick={mint} width='100%'>
                    {validate().message}
                </Button>
            </ModalFooter>
            </ModalContent>
        </Modal>}

		</>
	);
}
