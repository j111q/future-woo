import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const campaignCreate = readFileSync( 'src/campaigns/CampaignCreate.tsx', 'utf8' );
const campaignStyles = readFileSync( 'src/campaigns/style.scss', 'utf8' );

test( 'campaign create treats Woo Ads as recommendations, not a manual channel', () => {
	assert.match(
		campaignCreate,
		/Optimize campaign with Woo Ads/,
		'Woo Ads should be presented as the ongoing optimization path'
	);
	assert.doesNotMatch(
		campaignCreate,
		/Generate recommendations with Woo Ads/,
		'Woo Ads should not read as a one-time recommendation generator'
	);
	assert.match(
		campaignCreate,
		/Manage channels and activities manually/,
		'The create flow should offer a manual channel-management path'
	);
	assert.match(
		campaignCreate,
		/ToggleControl/,
		'Manual channels should be simple on/off toggles'
	);
	assert.match(
		campaignCreate,
		/aria-label=\{\s*sprintf\(/,
		'Manual channel toggles should keep accessible labels without adding visible row clutter'
	);
	assert.match(
		campaignCreate,
		/mcc-manual-channel-row__toggle[\s\S]*mcc-manual-channel-row__logo/,
		'Manual channel toggles should be first in the row, before the channel logo'
	);
	assert.match(
		campaignCreate,
		/ChannelProviderLogo[\s\S]*channelId=\{\s*ch\.id\s*\}/,
		'Manual channel rows should use the shared marketing channel logo marks from main'
	);
	assert.match(
		campaignCreate,
		/draft\.channels\[\s*ch\.id\s*\]\s*&&\s*\(/,
		'Manual channel detail actions should only render for enabled channels'
	);
	assert.match(
		campaignCreate,
		/Manage activity/,
		'Enabled manual channels should expose an activity-management action'
	);
	assert.doesNotMatch(
		campaignCreate,
		/Manage campaign details/,
		'Manual channel actions should use the shorter activity-management label'
	);
	assert.doesNotMatch(
		campaignCreate,
		/<ChannelProviderRow/,
		'Manual channels should not use provider-card rows with descriptions and badges'
	);
	assert.match(
		campaignCreate,
		/Preview initial recommendation/,
		'Merchants should be able to inspect the initial Woo Ads plan before launch'
	);
	assert.match(
		campaignCreate,
		/mcc-woo-ads-optimization__intro[\s\S]*mcc-woo-ads-optimization__description[\s\S]*Preview initial recommendation/,
		'The Woo Ads preview button should sit under the optimization description instead of squeezing into the header row'
	);
	assert.match(
		campaignStyles,
		/\.mcc-page-header\s*\{[\s\S]*position:\s*sticky;[\s\S]*top:\s*var\(--wp-admin--admin-bar--height,\s*32px\);[\s\S]*z-index:/,
		'The custom campaign page header should stay sticky so launch actions remain visible'
	);
	assert.match(
		campaignCreate,
		/Recommended channels/,
		'The initial preview should summarize the recommended channel mix'
	);
	assert.match(
		campaignCreate,
		/Estimated spend/,
		'The initial preview should estimate campaign spend'
	);
	assert.match(
		campaignCreate,
		/Based on estimated revenue impact of/,
		'The initial preview should explain that recommendations use the entered revenue target'
	);
	assert.match(
		campaignCreate,
		/Goal[\s\S]*Budget[\s\S]*Products to advertise/,
		'Campaign budget should follow the goal recommendation step before merchants choose products to advertise'
	);
	assert.match(
		campaignCreate,
		/budget:\s*'2400'/,
		'Campaign drafts should track an editable total budget'
	);
	assert.match(
		campaignCreate,
		/budgetFields/,
		'Budget should use a dedicated form section instead of being hidden inside goal fields'
	);
	assert.match(
		campaignCreate,
		/Recommended starting budget/,
		'The budget card should show Woo Ads guidance for a starting budget'
	);
	assert.match(
		campaignCreate,
		/getBudgetAmount\(\s*draft\s*\)/,
		'Recommendation preview should use the merchant-set budget amount'
	);
	assert.match(
		campaignCreate,
		/fmtMoney\(\s*Number\(\s*draft\.target\s*\)\s*\)/,
		'The revenue-impact line should render the current target value from the form'
	);
	assert.match(
		campaignCreate,
		/mcc-recommendation-preview__section/,
		'Recommendation headings and body copy should share a section wrapper for alignment'
	);
	assert.match(
		campaignCreate,
		/Duration/,
		'The initial preview should summarize campaign duration'
	);
	assert.match(
		campaignCreate,
		/Products to advertise[\s\S]*Channels & activities/,
		'Campaign scope should be chosen before merchants decide channels and activities'
	);
	assert.match(
		campaignCreate,
		/Advertise the whole catalog/,
		'Campaigns should default to a whole-catalog advertising scope'
	);
	assert.match(
		campaignCreate,
		/Choose products or categories/,
		'Merchants should be able to narrow the campaign to selected products or categories'
	);
	assert.match(
		campaignCreate,
		/product_scope:\s*'catalog'/,
		'Whole catalog should be the default product scope'
	);
	assert.match(
		campaignCreate,
		/product_targets:\s*\[\]/,
		'Selected product targets should be tracked separately from the scope mode'
	);
	assert.match(
		campaignCreate,
		/Search products or categories/,
		'The selected-scope path should expose a searchable product/category picker'
	);
	assert.match(
		campaignCreate,
		/ProductTargetPicker/,
		'The product-scope step should use a reusable picker instead of hard-coding one-off checkboxes inline'
	);
	assert.match(
		campaignCreate,
		/Products[\s\S]*getProductScopeSummary\(\s*draft\s*\)/,
		'The Woo Ads preview should summarize the selected advertising scope'
	);
	assert.match(
		campaignCreate,
		/Preview what the public will see/,
		'The initial recommendation should let merchants preview public-facing ad creative'
	);
	assert.match(
		campaignCreate,
		/Modal[\s\S]*mcc-public-preview-modal/,
		'The public preview should open in a modal instead of expanding the recommendation card'
	);
	assert.match(
		campaignCreate,
		/publicAdPreviews[\s\S]*Google Shopping[\s\S]*Facebook feed[\s\S]*Instagram story[\s\S]*Pinterest pin/s,
		'The public preview should carousel through mocked-up channel ad placements'
	);
	assert.match(
		campaignCreate,
		/activePublicPreviewIndex/,
		'The public preview modal should track the active carousel slide'
	);
	assert.match(
		campaignCreate,
		/getPrimaryProductForPreview\(\s*draft\s*\)/,
		'Public ad previews should use the selected product scope when choosing the mock product asset'
	);
	assert.match(
		campaignStyles,
		/\.mcc-public-preview-carousel/,
		'The public-facing ad preview carousel should have dedicated styles'
	);
	assert.match(
		campaignCreate,
		/\.filter\(\s*\(\s*channel\s*\)\s*=>\s*channel\.id\s*!==\s*'woo_ads'\s*\)/s,
		'Woo Ads should be filtered out of the manual channel list'
	);
	assert.match(
		campaignCreate,
		/Tumblr.*Blaze.*Pocket Casts/s,
		'Woo Ads copy should explain that recommendations can include Automattic-owned channels'
	);
} );
