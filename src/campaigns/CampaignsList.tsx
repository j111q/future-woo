/**
 * Campaigns list — backed by real @wordpress/dataviews.
 *
 * Data shape conforms to the WC marketing-multichannel Campaign concept,
 * but we render the rich cross-channel view that doesn't exist anywhere
 * else in WC yet.
 */
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Tooltip } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import type { Field, View } from '@wordpress/dataviews';
import { plus, megaphone } from '@wordpress/icons';
import type { Campaign } from './types';
import { ChannelChip, ChannelChipList } from './ChannelChip';
import { PageHeader } from './PageHeader';
import { StatCard } from './StatCard';
import { fmtMoney, fmtNum, fmtRoas, channelById } from './helpers';

const STATUS_OPTIONS = [
	{ value: 'active',    label: __( 'Active', 'multichannel-campaigns' ) },
	{ value: 'scheduled', label: __( 'Scheduled', 'multichannel-campaigns' ) },
	{ value: 'draft',     label: __( 'Draft', 'multichannel-campaigns' ) },
	{ value: 'completed', label: __( 'Completed', 'multichannel-campaigns' ) },
];

const STATUS_PILL_CLASS: Record< string, string > = {
	active:    'mcc-pill mcc-pill--success',
	scheduled: 'mcc-pill mcc-pill--scheduled',
	draft:     'mcc-pill mcc-pill--draft',
	completed: 'mcc-pill mcc-pill--completed',
};

const STATUS_PILL_LABEL: Record< string, string > = {
	active:    '● Active',
	scheduled: '◷ Scheduled',
	draft:     '◌ Draft',
	completed: '✓ Completed',
};

/**
 * The fields list is a function of an `onOpen` callback so the name field
 * can render the title as a clickable link that routes into the detail
 * view. This mirrors WC's Campaigns card, which renders titles as
 * `<Link>` from `@woocommerce/components` pointing at `el.manageUrl`.
 */
const buildFields = ( onOpen: ( id: number ) => void ): Field< Campaign >[] => [
	{
		id: 'name',
		label: __( 'Campaign', 'multichannel-campaigns' ),
		enableHiding: false,
		enableGlobalSearch: true,
		render: ( { item }: { item: Campaign } ) => (
			<div className="mcc-cell-name">
				<button
					type="button"
					className="mcc-cell-name__title"
					onClick={ ( e ) => {
						e.stopPropagation();
						onOpen( item.id );
					} }
				>
					{ item.name }
				</button>
				<span className="mcc-cell-name__goal">
					{ item.source ? (
						<>
							{ __( 'Single channel · From ', 'multichannel-campaigns' ) }
							<strong>{ channelById( item.source )?.label }</strong>
							<span className="mcc-source-pill">↕ synced</span>
						</>
					) : (
						<>
							{ __( 'Goal · ', 'multichannel-campaigns' ) }
							{ item.goal_type }
							{ item.goal_value
								? ' · ' +
								  ( item.goal_type === 'revenue'
										? fmtMoney( item.goal_value )
										: fmtNum( item.goal_value ) +
										  ' ' +
										  ( item.goal_type === 'bookings'
												? 'sign-ups'
												: item.goal_type === 'awareness'
												? 'sessions'
												: 'orders' ) )
								: '' }
						</>
					) }
				</span>
			</div>
		),
	},
	{
		id: 'status',
		label: __( 'Status', 'multichannel-campaigns' ),
		elements: STATUS_OPTIONS,
		filterBy: { operators: [ 'isAny', 'isNone' ] },
		render: ( { item }: { item: Campaign } ) => (
			<span className={ STATUS_PILL_CLASS[ item.status ] }>
				{ STATUS_PILL_LABEL[ item.status ] }
			</span>
		),
	},
	{
		id: 'channels',
		label: __( 'Channels', 'multichannel-campaigns' ),
		enableSorting: false,
		elements: window.MCC_BOOT.channels.map( ( c ) => ( {
			value: c.id,
			label: c.label,
		} ) ),
		filterBy: { operators: [ 'isAny', 'isAll' ] },
		// Filter callback: a row matches if its channels intersect with the chosen values.
		// DataViews handles this automatically when getValue returns an array of strings
		// and operators include isAny/isAll.
		getValue: ( { item }: { item: Campaign } ) =>
			item.channels as unknown as string,
		render: ( { item }: { item: Campaign } ) => (
			<ChannelChipList ids={ item.channels } />
		),
	},
	{
		id: 'dates',
		label: __( 'Dates', 'multichannel-campaigns' ),
		render: ( { item }: { item: Campaign } ) => (
			<span className="mcc-dim">{ item.dates }</span>
		),
	},
	{
		id: 'sessions',
		label: __( 'Sessions', 'multichannel-campaigns' ),
		type: 'integer',
		render: ( { item }: { item: Campaign } ) => (
			<span className="mcc-num">{ fmtNum( item.sessions ) }</span>
		),
	},
	{
		id: 'sales',
		label: __( 'Sales', 'multichannel-campaigns' ),
		type: 'integer',
		render: ( { item }: { item: Campaign } ) => (
			<span className="mcc-num">{ fmtMoney( item.sales ) }</span>
		),
	},
	{
		id: 'roas',
		label: __( 'ROAS', 'multichannel-campaigns' ),
		type: 'integer',
		header: (
			<span className="mcc-header-with-hint">
				ROAS{ ' ' }
				<Tooltip text={ __( 'Return on Ad Spend — attributed revenue divided by ad spend', 'multichannel-campaigns' ) }>
					<span className="mcc-hint" tabIndex={ 0 } aria-label="ROAS help">
						ⓘ
					</span>
				</Tooltip>
			</span>
		),
		render: ( { item }: { item: Campaign } ) => (
			<span className="mcc-num">{ fmtRoas( item.roas ) }</span>
		),
	},
];

const defaultLayouts = {
	table: {
		layout: {
			primaryField: 'name',
			styles: {
				// No minWidths — let DataViews size columns naturally
				// against the container so the actions column never
				// overflows the right edge of the page.
				sessions: { width: 100, align: 'end' as const },
				sales:    { width: 110, align: 'end' as const },
				roas:     { width: 90, align: 'end' as const },
			},
		},
	},
	grid: { layout: { primaryField: 'name' } },
	list: { layout: { primaryField: 'name' } },
};

type Props = {
	onCreate: () => void;
	onOpen: ( id: number ) => void;
};

export const CampaignsList = ( { onCreate, onOpen }: Props ): JSX.Element => {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		search: '',
		fields: [ 'status', 'channels', 'dates', 'sessions', 'sales', 'roas' ],
		filters: [
			{ field: 'status', operator: 'isAny', value: [ 'active', 'scheduled' ] },
		],
		layout: defaultLayouts.table.layout,
		perPage: 25,
		page: 1,
		sort: { field: 'name', direction: 'asc' },
		titleField: 'name',
	} );

	const fields = useMemo( () => buildFields( onOpen ), [ onOpen ] );
	const data = window.MCC_BOOT.campaigns;

	const { data: shownData, paginationInfo } = useMemo(
		() => filterSortAndPaginate( data, view, fields ),
		[ data, view, fields ]
	);

	const actions = useMemo(
		() => [
			{
				id: 'open',
				label: __( 'View details', 'multichannel-campaigns' ),
				isPrimary: true,
				callback: ( items: Campaign[] ) => {
					if ( items[ 0 ] ) onOpen( items[ 0 ].id );
				},
			},
			{
				id: 'pause',
				label: __( 'Pause', 'multichannel-campaigns' ),
				supportsBulk: true,
				callback: () => {
					// Bulk pause is a no-op in the prototype.
				},
			},
			{
				id: 'duplicate',
				label: __( 'Duplicate', 'multichannel-campaigns' ),
				supportsBulk: true,
				callback: () => {},
			},
			{
				id: 'delete',
				label: __( 'Delete', 'multichannel-campaigns' ),
				isDestructive: true,
				supportsBulk: true,
				callback: () => {},
			},
		],
		[ onOpen ]
	);

	return (
		<div className="mcc-page mcc-page--list">
			<PageHeader
				title={ __( 'Campaigns', 'multichannel-campaigns' ) }
				actions={
					<Button variant="primary" icon={ plus } onClick={ onCreate }>
						{ __( 'Create campaign', 'multichannel-campaigns' ) }
					</Button>
				}
			/>

			<div className="mcc-content-gutter">
				<RollupTiles />

			<DataViews
				data={ shownData }
				view={ view }
				onChangeView={ setView }
				fields={ fields }
				paginationInfo={ paginationInfo }
				actions={ actions }
				defaultLayouts={ defaultLayouts }
				getItemId={ ( item: Campaign ) => String( item.id ) }
				empty={
					<div className="mcc-empty-state">
						<div className="mcc-empty-icon">
							{ /* megaphone — same icon WC uses on empty Campaigns card */ }
							<svg width={ 32 } height={ 32 } viewBox="0 0 24 24" fill="currentColor">
								<path d={ megaphone.props.d ?? '' } />
							</svg>
						</div>
						<h2>{ __( 'No campaigns match your filters', 'multichannel-campaigns' ) }</h2>
						<p>{ __( 'Try clearing filters or start a new campaign.', 'multichannel-campaigns' ) }</p>
						<Button variant="primary" onClick={ onCreate }>
							{ __( 'Create campaign', 'multichannel-campaigns' ) }
						</Button>
					</div>
				}
			/>
			</div>
		</div>
	);
};

const RollupTiles = (): JSX.Element => {
	const r = window.MCC_BOOT.rollup;
	const tiles = [
		{ label: __( 'Active campaigns', 'multichannel-campaigns' ),         value: String( r.active_count ),       delta: '+1 vs last month',     tone: 'up'   as const },
		{ label: __( 'Attributed sales', 'multichannel-campaigns' ),         value: fmtMoney( r.attributed_sales ), delta: '+22% vs last 30 days', tone: 'up'   as const },
		{ label: __( 'Avg ROAS', 'multichannel-campaigns' ),                 value: r.avg_roas + '×',               delta: '−0.3 vs last 30 days', tone: 'down' as const },
		{ label: __( 'Sessions from campaigns', 'multichannel-campaigns' ),  value: fmtNum( r.sessions ),           delta: '+18%',                 tone: 'up'   as const },
	];

	return (
		<div className="mcc-stat-grid">
			{ tiles.map( ( t ) => (
				<StatCard
					key={ String( t.label ) }
					label={ t.label }
					value={ t.value }
					delta={ t.delta }
					deltaTone={ t.tone }
				/>
			) ) }
		</div>
	);
};
