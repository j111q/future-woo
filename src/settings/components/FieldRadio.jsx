/**
 * FieldRadio — renders radio fields using RadioControl.
 */

import { RadioControl } from '@wordpress/components';

function normaliseOptions( options ) {
	if ( ! options ) return [];
	if ( Array.isArray( options ) ) {
		return options.map( ( o ) => ( { value: o.key ?? o.value, label: o.label ?? o.name } ) );
	}
	return Object.entries( options ).map( ( [ value, label ] ) => ( { value, label } ) );
}

export function FieldRadio( { setting, value, onChange, disabled = false } ) {
	const options = normaliseOptions( setting.options );

	return (
		<RadioControl
			label={ setting.label }
			help={ setting.description || undefined }
			selected={ value ?? '' }
			options={ options }
			onChange={ onChange }
			disabled={ disabled }
		/>
	);
}
