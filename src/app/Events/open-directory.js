module.exports = (e, mainWindow, winState, fileHandler) =>
  e.ipcMain.on('open-dir', (event, args) => {
    e.dialog
      .showOpenDialog(mainWindow, {
        buttonLabel: 'Select Directory',
        defaultPath: winState.path,
        properties: ['createDirectory', 'openDirectory'],
        filters: [{ name: 'Markdown', extensions: ['md'] }],
      })
      .then((r) => {
        if (r.filePaths.length > 0) {
          fileHandler(r.filePaths).then((files) => {
            if (files.length > 0) {
              mainWindow.webContents.send('Open Directory', files);
            }
          });
        }
      })
      .catch((e) => {});
  });
