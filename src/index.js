const electron = require('electron');
const { app, BrowserWindow } = electron;
const ZditorApp = require('./app/Zditor');
const evens = require('./app/Events/evens');
const zditorFileHandler = require('./app/components/FileHandler');
require('@electron/remote/main').initialize();

let Zditor, settingsWindow, aboutWindow;

//   // TODO: 添加保存功能，保持markdown预览同步，修改预览主题。

//   // TODO: 设置进入页面的样式，加入预览功能

//   // TODO: 增加显示快捷键的页面

app.on('window-all-closed', (e) => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('open-file', (e, path) => {
  let fileStructure;
  if (path.endsWith('.md')) {
    fileStructure = path.slice(0, path.lastIndexOf('/'));
  } else {
    fileStructure = path;
  }
  zditorFileHandler
    .fileHandler([fileStructure])
    .then((files) => {
      if (files.length > 0) {
        // Zditor.mainWindow.webContents.reload();
        Zditor.mainWindow.webContents.send('Open Directory', files);
        if (path.endsWith('.md')) {
          Zditor.mainWindow.webContents.send('click-file', path);
        }
      }
    })
    .catch((err) => console.log(err));
});
app.on('ready', () => {
  Zditor = new ZditorApp();
  evens(electron, Zditor.mainWindow, Zditor.state.winState, zditorFileHandler.fileHandler, app);
});

electron.ipcMain.handle('open-settings', (e, args) => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
  } else {
    settingsWindow = require('./app/subWindow/sub-window')('settings.html');
  }
});
// electron.ipcMain.handle('open-about', (e, args) => {
//   if (aboutWindow && !aboutWindow.isDestroyed()) {
//     aboutWindow.show();
//   } else {
//     aboutWindow = require('./app/subWindow/sub-window')('about.html');
//   }
// });
app.on('open-url', (events, url) => {
  events.preventDefault();
  electron.shell.openExternal(url);
});
app.on('activate', () => {
  Zditor.mainWindow.show();
});
app.on('before-quit', (e) => {
  Zditor.mainWindow.webContents.send('will-quit');
  app.quitting = true;
});
// "@electron-forge/cli": "^6.0.4",
// "@electron-forge/maker-deb": "^6.0.4",
// "@electron-forge/maker-rpm": "^6.0.4",
// "@electron-forge/maker-squirrel": "^6.0.4",
// "electron": "^22.0.0",
// "@electron-forge/maker-zip": "^6.0.4"
