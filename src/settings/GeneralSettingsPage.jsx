/**
 * GeneralSettingsPage — React replacement for the WC General Settings tab.
 *
 * Layout matches the CIAB design:
 *   - wc-order-view__header: breadcrumb + title + save button (full width)
 *   - cdw-settings-sections: centred 660px column of collapsible cards
 *   - wc-order-view-card: section cards with collapsible headers
 *
 * Save logic:
 *   PATCH /wp-json/wc/v3/settings/general/batch → { update: [{id, value}] }
 */

import { useState, useMemo, useRef, createPortal } from '@wordpress/element';
import { applyFilters }              from '@wordpress/hooks';
import { __ }                        from '@wordpress/i18n';
import { Button, Notice, Spinner }   from '@wordpress/components';

import { useWCSettings }     from './hooks/useWCSettings';
import { SettingsSection }   from './components/SettingsSection';
import { FieldRenderer, SUPPORTED_TYPES } from './FieldRenderer';
import { FieldCheckboxGroup } from './components/FieldCheckboxGroup';

const STRUCTURAL_TYPES = new Set( [ 'title', 'sectionend' ] );

const GENERAL_FALLBACK_SECTIONS = [
	{ id: 'store_address', title: 'Store Address', description: 'Your store\'s physical address for shipping and tax calculations.' },
	{ id: 'general_options', title: 'General options', description: 'Configure selling and shipping locations.' },
	{ id: 'taxes_coupons', title: 'Taxes and coupons', description: 'Enable or disable taxes and coupons for your store.' },
	{ id: 'currency_options', title: 'Currency options', description: 'Set your store currency and number formatting.' },
];

function groupIntoSections( settings ) {
	const hasTitles = settings.some( ( s ) => s.type === 'title' );

	if ( ! hasTitles ) {
		return [ { id: 'general', title: __( 'General', 'custom-dashboard-widgets' ), description: '', fields: settings } ];
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

export function GeneralSettingsPage() {
	const {
		settings,
		values,
		loading,
		saving,
		error,
		saveError,
		setValue,
		save,
	} = useWCSettings();

	const [ saved, setSaved ]     = useState( false );
	const [ saveErr, setSaveErr ] = useState( null );
	const sectionRefs             = useRef( {} );

	const isOptedOut = useMemo(
		() => applyFilters( 'cdw.modernSettings.optOut.general', false ),
		[]
	);

	if ( ! loading && isOptedOut ) {
		const legacyUrl = window.cdwSettingsData?.legacyUrl ?? '#';
		return (
			<Notice status="info" isDismissible={ false }>
				<p>{ __( 'Modern settings have been disabled for this page.', 'custom-dashboard-widgets' ) }</p>
				<p><a href={ legacyUrl }>{ __( 'Open classic settings', 'custom-dashboard-widgets' ) }</a></p>
			</Notice>
		);
	}

	if ( loading ) {
		return <div className="cdw-settings-loading"><Spinner /></div>;
	}

	if ( error ) {
		return (
			<Notice status="error" isDismissible={ false }>
				<p>{ __( 'Failed to load settings', 'custom-dashboard-widgets' ) }: { error }</p>
			</Notice>
		);
	}

	let sections = groupIntoSections( settings );

	// If the API didn't return title markers, distribute into fallback cards.
	if ( sections.length <= 1 && settings.length > 0 ) {
		const renderableSettings = settings.filter( ( s ) => s.type !== 'title' && s.type !== 'sectionend' );
		const perSection = Math.ceil( renderableSettings.length / GENERAL_FALLBACK_SECTIONS.length );
		sections = GENERAL_FALLBACK_SECTIONS.map( ( section, i ) => ( {
			...section,
			fields: renderableSettings.slice( i * perSection, ( i + 1 ) * perSection ),
		} ) ).filter( ( s ) => s.fields.length > 0 );
	}

	const handleSave = async () => {
		setSaved( false );
		setSaveErr( null );
		try {
			await save();
			setSaved( true );
			setTimeout( () => setSaved( false ), 4000 );
		} catch ( e ) {
			setSaveErr( e?.message ?? __( 'An error occurred while saving.', 'custom-dashboard-widgets' ) );
		}
	};

	const headerActionsEl = document.getElementById( 'war-settings-header-actions' );

	return (
		<div className="cdw-settings-root">

			{/* Portal save button into the WAR page header */ }
			{ headerActionsEl && createPortal(
				<Button
					variant="primary"
					className="is-compact"
					onClick={ handleSave }
					disabled={ saving }
					isBusy={ saving }
				>
					{ saving
						? __( 'Saving…', 'custom-dashboard-widgets' )
						: __( 'Save', 'custom-dashboard-widgets' ) }
				</Button>,
				headerActionsEl
			) }

			{/* ── Body: centred 660px column ────────────────────────── */}
			<div className="cdw-settings-body">
				{ saved && (
					<Notice status="success" isDismissible={ false } className="cdw-settings-notice">
						<p>{ __( 'Settings saved.', 'custom-dashboard-widgets' ) }</p>
					</Notice>
				) }
				{ ( saveErr || saveError ) && (
					<Notice status="error" isDismissible={ false } className="cdw-settings-notice">
						<p>{ __( 'Could not save settings', 'custom-dashboard-widgets' ) }: { saveErr || saveError }</p>
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
				</div>
			</div>

		</div>
	);
}
