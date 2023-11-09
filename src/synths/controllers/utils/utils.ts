import {promises as fs} from "fs";
import path from "path";
import { RPC } from "./constant";
import { ethers } from "ethers";

import * as sentry from "@sentry/node";
import log from "../../config/logger";

export async function getABI(name:string) {
    try{
        const abi = (JSON.parse((await (fs.readFile(path.join(__dirname+"/../../../../src/synths/abi/ABI.json")))).toString()))[name];
        return abi
    }
    catch(error){
        sentry.captureException(error);
        log.error(`${error} - ${__filename}`);
    }
}

export function provider(chainId: string) {
    const rpc = RPC[chainId];
    if (!rpc) return null;
    return new ethers.providers.JsonRpcProvider(rpc);
}

import { IErrorResponse, IMessageResponse } from "./types";

export function errorResponse(error: any, statusCode: number = 400): IErrorResponse {
  return { status: false, error, statusCode };
}

export function messageResponse(message: string, statusCode: number, data: any): IMessageResponse {
  return { status: true, message, statusCode };
}

export function errorStackTrace(error: any) {
  log.error(`${error} - ${error.stack.split('\n')[1].slice(7)}`);
}