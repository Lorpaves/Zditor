const { editor2preview, scrollCheckBottom, scrollCheckTop, preview2editor } = require('./scroll.js');
// NOTE: 预览窗口与编辑器窗口同步
const p2e = () => {
  preview2editor();
  scrollCheckBottom(
    document.querySelector('.editor-preview-box'),
    document.querySelector('.CodeMirror-code'),
    document.querySelector('.CodeMirror-scroll')
  );
  scrollCheckTop(
    document.querySelector('.editor-preview-box'),
    document.querySelector('.CodeMirror-code'),
    document.querySelector('.CodeMirror-scroll')
  );
};
// NOTE: 编辑器窗口与预览窗口同步
const e2p = () => {
  editor2preview();
  scrollCheckBottom(
    document.querySelector('.CodeMirror-scroll'),
    document.querySelector('.editor-preview'),
    document.querySelector('.editor-preview-box')
  );
  scrollCheckTop(
    document.querySelector('.CodeMirror-scroll'),
    document.querySelector('.editor-preview'),
    document.querySelector('.editor-preview-box')
  );
};
const toggleCls = (node, cls) => {
  if (!node.hasClass(cls)) {
    node.addClass(cls);
  } else {
    node.removeClass(cls);
  }
};

// NOTE: 读取data到编辑器中
const c2e = (data) => {
  tocbot.destroy();
  tocbot.refresh();
  Editor.setValue('');
  Editor.clearHistory();
  zeditor.path = data.filePath;

  Editor.refresh();
  zeditor.setRawContent(data.rawContent);
  Editor.setValue(zeditor.rawContent);
  document.querySelector('.editor-preview').innerHTML = zeditor.getMarkdown();

  tocbot.init({
    tocSelector: '.toc',
    headingSelector: 'h1, h2, h3 ,h4, h5 ,h6',
    contentSelector: '.editor-preview',
  });
  $('.title-bar__title').html(`${zeditor.name}`);
};

// NOTE: 搜索文字
const markSearchQuery = () => {
  let TextMarkers = [],
    result,
    currentPos,
    replaceVal,
    history = [Editor.getDoc().getHistory()],
    currentTM = null,
    query = '';
  enter = 0;
  $('.search__input').focus();
  window.addEventListener('keyup', function () {
    if ($('.search-box').hasClass('hidden')) {
      TextMarkers.forEach((tm) => tm.clear());
    }
  });
  $('.search__input').on('keyup', function (e) {
    // $(this).on('keyup', function (e) {
    query = $(this).val();
    const doc = Editor.getDoc();
    Editor.refresh();
    const rs = searchText(Editor, query);
    result = rs.result;
    TextMarkers = [...TextMarkers, ...rs.TextMarkers];
    // let currentMarkers = TextMarkers.slice(TextMarkers.length - rs.TextMarkers.length - 2, TextMarkers.length - 1);
    TextMarkers.slice(0, TextMarkers.length - rs.TextMarkers.length - 1).forEach((TextMarker) => TextMarker.clear());
    if (query === '') {
      const article = doc.getValue();
      doc.setValue(article);
    }
    if (e.which === 13) {
      if (enter > result.length - 1) {
        enter = 0;
      }
      Editor.setSelection(result[enter].from, result[enter].to);
      Editor.setCursor(result[enter].to);
      if (currentTM) {
        currentTM.clear();
      }
      currentTM = Editor.markText(result[enter].from, result[enter].to, {
        className: 'search-highlight-current',
      });

      const fontSize = $('.search-highlight-current').css('font-size');
      try {
        const zoomFontSize = `${(parseInt(fontSize.slice(0, fontSize.length - 2)) + 5).toString()}px`;
        $('.search-highlight-current').css('font-size', zoomFontSize);
      } catch (err) {}
      currentPos = result[enter];
      enter++;
    }
    $(window).on('keyup', function (e) {
      if (e.which === 27) {
        $('.search-box').addClass('hidden');
        $('.CodeMirror-scroll').removeClass('margin-top');
      }
    });

    if (!$('.replace').hasClass('hidden')) {
      $('.replace-btn').click(function () {
        if (currentPos) {
          replaceVal = $('.replace__input').val();
          history.push(replaceSearchQuery(currentPos, replaceVal));
        } else {
          history.push(replaceSearchQuery(result[0], replaceVal));
        }
      });
      $('.replace-all-btn').click(function () {
        for (const r of result) {
          replaceVal = $('.replace__input').val();
          history.push(replaceSearchQuery(r, replaceVal));
        }
      });
      $('.replace-undo-btn').click(function () {
        if (history.length > 0) {
          for (let index = 0; index < doc.historySize().undo - 1; index++) {
            doc.undo();
          }
        }
      });
    }
  });
};

// NOTE: 替换文字
const replaceSearchQuery = (range, query) => {
  const { from, to } = range;
  const doc = Editor.getDoc();
  doc.replaceRange(query, from, to);
  return doc.getHistory();
};

// NOTE: toggle侧边栏
const handleToggleSidebar = () => {
  $('.hide-sidebar').click(function () {
    if ($('.sidebar').css('display') === 'none') {
      toggleSidebar(true);
    } else {
      toggleSidebar(false);
    }
  });
};

// NOTE: 防止窗口进入链接
const preventOpenExternalLinks = () => {
  as = document.querySelectorAll('a[href^="http"], a[href^="https"]');
  if (as.length > 0)
    as.forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        remote.shell.openExternal(a.getAttribute('href'));
      });
    });
};

// NOTE: 显示preview一半窗口
const togglePreviewHalf = (self) => {
  $('.editor-preview-box').addClass('border-left');
  if ($(self).hasClass('preview-mode')) {
    $(self).removeClass('preview-mode');
    $('.editor-preview-box').css('display', 'none');
    $('.CodeMirror').removeClass('hidden');
    $('.CodeMirror').css('width', '100%');
  } else {
    console.log('add class');
    $(self).addClass('preview-mode');
    $('.editor-preview-box').css('display', 'flex');
    $('.CodeMirror').css('width', '50%');
  }
};
// NOTE: 显示preview窗口全部
const togglePreviewFull = (self) => {
  $('.editor-preview-box').removeClass('border-left');
  if ($(self).hasClass('preview-mode')) {
    $(self).removeClass('preview-mode');
    $('.editor-preview-box').css('display', 'none');
    $('.CodeMirror').css('width', '100%');
    $('.CodeMirror').removeClass('hidden');
  } else {
    $(self).addClass('preview-mode');
    $('.editor-preview-box').css('display', 'flex');

    // $('.editor-preview-box').addClass('border-left');
    // $('.editor-preview-box').css('border', 'none');
    $('.CodeMirror').addClass('hidden');
  }
};
// NOTE: 显示preview窗口
const togglePreview = (self) => {
  if (window.config && window.config.general.preview === 'half') {
    togglePreviewHalf(self);
  } else if (window.config && window.config.general.preview === 'full') {
    togglePreviewFull(self);
  } else {
    togglePreviewHalf(self);
  }
};
tocBtnElement = $('.btn-doc');
tocElement = $('.toc-box');
treeFileElement = $('.tree');
const menu = Menu.getApplicationMenu();
const enableMenu = (ids) => {
  ids.forEach((id) => (menu.getMenuItemById(id).enabled = true));
  // const subMenu = menu.getMenuItemById(id);
  // subMenu.enabled = true
  Menu.setApplicationMenu(menu);
};
const disableMenu = (ids) => {
  ids.forEach((id) => (menu.getMenuItemById(id).enabled = false));
  Menu.setApplicationMenu(menu);
};
module.exports = () => {
  dirElement = $('.sub-dir__name');
  fileElement = $('.sub-dir__file');

  hideSideBarFile();

  // NOTE: 处理侧边栏文件夹元素被点击
  dirElement.on('click', function (e) {
    getTarget(zeditor, 1, e);
    enableMenu(['Save File', 'Save As', 'Delete', 'Rename', 'Copy Path', 'Reveal in Finder']);
    $(this)
      .nextAll()
      .animate(
        {
          height: 'toggle',
          opacity: 'toggle',
        },
        {
          duration: 300,
          easing: 'swing',
          start: function () {
            dirClicked = !dirClicked;
            if (dirClicked) {
              $(this).parent().children().eq(0).addClass('dir-opened');
            } else {
              $(this).parent().children().eq(0).removeClass('dir-opened');
            }
          },
        }
      );
  });

  // NOTE: 处理侧边栏文件元素被点击
  fileElement.on('click', function (e) {
    getTarget(zeditor, 5, e);
    enableMenu(['Save File', 'Save As', 'Delete', 'Rename', 'Copy Path', 'Reveal in Finder', 'Export']);
    fileElement.removeClass('opened');
    $(this).addClass('opened');
    const articlePath = $(this).attr('data-set');
    zeditor.name = $(this).attr('name');
    zeditor.path = articlePath;
    const isInRecentFile = recentFile.some((r) => r === articlePath);
    if (!isInRecentFile) {
      recentFile.push(zeditor.path);
      SideBar.saveToLocalStorage('recent-file', recentFile);
    }
    SideBar.readArticle(zeditor.path, zeditor.isFormatWhenOpen)
      .then((data) => {
        c2e(data);
      })
      .then((r) => {
        ipcRenderer.send('file-opened', { name: zeditor.name, recentFile: recentFile });
      })
      .catch((e) => {
        Editor.setValue('');
        Editor.clearHistory();
      });
  });

  // NOTE: 处理编辑器滚动事件
  $('.CodeMirror-scroll').scroll(function () {
    if ($(this).is(':hover')) {
      e2p();
    }
  });

  // NOTE: 处理预览窗口滚动事件
  $('.editor-preview-box').scroll(function () {
    if ($(this).is(':hover')) {
      p2e();
    }
  });

  // NOTE: 处理侧边栏是否显示
  handleToggleSidebar();

  // NOTE: 处理右击事件
  // handleFileRightClick();
  handleContextmenu(zeditor);

  // NOTE: 编辑器事件处理
  Editor.on('blur', function (e) {
    if (zeditor.path !== '' && Editor.getValue() !== '' && zeditor.autoSave) writeFile(zeditor.path, Editor.getValue());
    disableMenu(['Insert']);

    // menu.getMenuItemById('Insert').enabled = false;
    // Menu.setApplicationMenu(menu);
  });
  Editor.on('focus', function (e) {
    enableMenu(['Insert']);
    // menu.getMenuItemById('Insert').enabled = true;
    // Menu.setApplicationMenu(menu);
  });
  Editor.on('change', function () {
    zeditor.setRawContent(Editor.getDoc().getValue());
    document.querySelector('.editor-preview').innerHTML = zeditor.getMarkdown();
    if (zeditor.path !== '' && Editor.getValue() !== '' && zeditor.autoSave) writeFile(zeditor.path, Editor.getValue());
    tocbot.refresh();
  });
};

// NOTE: 处理toc链接点击事件
const handleTocLinkClick = () => {
  $('.toc-link').attr('ondragstart', 'return false');
  $('.toc-link').each(function (link) {
    $(this).on('click', function (e) {
      $('.toc-link').css('background', 'none');

      $(this).css('background', 'var(--color-file-opened-bg)');

      e.preventDefault();
      console.log(e.target.innerHTML);
      const query = e.target.innerHTML;
      const lineNumber = searchEditorLineByQuery(Editor, query);
      gsap.to(document.querySelector('.editor-preview-box'), {
        scrollTo: { y: searchPreviewLineByQuery(query), offsetY: 20 },
        ease: 'power2',
      });
      gsap.to(document.querySelector('.CodeMirror-scroll'), {
        scrollTo: { y: document.querySelectorAll('.CodeMirror-line')[lineNumber], ease: 'power2', offsetY: 20 },
      });
    });
  });
};
tocBtnElement.on('click', function () {
  toggleCls(tocElement, 'hidden');
  toggleCls(treeFileElement, 'hidden');
  handleTocLinkClick();
});

// NOTE: 处理预览按钮单击事件
$('.editor-preview-btn').on('click', function () {
  togglePreview(this);
  preventOpenExternalLinks();
});

// NOTE: 处理搜索按钮单击事件
$('.btn-search').on('click', function () {
  if (!$('.search-box').hasClass('hidden')) {
    $('.search-box').addClass('hidden');
    $('.CodeMirror-scroll').removeClass('margin-top');
  } else {
    $('.search-box').removeClass('hidden');
    $('.CodeMirror-scroll').addClass('margin-top');
  }
});
if (!$('.btn-search').hasClass('hidden')) {
  markSearchQuery();
  $('.search__close').on('click', () => {
    $('.search-box').addClass('hidden');
  });
}

$('.search__options').on('change', function () {
  const option = $(this).val();
  if (option !== 'f') {
    $('.replace').removeClass('hidden');
  } else {
    if (!$('.replace').hasClass('hidden')) {
      $('.replace').addClass('hidden');
    }
  }
});
