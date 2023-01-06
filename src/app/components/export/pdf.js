// const opt = {
//   marginsType:window.config? window.config.

module.exports = async (r) => {
  const opt = window.config ? window.config.export.pdf : {};

  const fs = require('fs');
  const win = BrowserWindow.getFocusedWindow();
  const hide = (node) => {
    if (!$(node).hasClass('hide')) {
      $(node).addClass('hide');
    }
  };
  const show = (node) => {
    if ($(node).hasClass('hide')) {
      $(node).removeClass('hide');
    }
  };
  const toggleCls = (node, cls) => {
    if ($(node).hasClass(cls)) $(node).removeClass(cls);
    else $(node).addClass(cls);
  };
  toggleSidebar(false);
  const excludeNodes = ['.main__title-bar', '.CodeMirror'];
  excludeNodes.forEach((node) => hide(node));
  toggleCls('.sidebar', 'hidden');
  toggleCls('.editor-preview-box', 'full-screen');
  toggleCls('.editor-preview-box', 'border-left');
  await win.webContents.printToPDF(opt).then((Buffer) => {
    fs.writeFile(r.filePath, Buffer, (error) => {
      if (error) throw error;
      excludeNodes.forEach((node) => show(node));
      toggleSidebar(true);
      toggleCls('.sidebar', 'hidden');
      toggleCls('.editor-preview-box', 'full-screen');
      toggleCls('.editor-preview-box', 'border-left');
      dialog
        .showMessageBox(BrowserWindow.getFocusedWindow(), {
          buttons: ['Confirm', 'Show', 'Cancel'],
          title: 'Task Done',
          message: 'Export to PDF task done',
        })
        .then((rs) => {
          if (rs.response === 1) {
            remote.shell.showItemInFolder(r.filePath);
          }
        });
    });
  });
};
