module.exports = (e, mainWindow, app) => {
  e.ipcMain.on('file-opened', (e, args) => {
    if (typeof args.recentFile[args.recentFile.length - 1] === 'string') {
      mainWindow.setRepresentedFilename(args.name);
      mainWindow.setTitle(args.name);
      app.addRecentDocument(args.recentFile[args.recentFile.length - 1]);
    } else {
      mainWindow.setRepresentedFilename(args.recentFile[args.recentFile.length - 1].name);
      mainWindow.setTitle(args.recentFile[args.recentFile.length - 1].name);
      app.addRecentDocument(args.recentFile[args.recentFile.length - 1].directory);
    }
  });
};
// BrowserWindow.getFocusedWindow().;
