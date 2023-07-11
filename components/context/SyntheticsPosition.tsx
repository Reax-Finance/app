import React from "react";
import { useAppData } from "./AppDataProvider";
import { usePriceData } from "./PriceContext";
import Big from "big.js";
import { useBalanceData } from "./BalanceProvider";
import { useLendingData } from "./LendingDataProvider";

interface Position {
    collateral: string;
    debt: string;
    stableDebt: string;
    adjustedCollateral: string;
    availableToIssue: string;
    debtLimit: string;
}

interface SyntheticsPositionValue {
    poolDebt: () => string;
    position: () => Position;
    lendingPosition: () => Position;
    netAPY: () => number;
    netBorrowAPY: () => number;
    netSupplyAPY: () => number;
    supplied: () => number;
    borrowed: () => number;
}

const SyntheticsPositionContext = React.createContext<SyntheticsPositionValue>({} as SyntheticsPositionValue);

function SyntheticsPositionProvider({ children }: any) {
    const { pools, tradingPool } = useAppData();
    const { pools: lendingPools, selectedPool } = useLendingData();
    const { prices } = usePriceData();
    const { walletBalances } = useBalanceData();

    const poolDebt = () => {
        if(pools.length == 0) return "0.00";
        if(!prices) return "0.00";
        let res = Big(0);
        for(let i in pools[tradingPool].synths){
            res = res.plus(
                Big(pools[tradingPool].synths[i].totalSupply)
                .div(10**pools[tradingPool].synths[i].token.decimals)
                .mul(prices[pools[tradingPool].synths[i].token.id] ?? 0)
            );
        }
        return res.toString();
    }

    const position = (_tradingPool = tradingPool): Position => {
		let _totalCollateral = Big(0);
		let _adjustedCollateral = Big(0);
		let _totalDebt = Big(0);
        const _pool = pools[_tradingPool];
        if(!_pool) return {collateral: '0', debt: '0', stableDebt: '0', adjustedCollateral: '0', availableToIssue: '0', debtLimit: '0'};
		for (let i = 0; i < _pool.collaterals.length; i++) {
			const usdValue = Big(_pool.collaterals[i].balance ?? 0)
            .div(10 ** _pool.collaterals[i].token.decimals)
            .mul(prices[_pool.collaterals[i].token.id] ?? 0);
            _totalCollateral = _totalCollateral.plus(usdValue);
			_adjustedCollateral = _adjustedCollateral.plus(usdValue.mul(_pool.collaterals[i].baseLTV).div(10000));
		}

		if(Big(_pool.totalSupply).gt(0)) _totalDebt = Big(_pool.balance ?? 0).div(_pool.totalSupply).mul(poolDebt());

        let availableToIssue = '0'
        if(_adjustedCollateral.sub(_totalDebt).gt(0)){
            availableToIssue = _adjustedCollateral.sub(_totalDebt).toString();
        }

        let debtLimit = Big(0);
        if(_totalCollateral.gt(0)){
            debtLimit = _totalDebt.mul(100).div(_totalCollateral);
        }
        return {
            collateral: _totalCollateral.toString(),
            debt: _totalDebt.toString(),
            stableDebt: '0',
            adjustedCollateral: _adjustedCollateral.toString(),
            availableToIssue,
            debtLimit: debtLimit.toString()
        }
    }

    const lendingPosition = (_selectedPool = selectedPool): Position => {
        let _totalCollateral = Big(0);
        let _adjustedCollateral = Big(0);
        let _totalDebt = Big(0);
        let _totalStableDebt = Big(0);
        let markets = lendingPools[_selectedPool];
        if(markets.length == 0) return {collateral: '0', debt: '0', stableDebt: '0', adjustedCollateral: '0', availableToIssue: '0', debtLimit: '0'};
        for (let i = 0; i < markets.length; i++) {
            if(!walletBalances[markets[i].outputToken.id] || !prices[markets[i].inputToken.id]) continue;
            const usdValue = Big(walletBalances[markets[i].outputToken.id]).div(10**markets[i].outputToken.decimals).mul(prices[markets[i].inputToken.id]).mul(markets[i].isCollateral ? 1 : 0);
            _totalCollateral = _totalCollateral.add(usdValue);
            _adjustedCollateral = _adjustedCollateral.plus(usdValue.mul(markets[i].maximumLTV).div(100));
            _totalDebt = _totalDebt.add(Big(walletBalances[markets[i]._vToken.id]).div(10**markets[i]._vToken.decimals).mul(prices[markets[i].inputToken.id]));
            _totalStableDebt = _totalStableDebt.add(Big(walletBalances[markets[i]._sToken.id]).div(10**markets[i]._sToken.decimals).mul(prices[markets[i].inputToken.id]));
        }
        let availableToIssue = '0'
        if(_adjustedCollateral.sub(_totalDebt).gt(0)){
            availableToIssue = _adjustedCollateral.sub(_totalDebt).toString();
        }

        let debtLimit = Big(0);
        if(_totalCollateral.gt(0)){
            debtLimit = _totalDebt.add(_totalStableDebt).mul(100).div(_totalCollateral);
        }
        return {
            collateral: _totalCollateral.toString(),
            debt: _totalDebt.toString(),
            stableDebt: _totalStableDebt.toString(),
            adjustedCollateral: _adjustedCollateral.toString(),
            availableToIssue,
            debtLimit: debtLimit.toString()
        }
    }

    const supplied = (_selectedPool = selectedPool) => {
        let markets = lendingPools[_selectedPool];
		return markets.reduce((acc: number, market: any) => {
			return acc + (Big(walletBalances[market.outputToken.id] ?? 0).div(10**market.outputToken.decimals).mul(prices[market.inputToken.id] ?? 0).toNumber());
		}, 0);
	}

    const netSupplyAPY = (_selectedPool = selectedPool) => {
        let markets = lendingPools[_selectedPool];
		// sum of all(market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0) * market balance) / sum of all(market balance)
		let sumOfRatesTimesBalance = markets.reduce((acc: number, market: any) => {
			return acc + (market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0) *(Big(walletBalances[market.outputToken.id] ?? 0).div(10**market.outputToken.decimals).mul(prices[market.inputToken.id] ?? 0).toNumber());
		}, 0);
		
		let sumOfBalances = supplied(_selectedPool);

		return sumOfRatesTimesBalance / sumOfBalances;
	}

    // sum of all stable + variable borrows
	const borrowed = (_selectedPool = selectedPool) => {
		let sum = Big(0);
        let markets = lendingPools[_selectedPool];
		markets.forEach((market: any) => {
			sum = sum.plus(Big(walletBalances[market._vToken.id]).mul(prices[market.inputToken.id]).div(10**market._vToken.decimals));
			sum = sum.plus(Big(walletBalances[market._sToken.id]).mul(prices[market.inputToken.id]).div(10**market._sToken.decimals));
		});
		return sum.toNumber();
	}

	const netBorrowAPY = (_selectedPool = selectedPool) => {
		// sum of all(market.rates.filter((rate: any) => rate.side == "BORROWER")[0]?.rate ?? 0) * market balance) / sum of all(market balance)
		let sum = Big(0);
		let sumBalances = borrowed(_selectedPool);
        let markets = lendingPools[_selectedPool];
		markets.forEach((market: any) => {
			sum = sum.plus(Big(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'VARIABLE')[0]?.rate ?? 0).mul(Big(walletBalances[market._vToken.id]).mul(prices[market.inputToken.id]).div(10**market._vToken.decimals)));
			sum = sum.plus(Big(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'STABLE')[0]?.rate ?? 0).mul(Big(walletBalances[market._sToken.id]).mul(prices[market.inputToken.id]).div(10**market._sToken.decimals)));
		})
		return sum.div(sumBalances).toNumber();
	}

    const netAPY = (_selectedPool = selectedPool) => {
        const netSupply = netSupplyAPY(_selectedPool);
        const netBorrow = netBorrowAPY(_selectedPool);
        const _supplied = supplied(_selectedPool);
        const _borrowed = borrowed(_selectedPool);
        return (_supplied * netSupply - _borrowed * netBorrow) / (_supplied + _borrowed);
    }

    return (
        <SyntheticsPositionContext.Provider value={{ poolDebt, position, lendingPosition, netAPY, netBorrowAPY, netSupplyAPY, supplied, borrowed }}>
            {children}
        </SyntheticsPositionContext.Provider>
    );
}

export const useSyntheticsData = () => {
	return React.useContext(SyntheticsPositionContext);
}

export { SyntheticsPositionContext, SyntheticsPositionProvider };