/**
 * FieldToggle — renders a toggle switch field.
 *
 * Uses ToggleControl from @wordpress/components.
 * WC stores toggle values as the strings 'yes' / 'no'.
 */

import { ToggleControl } from '@wordpress/components';

export function FieldToggle( { setting, value, onChange, disabled = false } ) {
	return (
		<ToggleControl
			label={ setting.label }
			help={ setting.description }
			checked={ value === 'yes' }
			onChange={ ( checked ) => onChange( checked ? 'yes' : 'no' ) }
			disabled={ disabled }
		/>
	);
}
