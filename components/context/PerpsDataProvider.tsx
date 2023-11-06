import * as React from "react";
import axios from "axios";
import { ADDRESS_ZERO, POOL, defaultChain } from '../../src/const';
import { useAccount, useNetwork } from "wagmi";
import { __chains } from "../../pages/_app";
import { Status } from "../utils/status";
import { POSITIONS_ENDPOINT, query_positions } from "../../src/queries/perps";
import { ethers } from "ethers";
import { getABI, getAddress, getContract } from "../../src/contract";
import { useLendingData } from "./LendingDataProvider";
import Big from "big.js";

interface PerpsDataValue {
	vaults: any[];
	status: Status;
	message: string;
	fetchData: (
		_address?: string
	) => Promise<number>;
	pairs: any;
	closedPositions: any[];
	openPositions: any[];
	history: any[];
	updateFromTx: (_address: string, tx: any, prices: any, tokens: any[]) => Promise<any[]>;
}

const PerpsDataContext = React.createContext<PerpsDataValue>({} as PerpsDataValue);

function PerpsDataProvider({ children }: any) {
	const [status, setStatus] = React.useState<PerpsDataValue['status']>(Status.NOT_FETCHING);
	const [message, setMessage] = React.useState<PerpsDataValue['message']>("");
	const [pairs, setPairs] = React.useState<any>({});
	const [history, setHistory] = React.useState<any[]>([]);

	const { chain } = useNetwork();
	const [ openPositions, setOpenPositions ] = React.useState<any[]>([]);
	const [ closedPositions, setClosedPositions ] = React.useState<any[]>([]);
	const [ vaults, setVaults ] = React.useState<any[]>([]);

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
						let _vaults = res[0].data.data.user?.positions ?? [];
						getAndSetPositionData(_vaults, _address!, res[1].data.data[Object.keys(res[1].data.data)[0]].perpFactory);
					}
				})
				.catch((err) => {
					console.log(err);
					setStatus(Status.ERROR);
				});
		});
	};

	const getAndSetPositionData = async (_vaults: any[], _address: string, FACTORY: string) => {
		console.log("Getting position data");
		let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
		let multicall = new ethers.Contract(getAddress("Multicall2", defaultChain.id), getABI("Multicall2", defaultChain.id), provider);
		let factory = new ethers.Contract(FACTORY, getABI('PerpFactory', defaultChain.id), provider);
		let calls: any[] = [];
		calls.push([factory.address, factory.interface.encodeFunctionData("getPositionAddress", [_address, _vaults.length])]);

		let requests = _vaults.map(
			(position: any) => axios.get(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/margin/positions?position=${position.id}&lendingPool=0x2b254761b439d3a5300be16d13aa5aac07354d0f`)
		).concat(
			axios.get(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/margin/history?userId=${_address.toLowerCase()}&lendingPool=0x2b254761b439d3a5300be16d13aa5aac07354d0f`)
		).concat(
			multicall.callStatic.aggregate(calls)
		);
		
		Promise.all(requests)
			.then((results: any) => {
				console.log("Got position data", results);
				// second last request is history
				// console.log(results[results.length - 2].data.data.reverse());
				setHistory(results[results.length - 2].data.data.reverse());
				// last request is multicall
				_vaults.push({
					id: results[results.length - 1].returnData[0].toLowerCase().replace("0x000000000000000000000000", "0x"),
					factory: {
						id: FACTORY.toLowerCase(),
						lendingPool: POOL.toLowerCase()
					}
				});

				console.log("Positions", _vaults, results);

				let openPositions: any[] = [];
				let closedPositions: any[] = [];

				for(let i in _vaults){
					for(let j in results[i]?.data?.data){
						// push last element into open
						if(results[i]?.data?.data[j].timestampClosed === null){
							openPositions.push({...results[i]?.data?.data[j], ..._vaults[i]})
						} else if(results[i]?.data?.data[j].timestampClosed) {
							// else push in closed
							closedPositions.push({...results[i]?.data?.data[j], ..._vaults[i]})
						}
					}
				}

				console.log("Open positions", openPositions);
				console.log("Closed positions", closedPositions);
				console.log("Vaults", closedPositions);
				setOpenPositions(openPositions);
				setClosedPositions(closedPositions);
				setVaults(_vaults);
				setStatus(Status.SUCCESS);
			})
			.catch((err: any) => {
				console.log("Failed to fetch position data", err);
			})
	}

	const updateFromTx = async (_address: string, tx: any, prices: any, tokens: any) => {
		const LendingPoolItf = new ethers.utils.Interface(getABI("LendingPool", chain?.id!));
		const PerpFactoryItf = new ethers.utils.Interface(getABI("PerpFactory", chain?.id!));
		const PerpPositionItf = new ethers.utils.Interface(getABI("PerpPosition", chain?.id!));
		let _vaults = JSON.parse(JSON.stringify(vaults));

		// for all: parse deposit, withdraw, borrow, repay into history
		let events: any[] = tx.events.filter((event: any) => event.topics[0] === LendingPoolItf.getEventTopic("Supply")).map((event: any) => LendingPoolItf.parseLog(event));
		events = events.concat(tx.events.filter((event: any) => event.topics[0] === LendingPoolItf.getEventTopic("Withdraw")).map((event: any) => LendingPoolItf.parseLog(event)));
		events = events.concat(tx.events.filter((event: any) => event.topics[0] === LendingPoolItf.getEventTopic("Borrow")).map((event: any) => LendingPoolItf.parseLog(event)));
		events = events.concat(tx.events.filter((event: any) => event.topics[0] === LendingPoolItf.getEventTopic("Repay")).map((event: any) => LendingPoolItf.parseLog(event)));

		let _history: any[] = [];
		for(let i in events){
			const token = tokens.find((token: any) => token.id.toLowerCase() === events[i].args[0].toLowerCase());
			_history.push({
				action: events[i].name.toLowerCase(),
				amount: events[i].args.amount.toString(),
				amountUSD: Big(events[i].args.amount.toString()).mul(prices[events[i].args[0].toLowerCase()] ?? 0).div(10**(token?.decimals || 18)).toString(),
				tokenAddress: events[i].args[0].toLowerCase(),
				tokenSymbol: token?.symbol,
				hash: tx.hash,
				logIndex: 0,
				timestamp: tx.timestamp ?? Date.now() / 1000,
				vault: events[i].args[1].toLowerCase(),
			})
		}
		_history = history.concat(_history);
		setHistory(_history);
		
		// create position: get next position address
		const createEvents = tx.events.filter((event: any) => event.topics[0] === PerpFactoryItf.getEventTopic("PositionCreated")).map((event: any) => PerpFactoryItf.parseLog(event));
		if(createEvents.length > 0){
			let provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrls.default.http[0]);
			let multicall = new ethers.Contract(getAddress("Multicall2", defaultChain.id), getABI("Multicall2", defaultChain.id), provider);
			const FACTORY = _vaults[_vaults.length - 1].factory.id;
			let factory = new ethers.Contract(FACTORY, getABI('PerpFactory', defaultChain.id), provider);
			try{
				const res = await multicall.callStatic.aggregate([[factory.address, factory.interface.encodeFunctionData("getPositionAddress(address,uint256)", [_address, _vaults.length])]]);
				_vaults = _vaults.concat({id: res.returnData[0].toLowerCase().replace("0x000000000000000000000000", "0x"), factory: _vaults[_vaults.length - 1].factory});
			} catch (err) {
				console.log(err);
			}
			setVaults(_vaults);
		}

		// open positions; if not already in open, add to open
		let openEvents = tx.events.filter((event: any) => event.topics[0] === PerpPositionItf.getEventTopic("OpenPosition")).map((event: any) => ({id: event.address.toLowerCase(), data: PerpPositionItf.parseLog(event)}));
		const _openPositions = JSON.parse(JSON.stringify(openPositions));
		for(let i in openEvents){
			if(!_openPositions.find((position: any) => position.id === openEvents[i].id)){
				const vault = _vaults.find((vault: any) => vault.id === openEvents[i].id);
				_openPositions.push(vault);
			}
		}
		setOpenPositions(_openPositions);
		return _vaults;
	}

	console.log(openPositions);

	const value: PerpsDataValue = {
        vaults,
        status,
        message,
        fetchData,
		pairs,
		openPositions,
		closedPositions,
		history,
		updateFromTx,
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