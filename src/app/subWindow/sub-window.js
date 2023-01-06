// const {BrowserWindow,app} = require('electron')
const path = require('path');
const { BrowserWindow, app } = require('electron');
const { winState } = require('../State/win-state');
module.exports = (page) => {
  let subWindow = new BrowserWindow({
    minHeight: 450,
    minWidth: 600,
    maxHeight: 450,
    maxWidth: 600,
    width: 600,
    height: 450,
    title: 'settings',
    frame: false,
    x: winState.x,
    y: winState.y,
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    transparent: true,
    visualEffectState: 'active',
    backgroundColor: '#f5f5f500',
    icon: path.join(app.getAppPath(), 'src/assets/icon/icon-512.icns'),
    // opacity: 0.95,
    trafficLightPosition: {
      x: 15,
      y: 11, // macOS traffic lights seem to be 14px in diameter. If you want them vertically centered, set this to `titlebar_height / 2 - 7`.
    },
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#74b1be',
      height: 40,
    },
    webPreferences: {
      preload: path.join(app.getAppPath(), 'src/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModules: true,
      experimentalFeatures: true,
    },
  });
  subWindow.webContents.loadFile(path.join(app.getAppPath(), `src/${page}`));
  winState.manage(subWindow);
  require('@electron/remote/main').enable(subWindow.webContents);
  return subWindow;
};
