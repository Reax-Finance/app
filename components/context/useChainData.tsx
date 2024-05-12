import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { ADDRESS_ZERO, isSupportedChain } from "../../src/const";
import dotenv from 'dotenv';
import { baseSepolia, sepolia } from "viem/chains";

dotenv.config();

export default function useChainData() {

    const { chain } = useAccount();

	const getABI = (contractName: string) => {
		const artifact = require(`../../out/${contractName}.sol/${contractName}.json`);
		if (!artifact?.abi) throw new Error("ABI not found: " + contractName);

		return artifact.abi;
	};

	const getContract = (contractName: string, address: string) => {
        // console.log(contractName, address, chain?.id);
		let provider = new ethers.providers.JsonRpcProvider((chain ?? baseSepolia)?.rpcUrls.default.http[0]);
		if(typeof window !== "undefined" && window?.ethereum && isSupportedChain(BigNumber.from(window?.ethereum?.chainId || 0).toNumber())) provider = new ethers.providers.Web3Provider(window.ethereum as any);
        if(!address) return new ethers.Contract(ADDRESS_ZERO, getABI(contractName), provider);
		let contract = new ethers.Contract(
			address!,
			getABI(contractName),
			provider
		);
		return contract;
	};

    const send = (contract: ethers.Contract, method: string, params: any[], value = '0') => {
        if(!window.ethereum) throw new Error("No ethereum provider found");
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        return contract.connect(provider.getSigner())[method](...params, {value: value});
    }

    const routerAddress: { [key: number]: string | undefined } = {
        11155111: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_11155111,
        84532: process.env.NEXT_PUBLIC_ROUTER_ADDRESS_84532
    }

    const uidpAddress: { [key: number]: string | undefined } = {
        11155111: process.env.NEXT_PUBLIC_UIDP_ADDRESS_11155111,
        84532: process.env.NEXT_PUBLIC_UIDP_ADDRESS_84532
    }

    const rxRouter = getContract("ReaxRouter", routerAddress[chain?.id ?? baseSepolia.id]!);
    const uidp = getContract("UIDataProvider", uidpAddress[chain?.id ?? baseSepolia.id]!);

    return {
        getABI,
        getContract,
        send,
        rxRouter,
        uidp
    }
};
