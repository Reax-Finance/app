import * as React from "react";
import axios from "axios";
import { ADDRESS_ZERO, POOL, defaultChain } from '../../src/const';
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
	pairs: any;
	closedPositions: any[];
}

const PerpsDataContext = React.createContext<PerpsDataValue>({} as PerpsDataValue);

function PerpsDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<PerpsDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<PerpsDataValue['message']>("");
	const [pairs, setPairs] = React.useState<any>({});

	const { chain } = useNetwork();
	const [positions, setPositions] = React.useState<any[]>([]);
	const [closedPositions, setClosedPositions] = React.useState<any[]>([]);

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
				}),
				axios.get(process.env.NEXT_PUBLIC_VERCEL_URL + "/api/margin/pairs?lendingPool=0x2b254761b439d3a5300be16d13aa5aac07354d0f")
			])
				.then(async (res) => {

					if (res[0].data.errors) {
						setStatus(Status.ERROR);
						setMessage("Network Error. Please refresh the page or try again later.");
						reject(res[0].data.errors);
					} else {
						setPairs(res[1].data.data);
						let _positions = res[0].data.data.user?.positions ?? [];
						console.log(_positions);
						getAndSetPositionData(_positions, _address!, res[1].data.data[Object.keys(res[1].data.data)[0]].perpFactory);
					}
				})
				.catch((err) => {
					console.log(err);
					setStatus(Status.ERROR);
				});
		});
	};

	const getAndSetPositionData = async (_positions: any[], _address: string, FACTORY: string) => {
		console.log("Getting position data");
		let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		let multicall = new ethers.Contract(getAddress("Multicall2", defaultChain.id), getABI("Multicall2", defaultChain.id), provider);
		let factory = new ethers.Contract(FACTORY, getABI('PerpFactory', defaultChain.id), provider);
		let calls = [];
		calls.push([factory.address, factory.interface.encodeFunctionData("getPositionAddress", [_address, _positions.length])]);

		let requests = _positions.map(
			(position: any) => axios.get(process.env.NEXT_PUBLIC_VERCEL_URL + `/api/margin/positions?position=${position.id}&lendingPool=0x2b254761b439d3a5300be16d13aa5aac07354d0f`)
		).concat(multicall.callStatic.aggregate(calls));
		
		
		Promise.all(requests)
			.then((results: any) => {
				console.log("Got position data", results);
				// results.returnData[0]: bytes to address
				_positions.push({
					id: results[results.length - 1].returnData[0].toLowerCase().replace("0x000000000000000000000000", "0x"),
					factory: {
						id: FACTORY,
						lendingPool: POOL
					}
				});

				console.log("Positions", _positions, results);

				let openPositions = [];
				let closedPositions = [];

				for(let i in _positions){
					for(let j in results[i]?.data?.data){
						// push last element into open
						if(results[i]?.data?.data[j].timestampClosed == null){
							openPositions.push({...results[i]?.data?.data[j], ..._positions[i]})
						} else {
							// else push in closed
							closedPositions.push({...results[i]?.data?.data[j], ..._positions[i]})
						}
					}
				}

				openPositions.push(_positions[_positions.length - 1])


				console.log("Open positions", openPositions);
				console.log("Closed positions", closedPositions);
				setPositions(openPositions);
				setClosedPositions(closedPositions)
				setStatus(Status.SUCCESS);
			})
			.catch((err: any) => {
				console.log("Failed to fetch position data", err);
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
        fetchData,
		pairs,
		closedPositions
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