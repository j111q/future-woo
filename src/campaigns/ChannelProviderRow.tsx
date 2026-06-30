import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { ChannelProviderLogo } from './ChannelProviderLogo';
import type { Channel } from './types';

type Mode = 'manage' | 'select';

type Props = {
	channel: Channel;
	mode?: Mode;
	selected?: boolean;
	onToggle?: ( id: string ) => void;
};

type SupportedChannelLogo = Pick< Channel, 'id' | 'label' | 'short' | 'color' >;

const supportedChannelLogoById: Record< string, SupportedChannelLogo > = {
	tumblr: {
		id: 'tumblr',
		label: 'Tumblr',
		short: 't',
		color: '#36465D',
	},
	pocket_casts: {
		id: 'pocket_casts',
		label: 'Pocket Casts',
		short: 'P',
		color: '#F43E37',
	},
};

const badgeIntent = (
	badge: string
): 'stable' | 'informational' | 'draft' | 'none' => {
	if ( badge === 'Connected' ) {
		return 'stable';
	}
	if ( badge === 'Recommended' ) {
		return 'informational';
	}
	if ( badge === 'Official' ) {
		return 'informational';
	}
	return 'none';
};

const rowActionVariant = (
	channel: Channel,
	mode: Mode,
	selected?: boolean
): 'primary' | 'secondary' => {
	if ( mode === 'select' && selected ) {
		return 'primary';
	}
	if ( channel.featured ) {
		return 'primary';
	}
	return 'secondary';
};

const getActionLabel = (
	channel: Channel,
	mode: Mode,
	selected: boolean
): string => {
	if ( mode === 'select' && channel.connected ) {
		if ( selected ) {
			return __( 'Included', 'multichannel-campaigns' );
		}
		return __( 'Add', 'multichannel-campaigns' );
	}
	return channel.action_label;
};

const getSupportedChannels = ( channel: Channel ): SupportedChannelLogo[] => {
	const channels = window.MCC_BOOT?.channels ?? [];

	return ( channel.supported_channel_ids ?? [] )
		.map(
			( channelId ) =>
				channels.find(
					( supportedChannel ) => supportedChannel.id === channelId
				) ?? supportedChannelLogoById[ channelId ]
		)
		.filter(
			( supportedChannel ): supportedChannel is SupportedChannelLogo =>
				Boolean( supportedChannel )
		);
};

const ChannelOfficialBadge = (): JSX.Element => (
	<span className="mcc-provider-official-badge">
		<svg
			aria-hidden="true"
			className="mcc-provider-official-badge__mark"
			focusable="false"
			viewBox="0 0 16 16"
		>
			<circle cx="8" cy="8" r="7" fill="#873EFF" />
			<path
				d="M5.909 10.9c.608 0 1.096-.3 1.464-.991l.819-1.533v1.3c0 .766.496 1.224 1.262 1.224.6 0 1.044-.263 1.472-.991l1.885-3.185c.413-.698.12-1.224-.789-1.224-.488 0-.803.158-1.089.691l-1.3 2.44v-2.17c0-.646-.307-.961-.878-.961-.45 0-.811.195-1.089.736L6.442 8.632V6.484c0-.691-.285-.984-.976-.984H4.054c-.534 0-.804.248-.804.706 0 .458.285.721.804.721h.578v2.741c0 .774.518 1.232 1.277 1.232Z"
				fill="#fff"
			/>
		</svg>
		<span>{ __( 'Official', 'multichannel-campaigns' ) }</span>
	</span>
);

export const ChannelProviderRow = ( {
	channel,
	mode = 'manage',
	selected = false,
	onToggle,
}: Props ): JSX.Element => {
	const logoStyle = {
		'--mcc-channel-color': channel.color,
	} as React.CSSProperties;
	const canSelect = mode === 'select' && channel.connected;
	const actionLabel = getActionLabel( channel, mode, selected );
	const supportedChannels = getSupportedChannels( channel );

	return (
		<section
			className={ [
				'mcc-provider-row',
				channel.featured ? 'is-featured' : '',
				selected ? 'is-selected' : '',
				! channel.connected ? 'is-disconnected' : '',
			]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<div className="mcc-provider-row__main">
				<div className="mcc-provider-row__logo" style={ logoStyle }>
					<ChannelProviderLogo
						channelId={ channel.id }
						fallback={ channel.short }
					/>
				</div>
				<div className="mcc-provider-row__text">
					<div className="mcc-provider-row__title-line">
						<span className="mcc-provider-row__title">
							{ channel.label }
						</span>
						<span className="mcc-provider-row__badges">
							{ channel.badges.map( ( badge ) => {
								if ( badge === 'Official' ) {
									return (
										<ChannelOfficialBadge key={ badge } />
									);
								}

								return (
									<Badge
										key={ badge }
										intent={ badgeIntent( badge ) }
									>
										{ badge }
									</Badge>
								);
							} ) }
						</span>
					</div>
					<div className="mcc-provider-row__description">
						{ channel.description }
					</div>
					{ supportedChannels.length > 0 && (
						<div
							className="mcc-provider-row__network-logos"
							aria-label={ __(
								'Supported marketing channels',
								'multichannel-campaigns'
							) }
						>
							{ supportedChannels.map( ( supportedChannel ) => {
								const supportedLogoStyle = {
									'--mcc-channel-color':
										supportedChannel.color,
								} as React.CSSProperties;

								return (
									<span
										key={ supportedChannel.id }
										className="mcc-provider-row__network-logo"
										style={ supportedLogoStyle }
										aria-label={ supportedChannel.label }
										title={ supportedChannel.label }
									>
										<ChannelProviderLogo
											channelId={ supportedChannel.id }
											fallback={ supportedChannel.short }
										/>
									</span>
								);
							} ) }
						</div>
					) }
				</div>
			</div>
			<div className="mcc-provider-row__actions">
				<Button
					__next40pxDefaultSize
					variant={ rowActionVariant( channel, mode, selected ) }
					onClick={ () => {
						if ( canSelect ) {
							onToggle?.( channel.id );
						}
					} }
				>
					{ actionLabel }
				</Button>
				<Button
					__next40pxDefaultSize
					icon={ moreVertical }
					label={ __( 'More options', 'multichannel-campaigns' ) }
					size="compact"
					variant="tertiary"
				/>
			</div>
		</section>
	);
};
