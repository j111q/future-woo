export type MarketingAnalyticsChannel = {
	id: string;
	name: string;
	category: string;
	color: string;
	status: string;
	revenue: number;
	spend: number;
	budget: number;
	recommended_budget: number;
	orders: number;
	visitors: number;
	reach: number;
	conversion_rate: number;
	click_rate: number;
	cost_per_visitor: number;
	average_order_value: number;
	sales_data: number[];
	spend_data: number[];
	recommendation: string;
};

export type MarketingAnalyticsAction = {
	type: 'budget_shift' | 'creative_refresh' | 'connect_channel';
	title: string;
	description: string;
	action: string;
};

export type MarketingAnalytics = {
	period: {
		label: string;
		comparison: string;
		description: string;
	};
	summary: {
		sales_from_ads: number;
		ad_spend: number;
		orders_from_ads: number;
		visitors_from_ads: number;
		reach: number;
		ad_click_rate: number;
		cost_per_visitor: number;
		ad_cost_percent: number;
	};
	visitor_quality: {
		total_visitors: number;
		visitors_from_ads: number;
		other_visitors: number;
		ad_conversion_rate: number;
		other_conversion_rate: number;
		conversion_multiplier: number;
		insight: string;
	};
	trend_labels: string[];
	channels: MarketingAnalyticsChannel[];
	recommended_actions: MarketingAnalyticsAction[];
};
