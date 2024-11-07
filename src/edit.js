/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useEntityProp, store as coreStore } from '@wordpress/core-data';

import { useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	dateI18n,
	humanTimeDiff,
	getSettings as getDateSettings,
} from '@wordpress/date';
import {
	AlignmentControl,
	BlockControls,
	InspectorControls,
	useBlockProps,
	__experimentalDateFormatPicker as DateFormatPicker,
	__experimentalPublishDateTimePicker as PublishDateTimePicker,
} from '@wordpress/block-editor';
import {
	Dropdown,
	ToolbarGroup,
	ToolbarButton,
	ToggleControl,
	PanelBody,
	SelectControl,
} from '@wordpress/components';
import { __, _x, sprintf } from '@wordpress/i18n';
import { DOWN } from '@wordpress/keycodes';
import { useSelect } from '@wordpress/data';

const EditIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		aria-hidden="true"
		focusable="false"
	>
		<path d="m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z"></path>
	</svg>
);

const TimeFormat = (targetDate, ref, format = 'd F Y', siteFormat) => {
	return (
		<time dateTime={ dateI18n( 'c', targetDate ) } ref={ ref }>
			{ format === 'human-diff'
				? humanTimeDiff( targetDate )
				: dateI18n( format || siteFormat, targetDate ) }
		</time>
	)
}

const getPostMetaFields = async ( postId ) => {
	const postMetaFields = await apiFetch( {
		path: `/wp/v2/posts/${ postId }`,
		method: 'GET',
	} );
	return postMetaFields;
}

export default function DateEdit( {
	attributes: { textAlign, format, isLink, displayType, source },
	context: { postId, postType: postTypeSlug, queryId },
	setAttributes,
} ) {
	const [ postMetaFields, setPostMetaFields ] = useState( null );
	const [ sourceOptions, setSourceOptions ] = useState( [] );
	// Get the available post meta fields.
	getPostMetaFields( postId ).then( ( fields ) => {
		if ( fields?.meta ) {
			setPostMetaFields( fields.meta );
			setSourceOptions( Object.keys( fields.meta ).map( ( key ) => ( { label: key, value: fields.meta[key] } ) ) );
		}
	} );

	// Generate a list of source options based on the available post meta fields.
	const blockProps = useBlockProps( {
		className: clsx( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
			[ `wp-block-post-date__modified-date` ]: displayType === 'modified',
		} ),
	} );

	// Use internal state instead of a ref to make sure that the component
	// re-renders when the popover's anchor updates.
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );
	// Memoize popoverProps to avoid returning a new object every time.
	const popoverProps = useMemo(
		() => ( { anchor: popoverAnchor } ),
		[ popoverAnchor ]
	);

	const isDescendentOfQueryLoop = Number.isFinite( queryId );
	const dateSettings = getDateSettings();
	const [ siteFormat = dateSettings.formats.date ] = useEntityProp(
		'root',
		'site',
		'date_format'
	);
	const [ siteTimeFormat = dateSettings.formats.time ] = useEntityProp(
		'root',
		'site',
		'time_format'
	);
	const [ postDate, setPostDate ] = useEntityProp(
		'postType',
		postTypeSlug,
		displayType,
		postId
	);

	const postType = useSelect(
		( select ) =>
			postTypeSlug
				? select( coreStore ).getPostType( postTypeSlug )
				: null,
		[ postTypeSlug ]
	);

	const postDateLabel =
		displayType === 'date' ? __( 'Post Date' ) : __( 'Post Modified Date' );

	let date;

	// Create conditional based on the source attribute
	if ( source === 'postDate' ) {
		date = postDate ? (
			<TimeFormat targetDate={ postDate } ref={ setPopoverAnchor } format={ format } siteFormat={ siteFormat } />
		) : (
			postDateLabel
		);
	} else {
		// find the source date in the post meta fields, which is an object with a key and a value
		let sourceDate = Object.keys(postMetaFields || {}).find(key => key === source) ? postMetaFields[source] : null;
		// check if the source date is a valid date
		sourceDate = isNaN( Date.parse( sourceDate ) ) ? null : sourceDate;
		date = sourceDate ? (
			<TimeFormat targetDate={ sourceDate } ref={ setPopoverAnchor } format={ format } siteFormat={ siteFormat } />
		) : (
			__( 'Invalid date' )
		);
	}

	if ( isLink && postDate ) {
		date = (
			<a
				href="#post-date-pseudo-link"
				onClick={ ( event ) => event.preventDefault() }
			>
				{ date }
			</a>
		);
	}

	const callSetDate = ( nextDate ) => {
		if ( source === 'postDate' ) {
			setPostDate( nextDate );
		} else {
			// dispatch an action to update the meta field value
			dispatch( 'core/editor' ).editPost( {
				meta: {
					[ source ]: nextDate,
				},
			} );
		}
	}

	return (
		<>
			<BlockControls group="block">
				<AlignmentControl
					value={ textAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
				{ date &&
					displayType === 'date' && (
						<ToolbarGroup>
							<Dropdown
								popoverProps={ popoverProps }
								renderContent={ ( { onClose } ) => (
									<PublishDateTimePicker
										currentDate={ date }
										onChange={ callSetDate }
										is12Hour={ is12HourFormat(
											siteTimeFormat
										) }
										onClose={ onClose }
										dateOrder={
											/* translators: Order of day, month, and year. Available formats are 'dmy', 'mdy', and 'ymd'. */
											_x( 'dmy', 'date order' )
										}
									/>
								) }
								renderToggle={ ( { isOpen, onToggle } ) => {
									const openOnArrowDown = ( event ) => {
										if (
											! isOpen &&
											event.keyCode === DOWN
										) {
											event.preventDefault();
											onToggle();
										}
									};
									return (
										<ToolbarButton
											aria-expanded={ isOpen }
											title={ __( 'Change Date' ) }
											icon={ EditIcon }
											onClick={ onToggle }
											onKeyDown={ openOnArrowDown }
										/>
									);
								} }
							/>
						</ToolbarGroup>
					) }
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					<DateFormatPicker
						format={ format }
						defaultFormat={ siteFormat }
						onChange={ ( nextFormat ) =>
							setAttributes( { format: nextFormat } )
						}
					/>
					{ sourceOptions.length > 0 && (
						<SelectControl
							label={ __( 'Source' ) }
							value={ source }
							onChange={ ( nextSource ) =>
								setAttributes( { source: nextSource } )
							}
							options={ [
								{ label: __( 'Post Date' ), value: 'postDate' },
								...sourceOptions,
							] }
						/>
					) }
					<ToggleControl
						__nextHasNoMarginBottom
						label={
							postType?.labels.singular_name
								? sprintf(
										// translators: %s: Name of the post type e.g: "post".
										__( 'Link to %s' ),
										postType.labels.singular_name.toLowerCase()
								  )
								: __( 'Link to post' )
						}
						onChange={ () => setAttributes( { isLink: ! isLink } ) }
						checked={ isLink }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Display last modified date' ) }
						onChange={ ( value ) =>
							setAttributes( {
								displayType: value ? 'modified' : 'date',
							} )
						}
						checked={ displayType === 'modified' }
						help={ __(
							'Only shows if the post has been modified'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>{ date }</div>
		</>
	);
}

export function is12HourFormat( format ) {
	// To know if the time format is a 12 hour time, look for any of the 12 hour
	// format characters: 'a', 'A', 'g', and 'h'. The character must be
	// unescaped, i.e. not preceded by a '\'. Coincidentally, 'aAgh' is how I
	// feel when working with regular expressions.
	// https://www.php.net/manual/en/datetime.format.php
	return /(?:^|[^\\])[aAgh]/.test( format );
}
