export interface IPriceData {
  [key: string]: [string, string, number]
}

export interface ISupplyData {
  pools: ISupplyPoolData[]
}

export interface ISupplyPoolData {
  id: string,
  totalSupply: string,
  synths: ISupplySynthData[]
}
export interface ISupplySynthData {
  id: string,
  totalSupply: string,
  token: {
    decimals: number
  }
}

export interface IPosition {
  pool: {
    id: string
  },
  balance: string
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