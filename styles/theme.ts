import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { switchTheme } from './switchTheme';

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
		},
		Switch: switchTheme
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
			50:  '#FFE5BC',
			100: '#FFD89B',
			200: '#FFC871',
			300: '#FFBD54',
			400: '#FFAE2D',
			500: '#E49C28',
			600: '#CF8D23',
			700: '#BB7F20',
			800: '#9B6A1C',
			900: '#7D5617',
		},
		secondary: {
			50:  '#FFB593',
			100: '#FF9B6D',
			200: '#FF8B55',
			300: '#FF7333',
			400: '#ff631b',
			500: '#DF581A',
			600: '#CE5117',
			700: '#AE4616',
			800: '#933D15',
			900: '#783212',
		},
		bg1: "#2B2E32",
		bg2: "#1D1F24",
		bg3: '#001A31',
		skyblue: "#92CAFF",
	},
});