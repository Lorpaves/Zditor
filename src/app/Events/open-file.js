module.exports = (e, mainWindow, winState) =>
  e.ipcMain.on('open-file', (event, args) => {
    e.dialog
      .showOpenDialog(mainWindow, {
        buttonLabel: 'Select File',
        defaultPath: winState.path,
        properties: ['multiSelections', 'createDirectory', 'openFile'],
        filters: [{ name: 'Markdown', extensions: ['md'] }],
      })
      .then((r) => {
        if (r.filePaths.length > 0) {
          mainWindow.webContents.send('Open File', r.filePaths);
        }
      });
  });
