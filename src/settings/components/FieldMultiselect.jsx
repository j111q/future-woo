import { BaseControl } from '@wordpress/components';

function normaliseOptions( options ) {
	if ( ! options ) return [];
	if ( Array.isArray( options ) ) {
		return options.map( ( o ) => ( { value: o.key ?? o.value, label: o.label ?? o.name } ) );
	}
	return Object.entries( options ).map( ( [ value, label ] ) => ( { value, label } ) );
}

export function FieldMultiselect( { setting, value, onChange, disabled = false } ) {
	const options  = normaliseOptions( setting.options );
	const selected = Array.isArray( value ) ? value : ( value ? [ value ] : [] );

	function handleChange( e ) {
		const chosen = Array.from( e.target.selectedOptions ).map( ( o ) => o.value );
		onChange( chosen );
	}

	return (
		<BaseControl id={ setting.id } label={ setting.label } help={ setting.description }>
			<select
				id={ setting.id }
				multiple
				value={ selected }
				onChange={ handleChange }
				disabled={ disabled }
				style={ { width: '100%', minHeight: '120px' } }
			>
				{ options.map( ( opt ) => (
					<option key={ opt.value } value={ opt.value }>
						{ opt.label }
					</option>
				) ) }
			</select>
		</BaseControl>
	);
}
