export type CampaignStatus = 'active' | 'scheduled' | 'draft' | 'completed';
export type ChannelStatus = 'connected' | 'recommended' | 'available' | 'coming_soon';

export type Channel = {
	id: string;
	label: string;
	short: string;
	color: string;
	connected: boolean;
	status: ChannelStatus;
	category: string;
	description: string;
	capabilities: string[];
	badges: string[];
	action_label: string;
	featured?: boolean;
};

export type Campaign = {
	id: number;
	name: string;
	status: CampaignStatus;
	goal_type: string;
	goal_value: number | null;
	channels: string[];
	dates: string;
	sessions: number | null;
	sales: number | null;
	roas: number | null;
	source?: string | null;
	tag?: string;
};

export type ChannelPerf = {
	channel: string;
	activities: number | string;
	sessions: number | null;
	sales: number | null;
	roas: number | null;
	status: string;
};

export type ActivityEntry = {
	tone: 'success' | 'warning' | 'neutral';
	title: string;
	when: string;
};

export type CampaignDetail = Campaign & {
	channel_perf: ChannelPerf[];
	activity: ActivityEntry[];
};

declare global {
	interface Window {
		MCC_BOOT: {
			restUrl: string;
			nonce: string;
			campaigns: Campaign[];
			channels: Channel[];
			rollup: {
				active_count: number;
				attributed_sales: number;
				avg_roas: number;
				sessions: number;
			};
			marketingAnalytics?: unknown;
			path: string;
			businessLocation: string;
		};
	}
}
