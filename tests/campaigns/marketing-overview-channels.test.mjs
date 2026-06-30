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
