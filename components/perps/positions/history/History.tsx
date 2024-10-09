import { Box, Flex, Heading, useColorMode } from "@chakra-ui/react";
import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Text,
} from "@chakra-ui/react";
import { usePerpsData } from "../../../context/PerpsDataProvider";
import HistoryRow from "./HistoryRow";
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

const pageSize = 3;

export default function History() {
  const { history } = usePerpsData();

  const { currentPage, setCurrentPage, pagesCount, pages } = usePagination({
    pagesCount: Math.ceil((history?.length ?? 1) / pageSize) ?? 1,
    initialState: { currentPage: 1 },
  });
  const { colorMode } = useColorMode();

  return (
    <>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Vault</Th>
              <Th>Asset</Th>
              <Th>Action</Th>
              <Th>Amount</Th>
              <Th isNumeric>Timestamp</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.length > 0 ? (
              [
                ...history.slice(
                  (currentPage - 1) * pageSize,
                  currentPage * pageSize
                ),
              ].map((_history: any, index: number) => (
                <HistoryRow key={index} index={index} history={_history} />
              ))
            ) : (
              <>
                <Text
                  color={
                    colorMode == "dark" ? "whiteAlpha.600" : "blackAlpha.600"
                  }
                  mx={4}
                  mt={4}
                >
                  No History Found
                </Text>
              </>
            )}
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
                  bgColor={"transparent"}
                  color={
                    page === currentPage
                      ? "primary.400"
                      : colorMode == "dark"
                      ? "white"
                      : "blackAlpha.600"
                  }
                  _hover={{
                    bgColor:
                      colorMode == "dark" ? "whiteAlpha.200" : "blackAlpha.200",
                  }}
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
  );
}
