import React from 'react'
import dynamic from "next/dynamic";

const Graph = dynamic(
	() =>
		import('./Graph.jsx').then(mod => mod.Graph),
	{ ssr: false },
);

export default function TradingViewWidget({pair}: any) {
  return (
    <>
       {pair && <Graph symbol={pair.split("-").join("").split("c").join("")} libraryPath={
        process.env.NEXT_PUBLIC_ENVIRONMENT == "production" ? '/static/charting_library/' : '/static/charting_library/'
       } />}
    </>
  )
}