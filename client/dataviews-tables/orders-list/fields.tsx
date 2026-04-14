/**
 * DataViews field definitions for the Orders list — matches CIAB Figma design.
 */
import type { Field } from '@wordpress/dataviews';

declare const wcOrdersList: {
	adminUrl: string;
	currency: string;
	statuses: Record< string, string >;
};

export interface WcOrder {
	id: number;
	number: string;
	status: string;
	date_created: string;
	total: string;
	billing: {
		first_name: string;
		last_name: string;
		email: string;
	};
	payment_method_title: string;
	line_items: Array< { quantity: number } >;
}

/**
 * Map WC status → payment badge.
 */
function getPaymentBadge( status: string ): { label: string; bg: string; color: string } {
	switch ( status ) {
		case 'processing':
		case 'completed':
			return { label: 'Paid', bg: '#d4edda', color: '#155724' };
		case 'pending':
			return { label: 'Unpaid', bg: '#f0f0f0', color: '#1e1e1e' };
		case 'failed':
			return { label: 'Failed', bg: '#f8d7da', color: '#721c24' };
		case 'refunded':
			return { label: 'Refunded', bg: '#f8d7da', color: '#721c24' };
		case 'on-hold':
			return { label: 'On hold', bg: '#fff3cd', color: '#856404' };
		default:
			return { label: status, bg: '#f0f0f0', color: '#1e1e1e' };
	}
}

/**
 * Map WC status → fulfillment badge.
 */
function getFulfillmentBadge( status: string ): { label: string; bg: string; color: string } | null {
	switch ( status ) {
		case 'processing':
		case 'pending':
		case 'on-hold':
		case 'failed':
			return { label: 'Unfulfilled', bg: '#fcf0e3', color: '#8a6534' };
		case 'completed':
			return { label: 'Fulfilled', bg: '#d4edda', color: '#155724' };
		case 'refunded':
		case 'cancelled':
			return null;
		default:
			return null;
	}
}

function Badge( { label, bg, color }: { label: string; bg: string; color: string } ) {
	return (
		<span
			style={ {
				display: 'inline-flex',
				alignItems: 'center',
				padding: '2px 8px',
				borderRadius: '4px',
				fontSize: '12px',
				fontWeight: 500,
				lineHeight: '20px',
				whiteSpace: 'nowrap',
				background: bg,
				color: color,
			} }
		>
			{ label }
		</span>
	);
}

export function getOrderFields(): Field< WcOrder >[] {
	return [
		{
			id: 'number',
			label: 'Order',
			enableGlobalSearch: true,
			enableSorting: true,
			render: ( { item } ) => {
				const url = `${ wcOrdersList.adminUrl }admin.php?page=wc-orders&action=edit&id=${ item.id }`;
				return (
					<a
						href={ url }
						style={ {
							color: '#1e1e1e',
							textDecoration: 'none',
							fontWeight: 600,
						} }
					>
						#{ item.number }
					</a>
				);
			},
		},
		{
			id: 'customer',
			label: 'Customer',
			enableGlobalSearch: true,
			getValue: ( { item } ) =>
				`${ item.billing.first_name } ${ item.billing.last_name }`.trim() || 'Guest',
			render: ( { item } ) => {
				const name = `${ item.billing.first_name } ${ item.billing.last_name }`.trim() || 'Guest';
				return <span>{ name }</span>;
			},
		},
		{
			id: 'date_created',
			label: 'Date',
			type: 'datetime' as const,
			enableSorting: true,
			render: ( { item } ) => {
				const d = new Date( item.date_created );
				return (
					<span style={ { color: '#757575' } }>
						{ d.toLocaleDateString( 'en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric',
						} ).replace( ',', '.' ) }
					</span>
				);
			},
		},
		{
			id: 'payment',
			label: 'Payment',
			enableSorting: false,
			render: ( { item } ) => {
				const badge = getPaymentBadge( item.status );
				return <Badge { ...badge } />;
			},
		},
		{
			id: 'fulfillment',
			label: 'Fulfillment',
			enableSorting: false,
			render: ( { item } ) => {
				const badge = getFulfillmentBadge( item.status );
				if ( ! badge ) {
					return <span style={ { color: '#b0b0b0' } }>—</span>;
				}
				return <Badge { ...badge } />;
			},
		},
		{
			id: 'items',
			label: 'Items',
			enableSorting: false,
			render: ( { item } ) => {
				const count = item.line_items
					? item.line_items.reduce( ( sum, li ) => sum + li.quantity, 0 )
					: 0;
				return <span>{ count }</span>;
			},
		},
		{
			id: 'total',
			label: 'Total',
			enableSorting: true,
			render: ( { item } ) => {
				return (
					<span style={ {  } }>
						{ wcOrdersList.currency }{ parseFloat( item.total ).toFixed( 2 ) }
					</span>
				);
			},
		},
	];
}
