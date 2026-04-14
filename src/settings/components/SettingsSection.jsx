/**
 * SettingsSection — plain card wrapping a logical group of settings.
 *
 * Matches the CIAB design: card title (15px semibold) followed by an optional
 * description paragraph and the fields below. No collapsible behaviour.
 */

export function SettingsSection( { title, description, children } ) {
	return (
		<div className="wc-order-view-card">
			{ title && (
				<h3 className="wc-order-view-card__title">{ title }</h3>
			) }
			<div className="cdw-settings-card-body">
				{ description && (
					<p className="cdw-settings-card-description">{ description }</p>
				) }
				{ children }
			</div>
		</div>
	);
}
