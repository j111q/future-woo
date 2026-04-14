/**
 * FieldTextarea — renders textarea fields.
 *
 * Component: TextareaControl from @wordpress/components.
 */

import { TextareaControl } from '@wordpress/components';

export function FieldTextarea( { setting, value, onChange, disabled = false } ) {
	return (
		<TextareaControl
			label={ setting.label }
			help={ setting.description || undefined }
			id={ setting.id }
			value={ value ?? '' }
			onChange={ onChange }
			disabled={ disabled }
			rows={ 4 }
			__nextHasNoMarginBottom
		/>
	);
}
