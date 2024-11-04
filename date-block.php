<?php
/**
 * Plugin Name:       Date Block
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       date-block
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function render_block_date_block( $attributes, $content, $block ) {
	if ( ! isset( $block->context['postId'] ) ) {
		return '';
	}

	$post_ID = $block->context['postId'];

	if ( isset( $attributes['format'] ) && 'human-diff' === $attributes['format'] ) {
		$post_timestamp = get_post_timestamp( $post_ID );
		if ( $post_timestamp > time() ) {
			// translators: %s: human-readable time difference.
			$formatted_date = sprintf( __( '%s from now' ), human_time_diff( $post_timestamp ) );
		} else {
			// translators: %s: human-readable time difference.
			$formatted_date = sprintf( __( '%s ago' ), human_time_diff( $post_timestamp ) );
		}
	} else {
		$formatted_date = get_the_date( empty( $attributes['format'] ) ? '' : $attributes['format'], $post_ID );
	}
	$unformatted_date = esc_attr( get_the_date( 'c', $post_ID ) );
	$classes          = array();

	if ( isset( $attributes['textAlign'] ) ) {
		$classes[] = 'has-text-align-' . $attributes['textAlign'];
	}
	if ( isset( $attributes['style']['elements']['link']['color']['text'] ) ) {
		$classes[] = 'has-link-color';
	}

	/*
	 * If the "Display last modified date" setting is enabled,
	 * only display the modified date if it is later than the publishing date.
	 */
	if ( isset( $attributes['displayType'] ) && 'modified' === $attributes['displayType'] ) {
		if ( get_the_modified_date( 'Ymdhi', $post_ID ) > get_the_date( 'Ymdhi', $post_ID ) ) {
			if ( isset( $attributes['format'] ) && 'human-diff' === $attributes['format'] ) {
				// translators: %s: human-readable time difference.
				$formatted_date = sprintf( __( '%s ago' ), human_time_diff( get_post_timestamp( $post_ID, 'modified' ) ) );
			} else {
				$formatted_date = get_the_modified_date( empty( $attributes['format'] ) ? '' : $attributes['format'], $post_ID );
			}
			$unformatted_date = esc_attr( get_the_modified_date( 'c', $post_ID ) );
			$classes[]        = 'wp-block-post-date__modified-date';
		} else {
			return '';
		}
	}

	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );

	if ( isset( $attributes['isLink'] ) && $attributes['isLink'] ) {
		$formatted_date = sprintf( '<a href="%1s">%2s</a>', get_the_permalink( $post_ID ), $formatted_date );
	}

	return sprintf(
		'<div %1$s><time datetime="%2$s">%3$s</time></div>',
		$wrapper_attributes,
		$unformatted_date,
		$formatted_date
	);
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_date_block_block_init() {
	register_block_type(
		__DIR__ . '/build',
		array(
			'render_callback' => 'render_block_date_block',
		)
	);
}
add_action( 'init', 'create_block_date_block_block_init' );
