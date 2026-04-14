(function () {
	// Convert tooltip "?" icons into inline helper text below each label.
	var tips = document.querySelectorAll('.form-table .woocommerce-help-tip');

	tips.forEach(function (tip) {
		var text = tip.getAttribute('data-tip') || tip.getAttribute('aria-label') || '';
		if (!text) return;

		// Strip any HTML tags from the tip text.
		var tmp = document.createElement('div');
		tmp.innerHTML = text;
		text = tmp.textContent || tmp.innerText || '';
		if (!text.trim()) return;

		var span = document.createElement('span');
		span.className = 'war-tax-helper-text';
		span.textContent = text.trim();

		// Insert into the <th> (label cell).
		var th = tip.closest('th');
		if (th) {
			th.appendChild(span);
		}
	});

	// Also convert desc/description text from <td> into helper text in <th>.
	var descs = document.querySelectorAll('.form-table td > .description');
	descs.forEach(function (desc) {
		var text = desc.textContent || '';
		if (!text.trim()) return;

		var tr = desc.closest('tr');
		if (!tr) return;
		var th = tr.querySelector('th');
		if (!th) return;

		// Skip if we already have helper text from the tooltip.
		if (th.querySelector('.war-tax-helper-text')) return;

		var span = document.createElement('span');
		span.className = 'war-tax-helper-text';
		span.textContent = text.trim();
		th.appendChild(span);
	});
})();
