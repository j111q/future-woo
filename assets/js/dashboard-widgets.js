/* global cdwData, jQuery */
( function ( $ ) {
	'use strict';

	// =========================================================================
	// WooCommerce Inbox
	// =========================================================================

	var $inbox = $( '#cdw-woo-inbox' );

	if ( $inbox.length ) {

		// Move panel to <body> for correct stacking context.
		var $panel      = $( '#cdw-inbox-panel' ).appendTo( 'body' );
		var panelLoaded = false;

		// Detect truncated note bodies and inject "Read more" buttons.
		$inbox.find( '.cdw-note-body--clamp' ).each( function () {
			if ( this.scrollHeight > this.clientHeight ) {
				$( this ).after( '<button class="cdw-read-more button-link">' + escHtml( cdwData.i18n.readMore || 'Read more' ) + '</button>' );
			} else {
				$( this ).removeClass( 'cdw-note-body--clamp' );
			}
		} );

		// Open panel via "Show more" or "Read more".
		$inbox.on( 'click', '#cdw-show-more, .cdw-read-more', openInboxPanel );

		// Panel ellipsis menu.
		$panel.on( 'click', '.cdw-inbox-panel-ellipsis-btn', function ( e ) {
			e.stopPropagation();
			var $btn      = $( this );
			var $dropdown = $btn.siblings( '.cdw-inbox-panel-dropdown' );
			var isOpen    = ! $dropdown.prop( 'hidden' );
			$dropdown.prop( 'hidden', isOpen );
			$btn.attr( 'aria-expanded', String( ! isOpen ) );
		} );

		$panel.on( 'click', '.cdw-panel-dismiss-all', function () {
			$( this ).closest( '.cdw-inbox-panel-dropdown' ).prop( 'hidden', true );

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_inbox_dismiss_all',
				nonce  : cdwData.nonce,
			} ).done( function ( res ) {
				if ( res.success ) {
					$panel.find( '#cdw-inbox-panel-body' ).html(
						'<p class="cdw-no-notes">' + escHtml( cdwData.i18n.inboxEmpty || 'Your inbox is empty.' ) + '</p>'
					);
					$inbox.find( '.cdw-notes-list, #cdw-show-more' ).remove();
					$inbox.prepend( '<p class="cdw-no-notes">' + escHtml( cdwData.i18n.inboxEmpty || 'Your inbox is empty.' ) + '</p>' );
					panelLoaded = true;
				}
			} );
		} );

		$( document ).on( 'click.cdw-panel-ellipsis', function () {
			$panel.find( '.cdw-inbox-panel-dropdown' ).prop( 'hidden', true );
			$panel.find( '.cdw-inbox-panel-ellipsis-btn' ).attr( 'aria-expanded', 'false' );
		} );

		// Close panel via overlay or close button.
		$panel.on( 'click', '.cdw-inbox-panel-overlay, .cdw-inbox-panel-close', closeInboxPanel );

		// Close panel on Escape.
		$( document ).on( 'keydown.cdw-inbox', function ( e ) {
			if ( e.key === 'Escape' ) { closeInboxPanel(); }
		} );

		// Dismiss a note from the widget or the panel.
		$( document ).on( 'click', '.cdw-dismiss-note', function () {
			var id     = $( this ).data( 'id' );
			var $notes = $( '.cdw-note[data-id="' + id + '"]' );

			$notes.css( 'opacity', '0.4' );

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_dismiss_note',
				nonce  : cdwData.nonce,
				id     : id,
			} ).done( function ( res ) {
				if ( res.success ) {
					$notes.slideUp( 200, function () {
						$notes.remove();
						if ( ! $inbox.find( '.cdw-note' ).length ) {
							$inbox.find( '.cdw-notes-list, #cdw-show-more' ).remove();
							$inbox.prepend( '<p class="cdw-no-notes">' + escHtml( cdwData.i18n.inboxEmpty || 'Your inbox is empty.' ) + '</p>' );
						}
					} );
				} else {
					$notes.css( 'opacity', '' );
				}
			} ).fail( function () {
				$notes.css( 'opacity', '' );
			} );
		} );

		function openInboxPanel() {
			$panel.removeAttr( 'hidden' );
			$panel[0].offsetHeight; // eslint-disable-line no-unused-expressions
			$panel.addClass( 'cdw-inbox-panel--open' );

			if ( panelLoaded ) { return; }

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_inbox_load_panel',
				nonce  : cdwData.nonce,
			} ).done( function ( res ) {
				if ( res.success ) {
					$panel.find( '#cdw-inbox-panel-body' ).html( res.data.html );
					panelLoaded = true;
				}
			} ).fail( function () {
				$panel.find( '#cdw-inbox-panel-body' ).html(
					'<p class="cdw-inbox-panel-loading">' + escHtml( cdwData.i18n.inboxLoadError || 'Could not load messages.' ) + '</p>'
				);
			} );
		}

		function closeInboxPanel() {
			$panel.removeClass( 'cdw-inbox-panel--open' );
			setTimeout( function () { $panel.attr( 'hidden', '' ); }, 250 );
		}
	}

	// =========================================================================
	// WooCommerce Store Setup checklist
	// =========================================================================

	var $setup = $( '#cdw-setup-widget' );

	if ( $setup.length ) {

		$setup.on( 'click', '.cdw-setup-item-toggle', function () {
			var $btn   = $( this );
			var $item  = $btn.closest( '.cdw-setup-item' );
			var $body  = $item.find( '.cdw-setup-item-body' );
			var isOpen = $item.hasClass( 'cdw-setup-item--open' );

			if ( isOpen ) {
				// Collapse this item.
				$body.attr( 'hidden', '' );
				$item.removeClass( 'cdw-setup-item--open' );
				$btn.attr( 'aria-expanded', 'false' );
			} else {
				// Collapse any other open item first.
				$setup.find( '.cdw-setup-item--open' ).each( function () {
					var $other = $( this );
					$other.find( '.cdw-setup-item-body' ).attr( 'hidden', '' );
					$other.find( '.cdw-setup-item-toggle' ).attr( 'aria-expanded', 'false' );
					$other.removeClass( 'cdw-setup-item--open' );
				} );

				// Expand this item.
				$body.removeAttr( 'hidden' );
				$item.addClass( 'cdw-setup-item--open' );
				$btn.attr( 'aria-expanded', 'true' );
			}
		} );

		// Auto-open the first incomplete task on page load.
		var $firstIncomplete = $setup.find( '.cdw-setup-item:not(.cdw-setup-item--done):not(.cdw-setup-item--half)' ).first();
		if ( ! $firstIncomplete.length ) {
			// Fall back to first half-complete task if no fully incomplete tasks remain.
			$firstIncomplete = $setup.find( '.cdw-setup-item--half' ).first();
		}
		if ( $firstIncomplete.length ) {
			$firstIncomplete.find( '.cdw-setup-item-toggle' ).trigger( 'click' );
		}

		// Guardrail: prevent hiding the Store Setup widget until setup is complete.
		$( '#cdw_woo_setup-hide' ).on( 'click', function ( e ) {
			if ( ! $( this ).prop( 'checked' ) ) {
				e.preventDefault();
				$( this ).prop( 'checked', true );
				showSetupGuardrailModal();
			}
		} );
	}

	var closeSmallSvg =
		'<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">' +
			'<path d="M13 11.8l6.1-6.3-1-1-6.1 6.2-6.1-6.2-1 1 6.1 6.3-6.5 6.7 1 1 6.5-6.7 6.5 6.7 1-1z"/>' +
		'</svg>';

	function showSetupGuardrailModal() {
		if ( $( '#cdw-guardrail-modal' ).length ) {
			$( '#cdw-guardrail-modal' ).show();
			return;
		}

		var i18n = cdwData.i18n || {};
		var body = i18n.guardrailMessage || 'The Store Setup widget cannot be hidden until all setup tasks are complete. Please finish your store setup first.';

		var $modal = $(
			'<div id="cdw-guardrail-modal" class="cdw-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cdw-guardrail-title">' +
				'<div class="cdw-modal">' +
					'<div class="cdw-modal-header">' +
						'<h1 id="cdw-guardrail-title" class="cdw-modal-title">Are you sure?</h1>' +
						'<button class="cdw-modal-x-close button-link" aria-label="Close dialog">' + closeSmallSvg + '</button>' +
					'</div>' +
					'<div class="cdw-modal-content">' +
						'<p>' + escHtml( body ) + '</p>' +
						'<div class="cdw-modal-actions">' +
							'<button class="cdw-btn cdw-btn-secondary cdw-guardrail-cancel">Cancel</button>' +
							'<button class="cdw-btn cdw-btn-primary cdw-guardrail-ok">I\'m sure</button>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>'
		);

		$modal.on( 'click', function ( e ) {
			if ( e.target === this ) { $modal.hide(); }
		} );

		$modal.on( 'click', '.cdw-modal-x-close, .cdw-guardrail-cancel', function () {
			$modal.hide();
		} );

		$modal.on( 'click', '.cdw-guardrail-ok', function () {
			$modal.hide();
		} );

		$( 'body' ).append( $modal );
	}

	// =========================================================================
	// What's Next widget
	// =========================================================================

	var $whatsNext = $( '#cdw-whats-next-widget' );

	if ( $whatsNext.length ) {

		// Inject ellipsis menu button into widget header.
		var $whatsNextBox     = $( '#cdw_whats_next' );
		var $handleActions    = $whatsNextBox.find( '.handle-actions' );
		var ellipsisIconSvg   =
			'<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">' +
				'<path d="M13 19H11V17H13V19ZM13 13H11V11H13V13ZM13 7H11V5H13V7Z"/>' +
			'</svg>';
		var $ellipsisWrap = $( '<div style="position:relative;display:inline-flex;"></div>' );
		var $ellipsisBtn  = $( '<button class="cdw-whats-next-ellipsis" type="button" aria-haspopup="true" aria-expanded="false" title="' + escAttr( cdwData.i18n.whatsNextOptions || 'Options' ) + '">' + ellipsisIconSvg + '</button>' );
		var $dropdown     = $(
			'<div class="cdw-whats-next-dropdown" hidden>' +
				'<button class="cdw-whats-next-dismiss-all" type="button">' + escHtml( cdwData.i18n.dismissAll || 'Dismiss all' ) + '</button>' +
			'</div>'
		);

		$ellipsisWrap.append( $ellipsisBtn ).append( $dropdown );
		$handleActions.prepend( $ellipsisWrap );

		// Toggle dropdown.
		$ellipsisBtn.on( 'click', function ( e ) {
			e.stopPropagation();
			var isOpen = ! $dropdown.prop( 'hidden' );
			$dropdown.prop( 'hidden', isOpen );
			$ellipsisBtn.attr( 'aria-expanded', String( ! isOpen ) );
		} );

		// Close dropdown when clicking outside.
		$( document ).on( 'click.cdw-whats-next', function () {
			$dropdown.prop( 'hidden', true );
			$ellipsisBtn.attr( 'aria-expanded', 'false' );
		} );

		// Accordion.
		$whatsNext.on( 'click', '.cdw-setup-item-toggle', function () {
			var $btn   = $( this );
			var $item  = $btn.closest( '.cdw-setup-item' );
			var $body  = $item.find( '.cdw-setup-item-body' );
			var isOpen = $item.hasClass( 'cdw-setup-item--open' );

			if ( isOpen ) {
				$body.attr( 'hidden', '' );
				$item.removeClass( 'cdw-setup-item--open' );
				$btn.attr( 'aria-expanded', 'false' );
			} else {
				$whatsNext.find( '.cdw-setup-item--open' ).each( function () {
					var $other = $( this );
					$other.find( '.cdw-setup-item-body' ).attr( 'hidden', '' );
					$other.find( '.cdw-setup-item-toggle' ).attr( 'aria-expanded', 'false' );
					$other.removeClass( 'cdw-setup-item--open' );
				} );

				$body.removeAttr( 'hidden' );
				$item.addClass( 'cdw-setup-item--open' );
				$btn.attr( 'aria-expanded', 'true' );
			}
		} );

		// Auto-open first task.
		$whatsNext.find( '.cdw-setup-item' ).first().find( '.cdw-setup-item-toggle' ).trigger( 'click' );

		// Dismiss individual task.
		$whatsNext.on( 'click', '.cdw-whats-next-dismiss', function () {
			var id    = $( this ).data( 'id' );
			var $item = $( this ).closest( '.cdw-setup-item' );

			$item.css( 'opacity', '0.4' );

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_whats_next_dismiss_task',
				nonce  : cdwData.nonce,
				id     : id,
			} ).done( function ( res ) {
				if ( res.success ) {
					$item.slideUp( 200, function () {
						$item.remove();
						if ( res.data.remaining === 0 ) {
							showWhatsNextEmptyState();
						}
					} );
				} else {
					$item.css( 'opacity', '' );
				}
			} ).fail( function () {
				$item.css( 'opacity', '' );
			} );
		} );

		// Dismiss all.
		$dropdown.on( 'click', '.cdw-whats-next-dismiss-all', function () {
			$dropdown.prop( 'hidden', true );

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_whats_next_dismiss_all',
				nonce  : cdwData.nonce,
			} ).done( function ( res ) {
				if ( res.success ) {
					showWhatsNextEmptyState();
				}
			} );
		} );

		function showWhatsNextEmptyState() {

			$whatsNext.find( '.cdw-setup-list' ).fadeOut( 200, function () {
				$( this ).replaceWith(
					'<div class="cdw-whats-next-empty">' +
						'<img src="' + escAttr( cdwData.checkListImageUrl || '' ) + '" alt="" aria-hidden="true" class="cdw-whats-next-empty-illustration"/>' +
						'<p class="cdw-whats-next-empty-text">' +
							escHtml( cdwData.i18n.whatsNextEmptyText || "You're all caught up! Check back later for new recommendations." ) +
						'</p>' +
					'</div>'
				);
				$ellipsisWrap.hide();
			} );
		}
	}

	// =========================================================================
	// Stats overview widget
	// =========================================================================

	var $statsWidget = $( '#cdw-stats-widget' );

	if ( $statsWidget.length ) {

		var $statsBox      = $( '#cdw_stats' );
		var $statsGrid     = $( '#cdw-stats-grid' );
		var $statsSettings = $( '#cdw-stats-settings' );
		var activePeriod   = 'today';

		// Inject settings cog button into the postbox header, left of the arrows.
		var $settingsBtn = $(
			'<button class="cdw-stats-settings-btn" type="button" aria-label="' + escAttr( cdwData.i18n.statsSettings || 'Stats settings' ) + '" aria-expanded="false">' +
				'<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
					'<path fill-rule="evenodd" clip-rule="evenodd" d="M11.372 7.5H19V9H11.372C11.0631 9.87389 10.2297 10.5 9.25 10.5C8.27034 10.5 7.43691 9.87389 7.12803 9H5V7.5H7.12803C7.43691 6.62611 8.27034 6 9.25 6C10.2297 6 11.0631 6.62611 11.372 7.5ZM16.872 15H19V16.5H16.872C16.5631 17.3739 15.7297 18 14.75 18C13.7703 18 12.9369 17.3739 12.628 16.5H5V15H12.628C12.9369 14.1261 13.7703 13.5 14.75 13.5C15.7297 13.5 16.5631 14.1261 16.872 15Z"/>' +
				'</svg>' +
			'</button>'
		);

		$settingsBtn.insertBefore( $statsBox.find( '.postbox-header .handle-actions' ) );

		// Build and open the settings modal.
		var $statsModal = null;

		function openStatsModal() {
			if ( ! $statsModal ) {
				$statsModal = $(
					'<div class="cdw-modal-overlay" id="cdw-stats-settings-modal" role="dialog" aria-modal="true" aria-labelledby="cdw-stats-modal-title">' +
						'<div class="cdw-modal">' +
							'<div class="cdw-modal-header">' +
								'<h1 id="cdw-stats-modal-title" class="cdw-modal-title">' + escHtml( cdwData.i18n.statsSettings || 'Stats settings' ) + '</h1>' +
								'<button type="button" class="cdw-modal-x-close button-link" aria-label="Close dialog">' + closeSmallSvg + '</button>' +
							'</div>' +
							'<div class="cdw-modal-content cdw-stats-modal-body">' +
								'<div class="cdw-modal-actions">' +
									'<button type="button" class="cdw-btn cdw-btn-tertiary" id="cdw-stats-settings-cancel">Cancel</button>' +
									'<button type="button" class="cdw-btn cdw-btn-primary" id="cdw-stats-settings-save">Save</button>' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>'
				);
				$statsModal.find( '.cdw-stats-modal-body' ).prepend( $statsSettings.find( '.cdw-stats-settings-list' ) );
				$( 'body' ).append( $statsModal );

				$statsModal.on( 'click', function ( e ) {
					if ( e.target === this ) { closeStatsModal(); }
				} );

				$statsModal.on( 'click', '.cdw-modal-x-close', closeStatsModal );

				$statsModal.on( 'click', '#cdw-stats-settings-save', function () {
					var metrics = [];
					$statsModal.find( 'input[name="cdw_metric"]:checked' ).each( function () {
						metrics.push( $( this ).val() );
					} );

					closeStatsModal();
					$statsGrid.addClass( 'cdw-stats-grid--loading' );

					$.post( cdwData.ajaxUrl, {
						action  : 'cdw_stats_save_settings',
						nonce   : cdwData.nonce,
						metrics : metrics,
						period  : activePeriod,
					} ).done( function ( res ) {
						if ( res.success ) { $statsGrid.html( res.data.html ); }
					} ).always( function () {
						$statsGrid.removeClass( 'cdw-stats-grid--loading' );
					} );
				} );

				$statsModal.on( 'click', '#cdw-stats-settings-cancel', closeStatsModal );

				$( document ).on( 'keydown.cdw-stats-modal', function ( e ) {
					if ( e.key === 'Escape' ) { closeStatsModal(); }
				} );
			}

			$statsModal.show();
			$settingsBtn.attr( 'aria-expanded', 'true' );
		}

		function closeStatsModal() {
			if ( $statsModal ) { $statsModal.hide(); }
			$settingsBtn.attr( 'aria-expanded', 'false' );
		}

		$settingsBtn.on( 'click', openStatsModal );

		// Tab switching.
		$statsWidget.on( 'click', '.cdw-stats-tab', function () {
			var $tab   = $( this );
			var period = $tab.data( 'period' );

			if ( period === activePeriod ) { return; }

			$statsWidget.find( '.cdw-stats-tab' ).removeClass( 'cdw-stats-tab--active' ).attr( 'aria-selected', 'false' );
			$tab.addClass( 'cdw-stats-tab--active' ).attr( 'aria-selected', 'true' );
			activePeriod = period;

			$statsGrid.addClass( 'cdw-stats-grid--loading' );

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_stats_get',
				nonce  : cdwData.nonce,
				period : period,
			} ).done( function ( res ) {
				if ( res.success ) {
					$statsGrid.html( res.data.html );
				}
			} ).always( function () {
				$statsGrid.removeClass( 'cdw-stats-grid--loading' );
			} );
		} );
	}

	// =========================================================================
	// Dev: State Switcher FAB
	// =========================================================================

	var $fab = $( '#cdw-state-fab' );

	if ( $fab.length ) {

		var $fabBtn   = $( '#cdw-state-fab-btn' );
		var $fabMenu  = $( '#cdw-state-menu' );

		$fabBtn.on( 'click', function ( e ) {
			e.stopPropagation();
			var isOpen = ! $fabMenu.prop( 'hidden' );
			$fabMenu.prop( 'hidden', isOpen );
			$fabBtn.attr( 'aria-expanded', String( ! isOpen ) );
		} );

		$( document ).on( 'click.cdw-fab', function () {
			$fabMenu.prop( 'hidden', true );
			$fabBtn.attr( 'aria-expanded', 'false' );
		} );

		$fab.on( 'click', '#cdw-restore-inbox-btn', function ( e ) {
			e.stopPropagation();
			$( this ).prop( 'disabled', true );

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_restore_inbox',
				nonce  : cdwData.nonce,
			} ).done( function ( res ) {
				if ( res.success ) {
					window.location.reload();
				}
			} ).fail( function () {
				$( '#cdw-restore-inbox-btn' ).prop( 'disabled', false );
			} );
		} );

		$fab.on( 'change', '#cdw-redesign-toggle-btn', function ( e ) {
			e.stopPropagation();
			var $checkbox = $( this );
			$checkbox.prop( 'disabled', true );

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_toggle_redesign',
				nonce  : cdwData.nonce,
			} ).done( function ( res ) {
				if ( res.success ) {
					window.location.reload();
				}
			} ).fail( function () {
				$checkbox.prop( 'checked', ! $checkbox.prop( 'checked' ) );
				$checkbox.prop( 'disabled', false );
			} );
		} );

	$fab.on( 'click', '.cdw-state-option', function () {
			var state = $( this ).data( 'state' );

			$fabMenu.prop( 'hidden', true );
			$fabBtn.attr( 'aria-expanded', 'false' ).prop( 'disabled', true );

			$.post( cdwData.ajaxUrl, {
				action : 'cdw_set_state',
				nonce  : cdwData.nonce,
				state  : state,
			} ).done( function ( res ) {
				if ( res.success ) {
					window.location.reload();
				}
			} ).fail( function () {
				$fabBtn.prop( 'disabled', false );
			} );
		} );
	}

	// =========================================================================
	// Redesign: Customize button
	// =========================================================================

	if ( $( 'body' ).hasClass( 'cdw-redesign' ) ) {
		var $customizeBtn  = $( '<button type="button" class="cdw-btn cdw-btn-secondary cdw-customize-btn">Customize</button>' );
		var $cancelBtn     = $( '<button type="button" class="cdw-btn cdw-btn-tertiary cdw-customize-cancel-btn">Cancel</button>' );
		var $btnWrap       = $( '<div class="cdw-customize-btn-wrap"></div>' );
		var savedOrder     = {};

		$btnWrap.append( $cancelBtn ).append( $customizeBtn );
		$( '.wrap h1' ).first().before( $btnWrap );

		function enterCustomizeMode() {
			// Snapshot current widget order per column.
			savedOrder = {};
			$( '.meta-box-sortables' ).each( function () {
				var col = $( this ).attr( 'id' );
				savedOrder[ col ] = $( this ).sortable( 'toArray' );
			} );

			$( 'body' ).addClass( 'cdw-customize-mode' );
			$customizeBtn.removeClass( 'cdw-btn-secondary' ).addClass( 'cdw-btn-primary' ).text( 'Done' );
			$cancelBtn.addClass( 'cdw-customize-cancel-btn--visible' );
		}

		function exitCustomizeMode() {
			$( 'body' ).removeClass( 'cdw-customize-mode' );
			$customizeBtn.removeClass( 'cdw-btn-primary' ).addClass( 'cdw-btn-secondary' ).text( 'Customize' );
			$cancelBtn.removeClass( 'cdw-customize-cancel-btn--visible' );
			savedOrder = {};
		}

		$customizeBtn.on( 'click', function () {
			if ( $( 'body' ).hasClass( 'cdw-customize-mode' ) ) {
				exitCustomizeMode();
			} else {
				enterCustomizeMode();
			}
		} );

		$cancelBtn.on( 'click', function () {
			// Restore saved widget order in the DOM.
			$.each( savedOrder, function ( colId, order ) {
				var $col = $( '#' + colId );
				$.each( order, function ( i, id ) {
					$col.append( $( '#' + id ) );
				} );
			} );
			exitCustomizeMode();
		} );
	}

	// =========================================================================
	// Helpers
	// =========================================================================

	function escHtml( str ) {
		return $( '<div>' ).text( str ).html();
	}

	function escAttr( str ) {
		return $( '<div>' ).text( str ).html().replace( /"/g, '&quot;' );
	}

} )( jQuery );
