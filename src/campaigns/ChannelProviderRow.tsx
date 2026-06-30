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
							{ channel.badges.map( ( badge ) => (
								<Badge
									key={ badge }
									intent={ badgeIntent( badge ) }
								>
									{ badge }
								</Badge>
							) ) }
						</span>
					</div>
					<div className="mcc-provider-row__description">
						{ channel.description }
					</div>
					<div
						className="mcc-provider-row__capabilities"
						aria-label={ __(
							'Channel capabilities',
							'multichannel-campaigns'
						) }
					>
						{ channel.capabilities.map( ( capability ) => (
							<span key={ capability }>{ capability }</span>
						) ) }
					</div>
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
