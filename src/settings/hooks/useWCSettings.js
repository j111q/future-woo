/**
 * useWCSettings — fetches and saves WooCommerce General Settings via v4 REST API.
 *
 * GET  /wp-json/wc/v3/settings/general          → array of setting objects
 * POST /wp-json/wc/v3/settings/general/batch    → { update: [{id, value}] }
 *
 * The v4 API fires woocommerce_admin_settings_sanitize_option_{$id} and
 * pre_update_option_{$option} hooks on save, preserving all business-logic
 * validation that plugin developers rely on (confirmed in Ahmed's exploration,
 * Jan 2026).
 */

import { useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * @typedef {Object} WCSetting
 * @property {string} id
 * @property {string} label
 * @property {string} description
 * @property {string} type
 * @property {string} value
 * @property {string} [default]
 * @property {Object} [options]   — present on select fields
 * @property {string} [tip]
 * @property {string} [group_id]
 */

/**
 * @returns {{
 *   settings: WCSetting[],
 *   values: Object,
 *   loading: boolean,
 *   saving: boolean,
 *   error: string|null,
 *   saveError: string|null,
 *   setValue: (id: string, value: any) => void,
 *   save: () => Promise<void>,
 * }}
 */
export function useWCSettings() {
	const [ settings, setSettings ] = useState( [] );
	const [ values, setValues ]     = useState( {} );
	const [ loading, setLoading ]   = useState( true );
	const [ saving, setSaving ]     = useState( false );
	const [ error, setError ]       = useState( null );
	const [ saveError, setSaveError ] = useState( null );

	useEffect( () => {
		apiFetch( { path: '/wc/v3/settings/general' } )
			.then( ( data ) => {
				setSettings( data );
				// Seed local values from API response.
				const initial = {};
				data.forEach( ( s ) => {
					initial[ s.id ] = s.value ?? s.default ?? '';
				} );
				setValues( initial );
			} )
			.catch( ( err ) => {
				setError( err?.message ?? 'Failed to load settings.' );
			} )
			.finally( () => setLoading( false ) );
	}, [] );

	const setValue = useCallback( ( id, value ) => {
		setValues( ( prev ) => ( { ...prev, [ id ]: value } ) );
		setSaveError( null );
	}, [] );

	const save = useCallback( async () => {
		setSaving( true );
		setSaveError( null );
		try {
			const update = Object.entries( values ).map( ( [ id, value ] ) => ( { id, value } ) );
			await apiFetch( {
				path:   '/wc/v3/settings/general/batch',
				method: 'POST',
				data:   { update },
			} );
		} catch ( err ) {
			setSaveError( err?.message ?? 'Failed to save settings.' );
			throw err;
		} finally {
			setSaving( false );
		}
	}, [ values ] );

	return { settings, values, loading, saving, error, saveError, setValue, save };
}
