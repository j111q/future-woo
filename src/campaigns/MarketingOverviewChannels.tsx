import { createRoot } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ChannelProviderRow } from './ChannelProviderRow';

const MARKETING_OVERVIEW_PATH = '/marketing';
const OVERVIEW_CARD_SELECTOR = '.woocommerce-marketing-channels-card';

let overviewRoot: ReturnType< typeof createRoot > | null = null;
let overviewRootElement: HTMLElement | null = null;
let observerStarted = false;
let updateScheduled = false;

const isMarketingOverviewPath = (): boolean => {
	const params = new URLSearchParams( window.location.search );
	return (
		params.get( 'page' ) === 'wc-admin' &&
		params.get( 'path' ) === MARKETING_OVERVIEW_PATH
	);
};

const MarketingOverviewChannels = (): JSX.Element => {
	const channels = window.MCC_BOOT.channels || [];
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
