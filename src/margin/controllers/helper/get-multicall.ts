import { ethers } from 'ethers';
import { getAbi } from './get-abi';
import { provider } from './utils';
import * as sentry from '@sentry/node';
import { MULTICALL_ADDRESS } from '../../utils/constant';
import log from '../../config/logger';
import { CHAIN_ID } from '../../utils/secrets';

export async function getMulticall(): Promise<ethers.Contract | null> {
  try {
    const chainId = CHAIN_ID;
    const multicallAbi = await getAbi('Multicall2');
    const _provider = provider(chainId);
    const multicallAddress = MULTICALL_ADDRESS[chainId];
    const multicall = new ethers.Contract(multicallAddress, multicallAbi, _provider);
    return multicall;
  } catch (error) {
    sentry.captureException(error);
    log.error(`${error} - ${__filename}`);
    return null;
  }
}
