/**
 * WooCommerce Shipping Setup — React Frontend
 *
 * Two WP admin pages (registered as WooCommerce submenu items):
 *   1. Shipping Setup (zones) — wss-shipping-setup
 *   2. Shipping Operations    — wss-shipping-operations
 *
 * Zones flow (CIAB-matched):
 *   Zones list → Zone detail → Method detail
 *   Breadcrumbs: Zones & rates / Zone name / Method name
 *
 * Operations page (from Figma):
 *   Ship from location card  (sender addresses)
 *   Pickup location card     (pickup addresses)
 *
 * Local pickup as delivery option links to Operations page.
 */

( function () {
	'use strict';

	const { createElement: el, useState, useEffect, useCallback, Fragment, createPortal, useRef } = wp.element;
	const {
		Button, Modal, TextControl, TextareaControl, SelectControl, ToggleControl, Spinner,
		DropdownMenu, MenuGroup, MenuItem,
		__experimentalVStack: VStack, __experimentalHStack: HStack,
	} = wp.components;
	const { dispatch: wpDispatch } = wp.data;
	const apiFetch = wp.apiFetch;
	const { __ } = wp.i18n;

	const rawData = window.wssShippingData;
	const decodeHTML = ( str ) => { const el = document.createElement( 'textarea' ); el.innerHTML = str; return el.value; };
	const currency = { ...rawData.currency, symbol: decodeHTML( rawData.currency.symbol || '' ) };
	const { countries, states, storeAddress, operationsUrl, zonesUrl } = rawData;
	const initialPage = window.wssShippingData.initialPage || 'zones';

	const api = ( endpoint, options = {} ) => apiFetch( { path: `wss/v1/${ endpoint }`, ...options } );
	const notice = ( msg, type = 'success' ) => wpDispatch( 'core/notices' ).createNotice( type, msg, { type: 'snackbar', isDismissible: true } );


	// ─── Header Integration ───────────────────────────────────────────
	// Manages the PHP header to match the CIAB Page component pattern:
	//   - List view: Title "Shipping" + tabs (Zones | Operations)
	//   - Detail view: Breadcrumb "Shipping / Zone Name" — tabs hidden
	//   - Method view: Breadcrumb "Shipping / Zone / Method" — tabs hidden

	function setHeaderListMode() {
		// List view: "Settings / Shipping" (plain text) + tabs visible.
		// NOTE: Do NOT clear #wss-header-actions here — React portals manage it.
		const titleEl = document.getElementById( 'wss-breadcrumb-title' );
		const extraEl = document.getElementById( 'wss-breadcrumb-extra' );
		const tabsEl = document.getElementById( 'wss-tabs' );
		const headerEl = document.getElementById( 'wss-page-header' );

		if ( titleEl ) titleEl.textContent = __( 'Shipping', 'woocommerce-shipping-setup' );
		if ( extraEl ) extraEl.innerHTML = '';
		if ( tabsEl ) tabsEl.style.display = '';
		if ( headerEl ) headerEl.classList.add( 'war-page-header--shipping' );
	}

	function setHeaderDetailMode( segments, onNavigate ) {
		// Detail view: "Settings / Shipping / Zone Name" — tabs hidden.
		const titleEl = document.getElementById( 'wss-breadcrumb-title' );
		const extraEl = document.getElementById( 'wss-breadcrumb-extra' );
		const tabsEl = document.getElementById( 'wss-tabs' );
		const headerEl = document.getElementById( 'wss-page-header' );

		// "Shipping" becomes a link back to zones list.
		if ( titleEl ) {
			titleEl.innerHTML = '<a href="#" id="wss-back-link">' + __( 'Shipping', 'woocommerce-shipping-setup' ) + '</a>';
			const backLink = document.getElementById( 'wss-back-link' );
			if ( backLink ) {
				backLink.onclick = ( e ) => { e.preventDefault(); onNavigate( 'zones' ); };
			}
		}

		// Add extra breadcrumb segments: / Zone Name / Method
		if ( extraEl ) {
			const sep = ' <span class="war-page-header__breadcrumb-sep">/</span> ';
			extraEl.innerHTML = segments.map( ( s, i ) => {
				const isLast = i === segments.length - 1;
				if ( isLast ) return sep + '<span>' + s.label + '</span>';
				return sep + '<a href="#" data-wss-nav="' + ( s.id || '' ) + '">' + s.label + '</a>';
			} ).join( '' );

			extraEl.querySelectorAll( '[data-wss-nav]' ).forEach( ( link ) => {
				link.onclick = ( e ) => {
					e.preventDefault();
					onNavigate( link.getAttribute( 'data-wss-nav' ) );
				};
			} );
		}

		// Hide tabs in detail view.
		if ( tabsEl ) tabsEl.style.display = 'none';
		if ( headerEl ) headerEl.classList.remove( 'war-page-header--shipping' );
	}

	// ─── Shared Components ─────────────────────────────────────────────

	function Badge( { children, variant = 'info' } ) {
		return el( 'span', { className: `wc-shipping-badge wc-shipping-badge--${ variant }` }, children );
	}

	function Breadcrumb( { items, onNavigate } ) {
		return el( 'div', { className: 'wc-shipping__breadcrumb' },
			items.map( ( item, i ) => {
				const isLast = i === items.length - 1;
				return el( Fragment, { key: i },
					isLast
						? el( 'span', null, item.label )
						: el( 'a', { href: item.href || '#', onClick: ( e ) => { if ( ! item.href ) { e.preventDefault(); onNavigate( item.id, item.params ); } } }, item.label ),
					! isLast && el( 'span', { className: 'wc-shipping__breadcrumb-sep' }, '/' ),
				);
			} ),
		);
	}

	function CollapsibleCard( { title, summary, defaultOpen = true, actions, children } ) {
		const [ isOpen, setIsOpen ] = useState( defaultOpen );
		return el( 'div', { className: 'wc-shipping-card' },
			el( 'div', { className: 'wc-shipping-card__header', onClick: () => setIsOpen( ! isOpen ) },
				el( 'div', { className: 'wc-shipping-card__header-left' },
					el( 'h3', { className: 'wc-shipping-card__title' }, title ),
					! isOpen && summary && el( 'span', { className: 'wc-shipping-card__summary' }, summary ),
				),
				el( 'div', { className: 'wc-shipping-card__header-right' },
					actions && el( 'span', { onClick: ( e ) => e.stopPropagation() }, actions ),
					el( 'span', { className: `wc-shipping-card__toggle dashicons dashicons-arrow-${ isOpen ? 'up' : 'down' }-alt2` } ),
				),
			),
			isOpen && el( 'div', { className: 'wc-shipping-card__body' }, children ),
		);
	}

	function CountryPicker( { selected, onChange, countries: cl } ) {
		const [ search, setSearch ] = useState( '' );
		const entries = Object.entries( cl );
		const filtered = search ? entries.filter( ( [ , n ] ) => n.toLowerCase().includes( search.toLowerCase() ) ) : entries;
		const toggle = ( code ) => onChange( selected.includes( code ) ? selected.filter( ( c ) => c !== code ) : [ ...selected, code ] );
		return el( 'div', { className: 'wc-shipping-country-picker' },
			el( TextControl, { placeholder: __( 'Search countries...', 'woocommerce-shipping-setup' ), value: search, onChange: setSearch } ),
			selected.length > 0 && el( 'div', { className: 'wc-shipping-country-picker__selected' },
				selected.map( ( code ) => el( 'span', { key: code, className: 'wc-shipping-country-picker__tag' }, cl[ code ] || code, el( 'button', { type: 'button', onClick: () => toggle( code ), className: 'wc-shipping-country-picker__tag-remove' }, '\u00D7' ) ) ),
			),
			el( 'div', { className: 'wc-shipping-country-picker__list' },
				filtered.slice( 0, 50 ).map( ( [ code, name ] ) => el( 'label', { key: code, className: 'wc-shipping-country-picker__item' }, el( 'input', { type: 'checkbox', checked: selected.includes( code ), onChange: () => toggle( code ) } ), ' ', name ) ),
			),
		);
	}

	// ═══════════════════════════════════════════════════════════════════
	// ROUTING
	// ═══════════════════════════════════════════════════════════════════

	function ShippingSetupApp() {
		const [ route, setRoute ] = useState( { page: initialPage, params: {} } );
		const nav = ( page, params = {} ) => setRoute( { page, params } );

		// Centralized header: update breadcrumb + tabs on every route change.
		useEffect( () => {
			const p = route.page;
			const params = route.params || {};
			if ( p === 'zones' || p === 'operations' ) {
				setHeaderListMode();
			} else if ( p === 'zone-detail' && params.zone ) {
				setHeaderDetailMode(
					[ { label: params.zone.name || __( 'Zone', 'woocommerce-shipping-setup' ) } ],
					() => nav( 'zones' )
				);
			} else if ( p === 'method-detail' && params.zone ) {
				setHeaderDetailMode(
					[
						{ id: 'zone-detail', label: params.zone.name || __( 'Zone', 'woocommerce-shipping-setup' ) },
						{ label: params.method ? __( 'Edit', 'woocommerce-shipping-setup' ) + ' ' + ( params.method.title || '' ) : __( 'Add delivery option', 'woocommerce-shipping-setup' ) },
					],
					( navId ) => {
						if ( navId === 'zone-detail' ) nav( 'zone-detail', { zone: params.zone } );
						else nav( 'zones' );
					}
				);
			}
		}, [ route.page, route.params ] );

		switch ( route.page ) {
			case 'zones': return el( ZonesListPage, { navigate: nav } );
			case 'zone-detail': return el( ZoneDetailPage, { zone: route.params.zone, navigate: nav } );
			case 'method-detail': return el( MethodDetailPage, { zone: route.params.zone, method: route.params.method || null, methodType: route.params.methodType || 'flat_rate', isNew: route.params.isNew || false, navigate: nav } );
			case 'operations': return el( OperationsPage, { navigate: nav } );
			default: return el( ZonesListPage, { navigate: nav } );
		}
	}

	// ═══════════════════════════════════════════════════════════════════
	// PAGE 1: ZONES LIST
	// ═══════════════════════════════════════════════════════════════════

	function ZonesListPage( { navigate } ) {
		const [ zones, setZones ] = useState( [] );
		const [ loading, setLoading ] = useState( true );
		const [ showAddModal, setShowAddModal ] = useState( false );

		const fetchZones = useCallback( () => {
			setLoading( true );
			api( 'shipping-zones' ).then( ( data ) => {
				setZones( [ ...data ].sort( ( a, b ) => a.id === 0 ? 1 : b.id === 0 ? -1 : a.order - b.order ) );
				setLoading( false );
			} );
		}, [] );
		useEffect( () => { fetchZones(); }, [ fetchZones ] );

		const handleDelete = ( zoneId ) => {
			if ( ! confirm( __( 'Delete this shipping zone?', 'woocommerce-shipping-setup' ) ) ) return;
			api( `shipping-zones/${ zoneId }`, { method: 'DELETE' } ).then( () => { notice( __( 'Zone deleted.', 'woocommerce-shipping-setup' ) ); fetchZones(); } );
		};

		const fmtLoc = ( z ) => {
			if ( z.locations.length === 0 ) return z.id === 0 ? __( 'Any regions not in another zone', 'woocommerce-shipping-setup' ) : __( 'Everywhere', 'woocommerce-shipping-setup' );
			const n = z.locations.map( ( l ) => l.name );
			const j = n.join( ', ' );
			return j.length > 70 ? `${ n.slice( 0, 2 ).join( ', ' ) } and ${ n.length - 2 } more` : j;
		};

		const fmtMethods = ( m ) => ! m.length ? __( 'No delivery options', 'woocommerce-shipping-setup' ) : m.map( ( x ) => x.title ).join( ', ' );

		// Header managed by ShippingSetupApp router.

		// Header actions portal — renders "Add zone" button into the PHP header.
		const headerActionsEl = document.getElementById( 'wss-header-actions' );

		return el( 'div', { className: 'wc-shipping' },
			// Portal: render "Add zone" into the header actions area.
			headerActionsEl && createPortal(
				el( Button, {
					variant: 'primary',
					isCompact: true,
					onClick: () => setShowAddModal( true ),
				}, __( 'Add zone', 'woocommerce-shipping-setup' ) ),
				headerActionsEl
			),
			// DataViews table with column headers — matches Figma (1:12383)
			loading
				? el( 'div', { className: 'wc-shipping__loading' }, el( Spinner, null ) )
				: el( 'div', { className: 'wc-shipping-dataviews-list' },
					// Column headers — Figma: ZONE | DELIVERY OPTIONS | ACTIONS
					el( 'div', { className: 'wc-shipping-dataviews-list__header' },
						el( 'span', null, __( 'Zone', 'woocommerce-shipping-setup' ) ),
						el( 'span', null, __( 'Delivery options', 'woocommerce-shipping-setup' ) ),
						el( 'span', { style: { textAlign: 'right' } }, __( 'Actions', 'woocommerce-shipping-setup' ) ),
					),
					zones.map( ( z ) =>
						el( 'div', { key: z.id, className: 'wc-shipping-dataviews-list__row', onClick: ( e ) => {
							if ( e.target.closest( '.wc-shipping-dataviews-list__menu-wrapper' ) ) return;
							navigate( 'zone-detail', { zone: z } );
						} },
							el( 'div', { className: 'wc-shipping-dataviews-list__info' },
								el( 'span', { className: 'wc-shipping-dataviews-list__name-text' }, z.name ),
								el( 'div', { className: 'wc-shipping-dataviews-list__detail' }, fmtLoc( z ) ),
							),
							el( 'div', { className: 'wc-shipping-dataviews-list__right' },
								el( 'span', { className: 'wc-shipping-dataviews-list__meta' }, fmtMethods( z.methods ) ),
							),
							el( 'div', { className: 'wc-shipping-dataviews-list__actions', onClick: ( e ) => e.stopPropagation() },
								el( DropdownMenu, {
									icon: 'ellipsis',
									label: __( 'Actions', 'woocommerce-shipping-setup' ),
									controls: [
										{ title: __( 'Edit', 'woocommerce-shipping-setup' ), onClick: () => navigate( 'zone-detail', { zone: z } ) },
										...( z.id !== 0 ? [ { title: __( 'Delete', 'woocommerce-shipping-setup' ), onClick: () => handleDelete( z.id ) } ] : [] ),
									],
								} ),
							),
						),
					),
				),
			showAddModal && el( AddZoneModal, { onClose: () => setShowAddModal( false ), onSave: ( zone ) => { fetchZones(); navigate( 'zone-detail', { zone } ); }, countries } ),
		);
	}

	function AddZoneModal( { onClose, onSave, countries: cl } ) {
		const [ name, setName ] = useState( '' );
		const [ sel, setSel ] = useState( [] );
		const [ saving, setSaving ] = useState( false );
		const save = () => {
			if ( ! name.trim() ) return; setSaving( true );
			api( 'shipping-zones', { method: 'POST', data: { name, locations: sel.map( ( c ) => ( { code: c, type: 'country' } ) ) } } )
				.then( ( z ) => { notice( __( 'Zone created.', 'woocommerce-shipping-setup' ) ); setSaving( false ); onSave( z ); onClose(); } );
		};
		return el( Modal, { title: __( 'Add shipping zone', 'woocommerce-shipping-setup' ), onRequestClose: onClose, size: 'medium' },
			el( VStack, { spacing: 4 },
				el( TextControl, { label: __( 'Zone name', 'woocommerce-shipping-setup' ), value: name, onChange: setName, placeholder: __( 'e.g. North America', 'woocommerce-shipping-setup' ) } ),
				el( 'label', { className: 'components-base-control__label' }, __( 'Zone regions', 'woocommerce-shipping-setup' ) ),
				el( CountryPicker, { selected: sel, onChange: setSel, countries: cl } ),
				el( HStack, { justify: 'flex-end', spacing: 2 },
					el( Button, { variant: 'secondary', onClick: onClose }, __( 'Cancel', 'woocommerce-shipping-setup' ) ),
					el( Button, { variant: 'primary', isBusy: saving, disabled: ! name.trim(), onClick: save }, __( 'Create zone', 'woocommerce-shipping-setup' ) ),
				),
			),
		);
	}

	// ═══════════════════════════════════════════════════════════════════
	// PAGE 2: ZONE DETAIL
	// Breadcrumb: Shipping zones and rates / [Zone name]
	// ═══════════════════════════════════════════════════════════════════

	function ZoneDetailPage( { zone, navigate } ) {
		const [ zoneData, setZoneData ] = useState( zone );
		const [ methods, setMethods ] = useState( zone.methods || [] );
		const [ showEditModal, setShowEditModal ] = useState( false );
		const [ showAddOptionModal, setShowAddOptionModal ] = useState( false );

		const refreshMethods = useCallback( () => { api( `shipping-zones/${ zone.id }/methods` ).then( setMethods ); }, [ zone.id ] );

		const handleDeleteZone = () => {
			if ( zone.id === 0 || ! confirm( __( 'Delete this zone?', 'woocommerce-shipping-setup' ) ) ) return;
			api( `shipping-zones/${ zone.id }`, { method: 'DELETE' } ).then( () => { notice( __( 'Zone deleted.', 'woocommerce-shipping-setup' ) ); navigate( 'zones' ); } );
		};

		const handleDeleteMethod = ( m ) => {
			if ( ! confirm( __( 'Remove this delivery option?', 'woocommerce-shipping-setup' ) ) ) return;
			setMethods( methods.filter( ( x ) => x.instance_id !== m.instance_id ) );
			notice( __( 'Delivery option removed.', 'woocommerce-shipping-setup' ) );
		};

		const fmtLoc = () => {
			if ( ! zoneData.locations || ! zoneData.locations.length ) return __( 'No regions', 'woocommerce-shipping-setup' );
			return zoneData.locations.map( ( l ) => l.name ).join( ', ' );
		};

		// Header managed by ShippingSetupApp router.

		return el( 'div', { className: 'wc-shipping' },
			el( 'div', { className: 'wc-shipping__constrained' }, el( 'div', { className: 'wc-shipping__cards' },

				// Zone info card (read-only + edit modal)
				zone.id !== 0 && el( CollapsibleCard, {
					title: zoneData.name,
				},
					el( 'p', { className: 'wc-shipping__description' }, fmtLoc() ),
				),

				// Delivery options card
				el( CollapsibleCard, {
					title: __( 'Delivery options', 'woocommerce-shipping-setup' ),
					summary: methods.length ? `${ methods.length } option${ methods.length > 1 ? 's' : '' }` : __( 'None', 'woocommerce-shipping-setup' ),
				},
					methods.length > 0 && el( 'div', { className: 'wc-shipping-dataviews-list wc-shipping-dataviews-list--nested' },
						methods.map( ( m ) =>
							el( 'div', { key: m.instance_id, className: 'wc-shipping-dataviews-list__row', onClick: () => navigate( 'method-detail', { zone: zoneData, method: m, isNew: false } ) },
								el( 'div', { className: 'wc-shipping-dataviews-list__info' },
									el( 'div', { className: 'wc-shipping-dataviews-list__name-row' },
										el( 'a', { href: '#', className: 'wc-shipping-dataviews-list__name', onClick: ( e ) => { e.preventDefault(); e.stopPropagation(); navigate( 'method-detail', { zone: zoneData, method: m, isNew: false } ); } }, m.title ),
										el( Badge, { variant: m.enabled ? 'success' : 'neutral' }, m.enabled ? __( 'Active', 'woocommerce-shipping-setup' ) : __( 'Inactive', 'woocommerce-shipping-setup' ) ),
									),
									el( 'div', { className: 'wc-shipping-dataviews-list__detail' }, m.cost ? `${ currency.symbol }${ m.cost }` : __( 'Free', 'woocommerce-shipping-setup' ) ),
								),
								el( 'div', { className: 'wc-shipping-dataviews-list__actions' },
									el( Button, { variant: 'link', size: 'compact', onClick: ( e ) => { e.stopPropagation(); navigate( 'method-detail', { zone: zoneData, method: m, isNew: false } ); } }, __( 'Edit', 'woocommerce-shipping-setup' ) ),
									el( Button, { variant: 'link', isDestructive: true, size: 'compact', onClick: ( e ) => { e.stopPropagation(); handleDeleteMethod( m ); } }, __( 'Remove', 'woocommerce-shipping-setup' ) ),
								),
							),
						),
					),
					! methods.length && el( 'p', { className: 'wc-shipping__empty' }, __( 'No delivery options yet.', 'woocommerce-shipping-setup' ) ),
					el( 'div', { style: { marginTop: '12px' } },
						el( Button, { variant: 'secondary', onClick: () => setShowAddOptionModal( true ) }, __( 'Add delivery option', 'woocommerce-shipping-setup' ) ),
					),
				),
			) ),

			showEditModal && el( EditZoneModal, { zone: zoneData, onClose: () => setShowEditModal( false ), onSave: ( u ) => { setZoneData( u ); setShowEditModal( false ); } } ),
			showAddOptionModal && el( DeliveryOptionModal, { onClose: () => setShowAddOptionModal( false ), onSelect: ( type ) => { setShowAddOptionModal( false ); navigate( 'method-detail', { zone: zoneData, methodType: type, isNew: true } ); } } ),
		);
	}

	function EditZoneModal( { zone, onClose, onSave } ) {
		const [ name, setName ] = useState( zone.name );
		const [ saving, setSaving ] = useState( false );
		const save = () => { setSaving( true ); api( `shipping-zones/${ zone.id }`, { method: 'PUT', data: { name } } ).then( () => { notice( __( 'Zone updated.', 'woocommerce-shipping-setup' ) ); setSaving( false ); onSave( { ...zone, name } ); } ); };
		return el( Modal, { title: __( 'Edit zone', 'woocommerce-shipping-setup' ), onRequestClose: onClose, size: 'medium' },
			el( VStack, { spacing: 4 },
				el( TextControl, { label: __( 'Zone name', 'woocommerce-shipping-setup' ), value: name, onChange: setName } ),
				el( HStack, { justify: 'flex-end', spacing: 2 },
					el( Button, { variant: 'secondary', onClick: onClose }, __( 'Cancel', 'woocommerce-shipping-setup' ) ),
					el( Button, { variant: 'primary', isBusy: saving, disabled: ! name.trim(), onClick: save }, __( 'Save', 'woocommerce-shipping-setup' ) ),
				),
			),
		);
	}

	/**
	 * DeliveryOptionModal — type picker.
	 * Flat rate, Free shipping, Local pickup.
	 * Local pickup shows a link to Operations for managing pickup addresses.
	 */
	function DeliveryOptionModal( { onClose, onSelect } ) {
		const options = [
			{ id: 'flat_rate', title: __( 'Flat rate', 'woocommerce-shipping-setup' ), desc: __( 'Charge a fixed rate for shipping.', 'woocommerce-shipping-setup' ) },
			{ id: 'free_shipping', title: __( 'Free shipping', 'woocommerce-shipping-setup' ), desc: __( 'Offer free shipping, optionally with a minimum order.', 'woocommerce-shipping-setup' ) },
			{ id: 'local_pickup', title: __( 'Local pickup', 'woocommerce-shipping-setup' ), desc: __( 'Let customers collect from a pickup location.', 'woocommerce-shipping-setup' ) },
		];
		return el( Modal, { title: __( 'Add delivery option', 'woocommerce-shipping-setup' ), onRequestClose: onClose, size: 'medium' },
			el( 'div', { className: 'wc-shipping__option-list' },
				options.map( ( opt ) =>
					el( 'div', { key: opt.id, className: 'wc-shipping__option-item', onClick: () => onSelect( opt.id ) },
						el( 'div', { className: 'wc-shipping__option-item-info' },
							el( 'strong', null, opt.title ),
							el( 'div', { className: 'wc-shipping__option-item-desc' }, opt.desc ),
						),
						el( 'span', { className: 'dashicons dashicons-arrow-right-alt2', style: { color: '#787c82' } } ),
					),
				),
			),
		);
	}

	// ═══════════════════════════════════════════════════════════════════
	// PAGE 3: METHOD DETAIL
	// Breadcrumb: Zones & rates / Zone / Method
	// ═══════════════════════════════════════════════════════════════════

	function MethodDetailPage( { zone, method, methodType, isNew, navigate } ) {
		const labels = { flat_rate: __( 'Flat rate', 'woocommerce-shipping-setup' ), free_shipping: __( 'Free shipping', 'woocommerce-shipping-setup' ), local_pickup: __( 'Local pickup', 'woocommerce-shipping-setup' ) };
		const type = method ? method.method_id : methodType;
		const [ title, setTitle ] = useState( method ? method.title : labels[ type ] || '' );
		const [ cost, setCost ] = useState( method ? ( method.cost || '' ) : '' );
		const [ enabled, setEnabled ] = useState( method ? method.enabled : true );
		const [ minAmount, setMinAmount ] = useState( '' );
		const [ saving, setSaving ] = useState( false );

		const handleSave = () => {
			setSaving( true );
			const settings = { title };
			if ( type === 'flat_rate' ) settings.cost = cost;
			if ( isNew ) {
				api( `shipping-zones/${ zone.id }/methods`, { method: 'POST', data: { method_id: type, settings } } ).then( () => {
					notice( __( 'Delivery option added.', 'woocommerce-shipping-setup' ) );
					setSaving( false );
					api( 'shipping-zones' ).then( ( zones ) => {
						const updated = zones.find( ( z ) => z.id === zone.id ) || zone;
						navigate( 'zone-detail', { zone: updated } );
					} );
				} );
			} else {
				notice( __( 'Delivery option updated.', 'woocommerce-shipping-setup' ) );
				setSaving( false );
				navigate( 'zone-detail', { zone } );
			}
		};

		// Figma: Shipping zones & rates / Zone / Edit Method [Active] [Save] [⋮]
		const breadcrumbLabel = isNew
			? __( 'Add', 'woocommerce-shipping-setup' ) + ' ' + ( labels[ type ] || '' ).toLowerCase()
			: __( 'Edit', 'woocommerce-shipping-setup' ) + ' ' + title;

		const previewPrice = type === 'free_shipping'
			? __( 'Free', 'woocommerce-shipping-setup' )
			: cost ? `${ currency.symbol }${ cost }` : __( 'Free', 'woocommerce-shipping-setup' );

		// Header managed by ShippingSetupApp router.

		// Render Save button + badge into PHP header actions via portal.
		const headerActionsEl = document.getElementById( 'wss-header-actions' );

		return el( 'div', { className: 'wc-shipping' },
			// Portal: Save button + status badge in header.
			headerActionsEl && createPortal(
				el( Fragment, null,
					! isNew && el( Badge, { variant: enabled ? 'success' : 'neutral' }, enabled ? __( 'Active', 'woocommerce-shipping-setup' ) : __( 'Inactive', 'woocommerce-shipping-setup' ) ),
					el( Button, { className: 'wc-shipping__header-cta', isBusy: saving, disabled: ! title.trim(), onClick: handleSave },
						__( 'Save', 'woocommerce-shipping-setup' )
					),
				),
				headerActionsEl
			),

			// Single card: "Edit delivery option" — matches Figma exactly
			el( 'div', { className: 'wc-shipping__constrained' }, el( 'div', { className: 'wc-shipping__cards' },
				el( 'div', { className: 'wc-shipping-card' },
					el( 'div', { className: 'wc-shipping-card__body', style: { paddingTop: '24px' } },
						el( 'h3', { className: 'wc-shipping-card__title', style: { marginBottom: '20px' } },
							isNew ? __( 'Add delivery option', 'woocommerce-shipping-setup' ) : __( 'Edit delivery option', 'woocommerce-shipping-setup' )
						),

						el( VStack, { spacing: 4 },
							// NAME — uppercase label (Figma)
							el( 'div', null,
								el( 'label', { className: 'wc-shipping__form-label' }, __( 'Name', 'woocommerce-shipping-setup' ) ),
								el( TextControl, {
									value: title, onChange: setTitle,
									help: __( 'The name of the delivery option to be shown at checkout.', 'woocommerce-shipping-setup' ),
									__nextHasNoMarginBottom: true,
								} ),
							),

							// SHIPPING PRICE — with $ prefix (flat rate + local pickup)
							( type === 'flat_rate' || type === 'local_pickup' ) && el( 'div', null,
								el( 'label', { className: 'wc-shipping__form-label' },
									type === 'local_pickup' ? __( 'Pickup fee', 'woocommerce-shipping-setup' ) : __( 'Shipping price', 'woocommerce-shipping-setup' )
								),
								el( 'div', { className: 'wc-shipping__price-input' },
									el( 'span', { className: 'wc-shipping__price-prefix' }, currency.symbol ),
									el( 'input', {
										type: 'number', value: cost, className: 'wc-shipping__price-field',
										onChange: ( e ) => setCost( e.target.value ),
										placeholder: '0.00',
									} ),
								),
							),

							// MINIMUM ORDER (free shipping)
							type === 'free_shipping' && el( 'div', null,
								el( 'label', { className: 'wc-shipping__form-label' }, __( 'Minimum order amount', 'woocommerce-shipping-setup' ) ),
								el( 'div', { className: 'wc-shipping__price-input' },
									el( 'span', { className: 'wc-shipping__price-prefix' }, currency.symbol ),
									el( 'input', {
										type: 'number', value: minAmount, className: 'wc-shipping__price-field',
										onChange: ( e ) => setMinAmount( e.target.value ),
										placeholder: '0.00',
									} ),
								),
								el( 'p', { className: 'wc-shipping__description' }, __( 'Leave empty for free shipping on all orders.', 'woocommerce-shipping-setup' ) ),
							),

							// Taxable checkbox — Figma shows checkbox not toggle
							( type === 'flat_rate' || type === 'local_pickup' ) && el( 'label', { className: 'wc-shipping__checkbox-label' },
								el( 'input', { type: 'checkbox', checked: false } ),
								' ', __( 'Taxable', 'woocommerce-shipping-setup' ),
							),

							// Pickup → link to operations
							type === 'local_pickup' && el( 'div', { className: 'wc-shipping__description' },
								__( 'Manage pickup locations in ', 'woocommerce-shipping-setup' ),
								el( 'a', { href: operationsUrl, className: 'wc-shipping__link-arrow' }, __( 'Shipping Operations \u2192', 'woocommerce-shipping-setup' ) ),
							),

							// PREVIEW — dashed border box with radio icon (Figma)
							el( 'div', null,
								el( 'label', { className: 'wc-shipping__form-label' }, __( 'Preview', 'woocommerce-shipping-setup' ) ),
								el( 'div', { className: 'wc-shipping__preview' },
									el( 'div', { className: 'wc-shipping__preview-option' },
										el( 'div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
											el( 'span', { className: 'wc-shipping__preview-radio' } ),
											el( 'span', null, title || labels[ type ] ),
										),
										el( 'span', null, previewPrice ),
									),
								),
							),
						),
					),
				),
			) ),
		);
	}

	// ═══════════════════════════════════════════════════════════════════
	// PAGE 4: OPERATIONS
	// From Figma: Ship from location + Pickup location cards
	// Breadcrumb: Shipping zones and rates / Operations
	// ═══════════════════════════════════════════════════════════════════

	function OperationsPage( { navigate } ) {
		const [ shipFrom, setShipFrom ] = useState( [] );
		const [ pickupLocs, setPickupLocs ] = useState( [] );
		const [ loading, setLoading ] = useState( true );
		const [ showShipFromModal, setShowShipFromModal ] = useState( false );
		const [ showPickupModal, setShowPickupModal ] = useState( false );
		const [ editShipFromIdx, setEditShipFromIdx ] = useState( null );
		const [ editPickupIdx, setEditPickupIdx ] = useState( null );

		useEffect( () => {
			setLoading( true );
			api( 'operations/settings' ).then( ( data ) => {
				const sf = data.sender_addresses || [];
				if ( ! sf.length && storeAddress.address_1 ) {
					sf.push( { name: 'Store', address: `${ storeAddress.address_1 }, ${ storeAddress.city }, ${ storeAddress.state } ${ storeAddress.postcode }`, is_active: true, is_default_sender: true, is_default_return: true } );
				}
				setShipFrom( sf );
				setPickupLocs( data.pickup_locations || [] );
				setLoading( false );
			} );
		}, [] );

		const saveOps = ( sf, pl ) => {
			api( 'operations/settings', { method: 'POST', data: { sender_addresses: sf, pickup_locations: pl } } ).then( () => notice( __( 'Saved.', 'woocommerce-shipping-setup' ) ) );
		};

		const deleteShipFrom = ( i ) => { if ( ! confirm( __( 'Delete?', 'woocommerce-shipping-setup' ) ) ) return; const u = [ ...shipFrom ]; u.splice( i, 1 ); setShipFrom( u ); saveOps( u, pickupLocs ); };
		const deletePickup = ( i ) => { if ( ! confirm( __( 'Delete?', 'woocommerce-shipping-setup' ) ) ) return; const u = [ ...pickupLocs ]; u.splice( i, 1 ); setPickupLocs( u ); saveOps( shipFrom, u ); };

		// Header managed by ShippingSetupApp router.

		if ( loading ) return el( 'div', { className: 'wc-shipping__loading' }, el( Spinner, null ) );

		// Dataview list row helper — matches Figma (4:58605):
		//   Name [Active badge]     ⋮
		//   subtitle
		const dataRow = ( name, subtitle, isActive, badgeLabel, onEdit, onDelete ) =>
			el( 'div', { className: 'wc-shipping-dataviews-list__row', style: { cursor: 'default' } },
				el( 'div', { className: 'wc-shipping-dataviews-list__info' },
					el( 'div', { className: 'wc-shipping-dataviews-list__name-row' },
						el( 'span', { className: 'wc-shipping-dataviews-list__name-text' }, name ),
						isActive && el( Badge, { variant: 'success' }, badgeLabel ),
					),
					subtitle && el( 'div', { className: 'wc-shipping-dataviews-list__detail' }, subtitle ),
				),
				el( 'div', { className: 'wc-shipping-dataviews-list__actions' },
					el( Button, { variant: 'link', size: 'compact', onClick: onEdit }, __( 'Edit', 'woocommerce-shipping-setup' ) ),
					el( Button, { variant: 'link', isDestructive: true, size: 'compact', onClick: onDelete }, __( 'Delete', 'woocommerce-shipping-setup' ) ),
				),
			);

		return el( 'div', { className: 'wc-shipping' },
			el( 'div', { className: 'wc-shipping__constrained' }, el( 'div', { className: 'wc-shipping__cards' },

				// Card 1: Ship from location
				el( CollapsibleCard, { title: __( 'Ship from location', 'woocommerce-shipping-setup' ) },
					el( 'p', { className: 'wc-shipping__description' }, __( 'This address is used to calculate shipping rates and delivery times.', 'woocommerce-shipping-setup' ) ),
					shipFrom.length > 0 && el( 'div', { className: 'wc-shipping-dataviews-list wc-shipping-dataviews-list--nested' },
						shipFrom.map( ( a, i ) =>
							el( Fragment, { key: i },
								dataRow(
									a.name,
									a.address,
									a.is_active,
									__( 'Enabled', 'woocommerce-shipping-setup' ),
									() => { setEditShipFromIdx( i ); setShowShipFromModal( true ); },
									() => deleteShipFrom( i )
								),
							),
						),
					),
					el( 'div', { style: { marginTop: '12px' } },
						el( Button, { variant: 'link', onClick: () => { setEditShipFromIdx( null ); setShowShipFromModal( true ); } }, '+ ' + __( 'Add another', 'woocommerce-shipping-setup' ) ),
					),
				),

				// Card 2: Pickup location
				el( CollapsibleCard, { title: __( 'Pickup location', 'woocommerce-shipping-setup' ) },
					el( 'p', { className: 'wc-shipping__description' }, __( 'Offer buyers the option to pick up their order from your store.', 'woocommerce-shipping-setup' ) ),
					pickupLocs.length > 0 && el( 'div', { className: 'wc-shipping-dataviews-list wc-shipping-dataviews-list--nested' },
						pickupLocs.map( ( loc, i ) =>
							el( Fragment, { key: i },
								dataRow(
									loc.name,
									loc.address || '',
									loc.enabled,
									__( 'Active', 'woocommerce-shipping-setup' ),
									() => { setEditPickupIdx( i ); setShowPickupModal( true ); },
									() => deletePickup( i )
								),
							),
						),
					),
					el( 'div', { style: { marginTop: '12px' } },
						el( Button, { variant: 'link', onClick: () => { setEditPickupIdx( null ); setShowPickupModal( true ); } }, '+ ' + __( 'Add another', 'woocommerce-shipping-setup' ) ),
					),
				),
			) ),

			// Ship from address modal
			showShipFromModal && el( AddressModal, {
				title: editShipFromIdx !== null ? __( 'Edit ship from address', 'woocommerce-shipping-setup' ) : __( 'Add ship from address', 'woocommerce-shipping-setup' ),
				address: editShipFromIdx !== null ? shipFrom[ editShipFromIdx ] : null,
				onClose: () => { setShowShipFromModal( false ); setEditShipFromIdx( null ); },
				onSave: ( a ) => {
					const u = [ ...shipFrom ];
					if ( editShipFromIdx !== null ) u[ editShipFromIdx ] = a; else u.push( a );
					setShipFrom( u ); saveOps( u, pickupLocs );
					setShowShipFromModal( false ); setEditShipFromIdx( null );
				},
			} ),

			// Pickup location modal
			showPickupModal && el( AddressModal, {
				title: editPickupIdx !== null ? __( 'Edit pickup location', 'woocommerce-shipping-setup' ) : __( 'Add pickup location', 'woocommerce-shipping-setup' ),
				address: editPickupIdx !== null ? pickupLocs[ editPickupIdx ] : null,
				isPickup: true,
				onClose: () => { setShowPickupModal( false ); setEditPickupIdx( null ); },
				onSave: ( a ) => {
					const u = [ ...pickupLocs ];
					if ( editPickupIdx !== null ) u[ editPickupIdx ] = a; else u.push( a );
					setPickupLocs( u ); saveOps( shipFrom, u );
					setShowPickupModal( false ); setEditPickupIdx( null );
				},
			} ),
		);
	}

	/**
	 * AddressModal — shared modal for ship-from and pickup addresses.
	 */
	function AddressModal( { title: modalTitle, address, isPickup, onClose, onSave } ) {
		const def = { name: '', address: '', is_active: true, is_default_sender: false, is_default_return: false, enabled: true };
		const [ d, setD ] = useState( address || def );
		return el( Modal, { title: modalTitle, onRequestClose: onClose, size: 'medium' },
			el( VStack, { spacing: 4 },
				el( TextControl, { label: __( 'Name', 'woocommerce-shipping-setup' ), value: d.name, onChange: ( v ) => setD( { ...d, name: v } ) } ),
				el( TextControl, { label: __( 'Address', 'woocommerce-shipping-setup' ), value: d.address, onChange: ( v ) => setD( { ...d, address: v } ) } ),
				isPickup
					? el( ToggleControl, { label: __( 'Active', 'woocommerce-shipping-setup' ), checked: d.enabled !== false, onChange: ( v ) => setD( { ...d, enabled: v } ) } )
					: el( Fragment, null,
						el( ToggleControl, { label: __( 'Active', 'woocommerce-shipping-setup' ), checked: d.is_active, onChange: ( v ) => setD( { ...d, is_active: v } ) } ),
						el( ToggleControl, { label: __( 'Default sender', 'woocommerce-shipping-setup' ), checked: d.is_default_sender, onChange: ( v ) => setD( { ...d, is_default_sender: v } ) } ),
						el( ToggleControl, { label: __( 'Default return', 'woocommerce-shipping-setup' ), checked: d.is_default_return, onChange: ( v ) => setD( { ...d, is_default_return: v } ) } ),
					),
				el( HStack, { justify: 'flex-end', spacing: 2 },
					el( Button, { variant: 'secondary', onClick: onClose }, __( 'Cancel', 'woocommerce-shipping-setup' ) ),
					el( Button, { variant: 'primary', disabled: ! d.name.trim(), onClick: () => onSave( d ) }, address ? __( 'Save', 'woocommerce-shipping-setup' ) : __( 'Add', 'woocommerce-shipping-setup' ) ),
				),
			),
		);
	}

	// Mount
	const root = document.getElementById( 'wss-shipping-setup-root' );
	if ( root ) {
		const page = root.getAttribute( 'data-page' );
		if ( page ) window.wssShippingData.initialPage = page;
		wp.element.render( el( ShippingSetupApp, null ), root );
	}
} )();
