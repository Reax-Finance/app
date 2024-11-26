import React from "react";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAppData } from "../../components/context/AppDataProvider";
import Perps from "../../components/perps";

export default function PerpsPage() {
  const router = useRouter();
  const { pairs } = useAppData();

  console.log("pairs", pairs);

  if (pairs.length > 0) router.push(`/perps/${pairs[0].id}`);

  return (
    <>
      <Perps pair={pairs[1]} />
    </>
  );
}
