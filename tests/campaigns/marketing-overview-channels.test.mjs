import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const campaignsEntry = readFileSync( 'src/campaigns/index.tsx', 'utf8' );
const campaignsList = readFileSync( 'src/campaigns/CampaignsList.tsx', 'utf8' );
const mccAdminPage = readFileSync( 'includes/class-mcc-admin-page.php', 'utf8' );
const mccData = readFileSync( 'includes/class-mcc-data.php', 'utf8' );
const styles = readFileSync( 'src/campaigns/style.scss', 'utf8' );

test( 'Marketing Overview owns the channel provider list', () => {
	const overviewChannels = readFileSync(
		'src/campaigns/MarketingOverviewChannels.tsx',
		'utf8'
	);

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
		/woocommerce-marketing-channels-card\s*{[^}]*border-left:\s*0/s,
		'the primary Channels surface should read as full-width rows, not a narrow card'
	);
} );
