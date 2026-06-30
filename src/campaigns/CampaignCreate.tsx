/**
 * Create-campaign flow using real @wordpress/dataviews DataForm.
 *
 * The form is split into three panels following WC's MarketingOverviewMultichannel
 * pattern — sections sit inside Cards, label-on-side, sentence case.
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Notice } from '@wordpress/components';
import { Card, CollapsibleCard, Stack, Text } from '@wordpress/ui';
import { DataForm } from '@wordpress/dataviews';
import type { Field, Form, DataFormControlProps } from '@wordpress/dataviews';
import { ChannelProviderRow } from './ChannelProviderRow';
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
	channels: Record< string, boolean >;
};

const initialDraft = (): Draft => ( {
	name: 'Black Friday — Weekend Door Buster',
	start_date: '2026-11-28',
	end_date: '2026-12-01',
	tag: 'BFCM',
	goal_type: 'revenue',
	target: '50000',
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

type Props = {
	onCancel: () => void;
	onLaunched: () => void;
};

export const CampaignCreate = ( { onCancel, onLaunched }: Props ): JSX.Element => {
	const [ draft, setDraft ] = useState< Draft >( initialDraft );
	const [ saving, setSaving ] = useState( false );

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
									'Each channel contributes activities — a Performance Max campaign on Google, an ad set on Meta, or a promoted Pin on Pinterest.',
									'multichannel-campaigns'
								) }
							</Text>
						</Stack>
					</CollapsibleCard.Header>
					<CollapsibleCard.Content>
						<div className="mcc-provider-list mcc-provider-list--select">
							{ window.MCC_BOOT.channels.map( ( ch ) => (
								<ChannelProviderRow
									key={ ch.id }
									channel={ ch }
									mode="select"
									selected={ !! draft.channels[ ch.id ] }
									onToggle={ toggleChannel }
								/>
							) ) }
						</div>
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
