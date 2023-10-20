import React, { useEffect, useState } from "react";
import {
	Tabs,
	TabList,
	TabPanels,
	Tab,
    Divider,
	useColorMode,
} from "@chakra-ui/react";
import { VARIANT } from "../../../styles/theme";
import Long from "./Long";
import Short from "./Short";

export default function Trade() {
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
