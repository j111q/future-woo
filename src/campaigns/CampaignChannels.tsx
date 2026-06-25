import { __ } from '@wordpress/i18n';
import { PageHeader } from './PageHeader';
import { ChannelProviderRow } from './ChannelProviderRow';

type Props = {
	tabs: React.ReactNode;
};

export const CampaignChannels = ( { tabs }: Props ): JSX.Element => {
	const channels = window.MCC_BOOT.channels;
	const featured = channels.find( ( channel ) => channel.featured );
	const otherChannels = channels.filter( ( channel ) => ! channel.featured );

	return (
		<div className="mcc-page mcc-page--channels">
			<PageHeader
				title={ __( 'Campaigns', 'multichannel-campaigns' ) }
				subTitle={ __(
					'Connect the places where customers discover, follow, and buy from your store.',
					'multichannel-campaigns'
				) }
				tabs={ tabs }
			/>

			<div className="mcc-content-gutter">
				<section
					className="mcc-provider-surface"
					aria-labelledby="mcc-provider-surface-title"
				>
					<div className="mcc-provider-surface__toolbar">
						<div>
							<h2 id="mcc-provider-surface-title">
								{ __(
									'Marketing channels',
									'multichannel-campaigns'
								) }
							</h2>
							<p>
								{ __(
									'Choose sales and marketing providers, then use them in campaigns.',
									'multichannel-campaigns'
								) }
							</p>
						</div>
						<button type="button" className="mcc-provider-location">
							<span>
								{ __(
									'Business location:',
									'multichannel-campaigns'
								) }
							</span>{ ' ' }
							<strong>
								{ window.MCC_BOOT.businessLocation }
							</strong>
						</button>
					</div>

					<div className="mcc-provider-list">
						{ featured && (
							<ChannelProviderRow
								channel={ featured }
								mode="manage"
							/>
						) }
						{ otherChannels.map( ( channel ) => (
							<ChannelProviderRow
								key={ channel.id }
								channel={ channel }
								mode="manage"
							/>
						) ) }
					</div>
				</section>
			</div>
		</div>
	);
};
