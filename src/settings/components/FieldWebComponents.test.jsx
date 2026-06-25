/* eslint-env browser, jest */
/* eslint-disable import/no-extraneous-dependencies */

import { TextDecoder, TextEncoder } from 'util';

jest.mock( '@wordpress/components', () => ( {
	CheckboxControl: ( { label, checked } ) => (
		<label htmlFor="fallback-checkbox" data-testid="fallback-checkbox">
			<input
				id="fallback-checkbox"
				type="checkbox"
				checked={ checked }
				readOnly
			/>
			{ label }
		</label>
	),
	SelectControl: ( { label, options = [] } ) => (
		<select aria-label={ label } data-testid="fallback-select">
			{ options.map( ( option ) => (
				<option key={ option.value } value={ option.value }>
					{ option.label }
				</option>
			) ) }
		</select>
	),
	TextControl: ( { label, value } ) => (
		<label htmlFor="fallback-text" data-testid="fallback-text">
			{ label }
			<input id="fallback-text" value={ value } readOnly />
		</label>
	),
	ToggleControl: ( { label, checked } ) => (
		<label htmlFor="fallback-toggle" data-testid="fallback-toggle">
			<input
				id="fallback-toggle"
				type="checkbox"
				checked={ checked }
				readOnly
			/>
			{ label }
		</label>
	),
} ) );

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

const { renderToStaticMarkup } = require( 'react-dom/server' );
const { FieldCheckbox } = require( './FieldCheckbox' );
const { FieldCheckboxGroup } = require( './FieldCheckboxGroup' );
const { FieldSelect } = require( './FieldSelect' );
const { FieldText } = require( './FieldText' );
const { FieldToggle } = require( './FieldToggle' );

const selectSetting = {
	id: 'woocommerce_shipping_method',
	label: 'Shipping method',
	description: 'Choose how orders are shipped.',
	options: {
		flat_rate: 'Flat rate',
		free_shipping: 'Free shipping',
	},
};

const textSetting = {
	id: 'woocommerce_store_address',
	label: 'Address line 1',
	description: 'Your business location.',
	type: 'text',
};

const numberSetting = {
	id: 'woocommerce_price_num_decimals',
	label: 'Number of decimals',
	description: 'How many decimals prices display.',
	type: 'number',
	custom_attributes: {
		min: '0',
		max: '6',
		step: '1',
	},
};

const checkboxSetting = {
	id: 'woocommerce_enable_coupons',
	label: 'Enable coupons',
	description: 'Coupons can be applied from the cart and checkout.',
};

const toggleSetting = {
	id: 'woocommerce_coming_soon',
	label: 'Coming soon mode',
	description: 'Visitors will see a coming soon landing page.',
};

const checkboxGroupSettings = [
	{
		...checkboxSetting,
		checkboxgroup: 'start',
		show_if_checked: 'option',
	},
	{
		id: 'woocommerce_calc_discounts_sequentially',
		label: 'Calculate coupon discounts sequentially',
		description: 'Apply coupons one at a time.',
		checkboxgroup: 'end',
		show_if_checked: 'yes',
	},
];

function defineCustomElements() {
	for ( const tagName of [
		'wp-components-checkbox-control',
		'wp-components-input-control',
		'wp-components-select-control',
		'wp-components-toggle-control',
	] ) {
		if ( ! customElements.get( tagName ) ) {
			customElements.define( tagName, class extends HTMLElement {} );
		}
	}
}

describe( 'settings field web component adapters', () => {
	it( 'keeps React fallbacks when custom elements are unavailable', () => {
		const markup = renderToStaticMarkup(
			<>
				<FieldSelect
					setting={ selectSetting }
					value="flat_rate"
					onChange={ jest.fn() }
				/>
				<FieldText
					setting={ textSetting }
					value="60 29th Street"
					onChange={ jest.fn() }
				/>
				<FieldCheckbox
					setting={ checkboxSetting }
					value="yes"
					onChange={ jest.fn() }
				/>
				<FieldToggle
					setting={ toggleSetting }
					value="no"
					onChange={ jest.fn() }
				/>
			</>
		);

		expect( markup ).toContain( 'data-testid="fallback-select"' );
		expect( markup ).toContain( 'data-testid="fallback-text"' );
		expect( markup ).toContain( 'data-testid="fallback-checkbox"' );
		expect( markup ).toContain( 'data-testid="fallback-toggle"' );
	} );

	it( 'renders web component controls when their custom elements are registered', () => {
		defineCustomElements();

		const markup = renderToStaticMarkup(
			<>
				<FieldText
					setting={ textSetting }
					value="60 29th Street"
					onChange={ jest.fn() }
				/>
				<FieldText
					setting={ numberSetting }
					value="2"
					onChange={ jest.fn() }
				/>
				<FieldCheckbox
					setting={ checkboxSetting }
					value="yes"
					onChange={ jest.fn() }
				/>
				<FieldToggle
					setting={ toggleSetting }
					value="no"
					onChange={ jest.fn() }
				/>
				<FieldSelect
					setting={ selectSetting }
					value="free_shipping"
					onChange={ jest.fn() }
				/>
			</>
		);

		expect( markup ).toContain( '<wp-components-input-control' );
		expect( markup ).toContain( 'label="Address line 1"' );
		expect( markup ).toContain( 'value="60 29th Street"' );
		expect( markup ).toContain( 'type="number"' );
		expect( markup ).toContain( 'min="0"' );
		expect( markup ).toContain( 'max="6"' );
		expect( markup ).toContain( 'step="1"' );
		expect( markup ).toContain( '<wp-components-checkbox-control' );
		expect( markup ).toContain( 'label="Enable coupons"' );
		expect( markup ).toContain( 'checked="true"' );
		expect( markup ).toContain( '<wp-components-toggle-control' );
		expect( markup ).toContain( 'label="Coming soon mode"' );
		expect( markup ).toContain( '<wp-components-select-control' );
		expect( markup ).toContain(
			'data-component-source="wp-components-web"'
		);
	} );

	it( 'uses checkbox web components inside conditional checkbox groups', () => {
		defineCustomElements();

		const markup = renderToStaticMarkup(
			<FieldCheckboxGroup
				settings={ checkboxGroupSettings }
				values={ {
					woocommerce_enable_coupons: 'yes',
					woocommerce_calc_discounts_sequentially: 'no',
				} }
				onChange={ jest.fn() }
			/>
		);

		const checkboxMatches =
			markup.match( /<wp-components-checkbox-control/g ) ?? [];

		expect( checkboxMatches ).toHaveLength( 2 );
		expect( markup ).toContain( 'label="Enable coupons"' );
		expect( markup ).toContain(
			'label="Calculate coupon discounts sequentially"'
		);
	} );
} );
