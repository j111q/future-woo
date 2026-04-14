/**
 * TaxSettingsPage — React settings page for Tax Options.
 *
 * Uses the same card layout and field components as GeneralSettingsPage.
 */

import { useState, useEffect, createPortal } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Button, Notice, Spinner } from '@wordpress/components';

import { SettingsSection } from './components/SettingsSection';
import { FieldRenderer } from './FieldRenderer';

// Field definitions matching the WC tax settings, with tooltip text as descriptions.
const TAX_FIELDS = [
	{
		id: 'woocommerce_prices_include_tax',
		label: __( 'Prices entered with tax', 'woo-admin-revamp' ),
		description: __( "This option is important as it will affect how you input prices. Changing this setting will not update existing products.", 'woo-admin-revamp' ),
		type: 'radio',
		default: 'no',
		options: {
			yes: __( 'Yes, I will enter prices inclusive of tax', 'woo-admin-revamp' ),
			no: __( 'No, I will enter prices exclusive of tax', 'woo-admin-revamp' ),
		},
	},
	{
		id: 'woocommerce_tax_based_on',
		label: __( 'Calculate tax based on', 'woo-admin-revamp' ),
		description: __( 'This option determines which address is used to calculate tax.', 'woo-admin-revamp' ),
		type: 'select',
		default: 'shipping',
		options: {
			shipping: __( 'Customer shipping address', 'woo-admin-revamp' ),
			billing: __( 'Customer billing address', 'woo-admin-revamp' ),
			base: __( 'Shop base address', 'woo-admin-revamp' ),
		},
	},
	{
		id: 'woocommerce_shipping_tax_class',
		label: __( 'Shipping tax class', 'woo-admin-revamp' ),
		description: __( 'Optionally control which tax class shipping gets, or leave it so shipping tax is based on the cart items themselves.', 'woo-admin-revamp' ),
		type: 'select',
		default: 'inherit',
		options: {
			inherit: __( 'Shipping tax class based on cart items', 'woo-admin-revamp' ),
			'': __( 'Standard', 'woo-admin-revamp' ),
		},
	},
	{
		id: 'woocommerce_tax_round_at_subtotal',
		label: __( 'Round tax at subtotal level, instead of rounding per line', 'woo-admin-revamp' ),
		description: '',
		type: 'checkbox',
		default: 'no',
	},
	{
		id: 'woocommerce_tax_classes',
		label: __( 'Additional tax classes', 'woo-admin-revamp' ),
		description: __( 'List additional tax classes below (1 per line). These are in addition to "Standard rate" which exists by default.', 'woo-admin-revamp' ),
		type: 'textarea',
		default: '',
	},
	{
		id: 'woocommerce_tax_display_shop',
		label: __( 'Display prices in the shop', 'woo-admin-revamp' ),
		description: '',
		type: 'select',
		default: 'excl',
		options: {
			incl: __( 'Including tax', 'woo-admin-revamp' ),
			excl: __( 'Excluding tax', 'woo-admin-revamp' ),
		},
	},
	{
		id: 'woocommerce_tax_display_cart',
		label: __( 'Display prices during cart and checkout', 'woo-admin-revamp' ),
		description: '',
		type: 'select',
		default: 'excl',
		options: {
			incl: __( 'Including tax', 'woo-admin-revamp' ),
			excl: __( 'Excluding tax', 'woo-admin-revamp' ),
		},
	},
	{
		id: 'woocommerce_price_display_suffix',
		label: __( 'Price display suffix', 'woo-admin-revamp' ),
		description: __( 'Define text to show after your product prices. For example, "inc. Vat". You can use {price_including_tax} or {price_excluding_tax}.', 'woo-admin-revamp' ),
		type: 'text',
		default: '',
		placeholder: __( 'N/A', 'woo-admin-revamp' ),
	},
	{
		id: 'woocommerce_tax_total_display',
		label: __( 'Display tax totals', 'woo-admin-revamp' ),
		description: '',
		type: 'select',
		default: 'itemized',
		options: {
			single: __( 'As a single total', 'woo-admin-revamp' ),
			itemized: __( 'Itemized', 'woo-admin-revamp' ),
		},
	},
];

export function TaxSettingsPage() {
	const [ values, setValues ]   = useState( {} );
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ]   = useState( false );
	const [ saved, setSaved ]     = useState( false );
	const [ saveErr, setSaveErr ] = useState( null );

	useEffect( () => {
		apiFetch( { path: '/wc/v3/settings/tax' } )
			.then( ( data ) => {
				const initial = {};
				if ( Array.isArray( data ) ) {
					data.forEach( ( s ) => {
						initial[ s.id ] = s.value ?? s.default ?? '';
					} );
				}
				// Also set defaults for fields that didn't come from the API.
				TAX_FIELDS.forEach( ( f ) => {
					if ( ! ( f.id in initial ) ) {
						initial[ f.id ] = f.default;
					}
				} );
				setValues( initial );
			} )
			.catch( () => {} )
			.finally( () => setLoading( false ) );
	}, [] );

	const setValue = ( id, val ) => {
		setValues( ( prev ) => ( { ...prev, [ id ]: val } ) );
		setSaveErr( null );
		setSaved( false );
	};

	const handleSave = async () => {
		setSaving( true );
		setSaved( false );
		setSaveErr( null );
		try {
			const update = Object.entries( values ).map( ( [ id, value ] ) => ( { id, value } ) );
			await apiFetch( {
				path: '/wc/v3/settings/tax/batch',
				method: 'POST',
				data: { update },
			} );
			setSaved( true );
			setTimeout( () => setSaved( false ), 4000 );
		} catch ( e ) {
			setSaveErr( e?.message ?? __( 'An error occurred while saving.', 'woo-admin-revamp' ) );
		} finally {
			setSaving( false );
		}
	};

	const headerActionsEl = document.getElementById( 'wss-header-actions' );

	if ( loading ) {
		return (
			<div className="cdw-settings-loading">
				<Spinner />
			</div>
		);
	}

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
						<p>{ saveErr }</p>
					</Notice>
				) }
				<div className="cdw-settings-sections">
					<SettingsSection
						title={ __( 'Tax options', 'woo-admin-revamp' ) }
						description={ __( 'Configure how taxes are calculated and displayed in your store.', 'woo-admin-revamp' ) }
					>
						{ TAX_FIELDS.map( ( field ) => (
							<FieldRenderer
								key={ field.id }
								setting={ field }
								value={ values[ field.id ] }
								onChange={ ( val ) => setValue( field.id, val ) }
								disabled={ saving }
							/>
						) ) }
					</SettingsSection>
				</div>
			</div>
		</div>
	);
}
