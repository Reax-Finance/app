import React from "react";
import { useAppData } from "./AppDataProvider";
import { usePriceData } from "./PriceContext";
import Big from "big.js";
import { useBalanceData } from "./BalanceProvider";
import { useLendingData } from "./LendingDataProvider";
import { ESYX_PRICE } from "../../src/const";

interface Position {
    collateral: string;
    debt: string;
    adjustedCollateral: string;
    availableToIssue: string;
    debtLimit: string;
    ltv: string;
    liqLtv: string;
}

interface SyntheticsPositionValue {
    poolDebt: () => string;
    position: (_tradingPool: number) => Position;
    lendingPosition: (_tradingPool: number) => Position;
    netAPY: (_tradingPool: number) => number;
    netRewardsAPY: (_tradingPool: number) => number;
    netBorrowAPY: (_tradingPool: number) => number;
    netSupplyAPY: (_tradingPool: number) => number;
    supplied: (_tradingPool: number) => number;
    borrowed: (_tradingPool: number) => number;
}

const SyntheticsPositionContext = React.createContext<SyntheticsPositionValue>({} as SyntheticsPositionValue);

function SyntheticsPositionProvider({ children }: any) {
    const { pools, tradingPool } = useAppData();
    const { pools: lendingPools, protocols: lendingProtocols, positions } = useLendingData();
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
        let _liqCollateral = Big(0);
		let _totalDebt = Big(0);
        const _pool = pools[_tradingPool];
        if(!_pool) return {collateral: '0', debt: '0', adjustedCollateral: '0', availableToIssue: '0', debtLimit: '0', liqLtv: '0', ltv: '0'};
		for (let i = 0; i < _pool.collaterals.length; i++) {
			const usdValue = Big(_pool.collaterals[i].balance ?? 0)
            .div(10 ** _pool.collaterals[i].token.decimals)
            .mul(prices[_pool.collaterals[i].token.id] ?? 0);
            _totalCollateral = _totalCollateral.plus(usdValue);
			_adjustedCollateral = _adjustedCollateral.plus(usdValue.mul(_pool.collaterals[i].baseLTV).div(10000));
            // _liqCollateral = _liqCollateral.plus(usdValue.mul(_pool.collaterals[i].liquidationThreshold).div(10000));
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
            adjustedCollateral: _adjustedCollateral.toString(),
            availableToIssue,
            debtLimit: debtLimit.toString(),
            ltv: _totalCollateral.gt(0) ? _adjustedCollateral.div(_totalCollateral).mul(10000).toString() : 'Infinity',
            liqLtv: '9000'
        }
    }

    const lendingPosition = (_selectedPool: number): Position => {
        if(positions[_selectedPool] && positions[_selectedPool].ltv) {
            return {
                availableToIssue: Big(positions[_selectedPool].availableBorrowsBase).div(10**8).toString(),
                collateral: Big(positions[_selectedPool].totalCollateralBase).div(10**8).toString(),
                debt: Big(positions[_selectedPool].totalDebtBase).div(10**8).toString(),
                debtLimit: Big(positions[_selectedPool].totalCollateralBase).gt(0) ? Big(positions[_selectedPool].totalDebtBase).div(positions[_selectedPool].totalCollateralBase).mul(100).toString(): '0',
                adjustedCollateral: Big(positions[_selectedPool].totalCollateralBase).div(10**8).mul(positions[_selectedPool].ltv).div(10000).toString(),
                ltv: positions[_selectedPool].ltv,
                liqLtv: positions[_selectedPool].liquidationThreshold,
            }
        } else {
            let _totalCollateral = Big(0);
            let _adjustedCollateral = Big(0);
            let _totalDebt = Big(0);
            let markets = lendingPools[_selectedPool];
            if(!markets || markets.length == 0) return {collateral: '0', debt: '0', adjustedCollateral: '0', availableToIssue: '0', debtLimit: '0', ltv: '0', liqLtv: '0'};
            for (let i = 0; i < markets.length; i++) {
                if(!walletBalances[markets[i].outputToken.id] || !prices[markets[i].inputToken.id]) continue;
                const isEMode = markets[i].eModeCategory?.id && (markets[i].eModeCategory?.id == lendingProtocols[_selectedPool].eModeCategory?.id);
                const usdValue = Big(walletBalances[markets[i].outputToken.id]).div(10**markets[i].outputToken.decimals).mul(prices[markets[i].inputToken.id]);
                _totalCollateral = _totalCollateral.add(usdValue);
                _adjustedCollateral = _adjustedCollateral.plus(usdValue.mul(isEMode ? (markets[i].eModeCategory?.ltv ?? 0)/100 : markets[i].maximumLTV).div(100));
                _totalDebt = _totalDebt.add(Big(walletBalances[markets[i]._vToken.id]).div(10**markets[i]._vToken.decimals).mul(prices[markets[i].inputToken.id]));
                _totalDebt = _totalDebt.add(Big(walletBalances[markets[i]._sToken.id]).div(10**markets[i]._sToken.decimals).mul(prices[markets[i].inputToken.id]));
            }
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
                adjustedCollateral: (_adjustedCollateral).toString(),
                availableToIssue: availableToIssue,
                debtLimit: debtLimit.toString(),
                ltv: _totalDebt.gt(0) ? _totalCollateral.div(_totalDebt).mul(10000).toString() : '0',
                liqLtv: '9000'
            }
        }
    }

    const supplied = (_selectedPool: number) => {
        let markets = lendingPools[_selectedPool];
        if(!markets || markets.length == 0) return 0;
		let sum = markets.reduce((acc: number, market: any) => {
			return acc + (Big(walletBalances[market.outputToken.id] ?? 0).div(10**market.outputToken.decimals).mul(prices[market.inputToken.id] ?? 0).toNumber());
		}, 0);
        return sum;
	}

    const netSupplyAPY = (_selectedPool: number) => {
        let markets = lendingPools[_selectedPool];
        if(!markets || markets.length == 0) return 0;
		// sum of all(market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0) * market balance) / sum of all(market balance)
		let sumOfRatesTimesBalance = markets.reduce((acc: number, market: any) => {
			return acc + (market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0) *(Big(walletBalances[market.outputToken.id] ?? 0).div(10**market.outputToken.decimals).mul(prices[market.inputToken.id] ?? 0).toNumber());
		}, 0);
		
		let sumOfBalances = supplied(_selectedPool);
        if(sumOfBalances == 0) return 0;
		return sumOfRatesTimesBalance / sumOfBalances;
	}

    // sum of all stable + variable borrows
	const borrowed = (_selectedPool: number) => {
		let sum = Big(0);
        let markets = lendingPools[_selectedPool];
        if(!markets || markets.length == 0) return 0;
		markets.forEach((market: any) => {
			sum = sum.plus(Big(walletBalances[market._vToken.id] ?? 0).mul(prices[market.inputToken.id] ?? 0).div(10**market._vToken.decimals));
			sum = sum.plus(Big(walletBalances[market._sToken.id] ?? 0).mul(prices[market.inputToken.id] ?? 0).div(10**market._sToken.decimals));
		});
		return sum.toNumber();
	}

	const netBorrowAPY = (_selectedPool: number) => {
		// sum of all(market.rates.filter((rate: any) => rate.side == "BORROWER")[0]?.rate ?? 0) * market balance) / sum of all(market balance)
		let sum = Big(0);
		let sumBalances = borrowed(_selectedPool);
        let markets = lendingPools[_selectedPool];
        if(!markets || markets.length == 0) return 0;
		markets.forEach((market: any) => {
			sum = sum.plus(Big(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'VARIABLE')[0]?.rate ?? 0).mul(Big(walletBalances[market._vToken.id] ?? 0).mul(prices[market.inputToken.id] ?? 0).div(10**market._vToken.decimals)));
			sum = sum.plus(Big(market.rates.filter((rate: any) => rate.side == "BORROWER" && rate.type == 'STABLE')[0]?.rate ?? 0).mul(Big(walletBalances[market._sToken.id] ?? 0).mul(prices[market.inputToken.id] ?? 0).div(10**market._sToken.decimals)));
		})
        if(sumBalances == 0) return 0;
		return sum.div(sumBalances).toNumber();
	}

    const rewardAPY = (market: any, side = "DEPOSIT", type = "VARIABLE") => {
		let index = market.rewardTokens.map((token: any) => token.id.split('-')[0] == side && token.id.split('-')[1] == type).indexOf(true);
		if(index == -1) return '0';
        let total = Number(side == "DEPOSIT" ? market.totalDepositBalanceUSD : market.totalBorrowBalanceUSD);
		if(total == 0) return '0';
		return Big(market.rewardTokenEmissionsAmount[index])
			.div(1e18)
			.mul(365 * ESYX_PRICE)
			.div(total)
			.mul(100)
			.toFixed(2);
	}

    const netSupplyRewardsAPY = (_selectedPool: number) => {
        let markets = lendingPools[_selectedPool];
        if(!markets || markets.length == 0) return 0;
        // sum of all(market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0) * market balance) / sum of all(market balance)
        let sumOfRatesTimesBalance = markets.reduce((acc: number, market: any) => {
            return acc + Number(rewardAPY(market)) * (Big(walletBalances[market.outputToken.id] ?? 0).div(10**market.outputToken.decimals).mul(prices[market.inputToken.id] ?? 0).toNumber());
        }, 0)
		let sumOfBalances = supplied(_selectedPool);
        if(sumOfBalances == 0) return 0;
		return sumOfRatesTimesBalance / sumOfBalances;
    }

    const netBorrowRewardsAPY = (_selectedPool: number) => {
        let markets = lendingPools[_selectedPool];
        if(!markets || markets.length == 0) return 0;
        // sum of all(market.rates.filter((rate: any) => rate.side == "LENDER")[0]?.rate ?? 0) * market balance) / sum of all(market balance)
        let sumOfRatesTimesBalance = markets.reduce((acc: number, market: any) => {
            return acc + Number(rewardAPY(market, "BORROW", "VARIABLE")) * (Big(walletBalances[market._vToken.id] ?? 0).div(10**market._vToken.decimals).mul(prices[market.inputToken.id] ?? 0).toNumber()) + Number(rewardAPY(market, "BORROW", "STABLE")) * (Big(walletBalances[market._sToken.id] ?? 0).div(10**market._sToken.decimals).mul(prices[market.inputToken.id] ?? 0).toNumber());
        }, 0)
        let sumOfBalances = borrowed(_selectedPool);
        if(sumOfBalances == 0) return 0;
        return sumOfRatesTimesBalance / sumOfBalances;
    }

    const netRewardsAPY = (_selectedPool: number) => {
        const netSupply = netSupplyRewardsAPY(_selectedPool);
        const netBorrow = netBorrowRewardsAPY(_selectedPool);
        const _supplied = supplied(_selectedPool);
        const _borrowed = borrowed(_selectedPool);
        if(_supplied == 0 && _borrowed == 0) return 0;
        return (_supplied * netSupply + _borrowed * netBorrow) / (_supplied + _borrowed);
    }

    const netAPY = (_selectedPool: number) => {
        const netSupply = netSupplyAPY(_selectedPool);
        const netBorrow = netBorrowAPY(_selectedPool);
        const _supplied = supplied(_selectedPool);
        const _borrowed = borrowed(_selectedPool);
        if(_supplied == 0 && _borrowed == 0) return 0;
        return (_supplied * netSupply - _borrowed * netBorrow) / (_supplied + _borrowed);
    }

    return (
        <SyntheticsPositionContext.Provider value={{ netRewardsAPY, poolDebt, position, lendingPosition, netAPY, netBorrowAPY, netSupplyAPY, supplied, borrowed }}>
            {children}
        </SyntheticsPositionContext.Provider>
    );
}

export const useSyntheticsData = () => {
	return React.useContext(SyntheticsPositionContext);
}

export { SyntheticsPositionContext, SyntheticsPositionProvider };
