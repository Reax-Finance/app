import {
  Box,
  Text,
  Flex,
  Input,
  Button,
  InputGroup,
  useDisclosure,
  Divider,
  NumberInput,
  NumberInputField,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { dollarFormatter, tokenFormatter } from "../../src/const";
import { CloseIcon, InfoOutlineIcon, WarningTwoIcon } from "@chakra-ui/icons";
import SelectBody from "./SelectBody";
import Big from "big.js";
import { formatInput } from "../utils/number";
import { BigNumber, ethers } from "ethers";
import { VARIANT } from "../../styles/theme";
import { BsPlus } from "react-icons/bs";
import UserAccount from "../utils/useUserAccount";

const inputStyle = {
  variant: "unstyled",
  fontSize: "3xl",
  borderColor: "transparent",
  fontFamily: "Chakra Petch",
  _hover: { borderColor: "transparent" },
  borderRadius: "0",
  pr: "4.5rem",
  height: "50px",
  type: "number",
  placeholder: "Enter amount",
};

export default function AddLiquidityLayout({
  inputAmount,
  updateInputAmount,
  inputAssetIndex,
  onInputOpen,
  outputAmount,
  updateOutputAmount,
  maxMint,
  exchange,
  validate,
  loading,
  tokens,
  outToken,
  steps,
}: any) {
  const handleMaxOutput = () => {
    updateOutputAmount(maxMint().toString());
  };
  const { isConnected } = UserAccount();

  const handleMaxInput = () => {
    let _inputAmount = Big(tokens[inputAssetIndex].balance.toString()).div(
      Big(10).pow(tokens[inputAssetIndex].decimals).toString()
    );
    updateInputAmount(_inputAmount.toString());
  };

  const {
    isOpen: isStakeOpen,
    onOpen: onStakeOpen,
    onClose: onStakeClose,
  } = useDisclosure({
    onClose: () => {
      updateInputAmount("");
    },
    defaultIsOpen: true,
  });
  const {
    isOpen: isMintOpen,
    onOpen: onMintOpen,
    onClose: onMintClose,
  } = useDisclosure({
    onClose: () => {
      updateOutputAmount("");
    },
    defaultIsOpen: true,
  });

  const { colorMode } = useColorMode();

  return (
    <>
      <Box pt={2}>
        {/* Input */}
        <Box
          bg={colorMode == "dark" ? "darkBg.400" : "lightBg.600"}
          border={"1px"}
          borderColor={"whiteAlpha.200"}
          m={4}
          py={2}
          px={4}
        >
          <Flex align={"center"} gap={2}>
            <Text>Stake Collateral</Text>
            {isStakeOpen ? (
              <IconButton
                icon={<CloseIcon w={"10px"} />}
                onClick={onStakeClose}
                aria-label={""}
                size={"xs"}
              />
            ) : (
              <IconButton
                icon={<BsPlus size={20} />}
                onClick={onStakeOpen}
                aria-label={""}
                size={"xs"}
              />
            )}
          </Flex>

          {isStakeOpen && (
            <>
              <Flex align="center" justify={"space-between"} mt={2}>
                <Box width={{ base: "60%", md: "70%" }}>
                  <InputGroup>
                    <NumberInput
                      w={"100%"}
                      value={formatInput(inputAmount)}
                      onChange={updateInputAmount}
                      min={0}
                      step={0.01}
                      {...inputStyle}
                    >
                      <NumberInputField
                        pr={0}
                        fontSize={"4xl"}
                        placeholder="0"
                        border={0}
                      />
                    </NumberInput>
                  </InputGroup>
                </Box>

                <SelectBody
                  onOpen={onInputOpen}
                  asset={tokens[inputAssetIndex]}
                />
              </Flex>
              <Flex
                fontSize={"sm"}
                color={
                  colorMode == "dark" ? "whiteAlpha.700" : "blackAlpha.700"
                }
                justify={"space-between"}
                align="center"
                mt={4}
              >
                <Text>
                  {dollarFormatter.format(
                    (Number(inputAmount) || 0) *
                      (tokens[inputAssetIndex]?.price
                        ?.div(10 ** 8)
                        .toNumber() ?? 0)
                  )}
                </Text>
                {isConnected && (
                  <Flex align={"center"} gap={1}>
                    <Text>Max</Text>
                    <Text
                      onClick={handleMaxInput}
                      _hover={{ textDecor: "underline" }}
                      cursor="pointer"
                      textDecor={"underline"}
                      style={{ textUnderlineOffset: "2px" }}
                    >
                      {" "}
                      {tokenFormatter.format(
                        tokens[inputAssetIndex]
                          ? tokens[inputAssetIndex].balance /
                              10 ** tokens[inputAssetIndex].decimals
                          : 0
                      )}
                    </Text>
                  </Flex>
                )}
              </Flex>{" "}
            </>
          )}
        </Box>

        {/* Output */}
        <Box
          bg={colorMode == "dark" ? "darkBg.400" : "lightBg.600"}
          border={"1px"}
          borderColor={"whiteAlpha.200"}
          m={4}
          py={2}
          px={4}
        >
          <Flex align={"center"} gap={2}>
            <Text>Mint LP</Text>
            {isMintOpen ? (
              <IconButton
                icon={<CloseIcon w={"10px"} />}
                onClick={onMintClose}
                aria-label={""}
                size={"xs"}
              />
            ) : (
              <IconButton
                icon={<BsPlus size={20} />}
                onClick={onMintOpen}
                aria-label={""}
                size={"xs"}
              />
            )}
          </Flex>
          {isMintOpen && (
            <>
              <Flex align="center" justify={"space-between"} mt={2}>
                <Box width={{ base: "60%", md: "70%" }}>
                  <InputGroup>
                    <NumberInput
                      w={"100%"}
                      value={formatInput(outputAmount)}
                      onChange={updateOutputAmount}
                      min={0}
                      step={0.01}
                      {...inputStyle}
                    >
                      <NumberInputField
                        pr={0}
                        fontSize={"4xl"}
                        placeholder="0"
                        border={0}
                      />
                    </NumberInput>
                  </InputGroup>
                </Box>

                <SelectBody asset={outToken} />
              </Flex>
              <Flex
                fontSize={"sm"}
                color={
                  colorMode == "dark" ? "whiteAlpha.700" : "blackAlpha.700"
                }
                justify={"space-between"}
                align="center"
                mt={4}
              >
                <Text>
                  {dollarFormatter.format(
                    (Number(outputAmount) || 0) *
                      (outToken?.price
                        ?.div(ethers.constants.WeiPerEther)
                        .toNumber() ?? 0)
                  )}
                </Text>
                {isConnected && (
                  <Flex align={"center"} gap={1}>
                    <Text>Max</Text>
                    <Text
                      onClick={handleMaxOutput}
                      _hover={{ textDecor: "underline" }}
                      cursor="pointer"
                      textDecor={"underline"}
                      style={{ textUnderlineOffset: "2px" }}
                    >
                      {" "}
                      {tokenFormatter.format(maxMint())}
                    </Text>
                  </Flex>
                )}
              </Flex>{" "}
            </>
          )}
        </Box>

        <Box px="5">
          {steps.length > 0 && (
            <Box>
              {steps.map((step: any, index: number) => (
                <>
                  <Flex
                    align={"center"}
                    px={0}
                    border={"1px"}
                    borderColor={"whiteAlpha.300"}
                    my={2}
                    h={"40px"}
                  >
                    <Flex justify={"center"} w={"40px"}>
                      <Text color={"whiteAlpha.500"}>{index + 1}</Text>
                    </Flex>
                    <Divider orientation="vertical" />
                    <Flex
                      align={"center"}
                      justify={"space-between"}
                      gap={1}
                      ml={3}
                      w={"100%"}
                    >
                      <Text>
                        {step.type == "APPROVAL" || step.type == "PERMIT"
                          ? "Approve " + step.data.token.symbol + " for use"
                          : "Delegate Mint"}
                      </Text>
                      <Button
                        rounded={0}
                        onClick={step.execute}
                        isLoading={step.loading}
                        size={"md"}
                        colorScheme={"blue"}
                      >
                        {step.type == "APPROVAL"
                          ? "Approve"
                          : step.type == "PERMIT"
                          ? "Sign Message"
                          : "Delegate"}
                      </Button>
                    </Flex>
                  </Flex>
                </>
              ))}
            </Box>
          )}
          <Box
            mt={3}
            mb={5}
            className={
              validate().valid
                ? `${VARIANT}-${colorMode}-primaryButton`
                : `${VARIANT}-${colorMode}-disabledPrimaryButton`
            }
          >
            <Button
              size="lg"
              fontSize={"xl"}
              width={"100%"}
              onClick={exchange}
              bg={"transparent"}
              isDisabled={!validate().valid}
              loadingText="Loading"
              isLoading={loading}
              _hover={{ opacity: 0.6 }}
              color="white"
              height={"55px"}
            >
              {validate().message}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
