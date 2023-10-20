import { Box, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import dynamic from "next/dynamic";
import Head from 'next/head.js';

const Graph = dynamic(
	() =>
		import('./Graph.jsx').then(mod => mod.Graph),
	{ ssr: false },
);

export default function TradingViewWidget({pair}: any) {
  return (
    <>
       {pair && <Graph symbol={pair.split("-").join("").split("c").join("")}/>}
    </>
  )
}