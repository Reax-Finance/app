import {promises as fs} from "fs";
import path from "path";

export async function getABI(name:string) {
    try{
        const abi = (JSON.parse((await (fs.readFile(path.join(__dirname+"/abi.json")))).toString()))[name];
        return abi
    }
    catch(error){
        console.log(`Error @ getABI`, error)
    }
}
