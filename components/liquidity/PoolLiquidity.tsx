import {
	Box,
	useDisclosure,
	Text,
	Flex,
	Link,
	useColorMode,
	Heading,
	Divider,
    Image,
} from "@chakra-ui/react";
import React from "react";
import { VARIANT } from "../../styles/theme";
import {
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { useAppData } from "../context/AppDataProvider";
import Big from "big.js";
import { PoolStat } from "./PoolPosition";
import { IoIosWater } from "react-icons/io";
import { ONE_ETH, dollarFormatter } from "../../src/const";

const COLORS = [
	"#ff631b2e",
	"#933D15ae",
	"#FFBB28ae",
	"#FF8042ae",
	"#BB7F20ae",
	"#FFC871ae",
];

const RADIAN = Math.PI / 180;

export default function PoolLiquidity() {
	const { colorMode } = useColorMode();
	const { liquidityData } = useAppData();

	const data =
		liquidityData?.synths.map((synth) => {
			return {
				name: synth.symbol,
				value: Big(synth.totalSupply.toString())
					.mul(synth.price.toString())
					.div(1e24)
					.toNumber(),
			};
		}) || [];

	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percent,
		index,
	}: any) => {
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);
		if (percent < 0.05) return <></>;
		return (
			<text
				x={x}
				y={y}
				fill="white"
				textAnchor={x > cx ? "start" : "end"}
				dominantBaseline="central"
				fontSize={"12px"}
			>
				{data[index].name} ({`${(percent * 100).toFixed(0)}%`})
			</text>
		);
	};

	return (
		<Box p={4}>
			<Flex justify={"space-between"}>
				<Flex gap={2} align={"center"}>
					<Heading size={"sm"}>Pool Liquidity</Heading>
				</Flex>
			</Flex>
			<Divider mt={2} />
            <Flex flexDir={'column'} gap={1} mt={4}>
                <PoolStat icon={<IoIosWater />} title={'Total Liquidity'} value={dollarFormatter.format(Big(liquidityData?.totalDebtUSD?.toString() || '0').div(ONE_ETH).toNumber())} />
                <Box className={`${VARIANT}-${colorMode}-containerBody2`}>
                    <PoolStat icon={<Image src="/icons/rLP.svg" w={'25px'} rounded={'full'} />} title={'rLP Composition'} value={
                        dollarFormatter.format(Big(liquidityData?.lpToken?.price?.toString() || 0).div(ONE_ETH).toNumber()) + " / rLP"  
                    } />
                    <PieChart width={250} height={200}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#933D15"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>

                    {/* <Text fontSize={'sm'} color={'gray.500'} textAlign={'center'}>rLP Composition</Text> */}
                </Box>

            </Flex>

		</Box>
	);
}
