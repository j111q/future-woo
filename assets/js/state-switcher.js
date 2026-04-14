(function () {
	var btn = document.getElementById('war-state-fab-btn');
	var menu = document.getElementById('war-state-menu');

	if (!btn || !menu) return;

	// Toggle menu.
	btn.addEventListener('click', function () {
		var open = menu.hidden;
		menu.hidden = !open;
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
	});

	// Close on outside click.
	document.addEventListener('click', function (e) {
		if (!e.target.closest('#war-state-fab')) {
			menu.hidden = true;
			btn.setAttribute('aria-expanded', 'false');
		}
	});

	// State option click.
	menu.addEventListener('click', function (e) {
		var option = e.target.closest('.war-state-option');
		if (!option) return;

		var state = option.getAttribute('data-state');

		// Update UI immediately.
		menu.querySelectorAll('.war-state-option').forEach(function (o) {
			o.classList.remove('war-state-option--active');
		});
		option.classList.add('war-state-option--active');

		// Save via AJAX.
		var data = new FormData();
		data.append('action', 'war_set_state');
		data.append('nonce', warStateData.nonce);
		data.append('state', state);

		fetch(warStateData.ajaxUrl, { method: 'POST', body: data })
			.then(function () {
				// Reload to show the new state.
				window.location.reload();
			});
	});
})();
