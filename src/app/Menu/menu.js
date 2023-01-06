const { Menu } = require('electron');
const menu = Menu.buildFromTemplate(require('./template'));
module.exports = { ZditorMenu: menu, Menu: Menu };
