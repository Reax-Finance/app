import React, { useEffect } from 'react'
import { useAppData } from '../../components/context/AppDataProvider'
import { SynthData } from '../../components/utils/types'



export default function PerpsPage() {
    const { synths, pairs } = useAppData();
    return (
        <div className="p-4">
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
                    </div>
                </div>
            ))}
        </div>
    )
}
