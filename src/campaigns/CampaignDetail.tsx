/**
 * Campaign detail — REST-loaded enriched view of a single campaign.
 */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Button,
	Spinner,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { Card } from '@wordpress/ui';
import apiFetch from '@wordpress/api-fetch';
import type { CampaignDetail } from './types';
import { ChannelChip } from './ChannelChip';
import { PageHeader } from './PageHeader';
import { StatCard } from './StatCard';
import { fmtMoney, fmtNum, fmtRoas, channelById } from './helpers';

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

type Props = {
	campaignId: number;
	onBack: () => void;
};

export const Detail = ( { campaignId, onBack }: Props ): JSX.Element => {
	const [ detail, setDetail ] = useState< CampaignDetail | null >( null );
	const [ confirmPause, setConfirmPause ] = useState( false );

	useEffect( () => {
		apiFetch< CampaignDetail >( { path: `/mcc/v1/campaigns/${ campaignId }` } )
			.then( setDetail )
			.catch( ( err ) => {
				// eslint-disable-next-line no-console
				console.error( 'MCC detail fetch failed', err );
			} );
	}, [ campaignId ] );

	if ( ! detail ) {
		return (
			<div className="mcc-page mcc-page--detail">
				<div className="mcc-inline-loading">
					<Spinner /> { __( 'Loading campaign…', 'multichannel-campaigns' ) }
				</div>
			</div>
		);
	}

	const goalPct = detail.goal_value
		? Math.min( 100, ( ( detail.sales || 0 ) / detail.goal_value ) * 100 )
		: 0;

	return (
		<div className="mcc-page mcc-page--detail">
			<PageHeader
				parent={ { label: __( 'Campaigns', 'multichannel-campaigns' ), onClick: onBack } }
				title={ detail.name }
				badges={
					<span className={ STATUS_PILL_CLASS[ detail.status ] }>
						{ STATUS_PILL_LABEL[ detail.status ] }
					</span>
				}
				subTitle={
					<>
						{ detail.dates } · { __( 'Goal:', 'multichannel-campaigns' ) }{ ' ' }
						{ detail.goal_type }
						{ detail.goal_value
							? ' · ' +
							  ( detail.goal_type === 'revenue'
									? fmtMoney( detail.goal_value )
									: fmtNum( detail.goal_value ) )
							: '' }
						{ detail.tag ? ' · ' + __( 'Tag:', 'multichannel-campaigns' ) + ' ' + detail.tag : '' }
					</>
				}
				actions={
					<>
						<Button variant="tertiary">{ __( 'Duplicate', 'multichannel-campaigns' ) }</Button>
						<Button variant="secondary" onClick={ () => setConfirmPause( true ) }>
							{ __( 'Pause campaign', 'multichannel-campaigns' ) }
						</Button>
						<Button variant="primary">{ __( 'Edit', 'multichannel-campaigns' ) }</Button>
					</>
				}
			/>

			<div className="mcc-content-gutter">
			{ detail.goal_value && (
				<Card.Root className="mcc-goal-card">
					<Card.Content>
						<div className="mcc-goal-card__row">
							<div>
								<div className="mcc-dim mcc-small">
									{ __( 'Progress to goal · ', 'multichannel-campaigns' ) }
									{ detail.goal_type }
								</div>
								<div className="mcc-goal-card__big">
									{ fmtMoney( detail.sales ) }{ ' ' }
									<span className="mcc-dim mcc-small">
										{ __( 'of', 'multichannel-campaigns' ) }{ ' ' }
										{ fmtMoney( detail.goal_value ) }
									</span>
								</div>
							</div>
							<div className="mcc-goal-card__meta">
								<div>
									<strong>
										{ detail.channel_perf.length }{ ' ' }
										{ __( 'channels active', 'multichannel-campaigns' ) }
									</strong>
								</div>
								<div className="mcc-dim mcc-small">
									{ __( 'Pace: on track', 'multichannel-campaigns' ) }
								</div>
							</div>
						</div>
						<div className="mcc-progress">
							<div
								className="mcc-progress__bar"
								style={ { width: `${ goalPct }%` } }
							/>
						</div>
					</Card.Content>
				</Card.Root>
			) }

			<div className="mcc-stat-grid">
				{ [
					{ label: __( 'Sessions', 'multichannel-campaigns' ),         value: fmtNum( detail.sessions ),  delta: '+38% vs baseline' },
					{ label: __( 'Orders', 'multichannel-campaigns' ),           value: '312',                       delta: '+44%' },
					{ label: __( 'Attributed sales', 'multichannel-campaigns' ), value: fmtMoney( detail.sales ),    delta: '+52%' },
					{ label: __( 'ROAS', 'multichannel-campaigns' ),             value: fmtRoas( detail.roas ),      delta: '+0.6' },
				].map( ( t ) => (
					<StatCard
						key={ String( t.label ) }
						label={ t.label }
						value={ t.value }
						delta={ t.delta }
						deltaTone="up"
					/>
				) ) }
			</div>

			<div className="mcc-detail-grid">
				<Card.Root>
					<Card.Header>
						<Card.Title>{ __( 'Channel performance', 'multichannel-campaigns' ) }</Card.Title>
					</Card.Header>
					<Card.Content>
						<table className="mcc-table mcc-table--inner">
							<thead>
								<tr>
									<th>{ __( 'Channel', 'multichannel-campaigns' ) }</th>
									<th>{ __( 'Activities', 'multichannel-campaigns' ) }</th>
									<th className="mcc-num">{ __( 'Sessions', 'multichannel-campaigns' ) }</th>
									<th className="mcc-num">{ __( 'Sales', 'multichannel-campaigns' ) }</th>
									<th className="mcc-num">{ __( 'ROAS', 'multichannel-campaigns' ) }</th>
									<th>{ __( 'Status', 'multichannel-campaigns' ) }</th>
								</tr>
							</thead>
							<tbody>
								{ detail.channel_perf.map( ( row ) => (
									<tr key={ row.channel }>
										<td>
											<ChannelChip id={ row.channel } />{ ' ' }
											{ channelById( row.channel )?.label }
										</td>
										<td>{ row.activities }</td>
										<td className="mcc-num">{ fmtNum( row.sessions ) }</td>
										<td className="mcc-num">{ fmtMoney( row.sales ) }</td>
										<td className="mcc-num">{ fmtRoas( row.roas ) }</td>
										<td>
											<span className="mcc-pill mcc-pill--success mcc-pill--small">
												{ row.status }
											</span>
										</td>
									</tr>
								) ) }
							</tbody>
						</table>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>{ __( 'Activity', 'multichannel-campaigns' ) }</Card.Title>
					</Card.Header>
					<Card.Content>
						<ol className="mcc-feed">
							{ detail.activity.map( ( a, i ) => (
								<li key={ i }>
									<div className={ `mcc-feed__dot mcc-feed__dot--${ a.tone }` } />
									<div>
										<div className="mcc-feed__title">{ a.title }</div>
										<div className="mcc-dim mcc-small">{ a.when }</div>
									</div>
								</li>
							) ) }
						</ol>
					</Card.Content>
				</Card.Root>
			</div>

			{ confirmPause && (
				<ConfirmDialog
					onConfirm={ () => setConfirmPause( false ) }
					onCancel={ () => setConfirmPause( false ) }
					confirmButtonText={ __( 'Pause campaign', 'multichannel-campaigns' ) }
				>
					{ __(
						'Pause this campaign? Paid spend will stop within minutes. Email sends already in flight will continue. You can resume any time.',
						'multichannel-campaigns'
					) }
				</ConfirmDialog>
			) }
			</div>
		</div>
	);
};
