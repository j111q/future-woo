/**
 * Products Empty State — replaces default WooCommerce empty products page
 * with CIAB-style empty state.
 */
(function () {
	'use strict';

	// Check if the products page has no products.
	var table = document.querySelector( '.wp-list-table' );
	var noItems = document.querySelector( '.no-items' );
	var tbody = table ? table.querySelector( 'tbody' ) : null;
	var hasRows = tbody && tbody.querySelectorAll( 'tr:not(.no-items)' ).length > 0;

	// Multiple ways to detect empty:
	// 1. .no-items element exists
	// 2. Table exists but has no data rows
	// 3. No table at all (WooCommerce might not render one)
	var isEmpty = noItems || ( table && ! hasRows ) || ! table;

	if ( ! isEmpty ) return;

	var wrap = document.querySelector( '.wrap' );
	if ( ! wrap ) return;

	// CIAB product icon (colorful shopping bag).
	var productIcon =
		'<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
		'<g style="mix-blend-mode:multiply"><g clip-path="url(#war-pi-a)">' +
		'<path d="M42.599 10.709h-9.247V6.259h-1.821c-1.238 0-1.76-.626-1.76-1.788s.522-1.788 1.76-1.788c.619 0 3.175-.02 3.175-.02V0l-3.764.02c-2.674 0-4.226 1.797-4.226 4.451s1.469 4.358 4.004 4.456v1.782h-9.32S10.71 15.707 10.71 16.016h42.649c0-.309-10.763-5.307-10.763-5.307h.003z" fill="#D1C1FF"/>' +
		'<path d="M64 24.017S53.486 13.899 51.845 12.627c-1.413-1.094-3.14-1.945-6.498-1.945h-2.748c-.42 5.583-4.91 9.977-10.6 9.977-5.689 0-10.18-4.394-10.6-9.977H18.65c-3.359 0-5.085.848-6.498 1.945C10.514 13.899 0 24.017 0 24.017l3.634 10.673h9.643l-.009 29.313h37.466l-.009-29.313h9.643L64.003 24.017H64z" fill="#873EFF"/>' +
		'<path d="M13.266 34.688V64h19.011L13.266 34.688z" fill="#3C087E"/>' +
		'</g></g><defs><clipPath id="war-pi-a"><rect width="64" height="64" fill="#fff"/></clipPath></defs></svg>';

	// Hide everything in the wrap except scripts and the FAB.
	var children = Array.from( wrap.children );
	children.forEach( function ( child ) {
		if ( child.tagName === 'SCRIPT'
			|| child.id === 'war-unified-fab'
			|| child.classList.contains( 'war-state-fab' )
		) {
			return;
		}
		child.style.display = 'none';
	} );

	// Build the empty state.
	var emptyState = document.createElement( 'div' );
	emptyState.className = 'war-products-empty-state';
	emptyState.innerHTML =
		'<div class="war-products-empty-state__icon">' + productIcon + '</div>' +
		'<h2 class="war-products-empty-state__title">Add your first product</h2>' +
		'<p class="war-products-empty-state__description">' +
			'Start building your store by adding a physical, downloadable, or affiliate product.' +
		'</p>' +
		'<div class="war-products-empty-state__actions">' +
			'<a href="post-new.php?post_type=product" class="components-button is-primary">Add product</a>' +
		'</div>';

	wrap.insertBefore( emptyState, wrap.firstChild );

	// Hide the header's "Add product" button (the empty state has its own).
	var headerActions = document.querySelector( '.war-page-header__actions' );
	if ( headerActions ) headerActions.style.display = 'none';

	// Apply background and hide footer.
	var wpcontent = document.getElementById( 'wpcontent' );
	if ( wpcontent ) wpcontent.style.backgroundColor = 'var(--war-page-bg, #fcfcfc)';
	wrap.style.backgroundColor = 'var(--war-page-bg, #fcfcfc)';

	var footer = document.getElementById( 'wpfooter' );
	if ( footer ) footer.style.display = 'none';
})();
