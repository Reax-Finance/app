import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import TitleBar from "./TitleBar";
import Trade from "./trade";
import { useAppData } from "../context/AppDataProvider";
import TradingViewWidget from "./graph/TradingViewWidget";
import PairSelector from "./PairSelector";

export default function Perps({ pair }: { pair: any }) {
  if (!pair) return null;

  return (
    <Box>
      <TitleBar pair={pair} />
      <Flex mt={4} gap={4}>
        <Box>
          <PairSelector />
        </Box>
        <Box minW={"700px"}>
          <TradingViewWidget pair={pair.id} />
        </Box>
        <Box flex={1}>
          <Trade pair={pair} />
        </Box>
        {/* Add other components here if needed */}
      </Flex>
    </Box>
  );
}
