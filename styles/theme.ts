import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
	initialColorMode: 'dark',
	useSystemColorMode: false,
};

const breakpoints = {
	sm: '360px',
	md: '768px',
	lg: '1024px',
	xl: '1440px',
	'2xl': '1680px',
};

export const theme = extendTheme({
	components: {
		Heading: {
			baseStyle: {
				fontWeight: 'semibold'
			}
		}
	},
	fonts: {
		heading: `Chakra Petch, sans-serif`,
		body: `'Rubik', sans-serif`,
	},
	// styles,
	config,
	breakpoints,
	colors: {
		warning: "#FF8A00",
		danger: "#FF0000",
		primary: {
			50:  '#FFF3E6',
			100: '#FFDAB0',
			200: '#FFC88A',
			300: '#FEAF54',
			400: '#FF8A00',
			500: '#FE8700',
			600: '#E77B00',
			700: '#B46000',
			800: '#8C4A00',
			900: '#6B3900',
		},
		secondary: {
			50:  '#F64E00',
			100: '#F64E00',
			200: '#F64E00',
			300: '#F64E00',
			400: '#F64E00',
			500: '#F64E00',
			600: '#F64E00',
			700: '#F64E00',
			800: '#F64E00',
			900: '#F64E00',
		},
		bg1: "#2B2E32",
		bg2: "#1D1F24",
		bg3: '#001A31',
		skyblue: "#92CAFF",
	},
});