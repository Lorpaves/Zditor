// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer } = require('electron');

window.api = {
  newFile: () => {
    ipcRenderer.send('new-file');
  },
  openFile: () => {
    ipcRenderer.send('open-file');
  },
  openDir: () => {
    ipcRenderer.send('open-dir');
  },
  path: __dirname,
};
