import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const campaignsEntry = readFileSync( 'src/campaigns/index.tsx', 'utf8' );
const campaignsList = readFileSync( 'src/campaigns/CampaignsList.tsx', 'utf8' );
const mccAdminPage = readFileSync( 'includes/class-mcc-admin-page.php', 'utf8' );
const mccData = readFileSync( 'includes/class-mcc-data.php', 'utf8' );
const providerRow = readFileSync(
	'src/campaigns/ChannelProviderRow.tsx',
	'utf8'
);
const providerLogoPath = 'src/campaigns/ChannelProviderLogo.tsx';
const providerLogo = existsSync( providerLogoPath )
	? readFileSync( providerLogoPath, 'utf8' )
	: '';
const styles = readFileSync( 'src/campaigns/style.scss', 'utf8' );
const overviewChannels = readFileSync(
	'src/campaigns/MarketingOverviewChannels.tsx',
	'utf8'
);

test( 'Marketing Overview owns the channel provider list', () => {
	assert.match(
		campaignsEntry,
		/mountMarketingOverviewChannels\(\)/,
		'the campaigns bundle should enhance the native Marketing Overview route'
	);
	assert.match(
		overviewChannels,
		/woocommerce-marketing-channels-card/,
		'the Overview enhancer should replace the native Channels card'
	);
	assert.match(
		overviewChannels,
		/ChannelProviderRow/,
		'Overview should reuse the shared provider-row component'
	);
	assert.doesNotMatch(
		campaignsEntry,
		/CampaignChannels/,
		'Marketing > Campaigns should no longer have a Channels sub-view'
	);
} );

test( 'Marketing Overview removes the native customer-acquisition promo banner', () => {
	assert.match(
		overviewChannels,
		/LEGACY_MARKETING_PROMO_TEXT/,
		'the Overview enhancer should identify the native promo banner by headline'
	);
	assert.match(
		overviewChannels,
		/Reach new customers and increase sales without leaving WooCommerce/,
		'the retired native promo banner headline should be documented in the enhancer'
	);
	assert.match(
		overviewChannels,
		/removeLegacyMarketingPromoBanner\(\)/,
		'the Overview enhancer should remove the native promo banner while enhancing the page'
	);
	assert.doesNotMatch(
		overviewChannels,
		/<h[1-6][^>]*>\s*\{\s*__\(\s*'Reach new customers and increase sales without leaving WooCommerce'/,
		'Future Woo should not render the retired native promo banner itself'
	);
} );

test( 'Marketing Overview separates Woo Ads from manually managed channels', () => {
	assert.match(
		overviewChannels,
		/<MarketingOverviewPerformance\s*\/>[\s\S]*Optimize marketing across channels[\s\S]*Channels/,
		'Overview should put campaign performance first, then Woo Ads, then manual channels'
	);
	assert.match(
		overviewChannels,
		/Campaign performance/,
		'Overview should label the performance card clearly'
	);
	assert.match(
		overviewChannels,
		/Optimize marketing across channels/,
		'Woo Ads should move into a dedicated optimizer card'
	);
	assert.match(
		overviewChannels,
		/Manage channels manually/,
		'the regular Channels card should explain direct channel management'
	);
	assert.match(
		overviewChannels,
		/featuredChannel/,
		'Overview should identify the featured Woo Ads channel separately'
	);
	assert.match(
		overviewChannels,
		/manualChannels/,
		'Overview should render non-featured channels in their own list'
	);
	assert.match(
		overviewChannels,
		/!\s*channel\.featured/,
		'manual channels should exclude the featured Woo Ads row'
	);
	assert.doesNotMatch(
		overviewChannels,
		/businessLocation|mcc-provider-location|Business location/,
		'the Channels header should not show the business-location control'
	);
	assert.match(
		styles,
		/\.mcc-provider-overview\s*{[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*gap:/s,
		'Overview should lay out multiple provider cards as sibling surfaces'
	);
	assert.match(
		styles,
		/\.woocommerce-marketing-channels-card\s*{[^}]*border:\s*0/s,
		'the native wrapper should not add another card around the two provider cards'
	);
} );

test( 'Marketing Campaigns has no secondary tab strip', () => {
	assert.doesNotMatch(
		campaignsEntry,
		/mcc-page-tabs/,
		'Campaigns should not render Campaigns/Channels tabs'
	);
	assert.doesNotMatch(
		campaignsList,
		/tabs\??:/,
		'CampaignsList should not accept a tabs prop'
	);
} );

test( 'Campaigns page is hidden until a channel is connected', () => {
	assert.match(
		mccData,
		/public static function has_connected_channel/,
		'channel setup state should be centralized in MCC_Data'
	);
	assert.match(
		mccAdminPage,
		/if \( ! MCC_Data::has_connected_channel\(\) \) \{\s+return \$pages;\s+\}/,
		'wc-admin Campaigns registration should be skipped without connected channels'
	);
	assert.match(
		mccAdminPage,
		/remove_campaigns_nav_until_connected/,
		'nested nav should remove Campaigns when no connected channel exists'
	);
	assert.match(
		campaignsEntry,
		/hasConnectedMarketingChannel/,
		'the client page registry should also gate direct Campaigns route registration'
	);
} );

test( 'native Marketing Overview cards share the provider-list styling', () => {
	assert.match(
		styles,
		/woocommerce-marketing-overview-multichannel/,
		'Overview cards should be styled from the campaigns bundle'
	);
	assert.match(
		styles,
		/woocommerce_marketing_plugin_card_body/,
		'Discover more marketing tools rows should match provider-row anatomy'
	);
	assert.match(
		styles,
		/woocommerce-marketing-learn-marketing-card/,
		'Learn about marketing a store should read as a sibling surface'
	);
} );

test( 'Marketing channel rows render brand logos instead of letter swatches', () => {
	assert.match(
		providerRow,
		/ChannelProviderLogo/,
		'provider rows should render the shared logo component'
	);
	assert.doesNotMatch(
		providerRow,
		/<div className="mcc-provider-row__logo" style=\{ logoStyle \}>\s*\{\s*channel\.short\s*\}\s*<\/div>/,
		'provider rows should not render the old letter-only swatch'
	);

	for ( const id of [
		'woo_ads',
		'google',
		'meta',
		'pinterest',
		'tiktok',
		'amazon',
		'ebay',
	] ) {
		assert.match(
			providerLogo,
			new RegExp( `${ id }:` ),
			`${ id } should have a real brand mark`
		);
	}

	assert.match(
		providerLogo,
		/mcc-provider-logo-mark/,
		'logo SVGs should share a stable class for visual styling'
	);
	assert.match(
		styles,
		/\.mcc-provider-logo-mark/,
		'provider logos should be sized by the campaign stylesheet'
	);
} );

test( 'Woo Ads follows Payments-style official and network-logo treatment', () => {
	assert.match(
		providerRow,
		/mcc-provider-official-badge/,
		'Official should render with the same icon-led treatment as Settings > Payments'
	);
	assert.match(
		providerRow,
		/supported_channel_ids/,
		'Woo Ads should be able to render the individual channels it coordinates'
	);
	assert.match(
		providerRow,
		/supportedChannelLogoById/,
		'Woo Ads should support logo-only channels that are not manual setup rows'
	);
	assert.match(
		providerRow,
		/Tumblr/,
		'Tumblr should be available as a Woo Ads logo-only channel'
	);
	assert.match(
		providerRow,
		/Pocket Casts/,
		'Pocket Casts should be available as a Woo Ads logo-only channel'
	);
	assert.match(
		providerRow,
		/mcc-provider-row__network-logos/,
		'Woo Ads should show a compact row of supported channel logos under the description'
	);
	assert.match(
		providerLogo,
		/tumblr:/,
		'Tumblr should have a real brand mark'
	);
	assert.match(
		providerLogo,
		/pocket_casts:/,
		'Pocket Casts should have a real brand mark'
	);
	assert.match(
		providerLogo,
		/viewBox:\s*'0 0 40 40'/,
		'Woo Ads should use the newer Woo square logo shape from Payments'
	);
	assert.match(
		providerLogo,
		/#873EFF/,
		'Woo Ads should use the current Woo purple brand asset color'
	);
	assert.match(
		styles,
		/\.mcc-provider-official-badge/,
		'Official badge should have local styling rather than using a generic info badge'
	);
	assert.match(
		styles,
		/\.mcc-provider-row__network-logo/,
		'network logos should be styled as compact logo tiles'
	);
	assert.doesNotMatch(
		styles,
		/\.mcc-provider-row\s*{[^}]*&\.is-featured\s*{[^}]*surface-brand/s,
		'Woo Ads should not use a purple featured-row background'
	);
} );

test( 'Marketing provider rows do not render capability chips', () => {
	assert.doesNotMatch(
		providerRow,
		/mcc-provider-row__capabilities|Channel capabilities/,
		'channel rows should not render capability-chip badges under the description'
	);
	assert.doesNotMatch(
		styles,
		/\.mcc-provider-row__capabilities/,
		'capability-chip styling should be removed with the chips'
	);
} );

test( 'Marketing Overview uses full-width Settings-style rows', () => {
	assert.match(
		styles,
		/--fwa-marketing-settings-gutter:\s*30px/,
		'Overview should define the same gutter rhythm used by Settings tables'
	);
	assert.match(
		styles,
		/\.woocommerce-layout__primary\s*{[^}]*margin-left:\s*var\(--fwa-marketing-settings-gutter\)/s,
		'Overview should align the wc-admin content column with Settings rows'
	);
	assert.match(
		styles,
		/\.woocommerce-layout__main\s*{[^}]*padding-right:\s*var\(--fwa-marketing-settings-gutter\)/s,
		'Overview should keep the right edge aligned with Settings rows'
	);
	assert.match(
		styles,
		/woocommerce-marketing-overview-multichannel\s*{[^}]*max-width:\s*none/s,
		"Overview should override Woo's centered Marketing column"
	);
	assert.match(
		styles,
		/woocommerce-marketing-overview-multichannel\s*{[^}]*padding:\s*var\(--wpds-dimension-padding-xl,\s*24px\)\s*0\s*48px/s,
		'Overview should not inset the full-width provider rows'
	);
	assert.match(
		styles,
		/woocommerce-marketing-overview-multichannel > \.components-card\s*{[^}]*width:\s*100%/s,
		'Overview cards should stretch across the available settings content area'
	);
	assert.match(
		styles,
		/woocommerce-marketing-channels-card\s*{[^}]*border:\s*0/s,
		'the native Channels wrapper should not add a card around the provider surfaces'
	);
} );
