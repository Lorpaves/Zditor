module.exports = (editorContextMenu) => {
  $('.CodeMirror').contextmenu(function (e) {
    editorContextMenu.popup({
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY,
    });
  });
};
