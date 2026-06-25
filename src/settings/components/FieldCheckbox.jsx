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
import { useEffect, useRef } from '@wordpress/element';

import {
	trueOrUndefined,
	useWebComponentAvailability,
} from './web-component-adapter';

const WEB_COMPONENT_TAG_NAME = 'wp-components-checkbox-control';

// Props:
// - setting: import('../hooks/useWCSettings').WCSetting
// - value: 'yes' | 'no'
// - onChange: (value: string) => void
// - disabled?: boolean
export function FieldCheckbox( {
	setting,
	value,
	onChange,
	disabled = false,
} ) {
	const label = setting.label || setting.description;
	const help = setting.label ? setting.description || undefined : undefined;
	const checkboxRef = useRef( null );
	const isUsingWebComponent = useWebComponentAvailability(
		WEB_COMPONENT_TAG_NAME
	);

	useEffect( () => {
		const checkbox = checkboxRef.current;

		if ( ! checkbox || ! isUsingWebComponent ) {
			return undefined;
		}

		const handleChange = ( event ) => {
			onChange( event.detail?.checked ? 'yes' : 'no' );
		};

		checkbox.addEventListener( 'change', handleChange );

		return () => {
			checkbox.removeEventListener( 'change', handleChange );
		};
	}, [ isUsingWebComponent, onChange ] );

	if ( isUsingWebComponent ) {
		return (
			<wp-components-checkbox-control
				ref={ checkboxRef }
				label={ label }
				help={ help }
				checked={ trueOrUndefined( value === 'yes' ) }
				disabled={ trueOrUndefined( disabled ) }
				data-component-source="wp-components-web"
			/>
		);
	}

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
