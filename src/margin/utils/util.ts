import log from "../config/logger";
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