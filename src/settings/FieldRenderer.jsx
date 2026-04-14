/**
 * FieldRenderer — dispatches a WC field type to the correct React component.
 *
 * Supported types (auto-migrate to new design):
 *   text, number, email, url, tel, password, color → FieldText (@wordpress/ui Input)
 *   textarea                                        → FieldTextarea (@wordpress/ui Textarea)
 *   select, single_select_country                   → FieldSelect (@wordpress/ui Select)
 *   checkbox                                        → FieldCheckbox (@wordpress/components ⚠️)
 *   multi_select_countries                          → FieldMultiCountry (@wordpress/components ⚠️)
 *   title, sectionend                               → handled by GeneralSettingsPage (structural)
 *
 * Unsupported types (trigger opt-out fallback in GeneralSettingsPage):
 *   image_width, relative_date_selector, single_select_page,
 *   single_select_page_with_search, slotfill_placeholder, radio,
 *   multiselect, and any custom plugin types.
 */

import { FieldText }         from './components/FieldText';
import { FieldSelect }       from './components/FieldSelect';
import { FieldTextarea }     from './components/FieldTextarea';
import { FieldCheckbox }     from './components/FieldCheckbox';
import { FieldToggle }       from './components/FieldToggle';
import { FieldMultiCountry } from './components/FieldMultiCountry';
import { FieldMultiselect }  from './components/FieldMultiselect';
import { FieldRadio }        from './components/FieldRadio';

/** All known types — treat everything as supported to avoid legacy fallback. */
export const SUPPORTED_TYPES = new Set( [
	'text', 'number', 'email', 'url', 'tel', 'password', 'color',
	'textarea',
	'select', 'single_select_country',
	'multi_select_countries',
	'multiselect',
	'checkbox',
	'radio',
	'title', 'sectionend',
	// Custom / unknown types are caught by the default case and rendered as text.
] );

/**
 * @param {{
 *   setting: import('./hooks/useWCSettings').WCSetting,
 *   value: any,
 *   onChange: (value: any) => void,
 *   disabled?: boolean,
 * }} props
 */
export function FieldRenderer( { setting, value, onChange, disabled = false } ) {
	const { type } = setting;

	const sharedProps = { setting, value, onChange, disabled };

	switch ( type ) {
		case 'text':
		case 'number':
		case 'email':
		case 'url':
		case 'tel':
		case 'password':
		case 'color':
			// Using Input from @wordpress/ui (preferred package).
			return <FieldText { ...sharedProps } />;

		case 'textarea':
			// Using Textarea from @wordpress/ui (preferred package).
			return <FieldTextarea { ...sharedProps } />;

		case 'select':
		case 'single_select_country':
			// Using Select namespace from @wordpress/ui (preferred package).
			return <FieldSelect { ...sharedProps } />;

		case 'checkbox':
			// Using CheckboxControl from @wordpress/components.
			// ⚠️ No checkbox equivalent in @wordpress/ui v0.8.0 — migration target.
			return <FieldCheckbox { ...sharedProps } />;

		case 'toggle':
			// Using ToggleControl from @wordpress/components.
			return <FieldToggle { ...sharedProps } />;

		case 'multi_select_countries':
			return <FieldMultiCountry { ...sharedProps } />;

		case 'radio':
			return <FieldRadio { ...sharedProps } />;

		case 'multiselect':
			return <FieldMultiselect { ...sharedProps } />;

		default:
			// Unknown/custom type — render as text so nothing is silently dropped.
			return <FieldText { ...sharedProps } />;
	}
}
