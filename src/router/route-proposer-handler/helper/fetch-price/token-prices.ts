import axios from "axios";
import { PRICE_ENDPOINT } from "../../../../const";









let priceData: any = {};


async function updatePrice() {
    try {
        let data
        try {
            data = await axios.get(`${PRICE_ENDPOINT}/get_all_prices`);
        }
        catch (error) {
            console.log(`Error @ call axios updatePrice: ${error}`);
            return
        }
        priceData = data.data.data;
    }
    catch (error) {
        console.log(`Error @ updatePrice: Error: ${error}`)
    }
}

export function getPrices(adsress: string) {
    return priceData[adsress] ? Number(priceData[adsress][0]) : undefined;
}

export async function startUpdatePrice() {
    try {
        await updatePrice()
        setInterval(() => {
            updatePrice()
        },5000);
    }
    catch (error) {
        console.log(`Error @ startUpdatePrice: ${error}`)
    }
}