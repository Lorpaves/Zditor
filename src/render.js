const { ipcRenderer } = require('electron');
const remote = require('@electron/remote');
const { dialog, nativeTheme, app, webContents, BrowserWindow, clipboard, shell, Menu } = remote;
const SideBar = require('./app/components/SideBar');
const {
  writeFile,
  files2structure,
  fileHandler,
  renameFile,
  getFileNameFromPath,
} = require('./app/components/FileHandler');
const { hideNextAll } = require('./app/components/animation');
const zEditor = require('./app/components/Editor');
const { gsap } = require('./utils/gsap/gsap.min.js');
const { ScrollToPlugin } = require('./utils/gsap/ScrollToPlugin.min.js');
const { ScrollTrigger } = require('./utils/gsap/ScrollTrigger.min.js');
const {
  searchText,
  flattenElement,
  searchEditorLineByQuery,
  formatPreviewQuery,
  searchPreviewLineByQuery,
} = require('./app/components/QueryHelper.js');
const { handleContextmenu, getTarget } = require('./app/components/handle-contextmenu/handleContextmenu');
const tocbot = require('tocbot');
const { insertBefore, insertAround } = require('./app/components/EditorInsert.js');
const Zditor = require('./app/Zditor');
nativeTheme.themeSource = window.config ? window.config.appearance.colorTheme : 'system';
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
let zeditor = new zEditor(document.querySelector('.editor-container'), {
  isFormat: window.config ? window.config.editor.formatWhenSave : true,
  indentUnit: window.config ? parseInt(window.config.editor.indentSize) : 4,
  matchBrackets: window.config ? window.config.editor.matchBrackets : true,
  theme: window.config ? window.config.appearance.editorTheme : 'zditor',
  cursorHeight: window.config ? parseFloat(window.config.editor.cursorHeight) : 1,
  isFormatWhenOpen: window.config ? window.config.editor.formatWhenOpen : true,
  autoSave: window.config ? window.config.editor.autoSave : true,
  autoCloseBrackets: window.config ? window.config.editor.autoCloseBrackets : true,
});
let Editor = zeditor.cm();
const parentNode = $('.tree');

const openFileConfig = window.config ? window.config.general.onLaunch : 'Restore last closed folder';
// NOTE: 判断上次打开文件，存在则打开
if (lastOpened && openFileConfig === 'Restore last closed folder') {
  $('.welcome').addClass('hidden');
  $('.main').removeClass('hidden');
  ipcRenderer.send('Update Storage', [lastOpened[0].directory]);
  if (document.querySelector('.tree').childNodes.length > 0) {
    hideNextAll($('.sub-dir__name'), '');
  }
} else if (openFileConfig === 'Open new file') {
  ipcRenderer.send('new-file');
}
const clickFileElement = (path) => {
  const fElements = document.querySelectorAll('.sub-dir__file');
  for (const fElement of fElements) {
    if ($(fElement).attr('data-set') === path) {
      $(fElement).click();
      break;
    }
  }
};
// NOTE: 打开文件
ipcRenderer.on('Open File', async (e, filePaths) => {
  $('.welcome').addClass('hidden');
  $('.main').removeClass('hidden');
  if (parentNode.has()) {
    parentNode.children().remove();
  }

  const fileStructure = files2structure(filePaths);

  await SideBar.addDirToSideBar([fileStructure], parentNode)
    .then((r) => {
      const exist = sidebarItems.some((item) => JSON.stringify(item) === JSON.stringify[fileStructure]);
      if (!exist) {
        sidebarItems.push([fileStructure]);
        SideBar.saveToLocalStorage('file-objects', sidebarItems);
      }
      lastOpened = [fileStructure];
      SideBar.saveToLocalStorage('last-opened', lastOpened);
    })
    .then(clickFileElement(filePaths));
});

// NOTE: 打开最近的文件，显示该文件在编辑器中
ipcRenderer.on('click-file', (e, path) => {
  clickFileElement(path);
});
// NOTE: 打开文件夹
ipcRenderer.on('Open Directory', async (e, dirPaths) => {
  $('.welcome').addClass('hidden');
  $('.main').removeClass('hidden');
  if (parentNode.has()) {
    parentNode.children().remove();
  }
  zeditor.root = dirPaths;
  await SideBar.addDirToSideBar(dirPaths, parentNode)
    .then((r) => {
      const exist = sidebarItems.some((item) => JSON.stringify(item) === JSON.stringify(dirPaths));
      if (!exist) {
        sidebarItems.push(dirPaths);
        SideBar.saveToLocalStorage('file-objects', sidebarItems);
      }
      lastOpened = dirPaths;
      SideBar.saveToLocalStorage('last-opened', lastOpened);
      sidebarItems.forEach((item) =>
        recentFile.push({ directory: item[0].directory, name: SideBar.formatDirTitle(item[0].directory) })
      );

      ipcRenderer.send('file-opened', { recentFile: recentFile });
    })
    .then((r) => {
      if (zeditor.path !== '') {
        clickFileElement(zeditor.path);
      }
    });
});

// NOTE: 另存为文件
ipcRenderer.on('saveAs', (event, filePath) => {
  writeFile(filePath, Editor.getValue())
    .then((r) => {})
    .catch((error) => {});
});
// NOTE: 保存文件
ipcRenderer.on('saving-file', async (event, filePath) => {
  if (zeditor.path.length > 0) {
    await writeFile(zeditor.path, Editor.getValue())
      .then((r) => {
        zeditor.setRawContent(Editor.getValue());
        $('.editor-preview').html(zeditor.getMarkdown());
        return 'saved';
      })
      .catch((error) => dialog.showErrorBox('Failed', 'Failed to save'));
  } else {
    dialog
      .showSaveDialog({
        buttonLabel: 'Save',
        properties: ['createDirectory'],
        filters: [{ name: 'Markdown', extensions: ['md'] }],
      })
      .then(async (r) => {
        if (r.filePath.length > 0) {
          await writeFile(r.filePath, Editor.getValue());
          slashIndex = r.filePath.lastIndexOf('/');
          dir = r.filePath.slice(0, slashIndex);
          return {
            directory: dir,
            filePaths: [r.filePath],
          };
        }
        return null;
      })
      .then((structure) => {
        if (structure) {
          SideBar.addDirToSideBar([structure], $('.tree'));
        }
      })
      .then($('.sidebar').removeClass('hidden'))
      .catch((err) => {});
  }
});
ipcRenderer.on('clear-history', (e) => {
  app.clearRecentDocuments();
});

// NOTE: 调节窗口大小
$('.sidebar').resizable();
$('.sidebar').resizable('option', 'handles', 'e');
$('.CodeMirror').resizable();
$('.CodeMirror').resizable('option', 'handles', 'e');

// NOTE: 创建新的文件
ipcRenderer.on('New File', (e, args) => {
  $('.welcome').addClass('hidden');
  $('.main').removeClass('hidden');
  if (zeditor.path !== '') {
    if (zeditor.path.endsWith('.md')) {
      defaultPath = zeditor.path.slice(0, zeditor.path.length - 3);
    } else defaultPath = zeditor.path;
    if (lastOpened) {
      dialog
        .showSaveDialog({
          buttonLabel: 'Create',
          properties: ['createDirectory'],
          showsTagField: true,
          defaultPath: defaultPath,
          securityScopedBookmarks: true,
          filters: [{ name: 'Markdown', extensions: ['md'] }],
        })
        .then(async (r) => {
          if (!r.canceled) {
            await writeFile(r.filePath, '');
            zeditor.path = r.filePath;
            slashIndex = r.filePath.lastIndexOf('/');
            dir = r.filePath.slice(0, slashIndex);
            ipcRenderer.send('Update Storage', [dir]);
          }
        });
    }
  } else {
    dialog
      .showSaveDialog({
        buttonLabel: 'Create',
        properties: ['createDirectory'],
        showsTagField: true,
        defaultPath: app.getPath('documents'),
        filters: [{ name: 'Markdown', extensions: ['md'] }],
      })
      .then(async (r) => {
        if (!r.canceled) {
          await writeFile(r.filePath, '');
          slashIndex = r.filePath.lastIndexOf('/');
          dir = r.filePath.slice(0, slashIndex);
          zeditor.path = r.filePath;
          return {
            directory: dir,
            filePaths: [r.filePath],
          };
        }
        return null;
      })
      .then((r) => {
        if (r) {
          SideBar.addDirToSideBar([r], $('.tree'));
          ipcRenderer.send('Update Storage', [r.directory]);
        }
      });
  }
});

// NOTE: 打开设置窗口
ipcRenderer.on('open-settings', (e, args) => {
  ipcRenderer.invoke('open-settings');
});
// NOTE: 双击放大
$('.title-bar__title, .title-bar').dblclick(() => {
  const window = remote.getCurrentWindow();
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
});
// NOTE: 搜索
ipcRenderer.on('Search', (e) => {
  if (!$('.search-box').hasClass('hidden')) {
    $('.search-box').addClass('hidden');
    $('.CodeMirror-scroll').removeClass('margin-top');
  } else {
    $('.search-box').removeClass('hidden');
    $('.CodeMirror-scroll').addClass('margin-top');
  }
});

// NOTE: 右击菜单栏

// NOTE: 重命名文件/文件夹
ipcRenderer.on('Rename File', (event) => {
  const handleFileChange = (self, changedTitle) => {
    $(zeditor.domParent).attr('name', changedTitle.slice(0, changedTitle.length - 3));
    $(zeditor.domParent).attr('data-set', zeditor.path);
    $('.title-bar__title').html(changedTitle);
    $(self)
      .parent()
      .html(
        `${changedTitle.slice(
          0,
          changedTitle.length - 3
        )}<input class="rename-input" type="text" spellcheck="false" value="${changedTitle}"/>`
      );
  };
  const handleDirChange = (self, changedTitle, newPath) => {
    $(self)
      .parent()
      .html(`${changedTitle}<input class="rename-input" spellcheck="false" type="text" value="${changedTitle}"/>`);

    $(zeditor.domParent).attr('name', changedTitle.slice(0, changedTitle.length - 3));
    $(zeditor.domParent).attr('data-set', newPath);
    const nodes = flattenElement(zeditor.domParent.parentNode);
    nodes.forEach((node) => {
      if (zeditor.domParent !== node) {
        if ($(node).is('li')) {
          const originPath = $(node).attr('data-set');
          $(node).attr('data-set', originPath.replace(/^\/(.+)\//, `${newPath}/`));
        } else if ($(node).hasClass('sub-dir__name')) {
          $(node).attr('data-set', originPath.replace(/^\/(.+)$/, `${newPath}`));
        }
      }
    });
  };
  const handleRenameEvent = (self) => {
    const changedTitle = $(self).val();
    const newPath = `${getFileNameFromPath(zeditor.path).directory}/${changedTitle}`;
    renameFile(zeditor.path, newPath)
      .then((p) => {
        zeditor.path = p;
        if (zeditor.isFile) {
          handleFileChange(self, changedTitle);
        } else {
          handleDirChange(self, changedTitle, p);
        }
      })
      .catch((err) => {});
  };
  $(zeditor.domParent).click();
  $(zeditor.dom).css('display', 'block');
  if (zeditor.isFile) {
    zeditor.dom.setSelectionRange(0, zeditor.dom.value.length - 3);
    $(zeditor.dom).focus();
  } else {
    zeditor.dom.select();
    $(zeditor.dom).focus();
  }
  $('.sub-dir__name, .sub-dir__file, .main, .title-bar').on('click', function () {
    if (this !== zeditor.domParent) {
      $(zeditor.dom).css('display', 'none');
      handleRenameEvent(zeditor.dom);
    }
  });
  $(zeditor.dom).on('keyup', function (e) {
    if (e.which === 27) {
      handleRenameEvent(this);
    }
  });
  $(zeditor.dom).on('change', function (e) {
    handleRenameEvent(this);
  });
});

// NOTE: 在访达中显示文件
ipcRenderer.on('Open in Finder', () => {
  remote.shell.showItemInFolder(zeditor.path);
});

// NOTE: 删除文件
ipcRenderer.on('Delete', async () => {
  if (zeditor.path !== '') {
    await shell.trashItem(zeditor.path);
    ipcRenderer.send('Update Storage', [lastOpened[0].directory]);
  }
});

// NOTE: 拷贝文件路径
ipcRenderer.on('Copy File Path', () => {
  if (zeditor.path !== '') {
    clipboard.writeText(zeditor.path);
    // ipcRenderer.send('Update Storage', [lastOpened[0].directory]);
  }
});

// NOTE: 文档插入快捷键
ipcRenderer.on('Insert Before', (e, chars) => {
  insertBefore(Editor, chars);
});
ipcRenderer.on('Insert Around', (e, chars) => {
  insertAround(Editor, chars[0], chars[1]);
  if (/^[`{2,}\${2,}]+(.+)/.exec(chars[0])) Editor.execCommand('goLineEnd');
  else
    for (let i = 0; i < chars[0].length; i++) {
      Editor.execCommand('goColumnRight');
    }
});

// TODO: 设置窗口
// TODO: 1. 添加主题设置
// TODO: 2. 添加字体更换
const toggleSidebar = (isShow) => {
  if (!isShow) {
    gsap.to(document.querySelector('.sidebar'), { x: '-400', display: 'none' });
    gsap.fromTo(document.querySelector('.hide-sidebar'), { left: '1.3rem' }, { left: '8rem' }, '<100%');
  } else {
    gsap.fromTo(
      document.querySelector('.sidebar'),
      { x: -400, opacity: 0, width: '0' },
      {
        x: 0,
        display: 'flex',
        opacity: 1,
        ease: 'power2',
      }
    );
    gsap.to(document.querySelector('.hide-sidebar'), { left: '1.3rem' }, '<100%');
  }
};
const isShowSideBar = window.config ? window.config.general.showSidebar : true;
toggleSidebar(isShowSideBar);
// NOTE: config
ipcRenderer.on('Update Config', (e, config) => {
  window.config = config;
});
ipcRenderer.on('update-show-sidebar', (e, showSidebar) => {
  toggleSidebar(showSidebar);
});
ipcRenderer.on('update-editor-theme', (e, theme) => {
  Editor.setOption('theme', theme);
});
ipcRenderer.on('update-app-font-family', (e, fontFamily) => {
  console.log(fontFamily);
  $(':root').css('--font-base', fontFamily);
});
ipcRenderer.on('update-app-font-size', (e, fontSize) => {
  console.log(fontSize);
  $(':root').css('--font-base-size', `${fontSize}px`);
});

ipcRenderer.on('update-editor-font-family', (e, fontFamily) => {
  console.log(fontFamily);
  $(':root').css('--font-editor', fontFamily);
});
ipcRenderer.on('update-editor-font-size', (e, fontSize) => {
  console.log(fontSize);
  $(':root').css('--font-editor-size', `${fontSize}px`);
});

ipcRenderer.on('update-editor-code-font-family', (e, fontFamily) => {
  console.log(fontFamily);
  $(':root').css('--font-code', fontFamily);
});
ipcRenderer.on('update-editor-code-font-size', (e, fontSize) => {
  console.log(fontSize);
  $(':root').css('--font-code-size', `${fontSize}px`);
});

ipcRenderer.on('update-indent', (e, indent) => {
  console.log(indent);
  Editor.setOption('indentUnit', parseInt(indent));
});
ipcRenderer.on('update-auto-save', (e, autoSave) => {
  console.log(autoSave);
  zeditor.autoSave = autoSave;
});
ipcRenderer.on('update-format-when-open', (e, formatWhenOpen) => {
  console.log(formatWhenOpen);
  zeditor.isFormatWhenOpen = formatWhenOpen;
});
ipcRenderer.on('update-format-when-save', (e, formatWhenSave) => {
  console.log(formatWhenSave);
  zeditor.isFormat = formatWhenSave;
});
ipcRenderer.on('update-match-brackets', (e, matchBrackets) => {
  console.log(matchBrackets);
  Editor.setOption('matchBrackets', matchBrackets);
});
ipcRenderer.on('update-auto-close-brackets', (e, autoCloseBrackets) => {
  console.log(autoCloseBrackets);
  Editor.setOption('autoCloseBrackets', autoCloseBrackets);
});
ipcRenderer.on('update-cursor-height', (e, cursorHeight) => {
  console.log(cursorHeight);
  Editor.setOption('cursorHeight', parseFloat(cursorHeight));
});
$(window).ready(function () {
  if (window.config) {
    $(':root').css('--font-base', window.config.appearance.appFont.fontFamily);
    $(':root').css('--font-base-size', `${window.config.appearance.appFont.fontSize}px`);
    $(':root').css('--font-editor', window.config.appearance.editorFont.fontFamily);
    $(':root').css('--font-editor-size', `${window.config.appearance.editorFont.fontSize}px`);
    $(':root').css('--font-code', window.config.appearance.codeblockFont.fontFamily);
    $(':root').css('--font-code-size', `${window.config.appearance.codeblockFont.fontSize}px`);
  }
});

// NOTE: export

ipcRenderer.on('export-pdf', (e) => {
  dialog.showSaveDialog(require('./app/components/dialogs/pdf')).then(async (r) => {
    if (!r.canceled) {
      await require('./app/components/export/pdf')(r);
    }
  });
});
ipcRenderer.on('export-html', (e) => {
  dialog.showSaveDialog(require('./app/components/dialogs/html')).then((r) => {
    if (!r.canceled) {
      require('./app/components/export/html')(zeditor, r);
    }
  });
});
// TODO: 完善菜单栏
ipcRenderer.on('clear-local-storage', (e) => {
  localStorage.clear();
});

ipcRenderer.on('will-quit', (e) => {
  if (!zeditor.autoSave) {
    if (zeditor.path === '') {
      dialog
        .showSaveDialog({
          buttonLabel: 'Save',
          properties: ['createDirectory'],
          filters: [{ name: 'Markdown', extensions: ['md'] }],
        })
        .then(async (r) => {
          if (r.filePath.length > 0) {
            await writeFile(r.filePath, Editor.getValue());
          }
        });
    } else if (zeditor.isFile) {
      writeFile(zeditor.path, Editor.getValue());
    }
  }
});
// ipcRenderer.on('open-about', (e) => {
//   ipcRenderer.invoke('open-about');
// });
