module.exports = [
  {
    label: 'New File',
    accelerator: 'CmdOrCtrl+N',
    click: (menuItem, browserWindow, event) => browserWindow.webContents.send('New File'),
  },

  {
    label: 'Delete',
    accelerator: 'CmdOrCtrl+D',
    click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Delete'),
  },
  {
    label: 'Rename',
    accelerator: 'Shift+Enter',
    click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Rename File'),
  },
  { type: 'separator' },
  {
    label: 'Save File',
    id: 'Save File',
    accelerator: 'CmdOrCtrl+S',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('saving-file');
    },
  },

  {
    label: 'Save As',
    id: 'Save As',
    accelerator: 'CmdOrCtrl+Shift+S',
    click: (menuItem, browserWindow, event) => {
      dialog
        .showSaveDialog(browserWindow, {
          buttonLabel: 'Save',
          defaultPath: app.getPath('documents'),
          filters: [{ name: 'Markdown', extensions: ['md'] }],
        })
        .then((r) => {
          browserWindow.webContents.send('saveAs', r.filePath);
        });
    },
  },
  { type: 'separator' },
  {
    label: 'Copy Path',
    accelerator: 'CmdOrCtrl+Shift+C',
    click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Copy File Path'),
  },
  {
    label: 'Reveal in Finder',
    accelerator: process.platform === 'darwin' ? 'Option+Shift+R' : 'Ctrl+Shift+R',
    click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Open in Finder'),
  },
];

// {
//   label: 'File',
//   submenu: [
//     {
//       label: 'Settings',
//       id: 'Settings',
//       accelerator: 'CmdOrCtrl+,',
//       click: (menuItem, browserWindow, event) => {
//         browserWindow.webContents.send('open-settings');
//       },
//     },
//     {
