/**
 * FieldText — renders text / number / email / url / tel / password fields.
 *
 * Component: wp-components-input-control when available. Falls back to
 * TextControl from the WordPress components package.
 */

import { TextControl } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';

import {
	trueOrUndefined,
	useWebComponentAvailability,
} from './web-component-adapter';

const WEB_COMPONENT_TAG_NAME = 'wp-components-input-control';

export function FieldText( { setting, value, onChange, disabled = false } ) {
	const inputType = [ 'number', 'email', 'url', 'tel', 'password' ].includes(
		setting.type
	)
		? setting.type
		: 'text';

	const extra = {};
	if ( setting.type === 'number' && setting.custom_attributes ) {
		if ( setting.custom_attributes.min !== undefined ) {
			extra.min = setting.custom_attributes.min;
		}
		if ( setting.custom_attributes.max !== undefined ) {
			extra.max = setting.custom_attributes.max;
		}
		if ( setting.custom_attributes.step !== undefined ) {
			extra.step = setting.custom_attributes.step;
		}
	}

	const inputRef = useRef( null );
	const isUsingWebComponent = useWebComponentAvailability(
		WEB_COMPONENT_TAG_NAME
	);

	useEffect( () => {
		const input = inputRef.current;

		if ( ! input || ! isUsingWebComponent ) {
			return undefined;
		}

		const handleInput = ( event ) => {
			onChange( event.detail?.value ?? event.target?.value ?? '' );
		};

		input.addEventListener( 'input', handleInput );

		return () => {
			input.removeEventListener( 'input', handleInput );
		};
	}, [ isUsingWebComponent, onChange ] );

	if ( isUsingWebComponent ) {
		return (
			<wp-components-input-control
				ref={ inputRef }
				id={ setting.id }
				label={ setting.label }
				help={ setting.description || undefined }
				name={ setting.id }
				type={ inputType }
				value={ value ?? '' }
				disabled={ trueOrUndefined( disabled ) }
				data-component-source="wp-components-web"
				{ ...extra }
			/>
		);
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
