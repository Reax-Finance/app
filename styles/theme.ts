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
		heading: `General Sans, sans-serif`,
		body: `'Rubik', sans-serif`,
	},
	// styles,
	config,
	breakpoints,
	colors: {
		warning: "#FF8A00",
		danger: "#FF0000",
		primary: {
			50:  '#FF8A00',
			100: '#FF8A00',
			200: '#FF8A00',
			300: '#FF8A00',
			400: '#FF8A00',
			500: '#FF8A00',
			600: '#FF8A00',
			700: '#FF8A00',
			800: '#FF8A00',
			900: '#FF8A00',
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
		bg1: "#071222",
		bg2: "#0C1E3C",
		bg3: '#001A31',
		skyblue: "#92CAFF",
	},
});