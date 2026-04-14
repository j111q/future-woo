/**
 * SettingsPage — Reusable React settings page for any WooCommerce settings tab.
 *
 * Takes an API path (e.g. '/wc/v3/settings/products') and renders
 * the settings in CIAB-style cards with save functionality.
 */

import { useState, useMemo, useRef, useEffect, createPortal } from '@wordpress/element';
import { __ }                        from '@wordpress/i18n';
import { Button, Notice, Spinner }   from '@wordpress/components';
import apiFetch                      from '@wordpress/api-fetch';

import { SettingsSection }   from './components/SettingsSection';
import { FieldRenderer }     from './FieldRenderer';
import { FieldCheckboxGroup } from './components/FieldCheckboxGroup';

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupIntoSections( settings ) {
	const hasTitles = settings.some( ( s ) => s.type === 'title' );

	if ( ! hasTitles ) {
		return [ { id: 'default', title: __( 'Settings', 'woo-admin-revamp' ), description: '', fields: settings } ];
	}

	const sections = [];
	let current    = null;

	settings.forEach( ( s ) => {
		if ( s.type === 'title' ) {
			current = { id: s.id, title: s.label ?? s.title ?? '', description: s.description ?? '', fields: [] };
			sections.push( current );
		} else if ( s.type === 'sectionend' ) {
			current = null;
		} else if ( current ) {
			current.fields.push( s );
		}
	} );

	return sections;
}

function mergeCheckboxGroups( fields ) {
	const result = [];
	let group    = null;

	fields.forEach( ( f ) => {
		if ( f.checkboxgroup === 'start' ) {
			group = { _checkboxGroup: true, fields: [ f ] };
			result.push( group );
		} else if ( f.checkboxgroup === 'end' && group ) {
			group.fields.push( f );
			group = null;
		} else if ( group && f.checkboxgroup ) {
			group.fields.push( f );
		} else {
			group = null;
			result.push( f );
		}
	} );

	return result;
}

// ── Fallback sections when API doesn't return title markers ──────────────────

const FALLBACK_SECTIONS = {
	'/wc/v3/settings/products': [
		{ id: 'shop-pages', title: 'Shop pages', description: 'Configure which pages WooCommerce uses for the shop, cart, checkout, and terms.' },
		{ id: 'measurements', title: 'Measurements', description: 'Set the default weight and dimension units for your products.' },
		{ id: 'reviews', title: 'Reviews', description: 'Control how product reviews and ratings are displayed.' },
	],
	'/wc/v3/settings/account': [
		{ id: 'account-creation', title: 'Account creation', description: 'Control how customers create accounts and log in.' },
		{ id: 'privacy-policy', title: 'Privacy policy', description: 'Configure privacy policy page and consent messages.' },
		{ id: 'personal-data', title: 'Personal data retention', description: 'Set how long to retain personal data from inactive accounts and orders.' },
	],
	'/wc/v3/settings/integration': [
		{ id: 'integrations', title: 'Integrations', description: 'Connect third-party services to extend your store.' },
	],
	'/wc/v3/settings/tax': [
		{
			id: 'tax-options',
			title: 'Tax options',
			description: 'Configure how taxes are calculated and displayed in your store.',
		},
	],
	'/war/v1/settings/site-visibility': [
		{
			id: 'site-visibility',
			title: 'Site visibility',
			description: 'Control whether your store is visible to the public or in coming soon mode.',
			staticFields: [
				{ id: 'woocommerce_coming_soon', label: 'Coming soon mode', type: 'toggle', description: 'Your site is in coming soon mode. Visitors will see a coming soon landing page until you are ready to launch.' },
				{ id: 'woocommerce_store_pages_only', label: 'Restrict to store pages only', type: 'toggle', description: 'When enabled, only WooCommerce store pages will show the coming soon notice. Other pages remain accessible.' },
				{ id: 'woocommerce_private_link', label: 'Enable private link sharing', type: 'toggle', description: 'Allow sharing a private link so people can preview your store before launch.' },
			],
		},
	],
	'/wc/v3/settings/advanced': [
		{ id: 'page-setup', title: 'Page setup', description: 'Configure which pages are used for the cart, checkout, my account, and terms.' },
		{ id: 'checkout-endpoints', title: 'Checkout endpoints', description: 'Endpoints appended to page URLs for checkout actions.' },
		{ id: 'account-endpoints', title: 'Account endpoints', description: 'Endpoints appended to page URLs for account actions.' },
		{ id: 'features', title: 'Features', description: 'Enable or disable optional WooCommerce features.' },
	],
};

/**
 * Distribute flat settings into fallback sections by splitting evenly
 * when the API doesn't provide title markers.
 */
function applyFallbackSections( settings, apiPath ) {
	const fallback = FALLBACK_SECTIONS[ apiPath ];
	if ( ! fallback || fallback.length === 0 ) {
		return [ { id: 'default', title: 'Settings', description: '', fields: settings } ];
	}

	// If there's only one section, put everything in it.
	if ( fallback.length === 1 ) {
		return [ { ...fallback[ 0 ], fields: settings } ];
	}

	// Distribute settings across sections roughly evenly.
	const perSection = Math.ceil( settings.length / fallback.length );
	return fallback.map( ( section, i ) => ( {
		...section,
		fields: settings.slice( i * perSection, ( i + 1 ) * perSection ),
	} ) ).filter( ( s ) => s.fields.length > 0 );
}

// ── Component ────────────────────────────────────────────────────────────────

export function SettingsPage( { apiPath, extraApiPaths } ) {
	const [ settings, setSettings ] = useState( [] );
	const [ values, setValues ]     = useState( {} );
	const [ loading, setLoading ]   = useState( true );
	const [ saving, setSaving ]     = useState( false );
	const [ error, setError ]       = useState( null );
	const [ saved, setSaved ]       = useState( false );
	const [ saveErr, setSaveErr ]   = useState( null );
	const sectionRefs               = useRef( {} );

	// Fetch settings on mount (main API + any extra API paths for static fields).
	useEffect( () => {
		const promises = [ apiFetch( { path: apiPath } ).catch( () => null ) ];

		// Fetch extra API paths (for static field values like admin-experience).
		const extraKeys = extraApiPaths ? Object.keys( extraApiPaths ) : [];
		extraKeys.forEach( ( key ) => {
			promises.push(
				apiFetch( { path: extraApiPaths[ key ] } ).catch( () => ( {} ) )
			);
		} );

		Promise.all( promises )
			.then( ( results ) => {
				const mainData = results[ 0 ];
				const initial = {};

				if ( Array.isArray( mainData ) ) {
					setSettings( mainData );
					mainData.forEach( ( s ) => {
						initial[ s.id ] = s.value ?? s.default ?? '';
					} );
				} else if ( mainData && typeof mainData === 'object' ) {
					setSettings( [] );
					Object.assign( initial, mainData );
				}

				// Merge extra API values into the values map.
				for ( let i = 0; i < extraKeys.length; i++ ) {
					const extraData = results[ i + 1 ];
					if ( extraData && typeof extraData === 'object' ) {
						Object.assign( initial, extraData );
					}
				}

				setValues( initial );
			} )
			.catch( ( err ) => {
				setError( err?.message ?? 'Failed to load settings.' );
			} )
			.finally( () => setLoading( false ) );
	}, [ apiPath ] );

	const setValue = ( id, value ) => {
		setValues( ( prev ) => ( { ...prev, [ id ]: value } ) );
		setSaveErr( null );
	};

	const handleSave = async () => {
		setSaved( false );
		setSaveErr( null );
		setSaving( true );
		try {
			const savePromises = [];

			// For custom endpoints (like site-visibility), POST the values directly.
			// For WC settings endpoints, use the batch format.
			if ( apiPath.startsWith( '/war/' ) ) {
				savePromises.push( apiFetch( {
					path: apiPath,
					method: 'POST',
					data: values,
				} ) );
			} else {
				const update = Object.entries( values )
					.filter( ( [ id ] ) => {
						// Don't send extra API fields to the main WC batch endpoint.
						const extraFields = new Set();
						const fallback = FALLBACK_SECTIONS[ apiPath ] || [];
						fallback.forEach( ( s ) => {
							( s.staticFields || [] ).forEach( ( f ) => extraFields.add( f.id ) );
						} );
						return ! extraFields.has( id );
					} )
					.map( ( [ id, value ] ) => ( { id, value } ) );
				savePromises.push( apiFetch( {
					path: apiPath + '/batch',
					method: 'POST',
					data: { update },
				} ) );
			}

			// Save to extra API paths if any.
			if ( extraApiPaths ) {
				Object.values( extraApiPaths ).forEach( ( extraPath ) => {
					// Collect values that belong to this extra path's static fields.
					const extraValues = {};
					const fallback = FALLBACK_SECTIONS[ apiPath ] || [];
					fallback.forEach( ( s ) => {
						( s.staticFields || [] ).forEach( ( f ) => {
							if ( values[ f.id ] !== undefined ) {
								extraValues[ f.id ] = values[ f.id ];
							}
						} );
					} );
					if ( Object.keys( extraValues ).length > 0 ) {
						savePromises.push( apiFetch( {
							path: extraPath,
							method: 'POST',
							data: extraValues,
						} ) );
					}
				} );
			}

			await Promise.all( savePromises );

			// Reload if any custom endpoints were involved.
			if ( apiPath.startsWith( '/war/' ) || extraApiPaths ) {
				window.location.reload();
				return;
			}
			setSaved( true );
			setTimeout( () => setSaved( false ), 4000 );
		} catch ( e ) {
			setSaveErr( e?.message ?? __( 'An error occurred while saving.', 'woo-admin-revamp' ) );
		} finally {
			setSaving( false );
		}
	};

	if ( loading ) {
		return <div className="cdw-settings-loading"><Spinner /></div>;
	}

	// If API fails or returns no settings, use fallback sections with static fields.
	if ( error || settings.length === 0 ) {
		const fallback = FALLBACK_SECTIONS[ apiPath ];
		const hasStaticFields = fallback?.some( ( s ) => s.staticFields?.length > 0 );

		if ( hasStaticFields ) {
			const headerActionsEl = document.getElementById( 'war-settings-header-actions' );
			// Render static fields directly.
			return (
				<div className="cdw-settings-root">
					{ headerActionsEl && createPortal(
						<Button
							variant="primary"
							className="is-compact"
							onClick={ handleSave }
							disabled={ saving }
							isBusy={ saving }
						>
							{ saving
								? __( 'Saving…', 'woo-admin-revamp' )
								: __( 'Save', 'woo-admin-revamp' ) }
						</Button>,
						headerActionsEl
					) }
					{ saved && (
						<Notice status="success" isDismissible={ false } className="cdw-settings-notice" style={ { margin: '0 0 16px' } }>
							<p>{ __( 'Settings saved.', 'woo-admin-revamp' ) }</p>
						</Notice>
					) }
					{ saveErr && (
						<Notice status="error" isDismissible={ false } className="cdw-settings-notice" style={ { margin: '0 0 16px' } }>
							<p>{ saveErr }</p>
						</Notice>
					) }
					<div className="cdw-settings-body">
						<div className="cdw-settings-sections">
							{ fallback.map( ( section ) => (
								<div key={ section.id }>
									<SettingsSection title={ section.title } description={ section.description }>
										{ ( section.staticFields || [] ).map( ( field ) => (
											<FieldRenderer
												key={ field.id }
												setting={ field }
												value={ values[ field.id ] ?? ( ( field.type === 'checkbox' || field.type === 'toggle' ) ? 'no' : '' ) }
												onChange={ ( val ) => setValue( field.id, val ) }
												disabled={ false }
											/>
										) ) }
									</SettingsSection>
								</div>
							) ) }
						</div>
					</div>
				</div>
			);
		}

		const emptyTitle = fallback?.[ 0 ]?.title || __( 'Settings', 'woo-admin-revamp' );
		const emptyDesc  = fallback?.[ 0 ]?.description || '';
		return (
			<div className="cdw-settings-root">
				<div className="cdw-settings-body">
					<div className="cdw-settings-sections">
						<div className="wc-order-view-card">
							<h3 className="wc-order-view-card__title">{ emptyTitle }</h3>
							<div className="cdw-settings-card-body">
								<p className="cdw-settings-card-description">{ emptyDesc }</p>
								<p style={ { color: '#757575', fontSize: '13px', marginTop: '16px' } }>
									{ __( 'No settings available. Install an integration to see options here.', 'woo-admin-revamp' ) }
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	let sections = groupIntoSections( settings );
	// If the API didn't return title markers, use our fallback section definitions.
	if ( sections.length <= 1 && FALLBACK_SECTIONS[ apiPath ] ) {
		const renderableSettings = settings.filter( ( s ) => s.type !== 'title' && s.type !== 'sectionend' );
		sections = applyFallbackSections( renderableSettings, apiPath );
	}
	const headerActionsEl = document.getElementById( 'war-settings-header-actions' );

	return (
		<div className="cdw-settings-root">

			{ headerActionsEl && createPortal(
				<Button
					variant="primary"
					className="is-compact"
					onClick={ handleSave }
					disabled={ saving }
					isBusy={ saving }
				>
					{ saving
						? __( 'Saving…', 'woo-admin-revamp' )
						: __( 'Save', 'woo-admin-revamp' ) }
				</Button>,
				headerActionsEl
			) }

			<div className="cdw-settings-body">
				{ saved && (
					<Notice status="success" isDismissible={ false } className="cdw-settings-notice">
						<p>{ __( 'Settings saved.', 'woo-admin-revamp' ) }</p>
					</Notice>
				) }
				{ saveErr && (
					<Notice status="error" isDismissible={ false } className="cdw-settings-notice">
						<p>{ __( 'Could not save settings', 'woo-admin-revamp' ) }: { saveErr }</p>
					</Notice>
				) }
				<div className="cdw-settings-sections">
					{ sections.map( ( section ) => (
						<div
							key={ section.id }
							ref={ ( el ) => { sectionRefs.current[ section.id ] = el; } }
						>
							<SettingsSection
								title={ section.title }
								description={ section.description }
							>
								{ mergeCheckboxGroups( section.fields ).map( ( item, idx ) => {
									if ( item._checkboxGroup ) {
										return (
											<FieldCheckboxGroup
												key={ item.fields[ 0 ].id }
												settings={ item.fields }
												values={ values }
												onChange={ setValue }
												disabled={ saving }
											/>
										);
									}
									return (
										<FieldRenderer
											key={ item.id ?? idx }
											setting={ item }
											value={ values[ item.id ] }
											onChange={ ( val ) => setValue( item.id, val ) }
											disabled={ saving }
										/>
									);
								} ) }
							</SettingsSection>
						</div>
					) ) }

					{ /* Append any static field sections from fallbacks */ }
					{ ( FALLBACK_SECTIONS[ apiPath ] || [] )
						.filter( ( s ) => s.staticFields?.length > 0 )
						.map( ( section ) => (
							<div key={ section.id }>
								<SettingsSection title={ section.title } description={ section.description }>
									{ section.staticFields.map( ( field ) => (
										<FieldRenderer
											key={ field.id }
											setting={ field }
											value={ values[ field.id ] ?? ( ( field.type === 'checkbox' || field.type === 'toggle' ) ? 'no' : '' ) }
											onChange={ ( val ) => setValue( field.id, val ) }
											disabled={ saving }
										/>
									) ) }
								</SettingsSection>
							</div>
						) ) }
				</div>
			</div>
		</div>
	);
}
