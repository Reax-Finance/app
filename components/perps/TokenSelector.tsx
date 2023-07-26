import React, { useContext } from "react";
import { AppDataContext } from "../context/AppDataProvider";
import {
	Box,
	Flex,
	Heading,
	Skeleton,
	Input,
	Divider,
	Image,
	Text,
	Tag,
	ModalOverlay,
} from "@chakra-ui/react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { motion, Variants } from "framer-motion";
import router from "next/router";
import { PERP_CATEGORIES } from "../../src/const";

const itemVariants: Variants = {
	open: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
	closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export default function TokenSelector({tokens}: any) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [searchedTokens, setSearchedTokens] = React.useState<any[]>([]);
    const { asset } = router.query;

    if(!asset) router.push('/perps/'+PERP_CATEGORIES[0].name+'/?asset='+PERP_CATEGORIES[0].tokens[0])

    React.useEffect(() => {
		setSearchedTokens(tokens);
	}, [tokens]);

	window.addEventListener("click", function (e) {
		if (
			!document.getElementById("menu-list-123")?.contains(e.target as any)
		) {
			setIsOpen(false);
		}
	});

    const handleSearch = (e: any) => {
		const search = e.target.value;
		// const filteredPools = Object.keys(tokens).filter((pool: any) => {
		// 	return pools[pool].name.toLowerCase().includes(search.toLowerCase());
		// });
		// const newPools: any[] = [];
		// filteredPools.forEach((pool: any) => {
		// 	newPools[pool] = pools[pool];
		// });
		// setSearchedTokens(newPools);
	};

    const token = tokens.find((token: any) => token.id === asset);

    if(!token) return <></>;

    const filterName = (name: string) => name.replace('REAX ', '').split('(')[0];
    const filterSymbol = (symbol: string) => symbol.slice(1);

	return (
		<Box>
			<Box id="menu-list-123" h='40px'>
				<motion.nav
					initial={false}
					animate={isOpen ? "open" : "closed"}
					className="menu"
				>
					<Flex zIndex={2} >
						{tokens.length > 0 ? (
							<motion.button
								whileTap={{ scale: 0.97 }}
								onClick={() => setIsOpen(!isOpen)}
							>
								<Flex align={"center"} py={4} gap={6}>
									<Flex>
										<Box textAlign={'left'}>
										<Flex gap={4}>
										<Heading fontSize={{sm: '3xl', md: "3xl", lg: '32px'}} fontWeight='bold'>
											{filterSymbol(token.symbol)}
										</Heading>
										</Flex>
										</Box>
									</Flex>
									<Flex align={'center'} color={'whiteAlpha.700'} >
									<Text fontSize={'sm'} display={{sm: 'none', md: 'block', lg: 'block'}} >{!isOpen ? 'All Markets' : 'Tap To Close'}</Text>
									<motion.div
										variants={{
											open: { rotate: 180, marginBottom: '4px' },
											closed: { rotate: 0 },
										}}
										transition={{ duration: 0.2 }}
										style={{ originY: 0.55 }}
									>
										<RiArrowDropDownLine size={36} />
									</motion.div>
									</Flex>

								</Flex>
							</motion.button>
						) : (
							<Skeleton height="30px" width="200px" rounded={0} />
						)}
					</Flex>
					<motion.ul
						variants={{
							open: {
								clipPath: "inset(0% 0% 0% 0%)",
								transition: {
									type: "spring",
									bounce: 0,
									duration: 0.4,
									delayChildren: 0.2,
									staggerChildren: 0.05,
								},
							},
							closed: {
								clipPath: "inset(00% 50% 90% 50%)",
								transition: {
									type: "spring",
									bounce: 0,
									duration: 0.3,
								},
							},
						}}
						style={{
							pointerEvents: isOpen ? "auto" : "none",
							listStyle: "none",
							display: "flex",
							flexDirection: "column",
							position: "relative",
							width: "450px",
							zIndex: '100',
							borderRadius: '0px',
							// background: "linear-gradient(45deg, transparent 10px, #1D1F24 0) bottom left, linear-gradient(-135deg, transparent 10px, #1D1F24 0) top right",
							// backgroundRepeat: 'no-repeat',
							// backgroundSize: '100% 50%',
							boxShadow: '0px 0px 20px 0px rgba(0,255,0,0.5)',
						}}
						
					>
						<Box shadow={'2xl'} className="containerBody">
							<Box className="containerHeader">
								<motion.div
									variants={{
										open: {
											opacity: 1,
											y: 0,
											transition: {
												ease: "easeOut",
												duration: 0.1,
											},
										},
										closed: {
											opacity: 0,
											y: 20,
											transition: { duration: 0.1 },
										},
									}}
									style={{
										padding: "4px 10px",
										// background: "linear-gradient(-135deg, transparent 10px, #2B2E32 0) top right",
										// backgroundRepeat: 'no-repeat',
										// backgroundSize: '100% 100%',
									}}
								>
									<Input
										placeholder="Search Pool"
										bg={'transparent'}
										rounded={0}
										my={3}
										pl={1}
										variant='unstyled'
										onChange={handleSearch}
										_active={{ borderColor: "transparent" }}
									/>
								</motion.div>
							</Box>

						<Divider />

						{searchedTokens.map((token: any, index: number) => {
							return (
								<motion.li
									variants={itemVariants}
									onClick={() => {
										localStorage.setItem("tradingPool", index.toString());
										// setTradingPool(index);
										setIsOpen(false);
									}}
									key={index}
								>
									<Box
										_hover={{ bg: "bg.600" }}
										cursor="pointer"
										px={4}
										my={0}
									>
										<Flex
											paddingY={1}
											justify={"space-between"}
											align="center"
											py="20px"
										>
											<Box>
												<Heading fontSize={"xl"}>
													{filterName(token.name)}
												</Heading>
											</Box>
											
											
										</Flex>
										{index != tokens.length - 1 && <Divider
											borderColor={"whiteAlpha.200"}
											mx={-4}
											w="109%"
										/>}
									</Box>
								</motion.li>
							);
						})}
						</Box>
					</motion.ul>
				</motion.nav>
			</Box>
		</Box>
	);
}
