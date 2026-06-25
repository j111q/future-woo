/**
 * FieldSelect — renders select / single_select_country fields.
 *
 * Component: wp-components-select-control when available, with SelectControl
 * from @wordpress/components as the fallback.
 */

import { SelectControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';

import {
	isWebComponentAvailable,
	trueOrUndefined,
	useWebComponentAvailability,
} from './web-component-adapter';

const WEB_COMPONENT_TAG_NAME = 'wp-components-select-control';

function normaliseOptions( options ) {
	if ( ! options ) {
		return [];
	}
	if ( Array.isArray( options ) ) {
		return options.map( ( o ) => ( {
			value: o.key ?? o.value,
			label: o.label ?? o.name,
		} ) );
	}
	return Object.entries( options ).map( ( [ value, label ] ) => ( {
		value,
		label,
	} ) );
}

export function FieldSelect( { setting, value, onChange, disabled = false } ) {
	const options = normaliseOptions( setting.options );
	const selectRef = useRef( null );
	const [ isUsingWebComponent, setIsUsingWebComponent ] = useState( () =>
		isWebComponentAvailable( WEB_COMPONENT_TAG_NAME )
	);
	const isWebComponentReady = useWebComponentAvailability(
		WEB_COMPONENT_TAG_NAME
	);

	useEffect( () => {
		setIsUsingWebComponent( isWebComponentReady );
	}, [ isWebComponentReady ] );

	useEffect( () => {
		const select = selectRef.current;

		if ( ! select || ! isUsingWebComponent ) {
			return undefined;
		}

		const handleChange = ( event ) => {
			onChange( event.detail?.value ?? event.target?.value ?? '' );
		};

		select.addEventListener( 'change', handleChange );

		return () => {
			select.removeEventListener( 'change', handleChange );
		};
	}, [ isUsingWebComponent, onChange ] );

	if ( isUsingWebComponent ) {
		return (
			<wp-components-select-control
				ref={ selectRef }
				id={ setting.id }
				label={ setting.label }
				help={ setting.description || undefined }
				name={ setting.id }
				value={ value ?? '' }
				disabled={ trueOrUndefined( disabled ) }
				data-component-source="wp-components-web"
			>
				{ options.map( ( option ) => (
					<option key={ option.value } value={ option.value }>
						{ option.label }
					</option>
				) ) }
			</wp-components-select-control>
		);
	}

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
