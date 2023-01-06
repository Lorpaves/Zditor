const fileContextMenu = require('../../ContextMenu/FileContextMenu'),
  editorContextMenu = require('../../ContextMenu/EditorContextMenu');
module.exports.handleContextmenu = (zeditor) => {
  require('./editor')(editorContextMenu);
  require('./sidebar').default(zeditor, fileContextMenu);
};
module.exports.getTarget = require('./sidebar').getTarget;
