import { useToast } from "@chakra-ui/react"
import { formatBalError, formatLendingError } from "../../src/errors";

export default function useHandleError() {
    const toast = useToast();
    return (err: any) => {
        if(err?.reason == "user rejected transaction"){
            toast({
                title: "Transaction Rejected",
                description: "You have rejected the transaction",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        } else if(formatBalError(err)){
            toast({
                title: "Transaction Failed",
                description: formatBalError(err),
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        } else if(formatLendingError(err)){
            toast({
                title: "Transaction Failed",
                description: formatLendingError(err),
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        } else {
            toast({
                title: "Transaction Failed",
                description: err?.data?.message || JSON.stringify(err).slice(0, 100),
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            })
        }
    }
}
