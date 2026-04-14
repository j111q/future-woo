/**
 * Orders Empty State — replaces default WooCommerce empty orders page
 * with CIAB-style empty state + collapsible "Tools for your store" card.
 *
 * Extracts tool suggestions from the original WooCommerce marketplace
 * suggestions DOM (preserving real images), then rebuilds with our design.
 */
(function () {
	'use strict';

	var emptyContent = document.querySelector( '.woocommerce-BlankState' );
	if ( ! emptyContent ) return;

	var wrap = emptyContent.closest( '.wrap' ) || emptyContent.parentElement;
	if ( ! wrap ) return;

	// Empty state image (URL passed from PHP).
	var illustrationUrl = ( window.warOrdersEmptyState && window.warOrdersEmptyState.illustrationUrl ) || '';
	var emptyStateIcon = illustrationUrl
		? '<img src="' + illustrationUrl + '" alt="" width="64" height="64">'
		: '';

	var chevronDown =
		'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"/></svg>';
	var chevronUp =
		'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z"/></svg>';

	// 1. Extract tool suggestions from the original WooCommerce marketplace DOM.
	//    Each suggestion has: img, title (h4), description (p), "Learn More" link, dismiss button.
	var tools = [];
	var suggestionItems = emptyContent.querySelectorAll(
		'.marketplace-suggestion-container, [data-suggestion-slug]'
	);

	suggestionItems.forEach( function ( item ) {
		var img = item.querySelector( 'img' );
		var title = item.querySelector( 'h4, .marketplace-suggestion-container-content h4, [class*="title"]' );
		var desc = item.querySelector( 'p, .marketplace-suggestion-container-content p, [class*="description"]' );
		var link = item.querySelector( 'a[href*="woocommerce.com"], a.suggestion-manage-link, a.linkout' );

		if ( title ) {
			tools.push( {
				icon: img ? img.src : '',
				title: title.textContent.trim(),
				description: desc ? desc.textContent.trim() : '',
				url: link ? link.href : '#',
			} );
		}
	} );

	// Fallback: if the marketplace React component hasn't rendered yet,
	// wait briefly and try to scrape it, or just show what we have.

	// 2. Hide the original BlankState and any table/list elements.
	emptyContent.style.display = 'none';

	// Hide the orders table, DataViews, pagination, bulk actions, filters, etc.
	// Hide everything in the wrap except our empty state, tools card, scripts, and FAB.
	var keepClasses = ['war-orders-empty-state', 'war-tools-card', 'war-state-fab', 'war-unified-fab'];
	Array.from( wrap.children ).forEach( function ( el ) {
		if ( el === emptyState ) return;
		if ( el.tagName === 'SCRIPT' ) return;
		for ( var i = 0; i < keepClasses.length; i++ ) {
			if ( el.classList && el.classList.contains( keepClasses[i] ) ) return;
			if ( el.id === keepClasses[i] || el.id === 'war-unified-fab' ) return;
		}
		if ( el.style.display === 'none' ) return; // already hidden
		el.style.display = 'none';
	} );

	// 3. Create the CIAB empty state.
	var emptyState = document.createElement( 'div' );
	emptyState.className = 'war-orders-empty-state';
	emptyState.innerHTML =
		'<div class="war-orders-empty-state__icon">' + emptyStateIcon + '</div>' +
		'<h2 class="war-orders-empty-state__title">No orders yet</h2>' +
		'<p class="war-orders-empty-state__description">' +
			'Orders will appear here once customers start purchasing from your store.' +
		'</p>';

	emptyContent.parentNode.insertBefore( emptyState, emptyContent.nextSibling );

	// 4. Build tools card.
	function buildToolsCard( toolsData ) {
		if ( ! toolsData.length ) return;

		var card = document.createElement( 'div' );
		card.className = 'war-tools-card';

		var header = document.createElement( 'div' );
		header.className = 'war-tools-card__header';
		header.innerHTML =
			'<h3 class="war-tools-card__title">Tools for your store</h3>' +
			'<button type="button" class="war-tools-card__toggle" aria-expanded="false" aria-label="Expand">' +
				chevronDown +
			'</button>';

		var body = document.createElement( 'div' );
		body.className = 'war-tools-card__body war-tools-card__body--collapsed';

		toolsData.forEach( function ( tool ) {
			var row = document.createElement( 'div' );
			row.className = 'war-tool-row';

			var iconHtml = tool.icon
				? '<img class="war-tool-row__icon" src="' + tool.icon + '" alt="" width="40" height="40">'
				: '<div class="war-tool-row__icon war-tool-row__icon--placeholder"></div>';

			row.innerHTML =
				iconHtml +
				'<div class="war-tool-row__content">' +
					'<div class="war-tool-row__title">' + tool.title + '</div>' +
					'<div class="war-tool-row__description">' + tool.description + '</div>' +
				'</div>' +
				'<div class="war-tool-row__actions">' +
					'<button type="button" class="components-button is-tertiary is-compact war-tool-dismiss">Dismiss</button>' +
					'<a href="' + tool.url + '" target="_blank" class="components-button is-secondary is-compact">Learn More</a>' +
				'</div>';

			body.appendChild( row );

			row.querySelector( '.war-tool-dismiss' ).addEventListener( 'click', function () {
				row.style.transition = 'opacity 0.2s, max-height 0.3s';
				row.style.opacity = '0';
				row.style.maxHeight = '0';
				row.style.overflow = 'hidden';
				row.style.padding = '0';
				row.style.margin = '0';
				setTimeout( function () { row.remove(); }, 300 );
			} );
		} );

		card.appendChild( header );
		card.appendChild( body );

		emptyState.parentNode.insertBefore( card, emptyState.nextSibling );

		header.addEventListener( 'click', function () {
			var isCollapsed = body.classList.contains( 'war-tools-card__body--collapsed' );
			body.classList.toggle( 'war-tools-card__body--collapsed' );
			var btn = header.querySelector( '.war-tools-card__toggle' );
			if ( btn ) {
				btn.innerHTML = isCollapsed ? chevronUp : chevronDown;
				btn.setAttribute( 'aria-expanded', isCollapsed ? 'true' : 'false' );
				btn.setAttribute( 'aria-label', isCollapsed ? 'Collapse' : 'Expand' );
			}
		} );
	}

	// Filter out non-extension items (headers, non-real entries).
	tools = tools.filter( function ( t ) {
		var lower = t.title.toLowerCase();
		return lower !== 'tools for your store' && lower !== '';
	} );

	// Remove the first item (not a real extension).
	if ( tools.length > 0 ) {
		tools.shift();
	}

	// If we found tools in the DOM, build immediately.
	if ( tools.length > 0 ) {
		buildToolsCard( tools );
	} else {
		// The marketplace suggestions may render via React after page load.
		// Observe the BlankState for new children.
		var observer = new MutationObserver( function ( mutations, obs ) {
			var items = emptyContent.querySelectorAll(
				'.marketplace-suggestion-container, [data-suggestion-slug]'
			);
			if ( items.length > 0 ) {
				obs.disconnect();
				var lateTool = [];
				items.forEach( function ( item ) {
					var img = item.querySelector( 'img' );
					var title = item.querySelector( 'h4, [class*="title"]' );
					var desc = item.querySelector( 'p, [class*="description"]' );
					var link = item.querySelector( 'a[href*="woocommerce.com"], a.linkout' );
					if ( title ) {
						lateTool.push( {
							icon: img ? img.src : '',
							title: title.textContent.trim(),
							description: desc ? desc.textContent.trim() : '',
							url: link ? link.href : '#',
						} );
					}
				} );
				lateTool = lateTool.filter( function ( t ) {
					var lower = t.title.toLowerCase();
					return lower !== 'tools for your store' && lower !== '';
				} );
				if ( lateTool.length > 1 ) {
					lateTool.shift();
				}
				if ( lateTool.length > 0 ) {
					buildToolsCard( lateTool );
				}
			}
		} );
		observer.observe( emptyContent, { childList: true, subtree: true } );

		// Stop observing after 10 seconds.
		setTimeout( function () { observer.disconnect(); }, 10000 );
	}

	// 5. Light grey background.
	var wpcontent = document.getElementById( 'wpcontent' );
	if ( wpcontent ) wpcontent.style.backgroundColor = 'var(--war-page-bg, #fcfcfc)';
	wrap.style.backgroundColor = 'var(--war-page-bg, #fcfcfc)';

	// 6. Hide the WordPress footer.
	var footer = document.getElementById( 'wpfooter' );
	if ( footer ) footer.style.display = 'none';
})();
