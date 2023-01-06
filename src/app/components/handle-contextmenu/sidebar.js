const getTarget = (zeditor, index, e) => {
  if (zeditor.dom) {
    $(zeditor.dom).css('display', 'none');
  }
  zeditor.path = $(e.delegateTarget).attr('data-set');

  zeditor.dom = flattenElement(e.delegateTarget)[index];
  zeditor.domParent = e.delegateTarget;
  if (index === 5) {
    zeditor.isFile = true;
  } else zeditor.isFile = false;
};
module.exports.default = (zeditor, fileContextMenu) => {
  $('.sub-dir__name').contextmenu(function (e) {
    getTarget(zeditor, 1, e);
    const x = e.originalEvent.clientX,
      y = e.originalEvent.clientY;

    fileContextMenu.popup({
      x: x,
      y: y,
    });
  });
  $('.sub-dir__file').contextmenu(function (e) {
    getTarget(zeditor, 5, e);
    const x = e.originalEvent.clientX,
      y = e.originalEvent.clientY;
    fileContextMenu.popup({
      x: x,
      y: y,
    });
  });
};
module.exports.getTarget = getTarget;
