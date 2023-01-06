module.exports = (e, mainWindow) => {
  e.ipcMain.on('new-file', (event) => {
    mainWindow.webContents.send('New File');
  });
};
