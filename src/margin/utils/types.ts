export type ITokenData = Record<string, [string, string, number]>;

export interface IPosition {
  id: string
  combinedPosition: number
  balance: string
  blockNumberClosed: string
  blockNumberOpened: string
  timestampOpened: string
  timestampClosed: string | null
  side: SIDE
  borrows: [
    {
      amount: string
      amountUSD: string
      logIndex: number
      timestamp: string
      market: IMarket
    }
  ]
  deposits: [
    {
      amount: string
      amountUSD: string
      logIndex: number
      timestamp: string
      market: IMarket
    }
  ]
  repays: [
    {
      amount: string
      amountUSD: string
      logIndex: number
      timestamp: string
    }
  ]
  withdraws: [
    {
      amount: string
      amountUSD: string
      logIndex: number
      timestamp: string
    }
  ]
  liquidations: [
    {
      amount: string
      amountUSD: string
      profitUSD: string
      logIndex: number
      timestamp: string
    }
  ]
}

export interface IMarket {
  id: string
  liquidationThreshold: string
  maximumLTV: string
  totalDepositBalanceUSD: string
  totalBorrowBalanceUSD: string
  inputTokenBalance: string
  _sToken: {
    id: string
  }
  _vToken: {
    id: string
  }
  inputToken: {
    id: string
    symbol: string
    name: string
    decimals: string
  }
  outputToken: {
    id: string
  }
}

export interface IBalance {
  id: string
  aToken: {
    id: string
    balance: string
  }
  vToken: {
    id: string
    balance: string
  }
  sToken: {
    id: string
    balance: string
  }
}

export interface IPairPosition {
  openPositions: IOpenPositions[]
  closePositions: IClosePositions[]
}

export interface IOpenPositions {
  id: string
  amountUSD: string
  token0: {
    id: string
    symbol: string
  }
  token1: {
    id: string
    symbol: string
  }
}

export interface IClosePositions {
  id: string
  amountUSD: string
  token0: {
    id: string
    symbol: string
  }
  token1: {
    id: string
    symbol: string
  }
}

export enum SIDE {
  LENDER = 'LENDER',
  BORROWER = 'BORROWER'
}

export interface IErrorResponse {
  status: boolean;
  error: string;
  statusCode: number;
}

export interface IMessageResponse {
  status: boolean;
  message: string;
  statusCode: number;
}

export enum POSITION_SIDE {
  LONG = 'long',
  SHORT = 'short'
}

export interface IPairResponse {
  long: {
    maxLeverage: string;
    liquidity: string;
  };
  short: {
    maxLeverage: string;
    liquidity: string;
  };
  token0: {
    id: string;
    symbol: string;
    name: string;
    decimals: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
    decimals: string;
  };
  perpFactory: string;
}

export interface IHistory {
  action: string;
  tokenAddress: string;
  tokenSymbol: string;
  amountUSD: string;
  amount: string;
  timestamp: string;
  logIndex: number;
  combinedPosition: number;
  vault: string;
}

export interface IFetchUserPosition {
  id: string;
  factory: {
    id: string;
    lendingPool: string;
  }
}