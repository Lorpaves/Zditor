const style = require('./html/style');
const HTMLContent = require('./html/content');

module.exports = (zeditor, r) => {
  const data = HTMLContent.replace(/{{%TITLE%}}/g, zeditor.name.replace('.md', ''))
    .replace(/{{%STYLE%}}/g, style)
    .replace(/{{%CONTENT%}}/g, zeditor.getMarkdown());
  const fs = require('fs');
  fs.writeFile(r.filePath, data, (err) => {
    if (err) throw err;
    dialog
      .showMessageBox(BrowserWindow.getFocusedWindow(), {
        buttons: ['Confirm', 'Show', 'Cancel'],
        title: 'Task Done',
        message: 'Export to HTML task done',
      })
      .then((rs) => {
        if (rs.response === 1) {
          remote.shell.showItemInFolder(r.filePath);
        }
      });
  });
};
