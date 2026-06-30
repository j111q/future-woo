import { createRoot } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { ChannelProviderRow } from './ChannelProviderRow';
import { fmtMoney, fmtNum } from './helpers';

const MARKETING_OVERVIEW_PATH = '/marketing';
const OVERVIEW_CARD_SELECTOR = '.woocommerce-marketing-channels-card';

let overviewRoot: ReturnType< typeof createRoot > | null = null;
let overviewRootElement: HTMLElement | null = null;
let observerStarted = false;
let updateScheduled = false;

type RollupMetric = {
	label: string;
	value: string;
	delta?: string;
	tone: 'up' | 'down' | 'neutral';
};

const isMarketingOverviewPath = (): boolean => {
	const params = new URLSearchParams( window.location.search );
	return (
		params.get( 'page' ) === 'wc-admin' &&
		params.get( 'path' ) === MARKETING_OVERVIEW_PATH
	);
};

const MarketingOverviewChannels = (): JSX.Element => {
	const channels = window.MCC_BOOT.channels || [];
	const hasConnectedMarketingChannel =
		window.MCC_BOOT.hasConnectedMarketingChannel ||
		channels.some( ( channel ) => channel.connected );
	const featuredChannel = channels.find( ( channel ) => channel.featured );
	const manualChannels = channels.filter( ( channel ) => ! channel.featured );

	return (
		<section
			className="mcc-provider-overview"
			aria-label={ __(
				'Marketing channel setup',
				'multichannel-campaigns'
			) }
		>
			{ hasConnectedMarketingChannel ? (
				<MarketingOverviewPerformance />
			) : null }

			{ featuredChannel ? (
				<div
					className="mcc-provider-surface mcc-provider-overview__optimizer"
					aria-labelledby="mcc-marketing-overview-optimizer-title"
				>
					<div className="mcc-provider-surface__toolbar">
						<div>
							<h2 id="mcc-marketing-overview-optimizer-title">
								{ __(
									'Optimize marketing across channels',
									'multichannel-campaigns'
								) }
							</h2>
						</div>
					</div>
					<div className="mcc-provider-list">
						<ChannelProviderRow
							channel={ featuredChannel }
							mode="manage"
						/>
					</div>
				</div>
			) : null }

			<div
				className="mcc-provider-surface mcc-provider-overview__channels"
				aria-labelledby="mcc-marketing-overview-channels-title"
			>
				<div className="mcc-provider-surface__toolbar">
					<div>
						<h2 id="mcc-marketing-overview-channels-title">
							{ __( 'Channels', 'multichannel-campaigns' ) }
						</h2>
						<p>
							{ __(
								'Manage channels manually when you want direct control over each connection, catalog sync, and campaign setup.',
								'multichannel-campaigns'
							) }
						</p>
					</div>
				</div>

				{ manualChannels.length > 0 ? (
					<div className="mcc-provider-list">
						{ manualChannels.map( ( channel ) => (
							<ChannelProviderRow
								key={ channel.id }
								channel={ channel }
								mode="manage"
							/>
						) ) }
					</div>
				) : (
					<div className="mcc-provider-overview__empty">
						<h3>
							{ __(
								'Marketing channels are not set up yet',
								'multichannel-campaigns'
							) }
						</h3>
						<p>
							{ __(
								'Channel recommendations and campaign data will appear here once the store is ready for marketing setup.',
								'multichannel-campaigns'
							) }
						</p>
					</div>
				) }
			</div>
		</section>
	);
};

const MarketingOverviewPerformance = (): JSX.Element => {
	const r = window.MCC_BOOT.rollup;
	const hasRollupActivity =
		r.active_count > 0 ||
		r.attributed_sales > 0 ||
		r.avg_roas > 0 ||
		r.sessions > 0;
	const metrics: RollupMetric[] = [
		{
			label: __( 'Active campaigns', 'multichannel-campaigns' ),
			value: String( r.active_count ),
			delta: hasRollupActivity ? '+1 vs last month' : undefined,
			tone: 'up',
		},
		{
			label: __( 'Attributed sales', 'multichannel-campaigns' ),
			value: fmtMoney( r.attributed_sales ),
			delta: hasRollupActivity ? '+22% vs last 30 days' : undefined,
			tone: 'up',
		},
		{
			label: __( 'Avg ROAS', 'multichannel-campaigns' ),
			value: r.avg_roas + '×',
			delta: hasRollupActivity ? '−0.3 vs last 30 days' : undefined,
			tone: 'down',
		},
		{
			label: __( 'Sessions from campaigns', 'multichannel-campaigns' ),
			value: fmtNum( r.sessions ),
			delta: hasRollupActivity ? '+18%' : undefined,
			tone: 'up',
		},
	];

	return (
		<section
			className="mcc-provider-surface mcc-rollup-summary"
			aria-labelledby="mcc-rollup-summary-title"
		>
			<div className="mcc-provider-surface__toolbar mcc-rollup-summary__header">
				<div>
					<h2 id="mcc-rollup-summary-title">
						{ __(
							'Campaign performance',
							'multichannel-campaigns'
						) }
					</h2>
				</div>
				<Button
					variant="link"
					href="admin.php?page=wc-admin&path=/analytics/marketing"
					className="mcc-rollup-summary__link"
				>
					{ __( 'View detailed stats', 'multichannel-campaigns' ) }
				</Button>
			</div>
			<div className="mcc-rollup-summary__body">
				<div className="mcc-rollup-summary__metrics">
					{ metrics.map( ( metric ) => (
						<div key={ metric.label } className="mcc-rollup-metric">
							<div className="mcc-rollup-metric__label">
								{ metric.label }
							</div>
							<div className="mcc-rollup-metric__value">
								{ metric.value }
							</div>
							{ metric.delta ? (
								<div
									className={ `mcc-rollup-metric__delta mcc-rollup-metric__delta--${ metric.tone }` }
								>
									{ metric.delta }
								</div>
							) : null }
						</div>
					) ) }
				</div>
			</div>
		</section>
	);
};

const unmountDisconnectedRoot = () => {
	if (
		overviewRoot &&
		overviewRootElement &&
		! document.body.contains( overviewRootElement )
	) {
		overviewRoot.unmount();
		overviewRoot = null;
		overviewRootElement = null;
	}
};

const enhanceMarketingOverview = () => {
	unmountDisconnectedRoot();

	if ( ! isMarketingOverviewPath() ) {
		document.body.classList.remove( 'fwa-marketing-overview-enhanced' );
		return;
	}

	document.body.classList.add( 'fwa-marketing-overview-enhanced' );

	const card = document.querySelector< HTMLElement >(
		OVERVIEW_CARD_SELECTOR
	);
	if ( ! card ) {
		return;
	}

	if ( overviewRootElement && card.contains( overviewRootElement ) ) {
		return;
	}

	if ( overviewRoot ) {
		overviewRoot.unmount();
	}

	card.classList.add( 'fwa-marketing-overview-card' );
	const mountPoint = document.createElement( 'div' );
	mountPoint.className = 'fwa-marketing-overview-card__root';
	card.replaceChildren( mountPoint );

	overviewRootElement = mountPoint;
	overviewRoot = createRoot( mountPoint );
	overviewRoot.render( <MarketingOverviewChannels /> );
};

const scheduleOverviewEnhancement = () => {
	if ( updateScheduled ) {
		return;
	}

	updateScheduled = true;
	window.requestAnimationFrame( () => {
		updateScheduled = false;
		enhanceMarketingOverview();
	} );
};

export const mountMarketingOverviewChannels = () => {
	if ( observerStarted || typeof window === 'undefined' ) {
		return;
	}

	observerStarted = true;
	scheduleOverviewEnhancement();

	const observer = new MutationObserver( scheduleOverviewEnhancement );
	observer.observe( document.body, { childList: true, subtree: true } );
	window.addEventListener( 'popstate', scheduleOverviewEnhancement );
};
