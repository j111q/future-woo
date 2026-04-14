/**
 * FieldCheckboxGroup — handles WC's checkboxgroup + show_if_checked pattern.
 *
 * WooCommerce supports a "checkboxgroup" that groups checkboxes together where
 * child checkboxes are conditionally shown based on a parent's checked state
 * (the `show_if_checked` metadata). This component replicates that logic in
 * React state.
 *
 * Component source: `CheckboxControl` from `@wordpress/components`.
 *
 * ⚠️  MIGRATION TARGET — same as FieldCheckbox.jsx. Tracked in docs/migration-map.md.
 *
 * Example from WC General Settings:
 *   - Enable coupons      (checkboxgroup: start, show_if_checked: option)
 *   - Sequential discounts (checkboxgroup: end,  show_if_checked: yes)
 *
 * When the parent (start) is unchecked, child (end, show_if_checked: yes)
 * is hidden. When parent is checked, child becomes visible.
 */

import { CheckboxControl } from '@wordpress/components';

/**
 * @param {{
 *   settings: import('../hooks/useWCSettings').WCSetting[],  — array of checkboxes in this group
 *   values: Object,       — full values map
 *   onChange: (id: string, value: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export function FieldCheckboxGroup( { settings, values, onChange, disabled = false } ) {
	// The 'start' item is the parent/trigger; 'end' items are children.
	const parent   = settings.find( ( s ) => s.checkboxgroup === 'start' );
	const children = settings.filter( ( s ) => s.checkboxgroup !== 'start' );

	const parentChecked = parent ? values[ parent.id ] === 'yes' : false;

	return (
		<div className="cdw-checkbox-group">
			{ parent && (
				<CheckboxControl
					label={ parent.label || parent.description }
					help={ parent.label ? ( parent.description || undefined ) : undefined }
					checked={ parentChecked }
					onChange={ ( checked ) => onChange( parent.id, checked ? 'yes' : 'no' ) }
					disabled={ disabled }
				/>
			) }
			{ children.map( ( child ) => {
				// show_if_checked: 'yes'  → only show when parent is checked.
				// show_if_checked: 'option' → always show (it IS the option).
				const isVisible =
					child.show_if_checked === 'yes' ? parentChecked : true;

				if ( ! isVisible ) return null;

				const childLabel = child.label || child.desc || child.description;
				const childHelp  = ( child.label || child.desc ) ? ( child.description || undefined ) : undefined;

				return (
					<div key={ child.id } className="cdw-checkbox-group__child">
						<CheckboxControl
							label={ childLabel }
							help={ childHelp }
							checked={ values[ child.id ] === 'yes' }
							onChange={ ( checked ) =>
								onChange( child.id, checked ? 'yes' : 'no' )
							}
							disabled={ disabled }
						/>
					</div>
				);
			} ) }
		</div>
	);
}
