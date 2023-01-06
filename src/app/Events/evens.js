// module.exports = {
//   handleOpenDir: require('./open-directory'),
//   handleOpenFile: require('./open-file'),
//   handleTheme: require('./theme'),
//   handleStorage: require('./update-storage'),
//   handleTitleBar: require('./file-opened'),
//   handleConfig: require('./config'),
// };
module.exports = (e, mainWindow, winState, fileHandler, app) => {
  require('./open-directory')(e, mainWindow, winState, fileHandler);
  require('./open-file')(e, mainWindow, winState);
  require('./config')(e, mainWindow);
  require('./update-storage')(e, mainWindow, fileHandler);
  require('./file-opened')(e, mainWindow, app);
  require('./new-file')(e, mainWindow);
  require('./export')(e, mainWindow);
};
