import { Box, Flex, Heading, useColorMode } from '@chakra-ui/react'
import React from 'react'
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Text
} from '@chakra-ui/react'
import { usePerpsData } from '../../../context/PerpsDataProvider'
import Position from './Position';

import {
	Pagination,
	usePagination,
	PaginationNext,
	PaginationPage,
	PaginationPrevious,
	PaginationContainer,
	PaginationPageGroup,
} from "@ajna/pagination";
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';

const pageSize = 2;

export default function Open() {
    const {openPositions} = usePerpsData();

    const { currentPage, setCurrentPage, pagesCount, pages } =
		usePagination({
			pagesCount: Math.ceil(((openPositions?.length) ?? 1) / pageSize) ?? 1,
			initialState: { currentPage: 1 }
		}
	);
    const {colorMode} = useColorMode();

    return (   <>
        <TableContainer>
            <Table variant='simple'>
                <Thead>
                <Tr>
                    <Th>Vault</Th>
                    <Th>Leverage</Th>
                    <Th>Net APY</Th>
                    <Th>Position</Th>
                    <Th>Borrowed</Th>
                    <Th>PnL</Th>
                    <Th isNumeric>Close</Th>
                </Tr>
                </Thead>
                <Tbody>
                    {openPositions.length > 0 ? [...openPositions.slice((currentPage - 1) * pageSize, currentPage * pageSize)].map((position: any, index: number) => (<Position key={index} index={index} position={position}/>)) : <><Text color={'whiteAlpha.600'} mx={4} mt={4}>No Positions Found</Text></>}
                </Tbody>
            </Table>
        </TableContainer>

        <Flex justify={"center"} mb={-8} mt={-1}>
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
                                page === currentPage ? 'primary.400' : colorMode == 'dark' ? 'white' : 'blackAlpha.600'
                            }
                            _hover={{ bgColor: colorMode == 'dark' ? "whiteAlpha.200" : "blackAlpha.200" }}
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
        </>
    )
}
