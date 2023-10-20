import * as React from "react";
import axios from "axios";
import { ADDRESS_ZERO, FACTORY, PERP_PAIRS, POOL, defaultChain } from '../../src/const';
import { useAccount, useNetwork } from "wagmi";
import { __chains } from "../../pages/_app";
import { Status } from "../utils/status";
import { POSITIONS_ENDPOINT, query_positions } from "../../src/queries/perps";
import { ethers } from "ethers";
import { getABI, getAddress } from "../../src/contract";

interface PerpsDataValue {
	positions: any[];
	status: Status;
	message: string;

	fetchData: (
		_address?: string
	) => Promise<number>;
	addPosition: (address: any) => void;
}

const PerpsDataContext = React.createContext<PerpsDataValue>({} as PerpsDataValue);

function PerpsDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<PerpsDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<PerpsDataValue['message']>("");

	const { chain } = useNetwork();
	const [positions, setPositions] = React.useState<any[]>([]);

	const fetchData = (_address?: string): Promise<number> => {
		let chainId = chain?.id ?? defaultChain.id;
		if(chain?.unsupported) chainId = defaultChain.id;
		console.log("Fetching positions for", chainId, _address);
		return new Promise((resolve, reject) => {
			setStatus(Status.FETCHING);
			const endpoint = POSITIONS_ENDPOINT(chainId)
			if(!_address) _address = ADDRESS_ZERO;
			Promise.all([
				axios.post(endpoint, {
					query: query_positions(_address?.toLowerCase()),
					variables: {},
				})
			])
				.then(async (res) => {
					if (res[0].data.errors) {
						setStatus(Status.ERROR);
						setMessage("Network Error. Please refresh the page or try again later.");
						reject(res[0].data.errors);
					} else {
						let _positions = res[0].data.data.user?.positions ?? [];
						const requestPositionData = [];
						https://perps-position-testnet.reax.one/positions?userId=0xb2e2436a6d705d469cc45cadb77cb56032849299&lendingPool=reaxCryptoLending
						getAndSetPositionData(_positions, _address!)
					}
				})
				.catch((err) => {
					setStatus(Status.ERROR);
				});
		});
	};

	const getAndSetPositionData = async (_positions: any[], _address: string) => {
		let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		let multicall = new ethers.Contract(getAddress("Multicall2", defaultChain.id), getABI("Multicall2", defaultChain.id), provider);
		let factory = new ethers.Contract(FACTORY, getABI('PerpFactory', defaultChain.id), provider);
		let calls = [];
		calls.push([factory.address, factory.interface.encodeFunctionData("getPositionAddress", [_address, _positions.length])]);
		multicall.callStatic.aggregate(calls)
			.then((results: any) => {
				// results.returnData[0]: bytes to address
				_positions.push({
					id: results.returnData[0].toLowerCase().replace("0x000000000000000000000000", "0x"),
					factory: {
						id: FACTORY,
						lendingPool: POOL
					}
				})
				setPositions(_positions);
				setStatus(Status.SUCCESS);
			})
			.catch((err: any) => {
				console.log(err);
			})
	}

	const addPosition = (
		address: string
	) => {
		
	};

	const value: PerpsDataValue = {
        positions,
        status,
        message,
        addPosition,
        fetchData
    };

	return (
		<PerpsDataContext.Provider value={value}>
			{children}
		</PerpsDataContext.Provider>
	);
}

export const usePerpsData = () => {
	return React.useContext(PerpsDataContext);
}

export { PerpsDataProvider, PerpsDataContext };