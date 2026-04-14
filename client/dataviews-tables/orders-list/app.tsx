/**
 * Orders list DataViews app — uses PHP header, renders tabs + table only.
 */
import { useState, useMemo, useCallback } from '@wordpress/element';
import { DataViews, type View } from '@wordpress/dataviews';
import { useWcRest } from '../shared/use-wc-rest';
import { getOrderFields } from './fields';
import type { WcOrder } from './fields';
import '../shared/dataviews-overrides.scss';
import './style.scss';

declare const wcOrdersList: {
	adminUrl: string;
};

const TABS = [
	{ id: 'open', label: 'Open', statuses: 'pending,processing,on-hold' },
	{ id: 'completed', label: 'Completed', statuses: 'completed' },
	{ id: 'refunded', label: 'Refunded', statuses: 'refunded' },
	{ id: 'disputed', label: 'Disputed', statuses: 'failed' },
	{ id: 'cancelled', label: 'Canceled', statuses: 'cancelled' },
	{ id: 'all', label: 'All', statuses: '' },
];

const DEFAULT_VIEW: View = {
	type: 'table' as const,
	search: '',
	filters: [],
	page: 1,
	perPage: 25,
	sort: {
		field: 'date_created',
		direction: 'desc',
	},
	fields: [
		'number',
		'customer',
		'date_created',
		'payment',
		'fulfillment',
		'items',
		'total',
	],
	layout: {},
};

function viewToApiParams(
	view: View,
	statusFilter: string
): Record< string, string | number > {
	const params: Record< string, string | number > = {
		page: view.page || 1,
		per_page: view.perPage || 25,
	};

	if ( view.sort?.field ) {
		const sortMap: Record< string, string > = {
			date_created: 'date',
			number: 'id',
			total: 'total',
		};
		params.orderby = sortMap[ view.sort.field ] || view.sort.field;
		params.order = view.sort.direction;
	}

	if ( view.search ) {
		params.search = view.search;
	}

	if ( statusFilter ) {
		params.status = statusFilter;
	}

	return params;
}

/* SVG icons matching CIAB Figma */
function SearchIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<circle cx="11" cy="11" r="6" />
			<path d="M15.5 15.5L20 20" strokeLinecap="round" />
		</svg>
	);
}

function FilterIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
		</svg>
	);
}

function SettingsIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
		</svg>
	);
}

export function OrdersListApp() {
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const [ activeTab, setActiveTab ] = useState( 'open' );

	const currentTab = TABS.find( ( t ) => t.id === activeTab ) || TABS[ 0 ];
	const apiParams = useMemo(
		() => viewToApiParams( view, currentTab.statuses ),
		[ view, currentTab.statuses ]
	);

	const { data, total, totalPages, isLoading } = useWcRest< WcOrder >(
		'/wc/v3/orders',
		apiParams
	);

	const fields = useMemo( () => getOrderFields(), [] );

	const onChangeView = useCallback( ( newView: View ) => {
		setView( newView );
	}, [] );

	const handleTabClick = useCallback( ( tabId: string ) => {
		setActiveTab( tabId );
		setView( ( prev ) => ( { ...prev, page: 1 } ) );
	}, [] );

	return (
		<div className="war-orders-page">
			{ /* Tabs + icons bar — sits below the PHP-rendered header */ }
			<div className="war-orders-tabs-bar">
				<div className="war-orders-tabs">
					{ TABS.map( ( tab ) => (
						<button
							key={ tab.id }
							className={ `war-orders-tab ${
								activeTab === tab.id
									? 'war-orders-tab--active'
									: ''
							}` }
							onClick={ () => handleTabClick( tab.id ) }
							type="button"
						>
							{ tab.label }
						</button>
					) ) }
				</div>
				<div className="war-orders-icons">
					<button className="war-orders-icon-btn" type="button" title="Search">
						<SearchIcon />
					</button>
					<button className="war-orders-icon-btn" type="button" title="Filter">
						<FilterIcon />
					</button>
					<button className="war-orders-icon-btn" type="button" title="Settings">
						<SettingsIcon />
					</button>
				</div>
			</div>

			{ /* DataViews table */ }
			<div className="war-orders-dataview">
				<DataViews
					data={ data }
					fields={ fields as any }
					view={ view }
					onChangeView={ onChangeView }
					paginationInfo={ { totalItems: total, totalPages } }
					getItemId={ ( item: WcOrder ) => String( item.id ) }
					isLoading={ isLoading }
					defaultLayouts={ { table: {} } }
					search={ false }
					isItemClickable={ () => true }
					onClickItem={ ( item: WcOrder ) => {
						window.location.href = `${ wcOrdersList.adminUrl }admin.php?page=wc-orders&action=edit&id=${ item.id }`;
					} }
				/>
			</div>
		</div>
	);
}
