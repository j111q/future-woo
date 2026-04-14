/**
 * Entry point — mounts the React settings page for whichever WC settings
 * tab has a mount point in the DOM.
 */

import { createRoot }  from '@wordpress/element';
import apiFetch        from '@wordpress/api-fetch';
import { GeneralSettingsPage } from './GeneralSettingsPage';
import { SettingsPage } from './SettingsPage';
import { TaxSettingsPage } from './TaxSettingsPage';

// Configure apiFetch with the WP REST nonce.
if ( window.cdwSettingsData?.nonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( window.cdwSettingsData.nonce ) );
}

if ( window.cdwSettingsData?.restRoot ) {
	apiFetch.use( apiFetch.createRootURLMiddleware( window.cdwSettingsData.restRoot ) );
}

// Tab mount points and their API paths.
const tabs = [
	{ id: 'wc-settings-modern-general',     component: GeneralSettingsPage },
	{ id: 'wc-settings-modern-products',    apiPath: '/wc/v3/settings/products' },
	{ id: 'wc-settings-modern-account',     apiPath: '/wc/v3/settings/account' },
	{ id: 'wc-settings-modern-integration',    apiPath: '/wc/v3/settings/integration' },
	{ id: 'wc-settings-modern-tax',            component: TaxSettingsPage },
	{ id: 'wc-settings-modern-site-visibility', apiPath: '/war/v1/settings/site-visibility' },
	{ id: 'wc-settings-modern-advanced',       apiPath: '/wc/v3/settings/advanced' },
];

for ( const tab of tabs ) {
	const el = document.getElementById( tab.id );
	if ( el ) {
		const root = createRoot( el );
		if ( tab.component ) {
			root.render( <tab.component /> );
		} else {
			root.render( <SettingsPage apiPath={ tab.apiPath } extraApiPaths={ tab.extraApiPaths } /> );
		}
		break;
	}
}
