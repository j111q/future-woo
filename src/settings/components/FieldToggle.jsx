/**
 * FieldToggle — renders a toggle switch field.
 *
 * Uses ToggleControl from @wordpress/components.
 * WC stores toggle values as the strings 'yes' / 'no'.
 */

import { ToggleControl } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';

import {
	trueOrUndefined,
	useWebComponentAvailability,
} from './web-component-adapter';

const WEB_COMPONENT_TAG_NAME = 'wp-components-toggle-control';

export function FieldToggle( { setting, value, onChange, disabled = false } ) {
	const toggleRef = useRef( null );
	const isUsingWebComponent = useWebComponentAvailability(
		WEB_COMPONENT_TAG_NAME
	);

	useEffect( () => {
		const toggle = toggleRef.current;

		if ( ! toggle || ! isUsingWebComponent ) {
			return undefined;
		}

		const handleChange = ( event ) => {
			onChange( event.detail?.checked ? 'yes' : 'no' );
		};

		toggle.addEventListener( 'change', handleChange );

		return () => {
			toggle.removeEventListener( 'change', handleChange );
		};
	}, [ isUsingWebComponent, onChange ] );

	if ( isUsingWebComponent ) {
		return (
			<wp-components-toggle-control
				ref={ toggleRef }
				label={ setting.label }
				help={ setting.description || undefined }
				checked={ trueOrUndefined( value === 'yes' ) }
				disabled={ trueOrUndefined( disabled ) }
				data-component-source="wp-components-web"
			/>
		);
	}

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
