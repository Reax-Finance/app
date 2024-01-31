import React, { useContext } from "react";
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
	useColorMode,
} from "@chakra-ui/react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { motion, Variants } from "framer-motion";
import router from "next/router";
import { usePriceData } from "../context/PriceContext";
import { usePerpsData } from "../context/PerpsDataProvider";

const itemVariants: Variants = {
	open: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
	closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export default function PairSelector() {

	const [isOpen, setIsOpen] = React.useState(false);
	const {pair}: any = router.query;
	const { colorMode } = useColorMode();
	const { prices } = usePriceData();
	const { pairs } = usePerpsData();

	window.addEventListener("click", function (e) {
		if (
			!document.getElementById("menu-list-123")?.contains(e.target as any)
		) {
			setIsOpen(false);
		}
	});

	return (
		<>
			<Box id="menu-list-123" h='40px'>
				<motion.nav
					initial={false}
					animate={isOpen ? "open" : "closed"}
					className="menu"
				>
					<Flex zIndex={2} >
						{pair ? (
							<motion.button
								whileTap={{ scale: 0.97 }}
								onClick={() => setIsOpen(!isOpen)}
							>
								<Flex align={"center"}  gap={6}>
									<Flex>
										<Box textAlign={'left'}>
										<Flex gap={4}>
										<Image src={`/icons/${pair?.split('-')[0]}.svg`} w={'30px'}  />
										<Heading fontSize={{sm: '3xl', md: "3xl", lg: '30px'}} fontWeight='bold'>
											{pair}
										</Heading>
										</Flex>
										</Box>
									</Flex>
									<Flex align={'center'} color={colorMode == 'dark' ? 'whiteAlpha.700' : 'blackAlpha.700'} >
									<Text fontSize={'sm'} display={{sm: 'none', md: 'block', lg: 'block'}} >{!isOpen ? 'All Pairs' : 'Tap To Close'}</Text>
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
							width: "350px",
							zIndex: '100',
							borderRadius: '0px',
							// background: "linear-gradient(45deg, transparent 10px, #1D1F24 0) bottom left, linear-gradient(-135deg, transparent 10px, #1D1F24 0) top right",
							// backgroundRepeat: 'no-repeat',
							// backgroundSize: '100% 50%',
							boxShadow: '0px 0px 20px 0px rgba(0,255,0,0.5)',
						}}
					>
						<Box shadow={'2xl'} mt={5} bg={`${colorMode}Bg.200`} >

						{/* <Divider /> */}

						{Object.keys(pairs).map((pair, index) => {
							return (
								<motion.li
									variants={itemVariants}
									onClick={() => {
										router.push(`/margin/${pair}`);
										setIsOpen(false);
									}}
									key={index}
								>
									<Box
										_hover={{ bg: `${colorMode}Bg.400` }}
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
											<Flex align={'center'} gap={2}>
												<Image src={`/icons/${pairs[pair]?.token0?.symbol}.svg`} boxSize="30px" alt="pair" />
												<Heading fontSize={"xl"}>
													{pair}
												</Heading>
											</Flex>
											<Box textAlign={'end'}>
												<Text fontSize={'xs'} mb={-1} color={colorMode == 'dark' ? 'whiteAlpha.600' : 'blackAlpha.600'}>Price</Text>
												<Text>{
													(Number(prices[pairs[pair]?.token0?.id] ?? 0) / Number(prices[pairs[pair]?.token1?.id] ?? 0)).toFixed(4)
												}</Text>
											</Box>
										</Flex>
									</Box>
									{index !== Object.keys(pairs).length -1 && <Divider />}
								</motion.li>
							);
						})}
						</Box>
					</motion.ul>
				</motion.nav>
			</Box>
		</>
	);
}
