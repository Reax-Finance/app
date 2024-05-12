import { Box, useToast } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Asset } from '../utils/types';
import useHandleError, { PlatformType } from '../utils/useHandleError';
import { useAccount, useSignTypedData } from 'wagmi';
import useChainData from './useChainData';
type TxType = "APPROVE" | "PERMIT";

interface ApprovalProps {
    deadline_m?: number;
    onSuccess?: (type: TxType) => void;
    onError?: (type: TxType, message: string) => void;
}

const useApproval = ({deadline_m = 20, onSuccess, onError}: ApprovalProps) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
	const handleError = useHandleError(PlatformType.DEX);
    const { signTypedDataAsync } = useSignTypedData();
    const { address, chain } = useAccount();
    const [data, setData] = useState<any>();
    const [deadline, setDeadline] = useState<string>("");
    const [approvedAmount, setApprovedAmount] = useState<string>("0");
	const { getContract, send } = useChainData();

    const approve = async (token: Asset, spender: string, amount: string = ethers.constants.MaxUint256.toString()) => {
        setLoading(true);
        const tokenContract = getContract("ERC20Permit", token.id);
        
        tokenContract.nonces(address).then((nonce: any) => {
            signPermit(token, spender, amount, nonce.toString());
        })
        .catch((err: any) => {
            approveTx(token, spender, amount);
        });
    }
    
    const approveTx = (token: Asset, routerAddress: string, amount: string) => {
		setLoading(true);
		const tokenContract = getContract("ERC20", token.id);
		send(tokenContract, "approve", [routerAddress, ethers.constants.MaxUint256])
		.then(async (res: any) => {
			await res.wait();
            setLoading(false);
            toast({
                title: "Approval Successful",
                description: `You have approved ${token.symbol}`,
                status: "success",
                duration: 10000,
                isClosable: true,
                position: "top-right"
            })
            if(onSuccess) onSuccess("APPROVE");
		}).catch((err: any) => {
			handleError(err);
			setLoading(false);
            if(onError) onError("APPROVE", JSON.stringify(err));
		})
	};

	const signPermit = async (token: any, spender: string, amount: string, nonce: string) => {
		const _deadline =(Math.floor(Date.now() / 1000) + 60 * deadline_m).toFixed(0);
		const value = ethers.constants.MaxUint256;
		const domain = await (getContract("ERC20Permit", token.id)).eip712Domain();
		const version = domain.version;
		const name = domain.name;
		signTypedDataAsync({
			domain: {
				name,
				version,
				chainId: chain!.id,
				verifyingContract: token.id,
			},
			types: {
				Permit: [
					{ name: "owner", type: "address" },
					{ name: "spender", type: "address" },
					{ name: "value", type: "uint256" },
					{ name: "nonce", type: "uint256" },
					{ name: "deadline", type: "uint256" },
				]
			},
			primaryType: "Permit",
			message: {
				owner: address!,
				spender: spender as `0x${string}`,
				value: value.toBigInt(),
				nonce: BigNumber.from(nonce.toString()).toBigInt(),
				deadline: BigNumber.from(_deadline).toBigInt(),
			}
		})
			.then(async (res: any) => {
				setData(res);
				setDeadline(_deadline);
				setApprovedAmount(ethers.constants.MaxUint256.toString());
				setLoading(false);
                toast({
                    title: "Permit Signed",
                    description: `You have signed a permit for approval of ${token.symbol}`,
                    status: "success",
                    duration: 10000,
                    isClosable: true,
                    position: "top-right"

                })
				if(onSuccess) onSuccess("PERMIT");
			})
			.catch((err: any) => {
				handleError(err);
				setLoading(false);
                if(onError) onError("PERMIT", JSON.stringify(err));
			});
	};

    // Clears all data
    const reset = () => {
        setData(undefined);
        setDeadline("");
        setApprovedAmount("0");
    }

    return { approve, loading, data, deadline, approvedAmount, reset };
}

export default useApproval;