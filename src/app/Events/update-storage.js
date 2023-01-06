module.exports = (e, mainWindow, fileHandler) => {
  e.ipcMain.on('Update Storage', (e, dir) => {
    console.log(dir);
    fileHandler(dir).then((files) => {
      if (files.length > 0) {
        console.log(files);
        mainWindow.webContents.send('Open Directory', files);
      }
    });
  });
};
