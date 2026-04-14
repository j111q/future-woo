/**
 * FieldMultiCountry — renders multi_select_countries fields.
 *
 * Component source: `FormTokenField` from `@wordpress/components`.
 *
 * ⚠️  MIGRATION TARGET — no multi-select / token-field equivalent exists in
 * @wordpress/ui v0.8.0. Once one is added, migrate this component.
 * Tracked in docs/migration-map.md.
 *
 * WC stores multi_select_countries values as arrays of country codes.
 * The v4 API returns the available country list in `setting.options`.
 */

// Using FormTokenField from @wordpress/components — no equivalent in
// @wordpress/ui. Flag as migration opportunity.
import { FormTokenField } from '@wordpress/components';

/**
 * @param {{
 *   setting: import('../hooks/useWCSettings').WCSetting,
 *   value: string[],
 *   onChange: (value: string[]) => void,
 *   disabled?: boolean,
 * }} props
 */
export function FieldMultiCountry( { setting, value, onChange, disabled = false } ) {
	// The options object from WC API is { 'US': 'United States', 'CA': 'Canada', ... }
	const optionsMap  = setting.options ?? {};
	const suggestions = Object.values( optionsMap );
	// Map display labels → codes for saving.
	const labelToCode = Object.fromEntries(
		Object.entries( optionsMap ).map( ( [ code, label ] ) => [ label, code ] )
	);
	const codeToLabel = optionsMap;

	// FormTokenField works with display strings; convert codes ↔ labels.
	const tokens = ( Array.isArray( value ) ? value : [] ).map(
		( code ) => codeToLabel[ code ] ?? code
	);

	return (
		<div className="cdw-field-multi-country">
			<label className="components-base-control__label">{ setting.label }</label>
			{ setting.description && (
				<p className="components-base-control__help">{ setting.description }</p>
			) }
			<FormTokenField
				value={ tokens }
				suggestions={ suggestions }
				onChange={ ( newTokens ) =>
					onChange( newTokens.map( ( t ) => labelToCode[ t ] ?? t ) )
				}
				disabled={ disabled }
				__experimentalExpandOnFocus
			/>
		</div>
	);
}
