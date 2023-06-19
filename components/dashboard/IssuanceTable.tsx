import React from "react";
import { useContext } from "react";

import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	TableContainer,
	Flex,
	Box,
	Heading,
	Text,
	Tfoot
} from "@chakra-ui/react";
import { AppDataContext } from "../context/AppDataProvider";
import {
	Pagination,
	usePagination,
	PaginationNext,
	PaginationPage,
	PaginationPrevious,
	PaginationContainer,
	PaginationPageGroup,
} from "@ajna/pagination";

import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { Skeleton } from "@chakra-ui/react";
import Debt from "../modals/debt";
import ThBox from "./ThBox";
import Big from "big.js";
import { ESYX_PRICE } from "../../src/const";
import APRInfo from "../infos/APRInfo";
import TdBox from "./TdBox";

const pageSize = 5;

export default function CollateralTable() {
	const { pools, tradingPool } = useContext(AppDataContext);

	const { currentPage, setCurrentPage, pagesCount, pages } =
		usePagination({
			pagesCount: Math.ceil((pools[tradingPool]?.synths?.length ?? 1) / pageSize) ?? 1,
			initialState: { currentPage: 1 }
		}
	);	

	return (
		<Box>
			<Box className="cutoutcornersboxright" px={5} py={5}>
				<Heading fontSize={'18px'} color={'secondary.300'}>Synthetic Assets</Heading>			
			</Box>
			{pools[tradingPool]?.synths.length > 0 ? (
				<TableContainer>
					<Table variant="simple">
						<Thead>
							<Tr >
								<ThBox alignBox='left'>Asset</ThBox>
								<ThBox >Price</ThBox>
								<ThBox >Volume 24h</ThBox>
								<ThBox alignBox='right' isNumeric>
									Liquidity
								</ThBox>
							</Tr>
						</Thead>
						<Tbody>
							{[...pools[tradingPool]?.synths.slice((currentPage - 1) * pageSize, currentPage * pageSize)].map(
								(synth: any, index: number) => (
									<Debt synth={synth} key={index} index={index} />
								)
							)}
						</Tbody>
					</Table>
				</TableContainer>
			) : (
				<Box pt={0.5}>
					<Skeleton height="50px" m={6} mt={8} rounded={12} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
					<Skeleton height="50px" rounded={12} m={6} />
				</Box>
			)}

			<Flex justify={"center"}>
				<Pagination
					pagesCount={pagesCount}
					currentPage={currentPage}
					onPageChange={setCurrentPage}
				>
					<PaginationContainer my={4}>
						<PaginationPrevious variant={"none"}>
							<MdNavigateBefore />
						</PaginationPrevious>
						<PaginationPageGroup>
							{pages.map((page: number) => (
								<PaginationPage
									key={`pagination_page_${page}`}
									page={page}
									width={10}
									rounded={"full"}
									bgColor={"transparent"
									}
									color={
										page === currentPage ? 'primary.400' : 'white'
									}
									_hover={{ bgColor: "whiteAlpha.200" }}
								/>
							))}
						</PaginationPageGroup>
						<PaginationNext variant={"none"}>
							{" "}
							<MdNavigateNext />{" "}
						</PaginationNext>
					</PaginationContainer>
				</Pagination>
			</Flex>
		</Box>
	);
}
