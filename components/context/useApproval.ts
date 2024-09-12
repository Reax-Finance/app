"use client";

import { useToast } from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { Asset } from "../utils/types";
import useHandleError, { PlatformType } from "../utils/useHandleError";
import useChainData from "./useChainData";
import UserAccount from "../utils/useUserAccount";
import { signTypedData } from "thirdweb/utils";
import { Hex } from "thirdweb";

type TxType = "APPROVE" | "PERMIT";

interface ApprovalProps {
  deadline_m?: number;
  onSuccess?: (type: TxType) => void;
  onError?: (type: TxType, message: string) => void;
}

const useApproval = ({
  deadline_m = 20,
  onSuccess,
  onError,
}: ApprovalProps) => {
  const toast = useToast();
  const { address, chain } = UserAccount();
  const [loading, setLoading] = useState(false);
  const handleError = useHandleError(PlatformType.DEX);
  const [data, setData] = useState<any>();
  const [deadline, setDeadline] = useState<string>("");
  const [approvedAmount, setApprovedAmount] = useState<string>("0");
  const { getContract, send } = useChainData();
  const chainId = chain?.id;

  const approve = async (
    token: Asset,
    spender: string,
    amount: string = ethers.constants.MaxUint256.toString()
  ) => {
    setLoading(true);
    const tokenContract = getContract("ERC20Permit", token.id);

    try {
      const nonce = await tokenContract.nonces(address);
      await signPermit(token, spender, amount, nonce.toString());
    } catch (err) {
      await approveTx(token, spender, amount);
    }
  };

  const approveTx = async (
    token: Asset,
    routerAddress: string,
    amount: string
  ) => {
    setLoading(true);
    const tokenContract = getContract("ERC20", token.id);
    try {
      const tx = await send(tokenContract, "approve", [
        routerAddress,
        ethers.constants.MaxUint256,
      ]);
      await tx.wait();
      setLoading(false);
      toast({
        title: "Approval Successful",
        description: `You have approved ${token.symbol}`,
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
      if (onSuccess) onSuccess("APPROVE");
    } catch (err) {
      handleError(err);
      setLoading(false);
      if (onError) onError("APPROVE", JSON.stringify(err));
    }
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

    if (!address || !chainId)
      throw new Error("No address or chain ID available");

    const domain = await getContract("ERC20Permit", token.id).eip712Domain();
    // const version = domain.version;
    // const name = domain.name;
    // const typedData = {
    //   domain: {
    //     name,
    //     version,
    //     chainId: chainId,
    //     verifyingContract: token.id,
    //   },
    //   types: {
    //     Permit: [
    //       { name: "owner", type: "address" },
    //       { name: "spender", type: "address" },
    //       { name: "value", type: "uint256" },
    //       { name: "nonce", type: "uint256" },
    //       { name: "deadline", type: "uint256" },
    //     ],
    //   },
    //   primaryType: "Permit",
    //   message: {
    //     owner: address!,
    //     spender: spender as `0x${string}`,
    //     value: value.toBigInt(),
    //     nonce: BigNumber.from(nonce.toString()).toBigInt(),
    //     deadline: BigNumber.from(_deadline).toBigInt(),
    //   },
    // };

    try {
      const signature = signTypedData({
        domain: {
          name: domain.name,
          version: domain.version,
          chainId: chainId,
          verifyingContract: token.id,
        },
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit",
        message: {
          owner: address!,
          spender: spender as `0x${string}`,
          value: value.toBigInt(),
          nonce: BigNumber.from(nonce.toString()).toBigInt(),
          deadline: BigNumber.from(_deadline).toBigInt(),
        },
        privateKey: process.env.THIRDWEB_ADMIN_PRIVATE_KEY as Hex,
      });
      setData(signature);
      setDeadline(_deadline);
      setApprovedAmount(ethers.constants.MaxUint256.toString());
      setLoading(false);
      toast({
        title: "Permit Signed",
        description: `You have signed a permit for approval of ${token.symbol}`,
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
      if (onSuccess) onSuccess("PERMIT");
    } catch (err) {
      handleError(err);
      setLoading(false);
      if (onError) onError("PERMIT", JSON.stringify(err));
    }
  };

  // Clears all data
  const reset = () => {
    setData(undefined);
    setDeadline("");
    setApprovedAmount("0");
  };

  return { approve, loading, data, deadline, approvedAmount, reset };
};

export default useApproval;
