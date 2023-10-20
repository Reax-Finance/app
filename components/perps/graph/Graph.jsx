import * as React from "react";
import { widget, version } from "../../../public/static/charting_library";

function getLanguageFromURL() {
	const regex = new RegExp("[\\?&]lang=([^&#]*)");
	const results = regex.exec(window.location.search);
	return results === null
		? null
		: decodeURIComponent(results[1].replace(/\+/g, " "));
}

const GREEN = "#33ffbc";
const RED = "#ff631b";

const BACKGROUND = "#191D25"
const BACKGROUND2 = "#252B36"

const HEIGHT = "590px";

export class Graph extends React.PureComponent {
	static defaultProps = {
		symbol: "BTC_USDC",
		interval: "1D",
		datafeedUrl: "https://demo_feed.tradingview.com",
		libraryPath: "/static/charting_library/",
		chartsStorageUrl: "https://saveload.tradingview.com",
		chartsStorageApiVersion: "1.1",
		clientId: "tradingview.com",
		userId: "public_user_id",
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	};

	tvWidget = null;

	constructor(props) {
		super(props);
		this.ref = React.createRef();
	}


	componentDidUpdate() {
		const widgetOptions = {
			symbol: this.props.symbol,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: new window.Datafeeds.UDFCompatibleDatafeed('https://benchmarks.pyth.network/v1/shims/tradingview'),
			interval: this.props.interval,
			container: this.ref.current,
			library_path: this.props.libraryPath,
			custom_css_url: '/css/style.css',
			locale: getLanguageFromURL() || "en",
			disabled_features: [
				"use_localstorage_for_settings", 
				"header_symbol_search", "header_compare", 
				"header_undo_redo", 
				"header_screenshot",
				"link_to_tradingview",
				"chart_property_page_trading",
				"chart_crosshair_menu",
				"hide_last_na_study_output"
			],
			enabled_features: [
				"minimalistic_logo",
				"narrow_chart_enabled",
				"study_templates",
				"show_logo_on_all_charts",
				"hide_left_toolbar_by_default"
			],
			logo: {
				image: "/favicon.png",
				link: "https://www.zexe.io/"
			},
			theme: 'dark',
			toolbar_bg: BACKGROUND,
			loading_screen: {
				backgroundColor: "transparent",
			},
			client_id: 'zexe.io',
			overrides: {
				"paneProperties.background": BACKGROUND,
				"paneProperties.backgroundType": "solid",
				"mainSeriesProperties.candleStyle.wickUpColor": GREEN,
				"mainSeriesProperties.candleStyle.wickDownColor": RED,
				"mainSeriesProperties.candleStyle.upColor": GREEN,
				"mainSeriesProperties.candleStyle.downColor": RED,
				"mainSeriesProperties.candleStyle.borderUpColor": GREEN,
				"mainSeriesProperties.candleStyle.borderDownColor": RED,
				"paneProperties.vertGridProperties.color": "#343B48",
				"paneProperties.horzGridProperties.color": "#343B48",
				editorFontsList: ['Poppins']
		   },
			// enabled_features: ["study_templates"],
			// charts_storage_url: this.props.chartsStorageUrl,
			// charts_storage_api_version: this.props.chartsStorageApiVersion,
			// client_id: this.props.clientId,
			// user_id: this.props.userId,
			// fullscreen: this.props.fullscreen,
			// autosize: this.props.autosize,
			// studies_overrides: this.props.studiesOverrides,
			theme: 'dark',
			toolbar_bg: BACKGROUND2,
			width: '100%',
			height: HEIGHT,
			header_widget_buttons_mode: 'compact'
		};

		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;
	}

	componentDidMount() {
		const widgetOptions = {
			symbol: this.props.symbol,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: new window.Datafeeds.UDFCompatibleDatafeed('https://benchmarks.pyth.network/v1/shims/tradingview'),
			interval: this.props.interval,
			container: this.ref.current,
			library_path: this.props.libraryPath,
			custom_css_url: '/css/style.css',
			locale: getLanguageFromURL() || "en",
			disabled_features: [
				"use_localstorage_for_settings", 
				"header_symbol_search", "header_compare", 
				"header_undo_redo", 
				"header_screenshot",
				"link_to_tradingview",
				"chart_property_page_trading",
				"chart_crosshair_menu",
				"hide_last_na_study_output"
			],
			enabled_features: [
				"minimalistic_logo",
				"narrow_chart_enabled",
				"study_templates",
				"show_logo_on_all_charts",
				"hide_left_toolbar_by_default"
			],
			logo: {
				image: "/favicon.png",
				link: "https://www.zexe.io/"
			},
			theme: 'dark',
			toolbar_bg: BACKGROUND,
			loading_screen: {
				backgroundColor: "transparent",
			},
			client_id: 'zexe.io',
			overrides: {
				"paneProperties.background": BACKGROUND,
				"paneProperties.backgroundType": "solid",
				"mainSeriesProperties.candleStyle.wickUpColor": GREEN,
				"mainSeriesProperties.candleStyle.wickDownColor": RED,
				"mainSeriesProperties.candleStyle.upColor": GREEN,
				"mainSeriesProperties.candleStyle.downColor": RED,
				"mainSeriesProperties.candleStyle.borderUpColor": GREEN,
				"mainSeriesProperties.candleStyle.borderDownColor": RED,
				"paneProperties.vertGridProperties.color": "#343B48",
				"paneProperties.horzGridProperties.color": "#343B48",
		   },
			// enabled_features: ["study_templates"],
			// charts_storage_url: this.props.chartsStorageUrl,
			// charts_storage_api_version: this.props.chartsStorageApiVersion,
			// client_id: this.props.clientId,
			// user_id: this.props.userId,
			// fullscreen: this.props.fullscreen,
			// autosize: this.props.autosize,
			// studies_overrides: this.props.studiesOverrides,
			theme: 'dark',
			toolbar_bg: BACKGROUND,

			width: '100%',
			height: HEIGHT,
			header_widget_buttons_mode: 'compact'
		};

		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;

		// tvWidget.onChartReady(() => {
		// 	tvWidget.headerReady().then(() => {
		// 		const button = tvWidget.createButton();
		// 		button.setAttribute(
		// 			"title",
		// 			"Click to show a notification popup"
		// 		);
		// 		button.classList.add("apply-common-tooltip");
		// 		button.addEventListener("click", () =>
		// 			tvWidget.showNoticeDialog({
		// 				title: "Notification",
		// 				body: "zexe API works correctly",
		// 				callback: () => {
		// 					console.log("Noticed!");
		// 				},
		// 			})
		// 		);
		// 		button.innerHTML = "Check API";
		// 	});
		// });
	}

	componentWillUnmount() {
		if (this.tvWidget !== null) {
			this.tvWidget.remove();
			this.tvWidget = null;
		}
	}

	render() {
		return (
			<>
				<div ref={this.ref} />
			</>
		);
	}
}