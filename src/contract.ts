import { BigNumber, ethers } from 'ethers';

export function call(contract: ethers.Contract, method: string, params: any[]) {
  return contract[method](...params);
}

export function send(contract: ethers.Contract, method: string, params: any[], value = '0') {
  if(!window.ethereum) throw new Error("No ethereum provider found");
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  return contract.connect(provider.getSigner())[method](...params, {value: value});
}

export function estimateGas(contract: ethers.Contract, method: string, params: any[], value = '0') {
  return contract.estimateGas[method](...params, {value: value});
}