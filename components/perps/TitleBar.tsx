import {
  Box,
  Divider,
  Flex,
  Heading,
  Text,
  Tooltip,
  useColorMode,
  Image,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import PairSelector from "./PairSelector";
import { usePriceData } from "../context/PriceContext";
import router from "next/router";
import { useAppData } from "../context/AppDataProvider";
import { SynthData } from "../utils/types";

const HEIGHT = "80px";

export default function TitleBar({ pair }: any) {
  const { pairs, synths } = useAppData();

  const [token0Rate, setToken0Rate] = React.useState(["0", "0"]);
  const [token1Rate, setToken1Rate] = React.useState(["0", "0"]);

  const { colorMode } = useColorMode();
  const pairId: string = pair?.id;

  const price0 = Number(pair.synth1.price) / 1e18;
  const price1 = Number(pair.synth2.price) / 1e18;
  const indexPrice = (price0 / price1).toFixed(4);

  console.log("pair from title bar", {
    pair: pair,
    pairId: pairId,
    price0: Number(pair.synth1.price) / 1e18,
    price1: Number(pair.synth2.price) / 1e18,
    indexPrice: indexPrice,
    baseAPY: {
      long: (Number(token0Rate[0]) ?? 0) + (Number(token1Rate[1]) ?? 0) + "%",
      short: (Number(token0Rate[0]) ?? 0) + (Number(token1Rate[1]) ?? 0) + "%",
    },
  });
  useEffect(() => {
    if (!pair || !pairs) return;

    const updateRates = (
      synth: SynthData,
      setRate: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      const interestRate = synth.market.interestRate; //WIP: calculate interest rate
      setRate([
        (interestRate.toNumber() / 100).toFixed(2),
        ((interestRate.toNumber() / 100) * -1).toFixed(2),
      ]);
    };

    console.log("synth1", pair.synth1);
    console.log("Synth2", pair.synth2);

    updateRates(pair.synth1, setToken0Rate);
    updateRates(pair.synth2, setToken1Rate);
  }, [pair, pairs, synths]);

  return (
    <>
      <Flex minH={HEIGHT} px={5} align={"center"} bg={`${colorMode}Bg.400`}>
        <Box>
          {/* <PairSelector /> */}
          <Flex gap={4} pr={10}>
            <Image
              src={`/icons/${pair?.id?.split("-")[0]}.svg`}
              w={"30px"}
              alt="pair"
            />
            <Heading
              fontSize={{ sm: "3xl", md: "3xl", lg: "30px" }}
              fontWeight="bold"
            >
              {pairId}
            </Heading>
          </Flex>
        </Box>
        <Divider orientation="vertical" h={HEIGHT} />
        <Box px={10}>
          <Text
            color={colorMode == "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
            fontSize={"sm"}
          >
            Index Price
          </Text>
          <Heading size={"md"}>{indexPrice}</Heading>
        </Box>
        <Divider orientation="vertical" h={HEIGHT} />
        <Box px={6}>
          <Text
            color={colorMode == "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
            fontSize={"sm"}
          >
            Base APY
          </Text>
          <Flex>
            <Tooltip label="LONG" aria-label="LONG">
              <Heading size={"sm"}>
                {(
                  (Number(token0Rate[0]) ?? 0) + (Number(token1Rate[1]) ?? 0)
                ).toFixed(4)}
                %
              </Heading>
            </Tooltip>
            <Text>/</Text>
            <Tooltip label="SHORT" aria-label="SHORT">
              <Heading size={"sm"}>
                {(
                  (Number(token0Rate[1]) ?? 0) + (Number(token1Rate[0]) ?? 0)
                ).toFixed(4)}
                %
              </Heading>
            </Tooltip>
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
