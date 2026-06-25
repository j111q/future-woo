import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const campaignsList = readFileSync( 'src/campaigns/CampaignsList.tsx', 'utf8' );

test( 'campaign rollup deltas are hidden when there is no rollup activity', () => {
	assert.ok(
		campaignsList.includes( 'hasRollupActivity' ),
		'RollupTiles should detect whether there is activity before rendering comparisons'
	);
	assert.ok(
		campaignsList.includes( "delta: hasRollupActivity ? '+1 vs last month' : undefined" ),
		'Active campaigns should not show a comparison when the rollup is empty'
	);
	assert.ok(
		campaignsList.includes( "delta: hasRollupActivity ? '+18%' : undefined" ),
		'Sessions should not show a comparison when the rollup is empty'
	);
} );
