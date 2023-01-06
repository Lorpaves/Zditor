const { dialog, app, ipcRenderer } = require('electron');
const { fileHandler } = require('../components/FileHandler');

module.exports = template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Settings',
        id: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('open-settings');
        },
      },
      { type: 'separator' },
      {
        label: 'New File',
        id: 'New File',
        accelerator: 'CmdOrCtrl+N',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('New File');
        },
      },
      {
        label: 'Open File',
        id: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: (menuItem, browserWindow, event) => {
          dialog
            .showOpenDialog(browserWindow, {
              buttonLabel: 'select files',
              defaultPath: app.getPath('documents'),
              properties: ['multiSelections', 'createDirectory', 'openFile'],
              filters: [{ name: 'Markdown', extensions: ['md'] }],
            })
            .then((r) => {
              if (r.filePaths.length > 0) {
                browserWindow.webContents.send('Open File', r.filePaths);
              }
            });
        },
      },
      {
        label: 'Open Directory',
        id: 'Open Directory',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: (menuItem, browserWindow, event) => {
          dialog
            .showOpenDialog(browserWindow, {
              buttonLabel: 'select directory',
              defaultPath: app.getPath('documents'),
              properties: ['createDirectory', 'openDirectory'],
              filters: [{ name: 'Markdown', extensions: ['md'] }],
            })
            .then((r) => {
              if (r.filePaths) {
                console.log(r.filePaths);
                fileHandler(r.filePaths).then((files) => {
                  if (files.length > 0) {
                    console.log(r.filePaths);
                    console.log(files);
                    browserWindow.webContents.send('Open Directory', files);
                  }
                });
              }
            });
        },
      },

      { type: 'separator' },
      {
        label: 'Save',
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
        label: 'Delete',
        id: 'Delete',
        enabled: false,
        accelerator: 'CmdOrCtrl+D',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Delete'),
      },
      {
        label: 'Rename',
        id: 'Rename',
        enabled: false,
        accelerator: 'Shift+Enter',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Rename File'),
      },
      {
        label: 'Copy Path',
        id: 'Copy Path',
        enabled: false,
        accelerator: 'CmdOrCtrl+Shift+C',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Copy File Path'),
      },
      {
        label: 'Reveal in Finder',
        id: 'Reveal in Finder',
        enabled: false,
        accelerator: process.platform === 'darwin' ? 'Option+Shift+R' : 'Ctrl+Shift+R',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Open in Finder'),
      },
      { type: 'separator' },
      {
        label: 'Recent Files',
        role: 'recentdocuments',
        submenu: [
          {
            label: 'Clear Recent',
            role: 'clearrecentdocuments',
            click: (menuItem, browserWindow, event) => browserWindow.webContents.send('clear-history'),
          },
        ],
        id: 'Recent Files',
      },
      { type: 'separator' },
      {
        label: 'Clear Local Storage',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('clear-local-storage'),
      },
      { type: 'separator' },
      {
        label: 'Export',
        id: 'Export',
        enabled: false,
        submenu: [
          {
            label: 'PDF',
            accelerator: 'CmdOrCtrl+Shift+P',
            click: (menuItem, browserWindow, event) => {
              browserWindow.webContents.send('export-pdf');
            },
          },
          {
            label: 'HTML',
            accelerator: 'CmdOrCtrl+Shift+H',
            click: (menuItem, browserWindow, event) => {
              browserWindow.webContents.send('export-html');
            },
          },
        ],
      },
    ],
  },

  {
    label: 'Edit',
    // role: 'editMenu',
    id: 'Edit',
    submenu: [
      // { role: 'editMenu' },
      { role: 'undo' },
      ,
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle', accelerator: 'CmdOrCtrl+Shift+V' },
      { role: 'delete' },
      { role: 'selectall' },
      { type: 'separator' },
      {
        label: 'Find',
        accelerator: 'CmdOrCtrl+F',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Search'),
      },
    ],
  },
  {
    label: 'Insert',
    enabled: false,
    id: 'Insert',
    submenu: [
      {
        label: 'Heading 1',
        accelerator: 'CmdOrCtrl+1',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '#'),
      },
      {
        label: 'Heading 2',
        accelerator: 'CmdOrCtrl+2',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '##'),
      },
      {
        label: 'Heading 3',
        accelerator: 'CmdOrCtrl+3',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '###'),
      },
      {
        label: 'Heading 4',
        accelerator: 'CmdOrCtrl+4',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '####'),
      },
      {
        label: 'Heading 5',
        accelerator: 'CmdOrCtrl+5',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '#####'),
      },
      {
        label: 'Heading 6',
        accelerator: 'CmdOrCtrl+6',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '######'),
      },
      { type: 'separator' },
      {
        label: 'Bold',
        accelerator: 'CmdOrCtrl+Shift+B',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Around', ['**', '**']),
      },
      {
        label: 'Italic',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Around', ['*', '*']),
      },
      {
        label: 'Strike',
        accelerator: 'CmdOrCtrl+Shift+E',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Around', ['~~', '~~']),
      },
      { type: 'separator' },
      {
        label: 'Quote',
        accelerator: 'CmdOrCtrl+T',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '>'),
      },
      { type: 'separator' },
      {
        label: 'Image',
        accelerator: 'CmdOrCtrl+Shift+P',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Around', ['![', ']()']),
      },
      {
        label: 'HyperLink',
        accelerator: 'CmdOrCtrl+Shift+H',
        click: (menuItem, browserWindow, event) =>
          browserWindow.webContents.send('Insert Around', ['[', '](https://)']),
      },
      { type: 'separator' },
      {
        label: 'CodeBlock',
        accelerator: 'CmdOrCtrl+`',
        click: (menuItem, browserWindow, event) =>
          browserWindow.webContents.send('Insert Around', ['```\r\n', '\r\n```']),
      },
      {
        label: 'Inline Code',
        accelerator: 'CmdOrCtrl+Shift+`',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Around', ['`', '`']),
      },
      { type: 'separator' },
      {
        label: 'Ordered List',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '1.'),
      },
      {
        label: 'Unordered List',
        accelerator: 'CmdOrCtrl+Shift+L',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Before', '-'),
      },
      { type: 'separator' },
      {
        label: 'Inline Math',
        accelerator: 'CmdOrCtrl+M',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Around', ['$', '$']),
      },
      {
        label: 'Math Block',
        accelerator: 'CmdOrCtrl+Shift+M',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Around', ['$$\r\n', '\r$$']),
      },
      { type: 'separator' },
      {
        label: 'Footnote',
        accelerator: 'CmdOrCtrl+Shift+F',
        click: (menuItem, browserWindow, event) => browserWindow.webContents.send('Insert Around', ['[^', ']']),
      },
    ],
  },

  {
    label: 'View',
    submenu: [
      // { role: 'reload' },
      // { role: 'forcereload' },
      // { role: 'toggledevtools' },
      // { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  {
    role: 'window',
    submenu: [{ role: 'minimize' }, { role: 'close' }],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About',
        click() {
          require('electron').shell.openExternal('https://github.com/Lorpaves/Zditor');
        },
      },
    ],
  },
];
if (process.platform === 'darwin') {
  template.unshift({
    label: 'Zditor',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  });

  // Edit menu
  template[2].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
    }
  );

  // Window menu
  template[4].submenu = [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' },
  ];
}
// const recentFiles = app.;
// recentFiles.forEach((file) => {
//   template[0].submenu[0].submenu.push({
//     label: file.displayName,
//     click() {
//       /* 这里可以添加打开文件的代码 */
//     },
//   });
// });
