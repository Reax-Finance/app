export const positionQuery = function (userId: string) {

  return `
  {
    account(id: "${userId}") {
      
      positions(orderBy: blockNumberOpened, orderDirection: asc) {
        id
        combinedPosition
        balance
        blockNumberClosed
        blockNumberOpened
        timestampOpened
        timestampClosed
        side
        borrows {
          amount
          amountUSD
          logIndex
          timestamp
          market {
            id
            liquidationThreshold
            maximumLTV
            totalDepositBalanceUSD
            totalBorrowBalanceUSD
            inputTokenBalance
            _sToken {
              id
            }
            _vToken {
              id
            }
            inputToken {
              id
              name
              symbol
              decimals
            }
            outputToken {
              id
            }
          }
        }
        deposits {
          amount
          amountUSD
          logIndex
          timestamp
          market {
            id
            liquidationThreshold
            maximumLTV
            totalDepositBalanceUSD
            totalBorrowBalanceUSD
            inputTokenBalance
            _sToken {
              id
            }
            _vToken {
              id
            }
            inputToken {
              id
              name
              symbol
              decimals
            }
            outputToken {
              id
            }
          }
        }
        repays {
          amount
          amountUSD
          logIndex
          timestamp
        }
        withdraws {
          amount
          amountUSD
          logIndex
          timestamp
        }
        liquidations {
          amount
          amountUSD
          profitUSD
          logIndex
          timestamp
        }
      }
    }
  }
  `
}

export function pairQuery(positionId: string) {
  return `
  {
    position(id: "${positionId}") {
      openPositions {
        amountUSD
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      closePositions {
        amountUSD
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
  }
  `
}

export function marketsQuery() {
  return `
  {
    markets(where: {canBorrowFrom: true, canUseAsCollateral: true}) {
      maximumLTV
      liquidationThreshold
      totalDepositBalanceUSD
      totalBorrowBalanceUSD
      inputTokenBalance
      _sToken {
        id
      }
      _vToken {
        id
      }
      inputToken {
        id
        name
        symbol
        decimals
      }
      outputToken {
        id
      }
    }
  }
  `
}

export function userPositionQuery(userId: string){
  return `
  {
    user(id: "${userId}") {
      positions {
        id
        factory {
          id
          lendingPool
        }
      }
    }
  }
  `
}