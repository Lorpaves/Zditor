const { BrowserWindow } = require('electron');
module.exports = class ZditorWindow {
  constructor(state, menu, options) {
    this.state = state;
    this.winState = this.state.winState;
    this.display = this.state.display;
    this.App = this.state.App;
    this.path = require('path');
    this.menu = menu;
    this.mainWindow = new BrowserWindow({
      width: this.winState.width,
      height: this.winState.height,
      minWidth: 665,
      minHeight: 250,
      maxHeight: options.maxHeight || this.display.size.height,
      maxWidth: options.maxWidth || this.display.size.width,
      x: options.x || this.winState.x,
      y: options.y || this.winState.y,
      title: options.title || this.App.getName(),
      icon: this.path.join(this.App.getAppPath(), 'src/assets/icon/icon-512.icns'),
      vibrancy: 'under-window',
      transparent: true,
      visualEffectState: 'active',
      backgroundColor: '#f5f5f500',
      frame: false,
      titleBarStyle: 'hidden',
      trafficLightPosition: {
        x: 15,
        y: 13, // macOS traffic lights seem to be 14px in diameter. If you want them vertically centered, set this to `titlebar_height / 2 - 7`.
      },
      titleBarOverlay: {
        // color: '#2f3241',
        symbolColor: '#74b1be',
        height: 40,
      },
      webPreferences: {
        preload: this.path.join(this.App.getAppPath(), 'src/preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModules: true,
        enableDragging: false,
      },
    });
  }
};
