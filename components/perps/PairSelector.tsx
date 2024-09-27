import React from "react";
import {
    Box,
    Flex,
    Heading,
    Skeleton,
    Divider,
    Image,
    Text,
    useColorMode,
	Button,
} from "@chakra-ui/react";
import router from "next/router";
import { useAppData } from "../context/AppDataProvider";
import Link from "next/link";
import { MdStarOutline } from "react-icons/md";

export default function PairSelector() {
    const [isOpen, setIsOpen] = React.useState(false);
    const { pair }: any = router.query;
    const { colorMode } = useColorMode();
    const { pairs } = useAppData();


    return (
        <>
            <Box bg={`${colorMode}Bg.400`} h='500px' cursor={'help'}>
				<Flex zIndex={2} px={4} py={2}>
					{pairs.length > 0 ? (
						<>
							<Flex align={"center"} gap={6}>
								<Flex>
									<Box textAlign={'left'}>
										<Flex gap={4}>
											<Text fontSize={{sm: 'xl', md: "sm"}} casing={'uppercase'} fontWeight={'bold'}>
												Favorites
											</Text>
										</Flex>
									</Box>
								</Flex>
							</Flex>
						</>
					) : (
						<Skeleton height="30px" width="200px" rounded={0} />
					)}
				</Flex>
				<Flex flexDir={'column'} shadow={'2xl'}  bg={`${colorMode}Bg.200`} >
					<Text fontSize={'sm'} px={4} py={2} color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'}>
						No favorites yet
					</Text>
				</Flex>
				<Flex zIndex={2} px={4} py={2}>
					{pairs.length > 0 ? (
						<>
							<Flex align={"center"} gap={6}>
								<Flex>
									<Box textAlign={'left'}>
										<Flex gap={4}>
											<Text fontSize={{sm: 'xl', md: "sm"}} casing={'uppercase'} fontWeight={'bold'}>
												All Pairs
											</Text>
										</Flex>
									</Box>
								</Flex>
							</Flex>
						</>
					) : (
						<Skeleton height="30px" width="200px" rounded={0} />
					)}
				</Flex>
				<Flex flexDir={'column'} shadow={'2xl'} bg={`${colorMode}Bg.200`} >
					{pairs?.map((pair, index) => {
						return (
							<Link
								href={`/perps/${pair.id}`}
								key={index}
							>
							<Divider />

								<Box
									_hover={{ bg: `${colorMode}Bg.600` }}
									px={3}
									my={0}
									
									>
									<Flex
										paddingY={1}
										justify={"space-between"}
										align="center"
										py="1.5"
										gap={4}
									>
										<Flex align={'center'} gap={2}>
											<Box _hover={{ color: 'yellow.400' }}>
												<MdStarOutline />
											</Box>
											<Image src={`/icons/${pair.synth1.synth.symbol}.svg`} boxSize="20px" alt="pair" />
											<Heading fontSize={"md"}>
												{pair.id}
											</Heading>
										</Flex>
										<Box textAlign={'end'}>
											{/* <Text fontSize={'xs'} mb={-1} color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'}>Price</Text> */}
											<Text>
												{(Number(pair.synth1.synth.price) / Number(pair.synth2.synth.price)).toFixed(4)}
											</Text>
										</Box>
									</Flex>
								</Box>
							</Link>
						);
					})}
				</Flex>
            </Box>
        </>
    );
}
