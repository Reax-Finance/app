import { ethers } from 'ethers';
import { defaultChain } from './const';

export function getABI(contractName: string) {
  const artifact = require(`../out/${contractName}.sol/${contractName}.json`);
  if(!artifact?.abi) throw new Error("ABI not found: "+contractName);

  return artifact.abi;
}

export function getContract(contractName: string, address: string) {
  if(!(window as any).ethereum) throw new Error("Wallet not connected");
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  let contract = new ethers.Contract(address!, getABI(contractName), provider);
  return contract;
}

export function call(contract: ethers.Contract, method: string, params: any[]) {
  return contract[method](...params);
}

export function send(contract: ethers.Contract, method: string, params: any[], value = '0') {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  return contract.connect(provider.getSigner())[method](...params, {value: value});
}

export function estimateGas(contract: ethers.Contract, method: string, params: any[], value = '0') {
  return contract.estimateGas[method](...params, {value: value});
}