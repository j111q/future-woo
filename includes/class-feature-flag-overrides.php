<?php
/**
 * Force-enable Woo feature flags that Future Woo wants to prototype early.
 *
 * This class is intentionally generic. WooCommerce has used a few different
 * feature-flag surfaces over time, so Future Woo opts into the common filters
 * and keeps the actual flag list in config/woo-intake.json.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Feature_Flag_Overrides {
	const CONFIG_PATH = 'config/woo-intake.json';

	public static function init(): void {
		add_filter( 'woocommerce_admin_features', array( __CLASS__, 'add_admin_features' ) );
		add_filter( 'woocommerce_admin_get_feature_config', array( __CLASS__, 'enable_feature_config' ) );

		foreach ( self::get_forced_flags() as $flag ) {
			add_filter( "woocommerce_feature_enabled_{$flag}", '__return_true' );
			add_filter( "woocommerce_admin_feature_enabled_{$flag}", '__return_true' );
			add_filter( "woocommerce_is_{$flag}_enabled", '__return_true' );
		}
	}

	public static function add_admin_features( $features ) {
		if ( ! is_array( $features ) ) {
			return $features;
		}

		foreach ( self::get_forced_flags() as $flag ) {
			if ( ! in_array( $flag, $features, true ) ) {
				$features[] = $flag;
			}
		}

		return $features;
	}

	public static function enable_feature_config( $feature_config ) {
		if ( ! is_array( $feature_config ) ) {
			return $feature_config;
		}

		foreach ( self::get_forced_flags() as $flag ) {
			if ( ! isset( $feature_config[ $flag ] ) ) {
				$feature_config[ $flag ] = true;
				continue;
			}

			if ( is_array( $feature_config[ $flag ] ) ) {
				$feature_config[ $flag ]['enabled']    = true;
				$feature_config[ $flag ]['is_enabled'] = true;
			} else {
				$feature_config[ $flag ] = true;
			}
		}

		return $feature_config;
	}

	public static function get_forced_flags(): array {
		$config_path = WAR_PATH . self::CONFIG_PATH;
		if ( ! file_exists( $config_path ) ) {
			return array();
		}

		$config = json_decode( file_get_contents( $config_path ), true );
		if ( ! is_array( $config ) || empty( $config['featureFlags'] ) || ! is_array( $config['featureFlags'] ) ) {
			return array();
		}

		$flags = array();
		foreach ( $config['featureFlags'] as $feature_flag ) {
			if ( isset( $feature_flag['enabled'] ) && false === $feature_flag['enabled'] ) {
				continue;
			}

			$feature_flags = ! empty( $feature_flag['flags'] ) && is_array( $feature_flag['flags'] )
				? $feature_flag['flags']
				: array( $feature_flag['id'] ?? '' );

			foreach ( $feature_flags as $flag ) {
				$flag = sanitize_key( $flag );
				if ( $flag ) {
					$flags[] = $flag;
				}
			}
		}

		return array_values( array_unique( $flags ) );
	}
}
