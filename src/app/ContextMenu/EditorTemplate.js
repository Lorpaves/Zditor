module.exports = [
  // { role: 'editMenu' },

  { role: 'copy', accelerator: 'CmdOrCtrl+C' },
  { role: 'cut', accelerator: 'CmdOrCtrl+X' },
  { role: 'paste', accelerator: 'CmdOrCtrl+V' },
  { role: 'pasteAndMatchStyle', accelerator: 'CmdOrCtrl+Shift+V' },
  { role: 'selectAll', accelerator: 'CmdOrCtrl+A' },
  { role: 'delete' },
  { type: 'separator' },
  { role: 'undo', accelerator: 'CmdOrCtrl+Z' },
  { role: 'redo', accelerator: 'CmdOrCtrl+Shift+Z' },
  { type: 'separator' },

  {
    label: 'Speech',
    submenu: process.platform === 'darwin' ? [{ role: 'startspeaking' }, { role: 'stopspeaking' }] : [],
  },
  { type: 'separator' },
  {
    label: 'Find',
    accelerator: 'CmdOrCtrl+F',
    click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Search'),
  },
];
