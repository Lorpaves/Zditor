module.exports = (e, mainWindow) => {
  e.ipcMain.on('config-changed', (e, args) => mainWindow.webContents.send('Update Config', args));
  e.ipcMain.on('update-show-sidebar', (e, showSidebar) =>
    mainWindow.webContents.send('update-show-sidebar', showSidebar)
  );

  e.ipcMain.on('update-app-theme', (event, theme) => (e.nativeTheme.themeSource = theme));
  e.ipcMain.on('update-editor-theme', (e, theme) => mainWindow.webContents.send('update-editor-theme', theme));
  e.ipcMain.on('update-app-font-family', (e, fontFamily) =>
    mainWindow.webContents.send('update-app-font-family', fontFamily)
  );
  e.ipcMain.on('update-app-font-size', (e, fontSize) => mainWindow.webContents.send('update-app-font-size', fontSize));
  e.ipcMain.on('update-editor-font-family', (e, fontFamily) =>
    mainWindow.webContents.send('update-editor-font-family', fontFamily)
  );
  e.ipcMain.on('update-editor-font-size', (e, fontSize) =>
    mainWindow.webContents.send('update-editor-font-size', fontSize)
  );
  e.ipcMain.on('update-editor-code-font-family', (e, fontFamily) =>
    mainWindow.webContents.send('update-editor-code-font-family', fontFamily)
  );
  e.ipcMain.on('update-editor-code-font-size', (e, fontSize) =>
    mainWindow.webContents.send('update-editor-code-font-size', fontSize)
  );
  e.ipcMain.on('update-indent', (e, indentSize) => mainWindow.webContents.send('update-indent', indentSize));
  e.ipcMain.on('update-auto-save', (e, autoSave) => mainWindow.webContents.send('update-auto-save', autoSave));
  e.ipcMain.on('update-format-when-open', (e, formatWhenOpen) =>
    mainWindow.webContents.send('update-format-when-open', formatWhenOpen)
  );
  e.ipcMain.on('update-format-when-save', (e, formatWhenSave) =>
    mainWindow.webContents.send('update-format-when-save', formatWhenSave)
  );
  e.ipcMain.on('update-match-brackets', (e, matchBrackets) =>
    mainWindow.webContents.send('update-match-brackets', matchBrackets)
  );
  e.ipcMain.on('update-auto-close-brackets', (e, autoCloseBrackets) =>
    mainWindow.webContents.send('update-auto-close-brackets', autoCloseBrackets)
  );
  e.ipcMain.on('update-cursor-height', (e, cursorHeight) =>
    mainWindow.webContents.send('update-cursor-height', cursorHeight)
  );
};
