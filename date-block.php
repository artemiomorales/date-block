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
	if ( ! isset( $block->context['postId'] ) || ! isset( $attributes['metadata']['bindings']['content']['args']['key'] ) ) {
		return '';
	}

	$content_attribute = $attributes['content'];

	$wrapper_attributes = get_block_wrapper_attributes();
	// set the key to a variable
	$custom_field_key = $attributes['metadata']['bindings']['content']['args']['key'];

	$formatted_date = '';

	// check if content is empty
	if ( ! empty( $content_attribute ) ) {
		if ( 'release_date' === $custom_field_key ) {
			$formatted_date = gmdate( 'F j, Y', strtotime( $content_attribute ) );
		} else if ( 'publish_date' === $custom_field_key ) {
			$formatted_date = gmdate( 'F Y', strtotime( $content_attribute ) );
		} else {
			// format the date in a different way
			$formatted_date = $content_attribute;
		}
	}

	return sprintf(
		'<div %1$s><time datetime="%2$s">%3$s</time></div>',
		$wrapper_attributes,
		$content,
		$formatted_date
	);
}

// Initialize on init
function register_custom_date_meta() {
	// Register custom field with a date
	register_meta(
		'post',
		'publish_date',
		array(
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
			'default' => '2024-01-01',
		)
	);

	register_meta(
		'post',
		'release_date',
		array(
			'show_in_rest' => true,
			'single' => true,
			'type' => 'string',
			'default' => '2026-01-01',
		)
	);
}
add_action( 'init', 'register_custom_date_meta' );

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
