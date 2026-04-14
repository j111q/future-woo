/**
 * Orders list entry point — mounts the DataViews app.
 */
import { createRoot } from '@wordpress/element';
import { OrdersListApp } from './app';

const container = document.getElementById( 'wc-orders-list-root' );
if ( container ) {
	const root = createRoot( container );
	root.render( <OrdersListApp /> );
}
