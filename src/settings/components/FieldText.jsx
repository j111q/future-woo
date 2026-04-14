/**
 * FieldText — renders text / number / email / url / tel / password fields.
 *
 * Component: TextControl from @wordpress/components.
 */

import { TextControl } from '@wordpress/components';

export function FieldText( { setting, value, onChange, disabled = false } ) {
	const inputType = [ 'number', 'email', 'url', 'tel', 'password' ].includes( setting.type )
		? setting.type
		: 'text';

	const extra = {};
	if ( setting.type === 'number' && setting.custom_attributes ) {
		if ( setting.custom_attributes.min !== undefined ) extra.min = setting.custom_attributes.min;
		if ( setting.custom_attributes.max !== undefined ) extra.max = setting.custom_attributes.max;
		if ( setting.custom_attributes.step !== undefined ) extra.step = setting.custom_attributes.step;
	}

	return (
		<TextControl
			label={ setting.label }
			help={ setting.description || undefined }
			id={ setting.id }
			type={ inputType }
			value={ value ?? '' }
			onChange={ onChange }
			disabled={ disabled }
			__nextHasNoMarginBottom
			{ ...extra }
		/>
	);
}
