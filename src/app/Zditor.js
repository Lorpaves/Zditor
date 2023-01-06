const ZditorWindow = require('./MainWindow/main-window');
const { app } = require('electron');
module.exports = class Zditor {
  constructor() {
    this.menu = require('./Menu/menu');
    this.state = require('./State/win-state');
    // this.fileHandler = fileHandler;
    this.ZditorWindow = new ZditorWindow(this.state, this.menu.ZditorMenu, { minHeight: 800, minWidth: 600 });
    this.mainWindow = this.ZditorWindow.mainWindow;
    this.createZditor();
  }
  createZditor() {
    this.mainWindow.webContents.loadFile(`${this.state.App.getAppPath()}/src/index.html`);

    this.mainWindow.webContents.openDevTools();
    this.mainWindow.webContents.on('did-finish-load', (e, args) => {
      this.menu.Menu.setApplicationMenu(this.menu.ZditorMenu);
      this.state.winState.manage(this.mainWindow);
      e.sender.send('load-files');
    });

    this.mainWindow.on('close', (event) => {
      if (app.quitting) {
        this.mainWindow = null;
      } else {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });
    require('@electron/remote/main').enable(this.mainWindow.webContents);
  }
};
