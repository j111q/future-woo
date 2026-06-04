<?php
/**
 * Demo data for the prototype. In a real plugin this would be backed by
 * a custom post type or a campaigns table. Here we keep it static so the
 * prototype loads instantly and the UI work stays the focus.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class MCC_Data {

	public static function get_channels() {
		return array(
			array( 'id' => 'google',    'label' => 'Google Ads',        'short' => 'G', 'color' => '#4285f4', 'connected' => true ),
			array( 'id' => 'meta',      'label' => 'Meta',              'short' => 'f', 'color' => '#1877f2', 'connected' => true ),
			array( 'id' => 'email',     'label' => 'Email · Mailchimp', 'short' => '✉', 'color' => '#d97706', 'connected' => true ),
			array( 'id' => 'onsite',    'label' => 'On-site banner',    'short' => '⬚', 'color' => '#6b7280', 'connected' => true ),
			array( 'id' => 'coupon',    'label' => 'Coupon',            'short' => '%', 'color' => '#16a34a', 'connected' => true ),
			array( 'id' => 'tiktok',    'label' => 'TikTok',            'short' => 'T', 'color' => '#000000', 'connected' => false ),
			array( 'id' => 'pinterest', 'label' => 'Pinterest',         'short' => 'P', 'color' => '#e60023', 'connected' => false ),
		);
	}

	public static function get_campaigns() {
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
		return array(
			'active_count'    => 5,
			'attributed_sales' => 48210,
			'avg_roas'        => 4.1,
			'sessions'        => 11402,
		);
	}
}
