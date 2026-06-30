/**
 * Create-campaign flow using real @wordpress/dataviews DataForm.
 *
 * The form is split into three panels following WC's MarketingOverviewMultichannel
 * pattern — sections sit inside Cards, label-on-side, sentence case.
 */
import { useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Button, Notice, ToggleControl } from '@wordpress/components';
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

type Draft = {
	name: string;
	start_date: string;
	end_date: string;
	tag: string;
	goal_type: 'revenue' | 'acquisition' | 'retention' | 'awareness';
	target: string;
	channel_mode: 'woo_ads' | 'manual';
	channels: Record< string, boolean >;
};

const initialDraft = (): Draft => ( {
	name: 'Black Friday — Weekend Door Buster',
	start_date: '2026-11-28',
	end_date: '2026-12-01',
	tag: 'BFCM',
	goal_type: 'revenue',
	target: '50000',
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

type Props = {
	onCancel: () => void;
	onLaunched: () => void;
};

export const CampaignCreate = ( { onCancel, onLaunched }: Props ): JSX.Element => {
	const [ draft, setDraft ] = useState< Draft >( initialDraft );
	const [ saving, setSaving ] = useState( false );
	const [ showWooAdsPreview, setShowWooAdsPreview ] = useState( false );
	const manualChannels = window.MCC_BOOT.channels.filter(
		( channel ) => channel.id !== 'woo_ads'
	);
	const selectedManualChannelCount = manualChannels.filter(
		( channel ) => draft.channels[ channel.id ]
	).length;
	const campaignDays = getCampaignDays( draft.start_date, draft.end_date );
	const estimatedSpend = getRecommendedSpend( draft );
	const estimatedDailySpend = Math.round( estimatedSpend / campaignDays );
	const goalImpactLabel = getGoalImpactLabel( draft );
	const recommendationPreviewId = 'mcc-woo-ads-preview';

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
										<Text variant="body" className="mcc-woo-ads-optimization__title">
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
												<Text variant="body" className="mcc-recommendation-preview__value">
													{ draft.name }
												</Text>
											</div>
											<div>
												<Text variant="body-sm" className="mcc-recommendation-preview__eyebrow">
													{ __( 'Duration', 'multichannel-campaigns' ) }
												</Text>
												<Text variant="body" className="mcc-recommendation-preview__value">
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
													{ __( 'Estimated spend', 'multichannel-campaigns' ) }
												</Text>
												<Text variant="body" className="mcc-recommendation-preview__value">
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
										<div className="mcc-recommendation-preview__grid">
											<div className="mcc-recommendation-preview__section">
												<Text variant="body" className="mcc-recommendation-preview__heading">
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
												<Text variant="body" className="mcc-recommendation-preview__heading">
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
		</div>
	);
};
