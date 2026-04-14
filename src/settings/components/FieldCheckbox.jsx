/**
 * FieldCheckbox — renders a single checkbox field.
 *
 * Component source: `CheckboxControl` from `@wordpress/components`.
 *
 * ⚠️  MIGRATION TARGET — @wordpress/ui does not currently include a Checkbox
 * component (v0.8.0). Once one is available, migrate this to @wordpress/ui.
 * Tracked in docs/migration-map.md.
 *
 * WC stores checkbox values as the strings 'yes' / 'no'.
 */

// Using CheckboxControl from @wordpress/components — no equivalent exists in
// @wordpress/ui yet. Flag as migration opportunity.
import { CheckboxControl } from '@wordpress/components';

/**
 * @param {{
 *   setting: import('../hooks/useWCSettings').WCSetting,
 *   value: string,          — 'yes' | 'no'
 *   onChange: (value: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export function FieldCheckbox( { setting, value, onChange, disabled = false } ) {
	const label = setting.label || setting.description;
	const help  = setting.label ? ( setting.description || undefined ) : undefined;
	return (
		<CheckboxControl
			label={ label }
			help={ help }
			checked={ value === 'yes' }
			onChange={ ( checked ) => onChange( checked ? 'yes' : 'no' ) }
			disabled={ disabled }
		/>
	);
}
