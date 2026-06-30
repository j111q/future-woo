/**
 * Create-campaign flow using real @wordpress/dataviews DataForm.
 *
 * The form is split into three panels following WC's MarketingOverviewMultichannel
 * pattern — sections sit inside Cards, label-on-side, sentence case.
 */
import { useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Button, Modal, Notice, ToggleControl } from '@wordpress/components';
import { Card, CollapsibleCard, Stack, Text } from '@wordpress/ui';
import { DataForm } from '@wordpress/dataviews';
import type { Field, Form, DataFormControlProps } from '@wordpress/dataviews';
import { fmtMoney, fmtNum } from './helpers';
import { ChannelProviderLogo } from './ChannelProviderLogo';
import { PageHeader } from './PageHeader';

/**
 * Custom Edit component for ISO date fields. DataViews ships a datetime
 * field (year/month/day/hour/minute) but no plain date — campaign windows
 * only care about days.
 */
const DateEdit = < Item extends Record< string, unknown > >( {
	data,
	field,
	onChange,
}: DataFormControlProps< Item > ): JSX.Element => {
	const id = String( field.id );
	const value = ( data[ id ] as string | undefined ) ?? '';
	const inputId = `mcc-date-${ id }`;
	return (
		<div className="components-base-control">
			<div className="components-base-control__field">
				<label
					htmlFor={ inputId }
					className="components-base-control__label"
				>
					{ field.label ?? id }
				</label>
				<input
					id={ inputId }
					type="date"
					value={ value }
					className="mcc-date-input"
					onChange={ ( e ) =>
						onChange( { [ id ]: e.target.value } as unknown as Partial< Item > )
					}
				/>
			</div>
		</div>
	);
};

const BudgetEdit = < Item extends Record< string, unknown > >( {
	data,
	field,
	onChange,
}: DataFormControlProps< Item > ): JSX.Element => {
	const id = String( field.id );
	const value = ( data[ id ] as string | undefined ) ?? '';
	const inputId = `mcc-budget-${ id }`;

	return (
		<div className="components-base-control">
			<div className="components-base-control__field">
				<label
					htmlFor={ inputId }
					className="components-base-control__label"
				>
					{ field.label ?? id }
				</label>
				<input
					id={ inputId }
					type="number"
					inputMode="numeric"
					min="0"
					step="100"
					value={ value }
					className="mcc-date-input mcc-budget-input"
					onChange={ ( e ) =>
						onChange( {
							[ id ]: e.target.value,
						} as unknown as Partial< Item > )
					}
				/>
			</div>
			{ field.description ? (
				<p className="components-base-control__help">
					{ field.description }
				</p>
			) : null }
		</div>
	);
};

type Draft = {
	name: string;
	start_date: string;
	end_date: string;
	tag: string;
	goal_type: 'revenue' | 'acquisition' | 'retention' | 'awareness';
	target: string;
	budget: string;
	product_scope: 'catalog' | 'selected';
	product_targets: string[];
	channel_mode: 'woo_ads' | 'manual';
	channels: Record< string, boolean >;
};

type ProductTarget = {
	id: string;
	label: string;
	kind: 'category' | 'product';
	meta: string;
};

type ProductTargetGroup = {
	id: string;
	label: string;
	description: string;
	targets: ProductTarget[];
};

type PublicAdPreview = {
	id: string;
	platform: string;
	placement: string;
	headline: string;
	body: string;
	cta: string;
	frame: 'shopping' | 'feed' | 'story' | 'pin';
};

const initialDraft = (): Draft => ( {
	name: 'Black Friday — Weekend Door Buster',
	start_date: '2026-11-28',
	end_date: '2026-12-01',
	tag: 'BFCM',
	goal_type: 'revenue',
	target: '50000',
	budget: '2400',
	product_scope: 'catalog',
	product_targets: [],
	channel_mode: 'woo_ads',
	channels: {
		google: true,
		meta: true,
		pinterest: true,
		tiktok: false,
		amazon: false,
		ebay: false,
	},
} );

const productTargetGroups: ProductTargetGroup[] = [
	{
		id: 'categories',
		label: __( 'Categories', 'multichannel-campaigns' ),
		description: __( 'Use when the campaign should cover a collection or product line.', 'multichannel-campaigns' ),
		targets: [
			{
				id: 'category-bfcm',
				label: __( 'Black Friday picks', 'multichannel-campaigns' ),
				kind: 'category',
				meta: __( '18 products', 'multichannel-campaigns' ),
			},
			{
				id: 'category-gifts',
				label: __( 'Holiday gifts', 'multichannel-campaigns' ),
				kind: 'category',
				meta: __( '24 products', 'multichannel-campaigns' ),
			},
			{
				id: 'category-bestsellers',
				label: __( 'Best sellers', 'multichannel-campaigns' ),
				kind: 'category',
				meta: __( '12 products', 'multichannel-campaigns' ),
			},
		],
	},
	{
		id: 'products',
		label: __( 'Products', 'multichannel-campaigns' ),
		description: __( 'Use when the campaign should push one hero item or a short product list.', 'multichannel-campaigns' ),
		targets: [
			{
				id: 'product-weekend-hoodie',
				label: __( 'Weekend hoodie', 'multichannel-campaigns' ),
				kind: 'product',
				meta: __( '$64 · 38 in stock', 'multichannel-campaigns' ),
			},
			{
				id: 'product-doorbuster-bundle',
				label: __( 'Doorbuster gift bundle', 'multichannel-campaigns' ),
				kind: 'product',
				meta: __( '$88 · bundle', 'multichannel-campaigns' ),
			},
			{
				id: 'product-everyday-tote',
				label: __( 'Everyday canvas tote', 'multichannel-campaigns' ),
				kind: 'product',
				meta: __( '$32 · 112 in stock', 'multichannel-campaigns' ),
			},
			{
				id: 'product-travel-mug',
				label: __( 'Insulated travel mug', 'multichannel-campaigns' ),
				kind: 'product',
				meta: __( '$28 · 74 in stock', 'multichannel-campaigns' ),
			},
		],
	},
];

const productTargets = productTargetGroups.flatMap( ( group ) => group.targets );

const publicAdPreviews: PublicAdPreview[] = [
	{
		id: 'google-shopping',
		platform: __( 'Google Shopping', 'multichannel-campaigns' ),
		placement: __( 'Sponsored shopping result', 'multichannel-campaigns' ),
		headline: __( 'Weekend-ready picks from your store', 'multichannel-campaigns' ),
		body: __( 'Product image, price, promo copy, and store name appear together in shopping results.', 'multichannel-campaigns' ),
		cta: __( 'Shop now', 'multichannel-campaigns' ),
		frame: 'shopping',
	},
	{
		id: 'facebook-feed',
		platform: __( 'Facebook feed', 'multichannel-campaigns' ),
		placement: __( 'Catalog carousel ad', 'multichannel-campaigns' ),
		headline: __( 'Limited-time BFCM offer', 'multichannel-campaigns' ),
		body: __( 'Woo Ads can pair product photography with short catalog copy and a product detail link.', 'multichannel-campaigns' ),
		cta: __( 'View product', 'multichannel-campaigns' ),
		frame: 'feed',
	},
	{
		id: 'instagram-story',
		platform: __( 'Instagram story', 'multichannel-campaigns' ),
		placement: __( 'Vertical story placement', 'multichannel-campaigns' ),
		headline: __( 'Giftable, shoppable, ready now', 'multichannel-campaigns' ),
		body: __( 'A vertical crop can reuse the same product asset with a stronger seasonal overlay.', 'multichannel-campaigns' ),
		cta: __( 'Swipe up', 'multichannel-campaigns' ),
		frame: 'story',
	},
	{
		id: 'pinterest-pin',
		platform: __( 'Pinterest pin', 'multichannel-campaigns' ),
		placement: __( 'Promoted product pin', 'multichannel-campaigns' ),
		headline: __( 'Build a holiday gift board', 'multichannel-campaigns' ),
		body: __( 'Pinterest-style creative can lean on product imagery, price, and collection context.', 'multichannel-campaigns' ),
		cta: __( 'Save idea', 'multichannel-campaigns' ),
		frame: 'pin',
	},
];

const getProductTarget = ( targetId: string ): ProductTarget | undefined =>
	productTargets.find( ( target ) => target.id === targetId );

const getPrimaryProductForPreview = ( draft: Draft ): ProductTarget =>
	draft.product_targets
		.map( getProductTarget )
		.find( ( target ): target is ProductTarget => Boolean( target ) ) ??
	getProductTarget( 'product-weekend-hoodie' ) ??
	productTargets[ 0 ];

const getProductScopeSummary = ( draft: Draft ): string => {
	if ( draft.product_scope === 'catalog' ) {
		return __( 'Whole catalog', 'multichannel-campaigns' );
	}

	const selectedTargets = draft.product_targets
		.map( getProductTarget )
		.filter( ( target ): target is ProductTarget => Boolean( target ) );

	if ( selectedTargets.length === 0 ) {
		return __( 'No products selected yet', 'multichannel-campaigns' );
	}

	if ( selectedTargets.length === 1 ) {
		return selectedTargets[ 0 ].label;
	}

	return sprintf(
		_n(
			'%d product or category selected',
			'%d products or categories selected',
			selectedTargets.length,
			'multichannel-campaigns'
		),
		selectedTargets.length
	);
};

const basicsFields: Field< Draft >[] = [
	{
		id: 'name',
		label: __( 'Name', 'multichannel-campaigns' ),
		type: 'text',
		Edit: 'text',
		description: __( "Customers won't see this — it's just for you.", 'multichannel-campaigns' ),
	},
	{
		id: 'start_date',
		label: __( 'Starts', 'multichannel-campaigns' ),
		Edit: DateEdit,
	},
	{
		id: 'end_date',
		label: __( 'Ends', 'multichannel-campaigns' ),
		Edit: DateEdit,
	},
	{
		id: 'tag',
		label: __( 'Tag', 'multichannel-campaigns' ),
		type: 'text',
		Edit: 'text',
		description: __( 'Used to group related campaigns in reports.', 'multichannel-campaigns' ),
	},
];

const goalFields: Field< Draft >[] = [
	{
		id: 'goal_type',
		label: __( 'Type', 'multichannel-campaigns' ),
		Edit: 'radio',
		elements: [
			{ value: 'revenue',     label: __( 'Revenue — hit a sales target during the window', 'multichannel-campaigns' ) },
			{ value: 'acquisition', label: __( 'Acquisition — bring in new customers', 'multichannel-campaigns' ) },
			{ value: 'retention',   label: __( 'Retention — re-engage existing customers', 'multichannel-campaigns' ) },
			{ value: 'awareness',   label: __( 'Awareness — sessions and reach', 'multichannel-campaigns' ) },
		],
	},
	{
		id: 'target',
		label: __( 'Target', 'multichannel-campaigns' ),
		type: 'text',
		Edit: 'text',
		description: __( 'Numeric target. Units depend on goal type.', 'multichannel-campaigns' ),
	},
];

const budgetFields: Field< Draft >[] = [
	{
		id: 'budget',
		label: __( 'Total budget', 'multichannel-campaigns' ),
		Edit: BudgetEdit,
		description: __(
			'Maximum spend across Woo Ads and selected manual channels.',
			'multichannel-campaigns'
		),
	},
];

const basicsForm: Form = {
	type: 'regular',
	labelPosition: 'top',
	fields: [ 'name', 'start_date', 'end_date', 'tag' ],
};

const goalForm: Form = {
	type: 'regular',
	labelPosition: 'top',
	fields: [ 'goal_type', 'target' ],
};

const budgetForm: Form = {
	type: 'regular',
	labelPosition: 'top',
	fields: [ 'budget' ],
};

const dayInMs = 24 * 60 * 60 * 1000;

const getCampaignDays = ( startDate: string, endDate: string ): number => {
	const start = new Date( `${ startDate }T00:00:00` );
	const end = new Date( `${ endDate }T00:00:00` );

	if ( Number.isNaN( start.getTime() ) || Number.isNaN( end.getTime() ) ) {
		return 1;
	}

	return Math.max( 1, Math.round( ( end.getTime() - start.getTime() ) / dayInMs ) + 1 );
};

const formatDateRange = ( startDate: string, endDate: string ): string => {
	const start = new Date( `${ startDate }T00:00:00` );
	const end = new Date( `${ endDate }T00:00:00` );

	if ( Number.isNaN( start.getTime() ) || Number.isNaN( end.getTime() ) ) {
		return __( 'Campaign dates', 'multichannel-campaigns' );
	}

	const monthDay = new Intl.DateTimeFormat( 'en-US', {
		month: 'short',
		day: 'numeric',
	} );
	const monthDayYear = new Intl.DateTimeFormat( 'en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	} );

	return `${ monthDay.format( start ) }–${ monthDayYear.format( end ) }`;
};

const getRecommendedSpend = ( draft: Draft ): number => {
	const target = Number( draft.target );

	if ( ! Number.isFinite( target ) || target <= 0 ) {
		return 1500;
	}

	return Math.max( 500, Math.round( ( target * 0.08 ) / 100 ) * 100 );
};

const getBudgetAmount = ( draft: Draft ): number => {
	const budget = Number( draft.budget );

	if ( ! Number.isFinite( budget ) || budget <= 0 ) {
		return getRecommendedSpend( draft );
	}

	return budget;
};

const getGoalImpactLabel = ( draft: Draft ): string => {
	const target = Number( draft.target );

	if ( ! Number.isFinite( target ) || target <= 0 ) {
		return __( 'Based on the campaign goal and store signals.', 'multichannel-campaigns' );
	}

	if ( draft.goal_type === 'revenue' ) {
		return sprintf(
			__( 'Based on estimated revenue impact of %s.', 'multichannel-campaigns' ),
			fmtMoney( Number( draft.target ) )
		);
	}

	if ( draft.goal_type === 'acquisition' ) {
		return sprintf(
			__( 'Based on an acquisition target of %s new customers.', 'multichannel-campaigns' ),
			fmtNum( target )
		);
	}

	if ( draft.goal_type === 'retention' ) {
		return sprintf(
			__( 'Based on a re-engagement target of %s customers.', 'multichannel-campaigns' ),
			fmtNum( target )
		);
	}

	return sprintf(
		__( 'Based on an awareness target of %s sessions.', 'multichannel-campaigns' ),
		fmtNum( target )
	);
};

type ProductTargetPickerProps = {
	selectedTargetIds: string[];
	onChange: ( targetIds: string[] ) => void;
};

const ProductTargetPicker = ( {
	selectedTargetIds,
	onChange,
}: ProductTargetPickerProps ): JSX.Element => {
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const selectedTargets = selectedTargetIds
		.map( getProductTarget )
		.filter( ( target ): target is ProductTarget => Boolean( target ) );
	const normalizedSearch = searchQuery.trim().toLowerCase();
	const visibleGroups = productTargetGroups
		.map( ( group ) => ( {
			...group,
			targets: group.targets.filter( ( target ) => {
				if ( ! normalizedSearch ) {
					return true;
				}

				return `${ target.label } ${ target.meta } ${ target.kind }`
					.toLowerCase()
					.includes( normalizedSearch );
			} ),
		} ) )
		.filter( ( group ) => group.targets.length > 0 );

	const toggleTarget = ( targetId: string ) => {
		if ( selectedTargetIds.includes( targetId ) ) {
			onChange( selectedTargetIds.filter( ( id ) => id !== targetId ) );
			return;
		}

		onChange( [ ...selectedTargetIds, targetId ] );
	};

	return (
		<div className="mcc-product-target-picker">
			<label
				className="mcc-product-target-picker__label"
				htmlFor="mcc-product-target-search"
			>
				{ __( 'Selected products and categories', 'multichannel-campaigns' ) }
			</label>
			<input
				id="mcc-product-target-search"
				type="search"
				className="mcc-product-target-picker__search"
				placeholder={ __( 'Search products or categories', 'multichannel-campaigns' ) }
				value={ searchQuery }
				onChange={ ( event ) => setSearchQuery( event.target.value ) }
			/>

			{ selectedTargets.length > 0 && (
				<div
					className="mcc-product-target-picker__tags"
					aria-label={ __( 'Selected product targets', 'multichannel-campaigns' ) }
				>
					{ selectedTargets.map( ( target ) => (
						<button
							key={ target.id }
							type="button"
							className="mcc-product-target-picker__tag"
							onClick={ () => toggleTarget( target.id ) }
						>
							{ target.label }
							<span aria-hidden="true">×</span>
						</button>
					) ) }
				</div>
			) }

			<div
				className="mcc-product-target-picker__tree"
				role="group"
				aria-label={ __( 'Products to advertise', 'multichannel-campaigns' ) }
			>
				{ visibleGroups.length === 0 ? (
					<Text variant="body-sm" className="mcc-product-target-picker__empty">
						{ __( 'No matching products or categories.', 'multichannel-campaigns' ) }
					</Text>
				) : (
					visibleGroups.map( ( group ) => (
						<div
							key={ group.id }
							className="mcc-product-target-picker__group"
						>
							<div className="mcc-product-target-picker__group-header">
								<Text variant="body-md" className="mcc-product-target-picker__group-title">
									{ group.label }
								</Text>
								<Text variant="body-sm" className="mcc-product-target-picker__group-description">
									{ group.description }
								</Text>
							</div>
							<div className="mcc-product-target-picker__options">
								{ group.targets.map( ( target ) => {
									const inputId = `mcc-product-target-${ target.id }`;

									return (
										<label
											key={ target.id }
											className="mcc-product-target-option"
											htmlFor={ inputId }
										>
											<input
												id={ inputId }
												type="checkbox"
												checked={ selectedTargetIds.includes( target.id ) }
												onChange={ () => toggleTarget( target.id ) }
											/>
											<span className="mcc-product-target-option__body">
												<span className="mcc-product-target-option__title">
													{ target.label }
												</span>
												<span className="mcc-product-target-option__meta">
													{ target.kind === 'category'
														? __( 'Category', 'multichannel-campaigns' )
														: __( 'Product', 'multichannel-campaigns' ) }
													{ ' · ' }
													{ target.meta }
												</span>
											</span>
										</label>
									);
								} ) }
							</div>
						</div>
					) )
				) }
			</div>
		</div>
	);
};

type Props = {
	onCancel: () => void;
	onLaunched: () => void;
};

export const CampaignCreate = ( { onCancel, onLaunched }: Props ): JSX.Element => {
	const [ draft, setDraft ] = useState< Draft >( initialDraft );
	const [ saving, setSaving ] = useState( false );
	const [ showWooAdsPreview, setShowWooAdsPreview ] = useState( false );
	const [ showPublicPreviewModal, setShowPublicPreviewModal ] = useState( false );
	const [ activePublicPreviewIndex, setActivePublicPreviewIndex ] = useState( 0 );
	const manualChannels = window.MCC_BOOT.channels.filter(
		( channel ) => channel.id !== 'woo_ads'
	);
	const selectedManualChannelCount = manualChannels.filter(
		( channel ) => draft.channels[ channel.id ]
	).length;
	const campaignDays = getCampaignDays( draft.start_date, draft.end_date );
	const recommendedSpend = getRecommendedSpend( draft );
	const estimatedSpend = getBudgetAmount( draft );
	const estimatedDailySpend = Math.round( estimatedSpend / campaignDays );
	const goalImpactLabel = getGoalImpactLabel( draft );
	const recommendationPreviewId = 'mcc-woo-ads-preview';
	const primaryPreviewProduct = getPrimaryProductForPreview( draft );
	const activePublicPreview = publicAdPreviews[ activePublicPreviewIndex ];

	const setField =
		< K extends keyof Draft >( key: K ) =>
		( value: Draft[ K ] ) =>
			setDraft( ( d ) => ( { ...d, [ key ]: value } ) );

	const launch = () => {
		setSaving( true );
		setTimeout( () => {
			setSaving( false );
			onLaunched();
		}, 600 );
	};

	const toggleChannel = ( id: string ) =>
		setDraft( ( d ) => ( {
			...d,
			channels: { ...d.channels, [ id ]: ! d.channels[ id ] },
		} ) );

	const showPreviousPublicPreview = () =>
		setActivePublicPreviewIndex( ( index ) =>
			index === 0 ? publicAdPreviews.length - 1 : index - 1
		);

	const showNextPublicPreview = () =>
		setActivePublicPreviewIndex( ( index ) =>
			index === publicAdPreviews.length - 1 ? 0 : index + 1
		);

	return (
		<div className="mcc-page mcc-page--create">
			<PageHeader
				parent={ { label: __( 'Campaigns', 'multichannel-campaigns' ), onClick: onCancel } }
				title={ __( 'New campaign', 'multichannel-campaigns' ) }
				actions={
					<>
						<Button variant="tertiary" onClick={ onCancel }>
							{ __( 'Cancel', 'multichannel-campaigns' ) }
						</Button>
						<Button variant="secondary">
							{ __( 'Save as draft', 'multichannel-campaigns' ) }
						</Button>
						<Button variant="primary" isBusy={ saving } onClick={ launch }>
							{ saving
								? __( 'Launching…', 'multichannel-campaigns' )
								: __( 'Launch campaign', 'multichannel-campaigns' ) }
						</Button>
					</>
				}
				/>

				<div className="mcc-content-gutter">
					<div className="mcc-form">
						<CollapsibleCard.Root defaultOpen className="mcc-panel">
							<CollapsibleCard.Header>
								<Stack direction="column" gap="xs">
									<Card.Title>{ __( 'Basics', 'multichannel-campaigns' ) }</Card.Title>
									<Text variant="body-sm" className="mcc-card-description">
										{ __( 'Name, dates, and tag.', 'multichannel-campaigns' ) }
									</Text>
								</Stack>
							</CollapsibleCard.Header>
							<CollapsibleCard.Content>
								<DataForm< Draft >
									data={ draft }
									fields={ basicsFields }
									form={ basicsForm }
									onChange={ ( edits: Partial< Draft > ) =>
										setDraft( ( d ) => ( { ...d, ...edits } ) )
									}
								/>
							</CollapsibleCard.Content>
						</CollapsibleCard.Root>

						<CollapsibleCard.Root defaultOpen className="mcc-panel">
							<CollapsibleCard.Header>
								<Stack direction="column" gap="xs">
									<Card.Title>{ __( 'Goal', 'multichannel-campaigns' ) }</Card.Title>
									<Text variant="body-sm" className="mcc-card-description">
										{ __(
											'Drives channel recommendations and end-of-campaign scoring.',
											'multichannel-campaigns'
										) }
									</Text>
								</Stack>
							</CollapsibleCard.Header>
							<CollapsibleCard.Content>
								<DataForm< Draft >
									data={ draft }
									fields={ goalFields }
									form={ goalForm }
									onChange={ ( edits: Partial< Draft > ) =>
										setDraft( ( d ) => ( { ...d, ...edits } ) )
									}
								/>
							</CollapsibleCard.Content>
						</CollapsibleCard.Root>

					<CollapsibleCard.Root defaultOpen className="mcc-panel">
						<CollapsibleCard.Header>
							<Stack direction="column" gap="xs">
								<Card.Title>{ __( 'Budget', 'multichannel-campaigns' ) }</Card.Title>
								<Text variant="body-sm" className="mcc-card-description">
									{ __(
										'Set the spend limit Woo Ads can optimize across the campaign.',
										'multichannel-campaigns'
									) }
								</Text>
							</Stack>
						</CollapsibleCard.Header>
						<CollapsibleCard.Content>
							<DataForm< Draft >
								data={ draft }
								fields={ budgetFields }
								form={ budgetForm }
								onChange={ ( edits: Partial< Draft > ) =>
									setDraft( ( d ) => ( { ...d, ...edits } ) )
								}
							/>
							<div className="mcc-budget-guidance">
								<div className="mcc-budget-guidance__item">
									<Text variant="body-sm" className="mcc-budget-guidance__label">
										{ __( 'Recommended starting budget', 'multichannel-campaigns' ) }
									</Text>
									<Text variant="body-md" className="mcc-budget-guidance__value">
										{ fmtMoney( recommendedSpend ) }
									</Text>
								</div>
								<div className="mcc-budget-guidance__item">
									<Text variant="body-sm" className="mcc-budget-guidance__label">
										{ __( 'Daily average', 'multichannel-campaigns' ) }
									</Text>
									<Text variant="body-md" className="mcc-budget-guidance__value">
										{ fmtMoney( estimatedDailySpend ) }
									</Text>
								</div>
							</div>
						</CollapsibleCard.Content>
					</CollapsibleCard.Root>

						<CollapsibleCard.Root defaultOpen className="mcc-panel">
							<CollapsibleCard.Header>
								<Stack direction="column" gap="xs">
									<Card.Title>{ __( 'Products to advertise', 'multichannel-campaigns' ) }</Card.Title>
									<Text variant="body-sm" className="mcc-card-description">
										{ __(
											'Choose whether this campaign promotes the whole catalog or a focused set of products.',
											'multichannel-campaigns'
										) }
									</Text>
								</Stack>
							</CollapsibleCard.Header>
							<CollapsibleCard.Content>
								<div
									className="mcc-channel-paths mcc-product-scope-options"
									role="group"
									aria-label={ __( 'Products to advertise', 'multichannel-campaigns' ) }
								>
							<button
								type="button"
								className={ [
									'mcc-channel-path',
									draft.product_scope === 'catalog' ? 'is-selected' : '',
								]
									.filter( Boolean )
									.join( ' ' ) }
								aria-pressed={ draft.product_scope === 'catalog' }
								onClick={ () => setField( 'product_scope' )( 'catalog' ) }
							>
								<span className="mcc-channel-path__label">
									{ __( 'Default', 'multichannel-campaigns' ) }
								</span>
								<span className="mcc-channel-path__title">
									{ __( 'Advertise the whole catalog', 'multichannel-campaigns' ) }
								</span>
								<span className="mcc-channel-path__description">
									{ __(
										'Let Woo Ads and connected channels choose from every eligible product.',
										'multichannel-campaigns'
									) }
								</span>
							</button>
							<button
								type="button"
								className={ [
									'mcc-channel-path',
									draft.product_scope === 'selected' ? 'is-selected' : '',
								]
									.filter( Boolean )
									.join( ' ' ) }
								aria-pressed={ draft.product_scope === 'selected' }
								onClick={ () => setField( 'product_scope' )( 'selected' ) }
							>
								<span className="mcc-channel-path__label">
									{ __( 'Focused', 'multichannel-campaigns' ) }
								</span>
								<span className="mcc-channel-path__title">
									{ __( 'Choose products or categories', 'multichannel-campaigns' ) }
								</span>
								<span className="mcc-channel-path__description">
									{ __(
										'Promote one hero product, a short list, or a seasonal category.',
										'multichannel-campaigns'
									) }
								</span>
							</button>
						</div>

						{ draft.product_scope === 'selected' && (
							<ProductTargetPicker
								selectedTargetIds={ draft.product_targets }
								onChange={ setField( 'product_targets' ) }
							/>
						) }
					</CollapsibleCard.Content>
				</CollapsibleCard.Root>

				<CollapsibleCard.Root defaultOpen className="mcc-panel">
					<CollapsibleCard.Header>
						<Stack direction="column" gap="xs">
							<Card.Title>{ __( 'Channels & activities', 'multichannel-campaigns' ) }</Card.Title>
							<Text variant="body-sm" className="mcc-card-description">
								{ __(
									'Let Woo Ads optimize the campaign across channels or choose each channel and activity yourself.',
									'multichannel-campaigns'
								) }
							</Text>
						</Stack>
					</CollapsibleCard.Header>
					<CollapsibleCard.Content>
						<div
							className="mcc-channel-paths"
							role="group"
							aria-label={ __(
								'Channel and activity setup',
								'multichannel-campaigns'
							) }
						>
							<button
								type="button"
								className={ [
									'mcc-channel-path',
									draft.channel_mode === 'woo_ads' ? 'is-selected' : '',
								]
									.filter( Boolean )
									.join( ' ' ) }
								aria-pressed={ draft.channel_mode === 'woo_ads' }
								onClick={ () => setField( 'channel_mode' )( 'woo_ads' ) }
							>
								<span className="mcc-channel-path__label">
									{ __( 'Recommended', 'multichannel-campaigns' ) }
								</span>
								<span className="mcc-channel-path__title">
									{ __( 'Optimize campaign with Woo Ads', 'multichannel-campaigns' ) }
								</span>
								<span className="mcc-channel-path__description">
									{ __(
										'Woo Ads continuously optimizes channels and activities across Google, Meta, Reddit, TikTok, Pinterest, Snapchat, Tumblr, WordPress Blaze, and Pocket Casts.',
										'multichannel-campaigns'
									) }
								</span>
							</button>
							<button
								type="button"
								className={ [
									'mcc-channel-path',
									draft.channel_mode === 'manual' ? 'is-selected' : '',
								]
									.filter( Boolean )
									.join( ' ' ) }
								aria-pressed={ draft.channel_mode === 'manual' }
								onClick={ () => setField( 'channel_mode' )( 'manual' ) }
							>
								<span className="mcc-channel-path__label">
									{ __( 'Manual', 'multichannel-campaigns' ) }
								</span>
								<span className="mcc-channel-path__title">
									{ __( 'Manage channels and activities manually', 'multichannel-campaigns' ) }
								</span>
								<span className="mcc-channel-path__description">
									{ __(
										'Choose connected sales and marketing channels one by one, then tune activities for each channel.',
										'multichannel-campaigns'
									) }
								</span>
							</button>
						</div>

						{ draft.channel_mode === 'woo_ads' ? (
							<div className="mcc-woo-ads-optimization">
								<div className="mcc-woo-ads-optimization__header">
									<div className="mcc-woo-ads-optimization__intro">
										<Text variant="body-md" className="mcc-woo-ads-optimization__title">
											{ __( 'Woo Ads optimization path', 'multichannel-campaigns' ) }
										</Text>
										<Text variant="body-sm" className="mcc-woo-ads-optimization__description">
											{ __(
												'Use the campaign goal, dates, and store signals to create an initial plan, then keep reallocating budget and activities while the campaign runs.',
												'multichannel-campaigns'
											) }
										</Text>
										<Button
											variant="secondary"
											aria-expanded={ showWooAdsPreview }
											aria-controls={ recommendationPreviewId }
											onClick={ () => setShowWooAdsPreview( ( value ) => ! value ) }
										>
											{ __( 'Preview initial recommendation', 'multichannel-campaigns' ) }
										</Button>
									</div>
								</div>
								{ showWooAdsPreview && (
									<div
										id={ recommendationPreviewId }
										className="mcc-recommendation-preview"
									>
										<div className="mcc-recommendation-preview__summary">
											<div>
												<Text variant="body-sm" className="mcc-recommendation-preview__eyebrow">
													{ __( 'Campaign', 'multichannel-campaigns' ) }
												</Text>
												<Text variant="body-md" className="mcc-recommendation-preview__value">
													{ draft.name }
												</Text>
											</div>
											<div>
												<Text variant="body-sm" className="mcc-recommendation-preview__eyebrow">
													{ __( 'Duration', 'multichannel-campaigns' ) }
												</Text>
												<Text variant="body-md" className="mcc-recommendation-preview__value">
													{ formatDateRange( draft.start_date, draft.end_date ) } ·{ ' ' }
													{ sprintf(
														_n(
															'%d day',
															'%d days',
															campaignDays,
															'multichannel-campaigns'
														),
														campaignDays
													) }
												</Text>
											</div>
											<div>
												<Text variant="body-sm" className="mcc-recommendation-preview__eyebrow">
													{ __( 'Products', 'multichannel-campaigns' ) }
												</Text>
												<Text variant="body-md" className="mcc-recommendation-preview__value">
													{ getProductScopeSummary( draft ) }
												</Text>
											</div>
											<div>
												<Text variant="body-sm" className="mcc-recommendation-preview__eyebrow">
													{ __( 'Estimated spend', 'multichannel-campaigns' ) }
												</Text>
												<Text variant="body-md" className="mcc-recommendation-preview__value">
													{ fmtMoney( estimatedSpend ) }{ ' ' }
													<span className="mcc-dim">
														{ sprintf(
															__( '(%s/day)', 'multichannel-campaigns' ),
															fmtMoney( estimatedDailySpend )
														) }
													</span>
												</Text>
											</div>
										</div>
										<Text variant="body-sm" className="mcc-recommendation-preview__impact">
											{ goalImpactLabel }
										</Text>
										<div className="mcc-recommendation-preview__actions">
											<Button
												variant="secondary"
												onClick={ () => setShowPublicPreviewModal( true ) }
											>
												{ __( 'Preview what the public will see', 'multichannel-campaigns' ) }
											</Button>
										</div>
										<div className="mcc-recommendation-preview__grid">
											<div className="mcc-recommendation-preview__section">
												<Text variant="body-md" className="mcc-recommendation-preview__heading">
													{ __( 'Recommended channels', 'multichannel-campaigns' ) }
												</Text>
												<ul className="mcc-recommendation-preview__list">
													<li>{ __( 'Google Performance Max for shopping intent', 'multichannel-campaigns' ) }</li>
													<li>{ __( 'Meta Advantage+ catalog retargeting', 'multichannel-campaigns' ) }</li>
													<li>{ __( 'TikTok and Pinterest creative tests', 'multichannel-campaigns' ) }</li>
													<li>{ __( 'Tumblr, WordPress Blaze, and Pocket Casts discovery placements', 'multichannel-campaigns' ) }</li>
												</ul>
											</div>
											<div className="mcc-recommendation-preview__section">
												<Text variant="body-md" className="mcc-recommendation-preview__heading">
													{ __( 'Activities Woo Ads will manage', 'multichannel-campaigns' ) }
												</Text>
												<ul className="mcc-recommendation-preview__list">
													<li>{ __( 'Create product audiences from store behavior and catalog data', 'multichannel-campaigns' ) }</li>
													<li>{ __( 'Shift budget toward channels with stronger return during the campaign', 'multichannel-campaigns' ) }</li>
													<li>{ __( 'Pause underperforming activities and suggest new tests', 'multichannel-campaigns' ) }</li>
												</ul>
											</div>
										</div>
									</div>
								) }
							</div>
						) : (
							<>
								<Text variant="body-sm" className="mcc-manual-channel-summary">
									{ sprintf(
										_n(
											'%d manual channel selected.',
											'%d manual channels selected.',
											selectedManualChannelCount,
											'multichannel-campaigns'
										),
										selectedManualChannelCount
									) }
								</Text>
								<div className="mcc-manual-channel-list">
									{ manualChannels.map( ( ch ) => (
										<div
											key={ ch.id }
											className="mcc-manual-channel-row"
										>
											<div className="mcc-manual-channel-row__toggle">
												<ToggleControl
													__nextHasNoMarginBottom
													aria-label={ sprintf(
														__( 'Include %s', 'multichannel-campaigns' ),
														ch.label
													) }
													checked={ !! draft.channels[ ch.id ] }
													className="mcc-manual-channel-toggle"
													label=""
													onChange={ () => toggleChannel( ch.id ) }
												/>
											</div>
											<div className="mcc-manual-channel-row__main">
												<div
													className="mcc-manual-channel-row__logo"
													style={
														{
															'--mcc-channel-color': ch.color,
														} as React.CSSProperties
													}
												>
													<ChannelProviderLogo
														channelId={ ch.id }
														fallback={ ch.short }
													/>
												</div>
												<span className="mcc-manual-channel-row__title">
													{ ch.label }
												</span>
											</div>
											{ draft.channels[ ch.id ] && (
												<div className="mcc-manual-channel-row__actions">
													<Button variant="secondary">
														{ __( 'Manage activity', 'multichannel-campaigns' ) }
													</Button>
												</div>
											) }
										</div>
									) ) }
								</div>
							</>
						) }
					</CollapsibleCard.Content>
				</CollapsibleCard.Root>

				<Notice status="info" isDismissible={ false }>
					<strong>{ __( 'Heads up:', 'multichannel-campaigns' ) }</strong>{ ' ' }
					{ __(
						"Meta needs ~24 hours to review ads. Channels that aren't ready on launch day will auto-pause and surface in the campaign feed.",
						'multichannel-campaigns'
					) }
				</Notice>
			</div>
			</div>
			{ showPublicPreviewModal && (
				<Modal
					className="mcc-public-preview-modal"
					title={ __( 'Preview what the public will see', 'multichannel-campaigns' ) }
					onRequestClose={ () => setShowPublicPreviewModal( false ) }
				>
					<div className="mcc-public-preview-carousel">
						<div className="mcc-public-preview-carousel__header">
							<div>
								<Text variant="body-sm" className="mcc-recommendation-preview__eyebrow">
									{ activePublicPreview.placement }
								</Text>
								<Text variant="body-md" className="mcc-public-preview-carousel__title">
									{ activePublicPreview.platform }
								</Text>
							</div>
							<Text variant="body-sm" className="mcc-public-preview-carousel__counter">
								{ sprintf(
									__( '%1$d of %2$d', 'multichannel-campaigns' ),
									activePublicPreviewIndex + 1,
									publicAdPreviews.length
								) }
							</Text>
						</div>

						<div
							className={ [
								'mcc-public-preview-frame',
								`mcc-public-preview-frame--${ activePublicPreview.frame }`,
							].join( ' ' ) }
						>
							<div className="mcc-public-preview-frame__chrome">
								<span>{ activePublicPreview.platform }</span>
								<span>{ __( 'Sponsored', 'multichannel-campaigns' ) }</span>
							</div>
							<div className="mcc-public-preview-frame__body">
								<div className="mcc-public-preview-asset">
									<div className="mcc-public-preview-asset__image">
										<span>{ primaryPreviewProduct.label }</span>
									</div>
									<div className="mcc-public-preview-asset__meta">
										<span>{ primaryPreviewProduct.label }</span>
										<span>{ primaryPreviewProduct.meta }</span>
									</div>
								</div>
								<div className="mcc-public-preview-copy">
									<Text variant="body-md" className="mcc-public-preview-copy__headline">
										{ activePublicPreview.headline }
									</Text>
									<Text variant="body-sm" className="mcc-public-preview-copy__body">
										{ activePublicPreview.body }
									</Text>
									<span className="mcc-public-preview-copy__cta">
										{ activePublicPreview.cta }
									</span>
								</div>
							</div>
						</div>

						<div className="mcc-public-preview-carousel__controls">
							<Button variant="secondary" onClick={ showPreviousPublicPreview }>
								{ __( 'Previous', 'multichannel-campaigns' ) }
							</Button>
							<div className="mcc-public-preview-carousel__dots">
								{ publicAdPreviews.map( ( preview, index ) => (
									<button
										key={ preview.id }
										type="button"
										className={ [
											'mcc-public-preview-carousel__dot',
											index === activePublicPreviewIndex ? 'is-active' : '',
										]
											.filter( Boolean )
											.join( ' ' ) }
										aria-label={ sprintf(
											__( 'Show %s preview', 'multichannel-campaigns' ),
											preview.platform
										) }
										aria-current={ index === activePublicPreviewIndex ? 'true' : undefined }
										onClick={ () => setActivePublicPreviewIndex( index ) }
									/>
								) ) }
							</div>
							<Button variant="primary" onClick={ showNextPublicPreview }>
								{ __( 'Next', 'multichannel-campaigns' ) }
							</Button>
						</div>
					</div>
				</Modal>
			) }
		</div>
	);
};
