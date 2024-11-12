import { useBlockProps } from '@wordpress/block-editor';

export default function DateEdit( {
	attributes: { textAlign, format, isLink, displayType, source },
	context: { postId, postType: postTypeSlug, queryId },
	setAttributes,
} ) {

	return (
		<div { ...useBlockProps() }>
			<p>Date Block</p>
		</div>
	);
}
