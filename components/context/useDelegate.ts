import { Box, useToast } from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { Asset } from "../utils/types";
import useHandleError, { PlatformType } from "../utils/useHandleError";
import { signTypedData } from "thirdweb/utils";
import useChainData from "./useChainData";
import { Hex } from "thirdweb";
import UserAccount from "../utils/useUserAccount";

type TxType = "DELEGATE" | "PERMIT";

interface ApprovalProps {
  deadline_m?: number;
  onSuccess?: (type: TxType) => void;
  onError?: (type: TxType, message: string) => void;
}

const useDelegate = ({
  deadline_m = 20,
  onSuccess,
  onError,
}: ApprovalProps) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const handleError = useHandleError(PlatformType.DEX);
  // const { signTypedDataAsync } = useSignTypedData();
  // const { address, chain } = useAccount();
  const { address, chain } = UserAccount();

  const [data, setData] = useState<any>();
  const [deadline, setDeadline] = useState<string>("");
  const [delegatedAmount, setDelegatedAmount] = useState<string>("0");
  const { getContract, send } = useChainData();

  const delegate = async (
    token: Asset,
    spender: string,
    amount: string = ethers.constants.MaxUint256.toString()
  ) => {
    setLoading(true);
    const tokenContract = getContract("ERC20Permit", token.id);

    tokenContract
      .nonces(address)
      .then((nonce: any) => {
        signPermit(token, spender, amount, nonce.toString());
      })
      .catch((err: any) => {
        delegateTx(token, spender, amount);
      });
  };

  const delegateTx = (token: Asset, spender: string, amount: string) => {
    setLoading(true);
    const tokenContract = getContract("DebtToken", token.id);
    send(tokenContract, "approveDelegation", [spender, amount])
      .then(async (res: any) => {
        await res.wait();
        setLoading(false);
        toast({
          title: "Delegation Successful",
          description: `You have delegated ${token.symbol}`,
          status: "success",
          duration: 10000,
          isClosable: true,
          position: "top-right",
        });
        if (onSuccess) onSuccess("DELEGATE");
      })
      .catch((err: any) => {
        handleError(err);
        setLoading(false);
        if (onError) onError("DELEGATE", JSON.stringify(err));
      });
  };

  const signPermit = async (
    token: any,
    spender: string,
    amount: string,
    nonce: string
  ) => {
    const _deadline = (Math.floor(Date.now() / 1000) + 60 * deadline_m).toFixed(
      0
    );
    const value = ethers.constants.MaxUint256;
    const version = (await getContract("ERC20Permit", token.id).eip712Domain())
      .version;
    try {
      const res = signTypedData({
        domain: {
          name: token.name,
          version: version,
          chainId: chain!.id,
          verifyingContract: token.id,
        },
        message: {
          delegatee: spender as `0x${string}`,
          delegator: address!,
          value: value.toBigInt(),
          nonce: BigNumber.from(nonce.toString()).toBigInt(),
          deadline: BigNumber.from(_deadline).toBigInt(),
        },
        privateKey: process.env.THIRDWEB_ADMIN_PRIVATE_KEY as Hex, //admin private key
        primaryType: "DelegationWithSig",
        types: {
          DelegationWithSig: [
            { name: "delegator", type: "address" },
            { name: "delegatee", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
      });
      setData(res);
      setDeadline(_deadline);
      setDelegatedAmount(ethers.constants.MaxUint256.toString());
      setLoading(false);
      toast({
        title: "Delegation Signed",
        description: `You have signed a permit for delegation of ${token.symbol}`,
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
      if (onSuccess) onSuccess("PERMIT");
    } catch (err: any) {
      handleError(err);
      setLoading(false);
      if (onError) onError("PERMIT", JSON.stringify(err));
    }
  };

  // Clears all data
  const reset = () => {
    setData(undefined);
    setDeadline("");
    setDelegatedAmount("");
  };

  return { delegate, loading, data, deadline, delegatedAmount, reset };
};

export default useDelegate;
