/**
 * Analytics > Marketing - wc-admin extension report.
 *
 * This adapts the multichannel ads exploration into a CIAB-style dashboard
 * model: registered widgets, shared widget chrome, and page-level date state.
 */
import { addFilter } from '@wordpress/hooks';
import { __, sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import {
	GlobalChartsProvider,
	LineChart,
	type ChartTheme,
	type SeriesData,
} from '@automattic/charts';
import '@automattic/charts/style.css';
import './style.scss';
import type {
	MarketingAnalytics,
	MarketingAnalyticsAction,
	MarketingAnalyticsChannel,
} from './types';

type WidgetSize = 'small' | 'medium' | 'large' | 'full';
type WidgetState = 'ready' | 'loading' | 'empty' | 'error';

type MarketingWidgetContext = {
	data: MarketingAnalytics;
	selectedDateRange: string;
};

type MarketingWidgetDefinition = {
	name: string;
	title: string;
	description?: string;
	info?: string;
	size: WidgetSize;
	layout?: {
		contentPadding?: boolean;
		scrollableContent?: boolean;
	};
	getMeta?: ( context: MarketingWidgetContext ) => string;
	getState?: ( context: MarketingWidgetContext ) => WidgetState;
	render: ( context: MarketingWidgetContext ) => React.ReactNode;
};

const MARKETING_DATE_RANGES: string[] = [
	__( 'Last 7 days', 'multichannel-campaigns' ),
	__( 'Last 30 days', 'multichannel-campaigns' ),
	__( 'Quarter to date', 'multichannel-campaigns' ),
];

const currency = new Intl.NumberFormat( undefined, {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0,
} );

const number = new Intl.NumberFormat();
const decimal = new Intl.NumberFormat( undefined, {
	maximumFractionDigits: 1,
} );

const formatCurrency = ( value: number ) => currency.format( value );
const formatNumber = ( value: number ) => number.format( value );
const formatPercent = ( value: number ) => `${ value }%`;
const formatMultiplier = ( value: number ) => `${ decimal.format( value ) }x`;

const marketingChartTheme: Partial< ChartTheme > = {
	colors: [ '#3858e9', '#1d6634' ],
};

const getTotalBudget = ( channels: MarketingAnalyticsChannel[] ) =>
	channels.reduce( ( total, channel ) => total + channel.budget, 0 );

const getReturnOnAdSpend = ( data: MarketingAnalytics ) =>
	data.summary.sales_from_ads / data.summary.ad_spend;

const sumSeries = (
	channels: MarketingAnalyticsChannel[],
	key: 'sales_data' | 'spend_data'
) =>
	channels[ 0 ][ key ].map( ( _, index ) =>
		channels.reduce(
			( total, channel ) => total + channel[ key ][ index ],
			0
		)
	);

const trendDateString = ( index: number ) => {
	const day = String( 1 + index * 5 ).padStart( 2, '0' );
	return `2026-05-${ day }`;
};

const buildTrendSeries = ( data: MarketingAnalytics ): SeriesData[] => {
	const sales = sumSeries( data.channels, 'sales_data' );
	const spend = sumSeries( data.channels, 'spend_data' );

	return [
		{
			label: __( 'Sales', 'multichannel-campaigns' ),
			data: sales.map( ( value, index ) => ( {
				dateString: trendDateString( index ),
				label: data.trend_labels[ index ],
				value,
			} ) ),
		},
		{
			label: __( 'Ad spend', 'multichannel-campaigns' ),
			data: spend.map( ( value, index ) => ( {
				dateString: trendDateString( index ),
				label: data.trend_labels[ index ],
				value,
			} ) ),
		},
	];
};

const WidgetStateMessage = ( { state }: { state: WidgetState } ) => {
	const labels: Record< Exclude< WidgetState, 'ready' >, string > = {
		loading: __( 'Loading marketing data…', 'multichannel-campaigns' ),
		empty: __(
			'No marketing data for this period.',
			'multichannel-campaigns'
		),
		error: __(
			'Marketing data could not be loaded.',
			'multichannel-campaigns'
		),
	};

	if ( state === 'ready' ) {
		return null;
	}

	return (
		<div className="fwa-marketing-widget__state" role="status">
			{ labels[ state ] }
		</div>
	);
};

const Widget = ( {
	name,
	title,
	description,
	info,
	meta,
	size = 'medium',
	state = 'ready',
	layout = { contentPadding: true },
	children,
}: {
	name: string;
	title: string;
	description?: string;
	info?: string;
	meta?: string;
	size?: WidgetSize;
	state?: WidgetState;
	layout?: MarketingWidgetDefinition[ 'layout' ];
	children: React.ReactNode;
} ) => {
	const className = [
		'fwa-marketing-widget',
		`fwa-marketing-widget--${ size }`,
		`fwa-marketing-widget--is-${ state }`,
		layout?.contentPadding === false
			? 'fwa-marketing-widget--no-padding'
			: '',
		layout?.scrollableContent
			? 'fwa-marketing-widget--scrollable-content'
			: '',
	]
		.filter( Boolean )
		.join( ' ' );

	return (
		<section className={ className } data-widget-name={ name }>
			<header className="fwa-marketing-widget__header">
				<div>
					<h3>{ title }</h3>
					{ description ? <p>{ description }</p> : null }
				</div>
				<div className="fwa-marketing-widget__tools">
					{ meta ? (
						<span className="fwa-marketing-widget__meta">
							{ meta }
						</span>
					) : null }
					{ info ? (
						<span
							className="fwa-marketing-widget__info"
							aria-label={ info }
							title={ info }
						>
							i
						</span>
					) : null }
				</div>
			</header>
			<div className="fwa-marketing-widget__body">
				{ state === 'ready' ? (
					children
				) : (
					<WidgetStateMessage state={ state } />
				) }
			</div>
		</section>
	);
};

const ChannelSwatch = ( {
	channel,
}: {
	channel: MarketingAnalyticsChannel;
} ) => (
	<span
		className="fwa-marketing-channel-swatch"
		style={ { '--channel-color': channel.color } as React.CSSProperties }
		aria-hidden="true"
	/>
);

const MarketingPerformanceWidget = ( { data }: MarketingWidgetContext ) => {
	const totalBudget = getTotalBudget( data.channels );
	const returnOnAdSpend = getReturnOnAdSpend( data );
	const metrics = [
		{
			key: 'sales',
			label: __( 'Sales from ads', 'multichannel-campaigns' ),
			value: formatCurrency( data.summary.sales_from_ads ),
			detail: __( '+12%', 'multichannel-campaigns' ),
			tone: 'positive',
		},
		{
			key: 'spend',
			label: __( 'Ad spend', 'multichannel-campaigns' ),
			value: formatCurrency( data.summary.ad_spend ),
			detail: sprintf(
				/* translators: %s is a formatted currency amount, for example $2,180. */
				__( '%s budget', 'multichannel-campaigns' ),
				formatCurrency( totalBudget )
			),
			tone: 'neutral',
		},
		{
			key: 'roas',
			label: __( 'Return on ad spend', 'multichannel-campaigns' ),
			value: formatMultiplier( returnOnAdSpend ),
			detail: sprintf(
				/* translators: %s is a percentage, for example 32%. */
				__( '%s cost', 'multichannel-campaigns' ),
				formatPercent( data.summary.ad_cost_percent )
			),
			tone: 'positive',
		},
		{
			key: 'orders',
			label: __( 'Orders from ads', 'multichannel-campaigns' ),
			value: formatNumber( data.summary.orders_from_ads ),
			detail: __( '+9%', 'multichannel-campaigns' ),
			tone: 'positive',
		},
	];
	const [ activeMetric, setActiveMetric ] = useState( metrics[ 0 ].key );

	return (
		<div className="fwa-marketing-performance-widget">
			<div className="fwa-marketing-performance-summary">
				<div
					className="fwa-marketing-metric-tabs"
					role="tablist"
					aria-label={ __(
						'Marketing performance metrics',
						'multichannel-campaigns'
					) }
				>
					{ metrics.map( ( metric ) => (
						<button
							type="button"
							role="tab"
							aria-selected={ metric.key === activeMetric }
							className={ `fwa-marketing-metric-tab ${
								metric.key === activeMetric ? 'is-active' : ''
							}` }
							key={ metric.key }
							onClick={ () => setActiveMetric( metric.key ) }
						>
							<span>{ metric.label }</span>
							<strong>{ metric.value }</strong>
							<small
								className={ `fwa-marketing-metric-detail fwa-marketing-metric-detail--${ metric.tone }` }
							>
								{ metric.detail }
							</small>
						</button>
					) ) }
				</div>
			</div>
			<div className="fwa-marketing-chart-region">
				<GlobalChartsProvider theme={ marketingChartTheme }>
					<LineChart
						chartId="fwa-marketing-sales-spend"
						data={ buildTrendSeries( data ) }
						height={ 280 }
						maxWidth={ 860 }
						withGradientFill={ false }
						withTooltips
						showLegend
						gridVisibility="y"
						legend={ {
							position: 'bottom',
							alignment: 'start',
							shape: 'line',
						} }
						margin={ {
							top: 16,
							right: 24,
							bottom: 32,
							left: 56,
						} }
					/>
				</GlobalChartsProvider>
			</div>
		</div>
	);
};

const VisitorQualityWidget = ( { data }: { data: MarketingAnalytics } ) => {
	const adShare = Math.round(
		( data.visitor_quality.visitors_from_ads /
			data.visitor_quality.total_visitors ) *
			100
	);
	const otherShare = 100 - adShare;

	return (
		<>
			<div className="fwa-marketing-traffic-bar" aria-hidden="true">
				<span className="is-ads" style={ { width: `${ adShare }%` } } />
				<span
					className="is-other"
					style={ { width: `${ otherShare }%` } }
				/>
			</div>
			<div className="fwa-marketing-quality-list">
				<div>
					<span>
						{ __( 'Ad visitors', 'multichannel-campaigns' ) }
					</span>
					<strong>
						{ formatNumber(
							data.visitor_quality.visitors_from_ads
						) }
					</strong>
					<small>
						{ sprintf(
							/* translators: %s is a conversion percentage, for example 3.2%. */
							__( '%s bought', 'multichannel-campaigns' ),
							formatPercent(
								data.visitor_quality.ad_conversion_rate
							)
						) }
					</small>
				</div>
				<div>
					<span>
						{ __( 'Other visitors', 'multichannel-campaigns' ) }
					</span>
					<strong>
						{ formatNumber( data.visitor_quality.other_visitors ) }
					</strong>
					<small>
						{ sprintf(
							/* translators: %s is a conversion percentage, for example 1.8%. */
							__( '%s bought', 'multichannel-campaigns' ),
							formatPercent(
								data.visitor_quality.other_conversion_rate
							)
						) }
					</small>
				</div>
			</div>
		</>
	);
};

const ChannelPerformanceWidget = ( {
	channels,
}: {
	channels: MarketingAnalyticsChannel[];
} ) => (
	<table className="fwa-marketing-channel-table">
		<thead>
			<tr>
				<th scope="col">
					{ __( 'Channel', 'multichannel-campaigns' ) }
				</th>
				<th scope="col">{ __( 'Sales', 'multichannel-campaigns' ) }</th>
				<th scope="col">{ __( 'Spend', 'multichannel-campaigns' ) }</th>
				<th scope="col">
					{ __( 'Cost of sales', 'multichannel-campaigns' ) }
				</th>
				<th scope="col">
					{ __( 'Orders', 'multichannel-campaigns' ) }
				</th>
				<th scope="col">
					{ __( 'Recommendation', 'multichannel-campaigns' ) }
				</th>
			</tr>
		</thead>
		<tbody>
			{ channels.map( ( channel ) => (
				<tr key={ channel.id }>
					<th scope="row">
						<span className="fwa-marketing-channel-name">
							<ChannelSwatch channel={ channel } />
							<span>
								<strong>{ channel.name }</strong>
								<small>{ channel.category }</small>
							</span>
						</span>
					</th>
					<td>{ formatCurrency( channel.revenue ) }</td>
					<td>{ formatCurrency( channel.spend ) }</td>
					<td>
						{ formatPercent(
							Math.round(
								( channel.spend / channel.revenue ) * 100
							)
						) }
					</td>
					<td>{ formatNumber( channel.orders ) }</td>
					<td>{ channel.recommendation }</td>
				</tr>
			) ) }
		</tbody>
	</table>
);

const RecommendedActionsWidget = ( {
	actions,
}: {
	actions: MarketingAnalyticsAction[];
} ) => (
	<div className="fwa-marketing-action-list">
		{ actions.map( ( action ) => (
			<div className="fwa-marketing-action" key={ action.type }>
				<div>
					<h4>{ action.title }</h4>
					<p>{ action.description }</p>
				</div>
				<Button variant="secondary" size="compact">
					{ action.action }
				</Button>
			</div>
		) ) }
	</div>
);

const MARKETING_WIDGETS: MarketingWidgetDefinition[] = [
	{
		name: 'marketing/performance-overview',
		title: __( 'Marketing performance', 'multichannel-campaigns' ),
		description: __(
			'Sales, spend, return, and order trends across paid channels.',
			'multichannel-campaigns'
		),
		info: __(
			'Metrics compare the selected date range with the previous period.',
			'multichannel-campaigns'
		),
		size: 'full',
		getMeta: ( { selectedDateRange } ) => selectedDateRange,
		render: ( context ) => <MarketingPerformanceWidget { ...context } />,
	},
	{
		name: 'marketing/channel-performance',
		title: __( 'Channel performance', 'multichannel-campaigns' ),
		description: __(
			'Connected channels ranked by sales efficiency.',
			'multichannel-campaigns'
		),
		info: __(
			'Cost of sales is ad spend divided by sales from that channel.',
			'multichannel-campaigns'
		),
		size: 'full',
		layout: { contentPadding: false, scrollableContent: true },
		getState: ( { data } ) =>
			data.channels.length > 0 ? 'ready' : 'empty',
		render: ( { data } ) => (
			<ChannelPerformanceWidget channels={ data.channels } />
		),
	},
	{
		name: 'marketing/visitor-quality',
		title: __( 'Visitor quality', 'multichannel-campaigns' ),
		description: __(
			'Ad-driven traffic compared with the rest of store visits.',
			'multichannel-campaigns'
		),
		info: __(
			'Ad visitors are compared with the rest of store traffic.',
			'multichannel-campaigns'
		),
		size: 'medium',
		getMeta: ( { data } ) =>
			formatMultiplier( data.visitor_quality.conversion_multiplier ),
		render: ( { data } ) => <VisitorQualityWidget data={ data } />,
	},
	{
		name: 'marketing/recommended-actions',
		title: __( 'Recommended next steps', 'multichannel-campaigns' ),
		description: __(
			'Plain-language moves for the current channel mix.',
			'multichannel-campaigns'
		),
		info: __(
			'Recommendations are based on budget use and channel efficiency.',
			'multichannel-campaigns'
		),
		size: 'large',
		getState: ( { data } ) =>
			data.recommended_actions.length > 0 ? 'ready' : 'empty',
		render: ( { data } ) => (
			<RecommendedActionsWidget actions={ data.recommended_actions } />
		),
	},
];

const MarketingAnalyticsPage = (): JSX.Element => {
	const boot = (
		window as unknown as Window & {
			MCC_BOOT: { marketingAnalytics?: unknown };
		}
	 ).MCC_BOOT;
	const data = boot.marketingAnalytics as MarketingAnalytics | undefined;
	const [ selectedDateRange, setSelectedDateRange ] = useState< string >(
		data?.period.label ?? MARKETING_DATE_RANGES[ 1 ]
	);

	useEffect( () => {
		const handleDateRangeChange = ( event: Event ) => {
			const { detail } = event as CustomEvent< { range?: string } >;

			if (
				detail?.range &&
				MARKETING_DATE_RANGES.includes( detail.range )
			) {
				setSelectedDateRange( detail.range );
			}
		};

		window.addEventListener(
			'fwa-marketing-analytics-date-range-change',
			handleDateRangeChange
		);

		return () => {
			window.removeEventListener(
				'fwa-marketing-analytics-date-range-change',
				handleDateRangeChange
			);
		};
	}, [] );

	const widgetContext = useMemo< MarketingWidgetContext | undefined >(
		() => ( data ? { data, selectedDateRange } : undefined ),
		[ data, selectedDateRange ]
	);

	if ( ! data || ! widgetContext ) {
		return (
			<div className="fwa-analytics-marketing">
				<Widget
					name="marketing/data-unavailable"
					title={ __(
						'Marketing data is not available.',
						'multichannel-campaigns'
					) }
					size="full"
					state="empty"
				>
					<p>
						{ __(
							'Run the Future Woo build so this prototype can load the Analytics > Marketing demo data.',
							'multichannel-campaigns'
						) }
					</p>
				</Widget>
			</div>
		);
	}

	return (
		<div className="fwa-analytics-marketing">
			<div className="fwa-marketing-board-grid">
				{ MARKETING_WIDGETS.map( ( widget ) => {
					const state = widget.getState?.( widgetContext ) ?? 'ready';

					return (
						<Widget
							key={ widget.name }
							name={ widget.name }
							title={ widget.title }
							description={ widget.description }
							info={ widget.info }
							meta={ widget.getMeta?.( widgetContext ) }
							size={ widget.size }
							state={ state }
							layout={ widget.layout }
						>
							{ widget.render( widgetContext ) }
						</Widget>
					);
				} ) }
			</div>
		</div>
	);
};

addFilter(
	'woocommerce_admin_pages_list',
	'future-woo-analytics-marketing',
	( pages: Array< Record< string, unknown > > ) => {
		pages.push( {
			container: MarketingAnalyticsPage,
			path: '/analytics/marketing',
			breadcrumbs: [
				[
					'/analytics/overview',
					__( 'Analytics', 'multichannel-campaigns' ),
				],
				__( 'Marketing', 'multichannel-campaigns' ),
			],
			navArgs: { id: 'future-woo-analytics-marketing' },
			capability: 'manage_woocommerce',
		} );
		return pages;
	}
);
