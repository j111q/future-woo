import { readFileSync } from 'node:fs';

const DEFAULT_CONFIG = {
	lookbackDays: 7,
	maxPullRequests: 40,
	minimumScore: 3,
	autoMerge: false,
	designSignals: {
		labels: [],
		paths: [],
		keywords: [],
		authors: [],
	},
	featureFlags: [],
	trackedPullRequests: [],
	patchAdapters: [],
	surfacePolicies: [],
};

const normalizeText = ( value ) => String( value ?? '' ).trim().toLowerCase();

const normalizeList = ( values ) => {
	if ( ! Array.isArray( values ) ) {
		return [];
	}

	return values
		.map( ( value ) => normalizeText( typeof value === 'object' ? value.name ?? value.login ?? value.path : value ) )
		.filter( Boolean );
};

const normalizePathList = ( values ) => {
	if ( ! Array.isArray( values ) ) {
		return [];
	}

	return values
		.map( ( value ) => String( typeof value === 'object' ? value.path ?? value.filename ?? value.name : value ?? '' ).trim() )
		.filter( Boolean );
};

export function loadConfigFromString( source ) {
	const parsed = JSON.parse( source );
	const designSignals = {
		...DEFAULT_CONFIG.designSignals,
		...( parsed.designSignals ?? {} ),
	};

	return {
		...DEFAULT_CONFIG,
		...parsed,
		designSignals: {
			labels: normalizeList( designSignals.labels ),
			paths: normalizePathList( designSignals.paths ),
			keywords: normalizeList( designSignals.keywords ),
			authors: normalizeList( designSignals.authors ),
		},
		featureFlags: Array.isArray( parsed.featureFlags ) ? parsed.featureFlags : [],
		trackedPullRequests: Array.isArray( parsed.trackedPullRequests ) ? parsed.trackedPullRequests : [],
		patchAdapters: Array.isArray( parsed.patchAdapters ) ? parsed.patchAdapters : [],
		surfacePolicies: Array.isArray( parsed.surfacePolicies ) ? parsed.surfacePolicies : [],
	};
}

export function loadConfig( configPath = 'config/woo-intake.json' ) {
	return loadConfigFromString( readFileSync( configPath, 'utf8' ) );
}

const labelNames = ( pullRequest ) => normalizeList( pullRequest.labels );

const fileNames = ( pullRequest ) => normalizePathList( pullRequest.files );

const authorName = ( pullRequest ) => normalizeText(
	typeof pullRequest.author === 'object'
		? pullRequest.author.login ?? pullRequest.author.name
		: pullRequest.author
);

export function scorePullRequest( pullRequest, config ) {
	const labels = labelNames( pullRequest );
	const files = fileNames( pullRequest );
	const author = authorName( pullRequest );
	const searchableText = normalizeText( [
		pullRequest.title,
		pullRequest.body,
		pullRequest.headRefName,
	].filter( Boolean ).join( ' ' ) );
	const reasons = [];
	let score = 0;

	for ( const label of config.designSignals.labels ) {
		if ( labels.includes( label ) ) {
			score += 2;
			reasons.push( `label: ${ label }` );
		}
	}

	for ( const configuredPath of config.designSignals.paths ) {
		if ( files.some( ( file ) => file.startsWith( configuredPath ) ) ) {
			score += 1;
			reasons.push( `path: ${ configuredPath }` );
		}
	}

	for ( const keyword of config.designSignals.keywords ) {
		if ( searchableText.includes( keyword ) ) {
			score += 2;
			reasons.push( `keyword: ${ keyword }` );
		}
	}

	for ( const configuredAuthor of config.designSignals.authors ) {
		if ( author.includes( configuredAuthor ) ) {
			score += 2;
			reasons.push( `author: ${ configuredAuthor }` );
		}
	}

	for ( const trackedPullRequest of config.trackedPullRequests ) {
		if ( Number( trackedPullRequest.number ) === Number( pullRequest.number ) ) {
			score += 3;
			reasons.push( `tracked PR: ${ trackedPullRequest.label ?? trackedPullRequest.number }` );
		}
	}

	const { body, ...reportablePullRequest } = pullRequest;

	return {
		...reportablePullRequest,
		author,
		files,
		labels,
		reasons: [ ...new Set( reasons ) ],
		score,
		selected: score >= config.minimumScore,
	};
}

export function selectCandidates( pullRequests, config ) {
	return pullRequests
		.map( ( pullRequest ) => scorePullRequest( pullRequest, config ) )
		.filter( ( pullRequest ) => pullRequest.selected )
		.sort( ( a, b ) => b.score - a.score || Number( b.number ) - Number( a.number ) );
}

export function forceEnabledFlags( config ) {
	return [
		...new Set(
			config.featureFlags
				.filter( ( featureFlag ) => featureFlag.enabled !== false )
				.flatMap( ( featureFlag ) => featureFlag.flags?.length ? featureFlag.flags : [ featureFlag.id ] )
				.map( ( flag ) => String( flag ).trim() )
				.filter( Boolean )
		),
	];
}

const matchRuleReasons = ( candidate, rules = {} ) => {
	const reasons = [];
	const files = fileNames( candidate );
	const titleAndBody = normalizeText( [
		candidate.title,
		candidate.body,
		candidate.headRefName,
	].filter( Boolean ).join( ' ' ) );
	const author = authorName( candidate );
	const labels = labelNames( candidate );

	for ( const path of normalizePathList( rules.paths ) ) {
		if ( files.some( ( file ) => file.startsWith( path ) ) ) {
			reasons.push( `path: ${ path }` );
		}
	}

	for ( const keyword of normalizeList( rules.keywords ) ) {
		if ( titleAndBody.includes( keyword ) ) {
			reasons.push( `keyword: ${ keyword }` );
		}
	}

	for ( const configuredAuthor of normalizeList( rules.authors ) ) {
		if ( author.includes( configuredAuthor ) ) {
			reasons.push( `author: ${ configuredAuthor }` );
		}
	}

	for ( const label of normalizeList( rules.labels ) ) {
		if ( labels.includes( label ) ) {
			reasons.push( `label: ${ label }` );
		}
	}

	for ( const number of rules.pullRequests ?? [] ) {
		if ( Number( number ) === Number( candidate.number ) ) {
			reasons.push( `PR: ${ number }` );
		}
	}

	return [ ...new Set( reasons ) ];
};

export function matchPatchAdapters( candidates, config ) {
	return config.patchAdapters.flatMap( ( adapter ) => {
		const matches = candidates
			.map( ( candidate ) => ( {
				candidate,
				matchedBy: matchRuleReasons( candidate, adapter.matches ),
			} ) )
			.filter( ( match ) => match.matchedBy.length > 0 );

		return matches.map( ( match ) => ( {
			adapterId: adapter.id,
			label: adapter.label ?? adapter.id,
			status: adapter.status ?? 'planned',
			localTarget: adapter.localTarget,
			reviewPath: adapter.reviewPath,
			notes: Array.isArray( adapter.notes ) ? adapter.notes : [],
			candidate: match.candidate,
			matchedBy: match.matchedBy,
		} ) );
	} );
}

export function classifyCandidateIntent( candidate ) {
	const labels = labelNames( candidate );
	const searchableText = normalizeText( [
		candidate.title,
		candidate.body,
		candidate.headRefName,
		...( candidate.reasons ?? [] ),
	].filter( Boolean ).join( ' ' ) );

	if (
		labels.some( ( label ) => [ 'feature flag', 'experimental', 'experiment' ].includes( label ) ) ||
		/\b(feature flag|behind a flag|behind flag|experiment|experimental)\b/.test( searchableText )
	) {
		return 'feature-flag';
	}

	if (
		labels.some( ( label ) => [ 'bug', 'bugfix', 'regression' ].includes( label ) ) ||
		/^(fix|fixes|fixed|bugfix|bug fix)\b/.test( searchableText ) ||
		/\b(regression|bug)\b/.test( searchableText )
	) {
		return 'bugfix';
	}

	if (
		labels.some( ( label ) => [ 'design', 'ux', 'prototype' ].includes( label ) ) ||
		/\b(redesign|vision|prototype|concept)\b/.test( searchableText )
	) {
		return 'vision-change';
	}

	return 'default';
}

const defaultActionForMode = ( mode ) => {
	switch ( normalizeText( mode ) ) {
		case 'vision-owned':
			return 'report-only';
		case 'hybrid':
			return 'draft-pr';
		case 'mirror-owned':
			return 'self-merge';
		default:
			return 'draft-pr';
	}
};

const actionForSurfaceIntent = ( surface, intent ) => {
	const intake = surface.intake ?? {};
	return intake[ intent ] ?? intake.default ?? defaultActionForMode( surface.mode );
};

export function classifySurfaceDecisions( candidates, config ) {
	return ( config.surfacePolicies ?? [] ).flatMap( ( surface ) => {
		return candidates
			.map( ( candidate ) => ( {
				candidate,
				matchedBy: matchRuleReasons( candidate, surface.matches ),
			} ) )
			.filter( ( match ) => match.matchedBy.length > 0 )
			.map( ( match ) => {
				const intent = classifyCandidateIntent( match.candidate );
				return {
					surfaceId: surface.id,
					label: surface.label ?? surface.id,
					mode: surface.mode ?? 'hybrid',
					owner: surface.owner,
					reviewPath: surface.reviewPath,
					notes: Array.isArray( surface.notes ) ? surface.notes : [],
					candidate: match.candidate,
					intent,
					action: actionForSurfaceIntent( surface, intent ),
					matchedBy: match.matchedBy,
				};
			} );
	} );
}

export function resolveGateStatus( verificationStatus, surfaceDecisions = [] ) {
	if ( normalizeText( verificationStatus ) !== 'merge' ) {
		return 'hold';
	}

	const needsHumanReview = surfaceDecisions.some( ( decision ) => {
		return [ 'draft-pr', 'hold' ].includes( normalizeText( decision.action ) );
	} );

	return needsHumanReview ? 'hold' : 'merge';
}

const checkbox = ( ok ) => ok ? 'pass' : 'fail';

export function buildDesignerReport( {
	config,
	candidates,
	adapterMatches = matchPatchAdapters( candidates, config ),
	surfaceDecisions = classifySurfaceDecisions( candidates, config ),
	gate = { status: 'pending', checks: [] },
	now = new Date(),
} ) {
	const date = now.toISOString().slice( 0, 10 );
	const lines = [
		'# Future Woo intake report',
		'',
		`Generated: ${ date }`,
		`Source: ${ config.wooRepository }`,
		`Auto-merge gate: ${ gate.status }`,
		'',
		'## What the bot checked',
		'',
		`- Recent merged Woo PRs from the last ${ config.lookbackDays } days.`,
		'- Design-facing labels, paths, keywords, tracked people, and explicitly tracked PRs.',
		'- Future Woo feature flags that should be forced on for the prototype.',
		'',
		'## Gate checks',
		'',
	];

	if ( gate.checks?.length ) {
		for ( const check of gate.checks ) {
			lines.push( `- ${ checkbox( check.ok ) }: ${ check.name }` );
		}
	} else {
		lines.push( '- pending: checks have not run yet.' );
	}

	lines.push(
		'',
		'## Feature flags Future Woo will force-enable',
		''
	);

	for ( const featureFlag of config.featureFlags.filter( ( item ) => item.enabled !== false ) ) {
		const flags = ( featureFlag.flags?.length ? featureFlag.flags : [ featureFlag.id ] ).join( ', ' );
		lines.push( `- ${ featureFlag.label ?? featureFlag.id }: ${ flags }` );
		if ( featureFlag.reviewPath ) {
			lines.push( `  Designer review path: ${ featureFlag.reviewPath }` );
		}
	}

	lines.push( '', '## Woo candidates', '' );

	if ( ! candidates.length ) {
		lines.push( 'No matching Woo PRs were found in this run.' );
	} else {
		for ( const candidate of candidates ) {
			lines.push( `### #${ candidate.number } ${ candidate.title }` );
			if ( candidate.url ) {
				lines.push( candidate.url );
			}
			lines.push( '' );
			lines.push( `Score: ${ candidate.score }` );
			if ( candidate.author ) {
				lines.push( `Author: ${ candidate.author }` );
			}
			if ( candidate.reasons.length ) {
				lines.push( `Why it matched: ${ candidate.reasons.join( '; ' ) }` );
			}
			if ( candidate.files.length ) {
				lines.push( 'Touched areas:' );
				for ( const file of candidate.files.slice( 0, 8 ) ) {
					lines.push( `- ${ file }` );
				}
			}
			lines.push( '' );
		}
	}

	lines.push( '## Surface ownership policy', '' );

	if ( ! surfaceDecisions.length ) {
		lines.push( 'No surface ownership policies matched this run.' );
		lines.push( '' );
	} else {
		for ( const decision of surfaceDecisions ) {
			lines.push( `### ${ decision.label }` );
			lines.push( `Mode: ${ decision.mode }` );
			if ( decision.owner ) {
				lines.push( `Owner: ${ decision.owner }` );
			}
			lines.push( `Woo PR: #${ decision.candidate.number } ${ decision.candidate.title }` );
			lines.push( `Intent: ${ decision.intent }` );
			lines.push( `Action: ${ decision.action }` );
			if ( decision.reviewPath ) {
				lines.push( `Designer review path: ${ decision.reviewPath }` );
			}
			if ( decision.matchedBy.length ) {
				lines.push( `Matched by: ${ decision.matchedBy.join( '; ' ) }` );
			}
			if ( decision.action === 'report-only' ) {
				lines.push( 'Auto-apply: skipped; this stays visible without overwriting the Future Woo surface.' );
			} else if ( decision.action === 'draft-pr' || decision.action === 'hold' ) {
				lines.push( 'Auto-merge: held; the bot should leave a draft PR for review.' );
			}
			for ( const note of decision.notes ) {
				lines.push( `- ${ note }` );
			}
			lines.push( '' );
		}
	}

	lines.push( '## Patch adapters', '' );

	if ( ! adapterMatches.length ) {
		lines.push( 'No patch adapters matched this run.' );
		lines.push( '' );
	} else {
		for ( const adapterMatch of adapterMatches ) {
			lines.push( `### ${ adapterMatch.label }` );
			lines.push( `Status: ${ adapterMatch.status }` );
			lines.push( `Matched Woo PR: #${ adapterMatch.candidate.number } ${ adapterMatch.candidate.title }` );
			if ( adapterMatch.localTarget ) {
				lines.push( `Local target: ${ adapterMatch.localTarget }` );
			}
			if ( adapterMatch.reviewPath ) {
				lines.push( `Designer review path: ${ adapterMatch.reviewPath }` );
			}
			if ( adapterMatch.matchedBy.length ) {
				lines.push( `Matched by: ${ adapterMatch.matchedBy.join( '; ' ) }` );
			}
			for ( const note of adapterMatch.notes ) {
				lines.push( `- ${ note }` );
			}
			lines.push( '' );
		}
	}

	const reviewPaths = [
		...new Set(
			[
				...config.featureFlags.map( ( featureFlag ) => featureFlag.reviewPath ),
				...adapterMatches.map( ( adapterMatch ) => adapterMatch.reviewPath ),
				...surfaceDecisions.map( ( decision ) => decision.reviewPath ),
			]
				.filter( Boolean )
		),
	];

	lines.push( '## Designer review paths', '' );
	for ( const reviewPath of reviewPaths ) {
		lines.push( `- ${ reviewPath }` );
	}

	lines.push(
		'',
		'## How to read this',
		'',
		'- If the gate says `merge`, the bot is allowed to merge this PR after it creates it.',
		'- If the gate says `hold`, the bot leaves a draft PR and this report is the handoff.',
		'- A candidate here is not a promise that the patch applied. It is a designer-relevant Woo change the bot noticed and tried to keep visible.'
	);

	return `${ lines.join( '\n' ) }\n`;
}
