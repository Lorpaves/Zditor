const windowStateKeeper = require('electron-window-state');
const { app } = require('electron');
module.exports = {
  winState: windowStateKeeper({
    defaultWidth: 968,
    defaultHeight: 742,
    path: app.getPath('home'),
  }),
  App: app,
  display: require('electron').screen.getPrimaryDisplay(),
};
