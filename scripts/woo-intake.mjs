#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
	buildDesignerReport,
	loadConfig,
	selectCandidates,
} from './woo-intake/lib.mjs';

const args = process.argv.slice( 2 );
const command = args[ 0 ] ?? 'discover';

const option = ( name, fallback = undefined ) => {
	const prefix = `--${ name }=`;
	const value = args.find( ( arg ) => arg.startsWith( prefix ) );
	if ( value ) {
		return value.slice( prefix.length );
	}
	const index = args.indexOf( `--${ name }` );
	if ( index >= 0 ) {
		return args[ index + 1 ];
	}
	return fallback;
};

const allOptions = ( name ) => {
	const prefix = `--${ name }=`;
	const values = [];
	for ( let index = 0; index < args.length; index += 1 ) {
		const arg = args[ index ];
		if ( arg.startsWith( prefix ) ) {
			values.push( arg.slice( prefix.length ) );
		} else if ( arg === `--${ name }` && args[ index + 1 ] ) {
			values.push( args[ index + 1 ] );
			index += 1;
		}
	}
	return values;
};

const configPath = option( 'config', 'config/woo-intake.json' );
const outputDir = option( 'output-dir', 'sync/woo-intake' );
const candidatesPath = resolve( outputDir, 'latest-candidates.json' );
const reportPath = resolve( outputDir, 'latest-report.md' );

const ensureOutputDir = () => mkdirSync( outputDir, { recursive: true } );

const gh = ( ghArgs ) => {
	const output = execFileSync( 'gh', ghArgs, {
		encoding: 'utf8',
		stdio: [ 'ignore', 'pipe', 'inherit' ],
	} );
	return JSON.parse( output );
};

const sinceDate = ( lookbackDays ) => {
	const date = new Date();
	date.setUTCDate( date.getUTCDate() - lookbackDays );
	return date.toISOString().slice( 0, 10 );
};

const normalizeGhPullRequest = ( pullRequest ) => ( {
	number: pullRequest.number,
	title: pullRequest.title,
	url: pullRequest.url,
	author: pullRequest.author?.login ?? '',
	labels: ( pullRequest.labels ?? [] ).map( ( label ) => label.name ?? label ),
	mergedAt: pullRequest.mergedAt,
	headRefName: pullRequest.headRefName,
	files: ( pullRequest.files ?? [] ).map( ( file ) => file.path ?? file.name ?? file ),
	body: pullRequest.body ?? '',
} );

const withFiles = ( pullRequest, repository ) => {
	const details = gh( [
		'pr',
		'view',
		String( pullRequest.number ),
		'--repo',
		repository,
		'--json',
		'body,files,headRefOid',
	] );
	return normalizeGhPullRequest( {
		...pullRequest,
		...details,
		files: details.files ?? pullRequest.files,
	} );
};

const discoverPullRequests = ( config ) => {
	const since = option( 'since', sinceDate( config.lookbackDays ) );
	const mergedPullRequests = gh( [
		'pr',
		'list',
		'--repo',
		config.wooRepository,
		'--state',
		'merged',
		'--limit',
		String( config.maxPullRequests ),
		'--search',
		`merged:>=${ since }`,
		'--json',
		'number,title,url,author,labels,mergedAt,headRefName',
	] );
	const trackedNumbers = new Set( config.trackedPullRequests.map( ( item ) => Number( item.number ) ) );
	const byNumber = new Map(
		mergedPullRequests.map( ( pullRequest ) => [
			Number( pullRequest.number ),
			pullRequest,
		] )
	);

	for ( const trackedPullRequest of config.trackedPullRequests ) {
		if ( ! byNumber.has( Number( trackedPullRequest.number ) ) ) {
			const details = gh( [
				'pr',
				'view',
				String( trackedPullRequest.number ),
				'--repo',
				config.wooRepository,
				'--json',
				'number,title,url,author,labels,mergedAt,headRefName',
			] );
			byNumber.set( Number( trackedPullRequest.number ), details );
		}
	}

	return [ ...byNumber.values() ].map( ( pullRequest ) => {
		if ( trackedNumbers.has( Number( pullRequest.number ) ) || pullRequest.number ) {
			return withFiles( pullRequest, config.wooRepository );
		}
		return normalizeGhPullRequest( pullRequest );
	} );
};

const checksFromArgs = () => allOptions( 'check' ).map( ( check ) => {
	const [ name, status ] = check.split( ':' );
	return {
		name: name?.trim() || check,
		ok: status?.trim() === 'ok',
	};
} );

const writeRunFiles = ( { config, candidates, gate } ) => {
	ensureOutputDir();
	writeFileSync( candidatesPath, `${ JSON.stringify( candidates, null, '\t' ) }\n` );
	writeFileSync( reportPath, buildDesignerReport( {
		config,
		candidates,
		gate,
	} ) );
};

if ( command === 'discover' ) {
	const config = loadConfig( configPath );
	const pullRequests = discoverPullRequests( config );
	const candidates = selectCandidates( pullRequests, config );
	writeRunFiles( {
		config,
		candidates,
		gate: {
			status: option( 'gate-status', 'pending' ),
			checks: checksFromArgs(),
		},
	} );
	console.log( `Found ${ candidates.length } Woo intake candidate(s).` );
} else if ( command === 'set-gate' ) {
	const config = loadConfig( configPath );
	const candidates = JSON.parse( readFileSync( candidatesPath, 'utf8' ) );
	writeRunFiles( {
		config,
		candidates,
		gate: {
			status: option( 'gate-status', 'pending' ),
			checks: checksFromArgs(),
		},
	} );
	console.log( `Updated ${ reportPath }.` );
} else if ( command === 'report' ) {
	console.log( readFileSync( reportPath, 'utf8' ) );
} else {
	console.error( `Unknown woo-intake command: ${ command }` );
	process.exit( 1 );
}
