<?php
/**
 * Demo data for the prototype. In a real plugin this would be backed by
 * a custom post type or a campaigns table. Here we keep it static so the
 * prototype loads instantly and the UI work stays the focus.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class MCC_Data {

	private static function should_show_marketing_demo_data() {
		if ( ! class_exists( 'WAR_Global_State_Manager' ) || ! method_exists( 'WAR_Global_State_Manager', 'get_state' ) ) {
			return true;
		}

		return 'active_store' === WAR_Global_State_Manager::get_state();
	}

	private static function get_empty_rollup() {
		return array(
			'active_count'     => 0,
			'attributed_sales' => 0,
			'avg_roas'         => 0,
			'sessions'         => 0,
		);
	}

	public static function get_channels() {
		if ( ! self::should_show_marketing_demo_data() ) {
			return array();
		}

		return array(
			array(
				'id'           => 'woo_ads',
				'label'        => 'Woo Ads',
				'short'        => 'W',
				'color'        => '#720eec',
				'connected'    => true,
				'status'       => 'connected',
				'category'     => 'Woo',
				'description'  => 'Plan, launch, and compare Woo-native ad campaigns from one place.',
				'capabilities' => array( 'Campaign setup', 'Product sync', 'Budget guidance', 'Performance reporting' ),
				'badges'       => array( 'Official', 'Connected' ),
				'action_label' => 'Manage',
				'featured'     => true,
			),
			array(
				'id'           => 'google',
				'label'        => 'Google for WooCommerce',
				'short'        => 'G',
				'color'        => '#4285f4',
				'connected'    => true,
				'status'       => 'connected',
				'category'     => 'Search and Shopping',
				'description'  => 'Sync products to Google, run Performance Max campaigns, and track conversions.',
				'capabilities' => array( 'Product sync', 'Paid ads', 'Free listings', 'Conversion tracking' ),
				'badges'       => array( 'Connected' ),
				'action_label' => 'Manage',
			),
			array(
				'id'           => 'meta',
				'label'        => 'Meta',
				'short'        => 'f',
				'color'        => '#1877f2',
				'connected'    => true,
				'status'       => 'connected',
				'category'     => 'Social',
				'description'  => 'Reach shoppers across Facebook and Instagram with catalog-powered ads.',
				'capabilities' => array( 'Catalog sync', 'Paid ads', 'Audience retargeting' ),
				'badges'       => array( 'Connected' ),
				'action_label' => 'Manage',
			),
			array(
				'id'           => 'pinterest',
				'label'        => 'Pinterest',
				'short'        => 'P',
				'color'        => '#e60023',
				'connected'    => false,
				'status'       => 'recommended',
				'category'     => 'Social commerce',
				'description'  => 'Turn your catalog into shoppable Pins for customers planning what to buy next.',
				'capabilities' => array( 'Product sync', 'Shoppable Pins', 'Paid ads' ),
				'badges'       => array( 'Recommended' ),
				'action_label' => 'Connect',
			),
			array(
				'id'           => 'tiktok',
				'label'        => 'TikTok',
				'short'        => 'T',
				'color'        => '#000000',
				'connected'    => false,
				'status'       => 'available',
				'category'     => 'Social commerce',
				'description'  => 'Create short-form video campaigns and sync products to TikTok Shop.',
				'capabilities' => array( 'Product sync', 'Paid ads', 'Shop sync' ),
				'badges'       => array(),
				'action_label' => 'Connect',
			),
			array(
				'id'           => 'amazon',
				'label'        => 'Amazon',
				'short'        => 'a',
				'color'        => '#ff9900',
				'connected'    => false,
				'status'       => 'available',
				'category'     => 'Marketplace',
				'description'  => 'List products on Amazon and keep inventory aligned from WooCommerce.',
				'capabilities' => array( 'Marketplace listings', 'Inventory sync', 'Order import' ),
				'badges'       => array(),
				'action_label' => 'Install',
			),
			array(
				'id'           => 'ebay',
				'label'        => 'eBay',
				'short'        => 'e',
				'color'        => '#86b817',
				'connected'    => false,
				'status'       => 'available',
				'category'     => 'Marketplace',
				'description'  => 'Reach marketplace shoppers with synchronized listings, inventory, and orders.',
				'capabilities' => array( 'Marketplace listings', 'Inventory sync', 'Order import' ),
				'badges'       => array(),
				'action_label' => 'Install',
			),
			array(
				'id'           => 'email',
				'label'        => 'Mailchimp',
				'short'        => '✉',
				'color'        => '#d97706',
				'connected'    => true,
				'status'       => 'connected',
				'category'     => 'Email',
				'description'  => 'Create lifecycle emails and campaign sends from customer and product data.',
				'capabilities' => array( 'Email campaigns', 'Audience sync', 'Automations' ),
				'badges'       => array( 'Connected' ),
				'action_label' => 'Manage',
			),
			array(
				'id'           => 'onsite',
				'label'        => 'On-site promotions',
				'short'        => '⬚',
				'color'        => '#6b7280',
				'connected'    => true,
				'status'       => 'connected',
				'category'     => 'Storefront',
				'description'  => 'Publish banners and product callouts directly on your store.',
				'capabilities' => array( 'Store banners', 'Product callouts', 'Scheduling' ),
				'badges'       => array( 'Connected' ),
				'action_label' => 'Manage',
			),
			array(
				'id'           => 'coupon',
				'label'        => 'Coupons',
				'short'        => '%',
				'color'        => '#16a34a',
				'connected'    => true,
				'status'       => 'connected',
				'category'     => 'Storefront',
				'description'  => 'Create discount campaigns that can be reused across channels.',
				'capabilities' => array( 'Discounts', 'Usage limits', 'Scheduling' ),
				'badges'       => array( 'Connected' ),
				'action_label' => 'Manage',
			),
		);
	}

	public static function has_connected_channel() {
		foreach ( self::get_channels() as $channel ) {
			if ( ! empty( $channel['connected'] ) ) {
				return true;
			}
		}

		return false;
	}

	public static function get_campaigns() {
		if ( ! self::should_show_marketing_demo_data() ) {
			return array();
		}

		return array(
			array(
				'id'         => 1,
				'name'       => 'Black Friday — Weekend Door Buster',
				'status'     => 'active',
				'goal_type'  => 'revenue',
				'goal_value' => 50000,
				'channels'   => array( 'google', 'meta', 'email', 'onsite', 'coupon' ),
				'dates'      => 'Nov 28 – Dec 1, 2026',
				'sessions'   => 5210,
				'sales'      => 22840,
				'roas'       => 5.4,
				'source'     => null,
				'tag'        => 'BFCM',
			),
			array(
				'id'         => 2,
				'name'       => 'Holiday gift guide',
				'status'     => 'active',
				'goal_type'  => 'awareness',
				'goal_value' => 20000,
				'channels'   => array( 'meta', 'pinterest', 'email' ),
				'dates'      => 'Nov 15 – Dec 24, 2026',
				'sessions'   => 3940,
				'sales'      => 14560,
				'roas'       => 3.8,
				'source'     => null,
			),
			array(
				'id'         => 3,
				'name'       => 'Always-on · Brand defense',
				'status'     => 'active',
				'goal_type'  => 'acquisition',
				'goal_value' => null,
				'channels'   => array( 'google' ),
				'dates'      => 'Ongoing',
				'sessions'   => 1420,
				'sales'      => 6210,
				'roas'       => 7.4,
				'source'     => 'google',
			),
			array(
				'id'         => 4,
				'name'       => 'Weekly newsletter',
				'status'     => 'active',
				'goal_type'  => 'retention',
				'goal_value' => null,
				'channels'   => array( 'email' ),
				'dates'      => 'Ongoing · Weekly',
				'sessions'   => 980,
				'sales'      => 3420,
				'roas'       => null,
				'source'     => 'email',
			),
			array(
				'id'         => 5,
				'name'       => 'Spring booking drive — yoga workshops',
				'status'     => 'active',
				'goal_type'  => 'bookings',
				'goal_value' => 120,
				'channels'   => array( 'meta', 'email', 'onsite' ),
				'dates'      => 'Mar 1 – Apr 30, 2026',
				'sessions'   => 1840,
				'sales'      => 5920,
				'roas'       => 2.9,
			),
			array(
				'id'         => 6,
				'name'       => 'Returning customers — Q4',
				'status'     => 'active',
				'goal_type'  => 'retention',
				'goal_value' => 15,
				'channels'   => array( 'email', 'coupon' ),
				'dates'      => 'Oct 1 – Dec 31, 2026',
				'sessions'   => 2252,
				'sales'      => 10810,
				'roas'       => 6.2,
			),
			array(
				'id'         => 7,
				'name'       => 'Cyber Monday flash',
				'status'     => 'scheduled',
				'goal_type'  => 'revenue',
				'goal_value' => 20000,
				'channels'   => array( 'google', 'meta', 'email', 'coupon' ),
				'dates'      => 'Dec 2, 2026',
				'sessions'   => null,
				'sales'      => null,
				'roas'       => null,
			),
			array(
				'id'         => 8,
				'name'       => 'Performance Max · evergreen',
				'status'     => 'scheduled',
				'goal_type'  => 'acquisition',
				'goal_value' => null,
				'channels'   => array( 'google' ),
				'dates'      => 'Starts Jan 2',
				'sessions'   => null,
				'sales'      => null,
				'roas'       => null,
				'source'     => 'google',
			),
			array(
				'id'         => 9,
				'name'       => 'New Year, new mug',
				'status'     => 'scheduled',
				'goal_type'  => 'acquisition',
				'goal_value' => 500,
				'channels'   => array( 'tiktok', 'meta', 'email' ),
				'dates'      => 'Jan 2 – Jan 14, 2027',
				'sessions'   => null,
				'sales'      => null,
				'roas'       => null,
			),
			array(
				'id'         => 10,
				'name'       => 'Spring collection teaser',
				'status'     => 'draft',
				'goal_type'  => 'awareness',
				'goal_value' => null,
				'channels'   => array(),
				'dates'      => '—',
				'sessions'   => null,
				'sales'      => null,
				'roas'       => null,
			),
			array(
				'id'         => 11,
				'name'       => 'Summer sale 2025',
				'status'     => 'completed',
				'goal_type'  => 'revenue',
				'goal_value' => 30000,
				'channels'   => array( 'google', 'meta', 'email' ),
				'dates'      => 'Jun 15 – Jun 30, 2025',
				'sessions'   => 8120,
				'sales'      => 31440,
				'roas'       => 4.7,
			),
		);
	}

	public static function get_campaign( $id ) {
		foreach ( self::get_campaigns() as $c ) {
			if ( (int) $c['id'] === (int) $id ) return $c;
		}
		return null;
	}

	public static function get_campaign_detail( $id ) {
		$base = self::get_campaign( $id );
		if ( ! $base ) return null;

		// Enrich with channel breakdown + activity feed for the detail view.
		$base['channel_perf'] = array(
			array( 'channel' => 'google', 'activities' => 2,         'sessions' => 1810, 'sales' => 9420, 'roas' => 6.1, 'status' => 'Running' ),
			array( 'channel' => 'meta',   'activities' => 1,         'sessions' => 1640, 'sales' => 5820, 'roas' => 3.9, 'status' => 'Running' ),
			array( 'channel' => 'email',  'activities' => '2 of 3 sent', 'sessions' => 980,  'sales' => 4210, 'roas' => null, 'status' => '1 scheduled' ),
			array( 'channel' => 'coupon', 'activities' => '—',       'sessions' => null, 'sales' => 2910, 'roas' => null, 'status' => '88 uses' ),
			array( 'channel' => 'onsite', 'activities' => 1,         'sessions' => 780,  'sales' => 480,  'roas' => null, 'status' => 'Live' ),
		);

		$base['activity'] = array(
			array( 'tone' => 'success', 'title' => 'Coupon BFCM30 crossed 100 uses',     'when' => '2 hours ago' ),
			array( 'tone' => 'neutral', 'title' => 'Email · Day-of blast sent to 12,408 subscribers', 'when' => 'Today · 06:00' ),
			array( 'tone' => 'warning', 'title' => 'Meta · Advantage+ shopping budget 80% spent',     'when' => 'Yesterday · 22:14' ),
			array( 'tone' => 'success', 'title' => 'Google · Performance Max started delivering',    'when' => 'Nov 28 · 08:02' ),
			array( 'tone' => 'neutral', 'title' => 'Campaign launched',                              'when' => 'Nov 28 · 00:00' ),
		);

		return $base;
	}

	public static function get_rollup() {
		if ( ! self::should_show_marketing_demo_data() ) {
			return self::get_empty_rollup();
		}

		return array(
			'active_count'    => 5,
			'attributed_sales' => 48210,
			'avg_roas'        => 4.1,
			'sessions'        => 11402,
		);
	}

	public static function get_marketing_analytics() {
		if ( ! self::should_show_marketing_demo_data() ) {
			return null;
		}

		$channels = array(
			array(
				'id'                => 'google',
				'name'              => 'Google',
				'category'          => 'Search and Shopping',
				'color'             => '#4285f4',
				'status'            => 'connected',
				'revenue'           => 3420,
				'spend'             => 820,
				'budget'            => 900,
				'recommended_budget' => 980,
				'orders'            => 86,
				'visitors'          => 1970,
				'reach'             => 102000,
				'conversion_rate'   => 3.8,
				'click_rate'        => 2.2,
				'cost_per_visitor'  => 0.42,
				'average_order_value' => 39.77,
				'sales_data'        => array( 360, 420, 390, 510, 540, 610, 589 ),
				'spend_data'        => array( 92, 104, 112, 126, 124, 132, 130 ),
				'recommendation'    => 'Keep Google funded. It is bringing the strongest sales efficiency this month.',
			),
			array(
				'id'                => 'meta',
				'name'              => 'Instagram',
				'category'          => 'Social',
				'color'             => '#1877f2',
				'status'            => 'connected',
				'revenue'           => 1840,
				'spend'             => 640,
				'budget'            => 680,
				'recommended_budget' => 620,
				'orders'            => 46,
				'visitors'          => 1620,
				'reach'             => 91000,
				'conversion_rate'   => 2.8,
				'click_rate'        => 1.8,
				'cost_per_visitor'  => 0.40,
				'average_order_value' => 40.00,
				'sales_data'        => array( 220, 240, 260, 310, 285, 270, 255 ),
				'spend_data'        => array( 78, 84, 90, 96, 98, 96, 98 ),
				'recommendation'    => 'Refresh creative before adding budget. Engagement is steady, but order quality is softer.',
			),
			array(
				'id'                => 'pinterest',
				'name'              => 'Pinterest',
				'category'          => 'Social commerce',
				'color'             => '#e60023',
				'status'            => 'connected',
				'revenue'           => 980,
				'spend'             => 550,
				'budget'            => 600,
				'recommended_budget' => 420,
				'orders'            => 24,
				'visitors'          => 1231,
				'reach'             => 55000,
				'conversion_rate'   => 2.0,
				'click_rate'        => 1.5,
				'cost_per_visitor'  => 0.45,
				'average_order_value' => 40.83,
				'sales_data'        => array( 140, 110, 135, 160, 150, 145, 140 ),
				'spend_data'        => array( 74, 72, 78, 84, 82, 80, 80 ),
				'recommendation'    => 'Trim Pinterest slightly and watch catalog engagement before scaling again.',
			),
		);

		$sales_from_ads = array_sum( array_column( $channels, 'revenue' ) );
		$ad_spend       = array_sum( array_column( $channels, 'spend' ) );

		return array(
			'period' => array(
				'label'       => 'Last 30 days',
				'comparison'  => 'Compared with previous 30 days',
				'description' => 'Google, Instagram, and Pinterest',
			),
			'summary' => array(
				'sales_from_ads'    => $sales_from_ads,
				'ad_spend'          => $ad_spend,
				'orders_from_ads'   => array_sum( array_column( $channels, 'orders' ) ),
				'visitors_from_ads' => array_sum( array_column( $channels, 'visitors' ) ),
				'reach'             => array_sum( array_column( $channels, 'reach' ) ),
				'ad_click_rate'     => 1.9,
				'cost_per_visitor'  => 0.42,
				'ad_cost_percent'   => round( ( $ad_spend / $sales_from_ads ) * 100 ),
			),
			'visitor_quality' => array(
				'total_visitors'         => 13200,
				'visitors_from_ads'      => 4821,
				'other_visitors'         => 8379,
				'ad_conversion_rate'     => 3.2,
				'other_conversion_rate'  => 1.8,
				'conversion_multiplier'  => 1.8,
				'insight'                => 'Ad visitors are 1.8x more likely to buy than other visitors.',
			),
			'trend_labels' => array( 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7' ),
			'channels' => $channels,
			'recommended_actions' => array(
				array(
					'type'        => 'budget_shift',
					'title'       => 'Shift budget toward Google',
					'description' => 'Move about $150 from Pinterest to Google while Google keeps outperforming on sales efficiency.',
					'action'      => 'Review budget',
				),
				array(
					'type'        => 'creative_refresh',
					'title'       => 'Refresh Instagram creative',
					'description' => 'Instagram is reaching shoppers, but conversion quality trails Google. Try a product-led creative set.',
					'action'      => 'Plan creative',
				),
				array(
					'type'        => 'connect_channel',
					'title'       => 'Test one new channel',
					'description' => 'TikTok or Facebook could expand reach without changing the reporting workflow you already use here.',
					'action'      => 'Explore channels',
				),
			),
		);
	}
}
