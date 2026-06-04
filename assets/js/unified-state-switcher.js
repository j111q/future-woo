(function () {
	function getFab() { return document.getElementById('war-unified-fab-btn'); }
	function getMenu() { return document.getElementById('war-unified-menu'); }

	// The FAB's original markup (gear icon + label), captured before the first
	// loading-spinner swap so it can be restored on failure rather than clobbered.
	var fabOriginalHTML = null;

	function setLoading( isLoading ) {
		var fabBtn = getFab();
		var menu = getMenu();
		if ( ! fabBtn ) return;

		if ( fabOriginalHTML === null ) {
			fabOriginalHTML = fabBtn.innerHTML;
		}

		if ( isLoading ) {
			fabBtn.classList.add( 'war-state-fab-btn--loading' );
			fabBtn.disabled = true;
			fabBtn.textContent = '';
			fabBtn.innerHTML = '<span class="war-fab-spinner"></span> Loading\u2026';
			if ( menu ) menu.hidden = true;
		} else {
			fabBtn.classList.remove( 'war-state-fab-btn--loading' );
			fabBtn.disabled = false;
			fabBtn.innerHTML = fabOriginalHTML;
		}
	}

	function postAndReload( url, formData ) {
		setLoading( true );
		fetch( url, { method: 'POST', body: formData })
			.then(function (r) { return r.json(); })
			.then(function (data) {
				if ( data.success ) window.location.reload();
				else setLoading( false );
			})
			.catch(function () { setLoading( false ); });
	}

	function getAjaxUrl() {
		return ( typeof warUnifiedData !== 'undefined' && warUnifiedData.ajaxUrl )
			? warUnifiedData.ajaxUrl
			: '';
	}

	function getNonce( name ) {
		return ( typeof warUnifiedData !== 'undefined' && warUnifiedData[ name ] )
			? warUnifiedData[ name ]
			: '';
	}

	// All click handling via event delegation.
	document.addEventListener( 'click', function (e) {
		// FAB button toggle.
		var fabBtn = e.target.closest('#war-unified-fab-btn');
		if ( fabBtn ) {
			var menu = getMenu();
			if ( ! menu ) return;
			var open = menu.hidden;
			menu.hidden = ! open;
			fabBtn.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
			return;
		}

		// Close menu on outside click.
		if ( ! e.target.closest('#war-unified-fab') ) {
			var menu = getMenu();
			var btn = getFab();
			if ( menu ) menu.hidden = true;
			if ( btn ) btn.setAttribute( 'aria-expanded', 'false' );
		}

		// State option buttons.
		var stateBtn = e.target.closest('[data-ajax-action]');
		if ( stateBtn && stateBtn.closest('#war-unified-menu') ) {
			var formData = new FormData();
			formData.append( 'action', stateBtn.getAttribute('data-ajax-action') );
			formData.append( 'nonce', stateBtn.getAttribute('data-nonce') );
			formData.append( 'state', stateBtn.getAttribute('data-state') );
			postAndReload( getAjaxUrl(), formData );
		}
	});

	// All change handling via event delegation.
	document.addEventListener( 'change', function (e) {
		var id = e.target.id;
		if ( ! id ) return;

		var formData = new FormData();

		if ( id === 'war-store-menu-toggle' ) {
			formData.append( 'action', 'war_toggle_admin_experience' );
			formData.append( 'nonce', getNonce('nonce') );
			formData.append( 'option', 'war_show_store_menu' );
			formData.append( 'value', e.target.checked ? 'yes' : 'no' );
			postAndReload( getAjaxUrl(), formData );
			return;
		}
	});
})();
