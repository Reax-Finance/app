import React, { useEffect, useState } from "react";
import {
	Tabs,
	Text,
	Image,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Flex,
	useDisclosure,
	Box,
	Button,
    Divider,
    Select,
    useToast,
    Link,
	useColorMode,
} from "@chakra-ui/react";

import {
	NumberInput,
	NumberInputField
} from "@chakra-ui/react";
import SelectBody from "../../swap/SelectBody";
import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork, useSignTypedData } from "wagmi";
import { useBalanceData } from "../../context/BalanceProvider";
import TokenSelector from "../TokenSelector";
import router from "next/router";
import { AiOutlineDownSquare } from "react-icons/ai";
import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from "@chakra-ui/react";
import { usePriceData } from "../../context/PriceContext";
import { EIP712_VERSION, ESYX_PRICE, FACTORY, PERP_PAIRS, POOL, defaultChain, dollarFormatter, tokenFormatter } from "../../../src/const";
import { usePerpsData } from "../../context/PerpsDataProvider";
import { getABI, getContract, send } from "../../../src/contract";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import Big from "big.js";
import useHandleError, { PlatformType } from "../../utils/useHandleError";
import useUpdateData from "../../utils/useUpdateData";
import { useLendingData } from "../../context/LendingDataProvider";
import { formatInput, parseInput } from "../../utils/number";
import { VARIANT } from "../../../styles/theme";
import Long from "./Long";
import Short from "./Short";

const labelStyles = {
	mt: "2",
	ml: "-2.5",
	fontSize: "sm",
};

export default function Trade() {
	const [inAssetIndex, setInAssetIndex] = React.useState(6);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const onInputTokenSelected = (i: number) => {
		setInAssetIndex(i);
	};

	const { colorMode } = useColorMode();

	return (
		<>
			<Tabs variant={"enclosed"}>
				<TabList className={VARIANT + "-" + colorMode + "-" + "containerHeader"}>
					<Tab
						w={"50%"}
						_selected={{
							color: "primary.400",
							borderColor: "primary.400",
						}}
						rounded={0}
						borderTop={0}
						borderX={0}
						p={3}
						fontWeight={'medium'}
					>
						Long
					</Tab>
                    <Divider orientation="vertical" h={'40px'} />
					<Tab
						w={"50%"}
						_selected={{
							color: "secondary.400",
							borderColor: "secondary.400",
						}}
						rounded={0}
						borderTop={0}
						borderX={0}
					>
						Short
					</Tab>
				</TabList>

				<TabPanels>
					<Long />
					<Short />
				</TabPanels>
			</Tabs>

			
		</>
	);
}
