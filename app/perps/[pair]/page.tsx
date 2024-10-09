import React from "react";
import Perps from "../../components/perps";
import router, { useRouter } from "next/router";
import Head from "next/head";
import { useAppData } from "../../components/context/AppDataProvider";

export default function PerpsPair() {
  // get pair id from url
  const { pair } = router.query;
  const { pairs } = useAppData();

  if (!pair) return <>Loading...</>;

  if (pairs.length > 0) {
    const selectedCategory = pairs.filter((i: any) => i.id == pair);
    if (selectedCategory.length == 0) {
      router.push(`/perps/${pairs[0].id}`);
      return <>Loading...</>;
    }
  }

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_TOKEN_SYMBOL} | Margin</title>
        <link
          rel="icon"
          type="image/x-icon"
          href={`/${process.env.NEXT_PUBLIC_TOKEN_SYMBOL}.svg`}
        ></link>
      </Head>
      {/* <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Correlated Pairs</h1>
            {pairs.map((pair) => (
                <div key={pair.id} className="mb-4 p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">
                        {pair.synth1.synth.symbol} - {pair.synth2.synth.symbol}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium">{pair.synth1.synth.symbol}</h3>
                            <p>Price: {pair.synth1.synth.price.toString()}</p>
                            <p>Total Assets: {pair.synth1.market.totalAssetsUSD.toString()} USD</p>
                            <p>Total Debt: {pair.synth1.market.totalDebtUSD.toString()} USD</p>
                        </div>
                        <div>
                            <h3 className="font-medium">{pair.synth2.synth.symbol}</h3>
                            <p>Price: {pair.synth2.synth.price.toString()}</p>
                            <p>Total Assets: {pair.synth2.market.totalAssetsUSD.toString()} USD</p>
                            <p>Total Debt: {pair.synth2.market.totalDebtUSD.toString()} USD</p>
                        </div>
                    </div>``
                </div>
            ))}
        </div> */}
      <Perps pair={pairs.find((i: any) => i.id == pair)!} />
    </>
  );
}
