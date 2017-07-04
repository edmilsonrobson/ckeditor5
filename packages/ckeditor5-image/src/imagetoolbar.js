/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetoolbar
 */

import Template from '@ckeditor/ckeditor5-ui/src/template';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import { isImageWidget } from './image/utils';
import ImageBalloonPanel from './image/ui/imageballoonpanelview';

/**
 * Image toolbar class. Creates image toolbar placed inside balloon panel that is showed when image widget is selected.
 * Toolbar components are created using editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}
 * based on {@link module:core/editor/editor~Editor#config configuration} stored under `image.toolbar`.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'image/imagetoolbar';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * When set to `true`, toolbar will be repositioned and showed on each render event and focus change.
		 * Set to `false` to temporary disable the image toolbar.
		 *
		 * @member {Boolean}
		 */
		this.isEnabled = true;
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const toolbarConfig = editor.config.get( 'image.toolbar' );

		// Don't add the toolbar if there is no configuration.
		if ( !toolbarConfig || !toolbarConfig.length ) {
			return;
		}

		const panel = this._panel = new ImageBalloonPanel( editor );
		const toolbar = new ToolbarView();

		// Add CSS class to the toolbar.
		Template.extend( toolbar.template, {
			attributes: {
				class: 'ck-editor-toolbar'
			}
		} );

		// Add CSS class to the panel.
		Template.extend( panel.template, {
			attributes: {
				class: [
					'ck-toolbar-container',
					'ck-editor-toolbar-container'
				]
			}
		} );

		// Add toolbar to balloon panel.
		panel.content.add( toolbar );

		// Add buttons to the toolbar.
		toolbar.fillFromConfig( toolbarConfig, editor.ui.componentFactory );

		// Add balloon panel to editor's UI.
		editor.ui.view.body.add( panel );

		// Show balloon panel each time image widget is selected.
		this.listenTo( this.editor.editing.view, 'render', () => {
			if ( this.isEnabled ) {
				this.show();
			}
		}, { priority: 'low' } );

		// There is no render method after focus is back in editor, we need to check if balloon panel should be visible.
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, is, was ) => {
			if ( !was && is && this.isEnabled ) {
				this.show();
			}
		} );
	}

	/**
	 * Shows the toolbar.
	 */
	show() {
		const selectedElement = this.editor.editing.view.selection.getSelectedElement();

		if ( selectedElement && isImageWidget( selectedElement ) ) {
			this._panel.attach();
		}
	}

	/**
	 * Hides the toolbar.
	 */
	hide() {
		this._panel.detach();
	}
}
