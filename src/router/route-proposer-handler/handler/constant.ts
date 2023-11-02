import { WETH_ADDRESS, defaultChain } from "../../../const";
import { IConstantPrices } from "../utils/types";
require("dotenv").config();






export const constantPrice: IConstantPrices = {
    "0x86fb905bd14923fd66a5353d2cda955564ddb9aa": "1700",
    "0xbe28691f9032333076f64e8cbd18beebd84dfc01": "1",
    "0x1561ccba861ee39552da5d703b629b1b23ee1899": '1',
    "0x10736f742c810be853ff30d8a0a238112875f23b": '1',
    "0xc5463c3e462e730a7bf625569e96dd275d136d2d": '1700',
    // "0x186423bfe65426534814ad90ff6fad85e8523fe2": "0.000000000000000385185988877491",
    // "0x1f8f5a97082224b87320f3cea41fbe25dd35d1c2":"0.000000000000000389037848766224",
    "0x62959ad021402f48d0d8067bc5c4c03f63fceaa4": "1"

}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// export const MANTLE_TOKEN_ADDRESS = process.env.NATIVE_WRAPPED_TOKEN_ADDRESS!;
export const MANTLE_TOKEN_ADDRESS = WETH_ADDRESS(defaultChain.id);
export const MAX_LIMIT = "57896044618658097711785492504343953926634992332820282019728792003956564819967";
