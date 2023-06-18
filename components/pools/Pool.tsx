
import { Flex, Modal, Image, Text, Button, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Tr, useDisclosure, ModalBody } from '@chakra-ui/react'
import React from 'react'
import TdBox from '../dashboard/TdBox';
import PoolModal from './PoolModal';

export default function Pool({pool}: any) {
	const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
        <Tr
        cursor="pointer"
        onClick={onOpen}
        _hover={{ borderColor: "primary.400", bg: "whiteAlpha.100" }}
        >
            <TdBox>
                <Flex ml={4}>
                {pool.tokens.map((token: any, index: number) => {
                    return pool.address !== token.token.id && <Flex  ml={'-2'}  key={index} align="center" gap={2}>
                        <Image src={`/icons/${token.token.symbol}.svg`} alt="" width={"38px"} />
                    </Flex>
                })}
                </Flex>
            </TdBox>

            <TdBox>
            <Flex gap={1}>
                {pool.tokens.map((token: any, index: number) => {
                    return pool.address !== token.token.id && <Flex className='smallcutoutcornersbox' p={2} key={index} align="center" gap={2}>
                        <Text>{token.token.symbol}({(pool.totalWeight > 0) ? (100*token.weight/pool.totalWeight) + '%' : '-'})</Text>
                        
                    </Flex>
                })}
                </Flex>
            </TdBox>

            <TdBox>
                {pool.totalLiquidity}
            </TdBox>

            <TdBox isNumeric>
                {10}%
            </TdBox>
        </Tr>

        <Modal isCentered isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                width={"30rem"}
                bgColor="bg1"
                rounded={0}
                mx={2}
            >
                <ModalCloseButton rounded={"full"} mt={1} />
                <ModalHeader>
                <Flex
							justify={"center"}
							gap={2}
							pt={1}
							align={"center"}
						>
							{/* <Image
								src={`/icons/${}.svg`}
								alt=""
								width={"38px"}
							/> */}
							<Text>{pool.name}</Text>
							
						</Flex>
                        </ModalHeader>
                        <PoolModal pool={pool} />
            </ModalContent>
        </Modal>

    </>
  )
}
