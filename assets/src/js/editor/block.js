import image from './block-image';

const isChecked = () => {
	return !!campus_a11y_insights.post.checked;
};

const isLocked = () => wp.data.select( 'core/editor' ).isPostSavingLocked();
const unlock = () => {
	if ( isLocked() ) {
		wp.data.dispatch('core/editor').unlockPostSaving();
	}

	return true;
};
const lock = () => {
	// Do not lock already published post.
	if ( ! wp.data.select( 'core/editor' ).isCurrentPostPublished() ) {
		wp.data.dispatch('core/editor').lockPostSaving();
	}
};

const setPostUnchecked = () => {
	if ( ! isChecked() ) {
		// Already marked dirty, no need to do this again.
		return;
	}
	campus_a11y_insights.post.checked = false;
	toggleSidebar();
	lock();
};

const setPostChecked = () => {
	if ( isChecked() ) {
		// Already marked non-dirty, no need to do this again.
		return;
	}
	campus_a11y_insights.post.checked = true;
	toggleSidebar();
	unlock();
};

const toggleSidebar = () => {
	const name = wp.data.select( 'core/edit-post' ).getActiveGeneralSidebarName();
	if ( name ) {
		wp.data.dispatch( 'core/edit-post' ).closeGeneralSidebar().then( () => {
			wp.data.dispatch( 'core/edit-post' ).openGeneralSidebar( name );
		} );
	}
};

const insight = () => wp.element.createElement(
		'div',
		{ className: isChecked() ? 'campus-a11y-all-good' : '', },
		wp.element.createElement(
			'p', null, wp.element.createElement( 'span', null, campus_a11y_insights.check_preview )
		)
	);

const prepublisher = () => {
	if ( ! isChecked() ) {
		wp.data.dispatch('core/editor').lockPostSaving();
	}
	return wp.element.createElement(
		wp.editPost.PluginPrePublishPanel,
		{
			className: 'campus-a11y-publish-panel campus-a11y-insights-check-container',
            title: campus_a11y_insights.panel_title,
            initialOpen: true,
		},
		insight()
	);
};

const boot = () => {
	if ( ! wp.data.select( 'core/editor' ).isCurrentPostPublished() ) {
		wp.plugins.registerPlugin( 'campus-a11y-prepublish', { render: prepublisher } );
		if ( ! isLocked() && ! isChecked() ) {
			lock();
		}
	}
	wp.data.subscribe( () => {
		const data = wp.data.select( 'core/editor' );
		if ( data.hasChangedContent() && data.isEditedPostDirty() ) {
			setPostUnchecked();
		} else {
			setPostChecked();
		}
	} );
};

export default () => {
	image.extendCoreImageBlock();
	setTimeout( boot );
}

