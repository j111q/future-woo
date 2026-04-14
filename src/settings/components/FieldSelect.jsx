/**
 * FieldSelect — renders select / single_select_country fields.
 *
 * Component: SelectControl from @wordpress/components.
 */

import { SelectControl } from '@wordpress/components';

function normaliseOptions( options ) {
	if ( ! options ) return [];
	if ( Array.isArray( options ) ) {
		return options.map( ( o ) => ( { value: o.key ?? o.value, label: o.label ?? o.name } ) );
	}
	return Object.entries( options ).map( ( [ value, label ] ) => ( { value, label } ) );
}

export function FieldSelect( { setting, value, onChange, disabled = false } ) {
	const options = normaliseOptions( setting.options );

	return (
		<SelectControl
			label={ setting.label }
			help={ setting.description || undefined }
			id={ setting.id }
			value={ value ?? '' }
			options={ options }
			onChange={ onChange }
			disabled={ disabled }
			__nextHasNoMarginBottom
		/>
	);
}
