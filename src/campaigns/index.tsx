/**
 * Multichannel Campaigns — wc-admin extension page entry.
 *
 * Registers a React component at /marketing/campaigns. wc-admin renders
 * it inside its shell, which gives us the 10.9 header + Marketing nav
 * for free.
 */
import { addFilter } from '@wordpress/hooks';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { CampaignsList } from './CampaignsList';
import { CampaignCreate } from './CampaignCreate';
import { Detail } from './CampaignDetail';
import { CampaignChannels } from './CampaignChannels';
import './style.scss';

// REST nonce wiring.
apiFetch.use(
	apiFetch.createNonceMiddleware( window.MCC_BOOT.nonce )
);

type ViewState =
	| { name: 'list' }
	| { name: 'channels' }
	| { name: 'create' }
	| { name: 'detail'; id: number };

const CampaignsPage = (): JSX.Element => {
	const [ view, setView ] = useState< ViewState >( { name: 'list' } );
	const [ notice, setNotice ] = useState< { status: 'success' | 'info'; text: string } | null >( null );

	// Hide the Activity Panel + Launch-Your-Store status on this page only.
	// We add a body class on mount and scope our CSS to it, so the moment
	// the user navigates away the chrome reappears.
	useEffect( () => {
		document.body.classList.add( 'mcc-page-active' );
		return () => document.body.classList.remove( 'mcc-page-active' );
	}, [] );

	useEffect( () => {
		if ( ! notice ) return;
		const t = window.setTimeout( () => setNotice( null ), 4000 );
		return () => window.clearTimeout( t );
	}, [ notice ] );

	const onLaunched = () => {
		setNotice( {
			status: 'success',
			text: __(
				'Campaign launched. Channels publishing on their own schedule.',
				'multichannel-campaigns'
			),
		} );
		setView( { name: 'detail', id: 1 } );
	};

	const tabs = (
		<nav
			className="mcc-page-tabs"
			role="tablist"
			aria-label={ __( 'Campaign sections', 'multichannel-campaigns' ) }
		>
			<button
				type="button"
				role="tab"
				aria-selected={ view.name === 'list' }
				className={ view.name === 'list' ? 'is-active' : '' }
				onClick={ () => setView( { name: 'list' } ) }
			>
				{ __( 'Campaigns', 'multichannel-campaigns' ) }
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={ view.name === 'channels' }
				className={ view.name === 'channels' ? 'is-active' : '' }
				onClick={ () => setView( { name: 'channels' } ) }
			>
				{ __( 'Channels', 'multichannel-campaigns' ) }
			</button>
		</nav>
	);

	return (
		<>
			{ notice && (
				<div className="mcc-snackbar-wrap">
					<Notice
						status={ notice.status }
						onRemove={ () => setNotice( null ) }
					>
						{ notice.text }
					</Notice>
				</div>
			) }

			{ view.name === 'list' && (
				<CampaignsList
					onCreate={ () => setView( { name: 'create' } ) }
					onOpen={ ( id ) => setView( { name: 'detail', id } ) }
					tabs={ tabs }
				/>
			) }
			{ view.name === 'channels' && <CampaignChannels tabs={ tabs } /> }
			{ view.name === 'create' && (
				<CampaignCreate
					onCancel={ () => setView( { name: 'list' } ) }
					onLaunched={ onLaunched }
				/>
			) }
			{ view.name === 'detail' && (
				<Detail
					campaignId={ view.id }
					onBack={ () => setView( { name: 'list' } ) }
				/>
			) }
		</>
	);
};

// Register with wc-admin. wc-admin will mount CampaignsPage whenever
// the current path matches `/marketing/campaigns`.
addFilter(
	'woocommerce_admin_pages_list',
	'multichannel-campaigns',
	( pages: Array< Record< string, unknown > > ) => {
		pages.push( {
			container: CampaignsPage,
			path: '/marketing/campaigns',
			breadcrumbs: [
				[ '/marketing', __( 'Marketing', 'multichannel-campaigns' ) ],
				__( 'Campaigns', 'multichannel-campaigns' ),
			],
			navArgs: { id: 'mcc-campaigns' },
			capability: 'manage_woocommerce',
		} );
		return pages;
	}
);
