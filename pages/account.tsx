import Head from "next/head";
import { useAccount, useBalance } from "wagmi";
import Title from "../components/account/title";
import ConnectBox from "../components/account/connect";
import Portfolio from "../components/account/portfolio";

export default function Account() {
	const { address } = useAccount();

	return (
		<>
			<Head>
				<title>Account | REAX</title>
				<link rel="icon" type="image/x-icon" href="/REAX.svg"></link>
			</Head>

			{address ? <>
				<Title/>
				<Portfolio/>
			 </>: <>
				<ConnectBox/>
			</>}
			
		</>
	);
}
