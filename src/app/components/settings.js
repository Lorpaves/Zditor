let config = JSON.parse(localStorage.getItem('config')) || undefined;

const toggleCls = (node, cls) => {
  if (!node.hasClass(cls)) {
    node.addClass(cls);
  } else {
    node.removeClass(cls);
  }
};
$('.side-bar__item').on('click', function () {
  $('.side-bar__item').removeClass('side-bar__clicked');
  toggleCls($(this), 'side-bar__clicked');
  $('.main').children().addClass('hidden');
  const part = $(this.childNodes[3]).html().toLowerCase();
  toggleCls($(`.${part}-box`), 'hidden');
});
const { ipcRenderer } = require('electron');
const fontList = require('font-list');
fontList
  .getFonts({ disableQuoting: true })
  .then((fonts) => {
    fonts.forEach((font) => {
      if (config) {
        if (font === config.appearance.appFont.fontFamily) {
          $('.app-font__selector').append(`<option selected value="${font}">${font}</option>`);
        }
        if (font === config.appearance.editorFont.fontFamily) {
          $('.editor-font__selector').append(`<option selected value="${font}">${font}</option>`);
        }
        if (font === config.appearance.codeblockFont.fontFamily) {
          $('.editor-code-font__selector').append(`<option selected value="${font}">${font}</option>`);
        } else {
          if (font !== config.appearance.appFont.fontFamily) {
            $('.app-font__selector').append(`<option value="${font}">${font}</option>`);
          }
          if (font !== config.appearance.editorFont.fontFamily) {
            $('.editor-font__selector').append(`<option value="${font}">${font}</option>`);
          }
          if (font !== config.appearance.codeblockFont.fontFamily) {
            $('.editor-code-font__selector').append(`<option value="${font}">${font}</option>`);
          }
        }
      } else if (font === 'SF Pro') {
        $('.app-font__selector').append(`<option selected value="${font}">${font}</option>`);
        $('.editor-font__selector').append(`<option selected value="${font}">${font}</option>`);
      } else if (font === 'Menlo') {
        $('.editor-code-font__selector').append(`<option selected value="${font}">${font}</option>`);
      } else {
        $('.app-font__selector').append(`<option value="${font}">${font}</option>`);
        $('.editor-font__selector').append(`<option value="${font}">${font}</option>`);
        $('.editor-code-font__selector').append(`<option value="${font}">${font}</option>`);
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });
// $('.app-font__selects').on('change', function(){
//   localStorage.setItem('selected-app-font', $(this).val())
// })
// $('.editor-font__selects').on('change', function(){
//   localStorage.setItem('selected-editor-font', $(this).val())
// })
$(window).on('change', function (e) {
  config = getConfig();
  localStorage.setItem('config', JSON.stringify(config));
  ipcRenderer.send('config-changed', config);
  const target = $(e.target);
  const eventName = target.attr('name');
  const eventVal = target.val() === 'on' ? target.prop('checked') : target.val();
  if (eventName === 'show-sidebar') {
    ipcRenderer.send('update-show-sidebar', eventVal);
  } else if (eventName === 'app-theme') {
    ipcRenderer.send('update-app-theme', eventVal);
  } else if (eventName === 'editor-theme') {
    ipcRenderer.send('update-editor-theme', eventVal);
  } else if (eventName === 'app-font-family') {
    ipcRenderer.send('update-app-font-family', eventVal);
  } else if (eventName === 'app-font-size') {
    ipcRenderer.send('update-app-font-size', eventVal);
  } else if (eventName === 'editor-font-family') {
    ipcRenderer.send('update-editor-font-family', eventVal);
  } else if (eventName === 'editor-font-size') {
    ipcRenderer.send('update-editor-font-size', eventVal);
  } else if (eventName === 'editor-code-font-family') {
    ipcRenderer.send('update-editor-code-font-family', eventVal);
  } else if (eventName === 'editor-code-font-size') {
    ipcRenderer.send('update-editor-code-font-size', eventVal);
  } else if (eventName === 'indent') {
    ipcRenderer.send('update-indent', eventVal);
  } else if (eventName === 'auto-save') {
    ipcRenderer.send('update-auto-save', eventVal);
  } else if (eventName === 'format-when-open') {
    ipcRenderer.send('update-format-when-open', eventVal);
  } else if (eventName === 'format-when-save') {
    ipcRenderer.send('update-format-when-save', eventVal);
  } else if (eventName === 'match-brackets') {
    ipcRenderer.send('update-match-brackets', eventVal);
  } else if (eventName === 'cursor-height') {
    ipcRenderer.send('update-cursor-height', eventVal);
  } else if (eventName === 'auto-close-brackets') {
    ipcRenderer.send('update-auto-close-brackets', eventVal);
  } else if (eventName === 'export-pdf-page-size') {
    if (eventVal === 'custom') $('.export-pdf-size-custom__inputs').removeClass('hidden');
    else $('.export-pdf-size-custom__inputs').addClass('hidden');
  }
  console.log(target.attr('name'), eventVal);
});
const getConfig = () => {
  return {
    general: {
      onLaunch: $('.launch__selector').val(),
      preview: $('.preview__selector').val(),
      showSidebar: $('.sidebar__checkbox').prop('checked'),
    },
    appearance: {
      colorTheme: $(':radio[name=app-theme]:checked').val(),
      editorTheme: $('.editor-theme__selector').val(),
      appFont: {
        fontFamily: $('.app-font__selector').val(),
        fontSize: $('.app-font-size__input').val(),
      },
      editorFont: {
        fontFamily: $('.editor-font__selector').val(),
        fontSize: $('.editor-font-size__input').val(),
      },
      codeblockFont: {
        fontFamily: $('.editor-code-font__selector').val(),
        fontSize: $('.editor-code-font-size__input').val(),
      },
    },
    editor: {
      indentSize: $('.indent__selector').val(),
      autoSave: $('.auto-save__checkbox').prop('checked'),
      formatWhenOpen: $('.format-when-open__checkbox').prop('checked'),
      formatWhenSave: $('.format-when-save__checkbox').prop('checked'),
      matchBrackets: $('.match-brackets__checkbox').prop('checked'),
      autoCloseBrackets: $('.auto-close-brackets__checkbox').prop('checked'),
      cursorHeight: $('.cursor-height__input').val(),
    },
    export: {
      pdf: {
        marginsType: parseInt($('.export-pdf-margins-type').val()),
        landscape: $('.export-pdf-page-type').val() === 'landscape' ? true : false,
        printBackground: $('.export-pdf-background__checkbox').prop('checked'),
        pageSize:
          $('.export-pdf-page-size').val() === 'custom'
            ? {
                width: parseFloat($('.export-pdf-size-custom-width').val()),
                height: parseFloat($('.export-pdf-size-custom-height').val()),
              }
            : $('.export-pdf-page-size').val(),
      },
    },
  };
};
const updateConfig = (config) => {
  $('.launch__selector').val(config.general.onLaunch);
  $('.preview__selector').val(config.general.preview);
  $('.sidebar__checkbox').prop('checked', config.general.showSidebar);
  $(':radio[name=app-theme]').filter(`[value="${config.appearance.colorTheme}"]`).prop('checked', true);
  $('.editor-theme__selector').val(config.appearance.editorTheme);
  $('.app-font__selector').val(config.appearance.appFont.fontFamily);
  $('.app-font-size__input').val(config.appearance.appFont.fontSize);
  $('.editor-font__selector').val(config.appearance.editorFont.fontFamily);
  $('.editor-font-size__input').val(config.appearance.editorFont.fontSize);
  $('.editor-code-font__selector').val(config.appearance.codeblockFont.fontFamily);
  $('.editor-code-font-size__input').val(config.appearance.codeblockFont.fontSize);
  $('.indent__selector').val(config.editor.indentSize);
  $('.auto-save__checkbox').prop('checked', config.editor.autoSave);
  $('.format-when-open__checkbox').prop('checked', config.editor.formatWhenOpen);
  $('.format-when-save__checkbox').prop('checked', config.editor.formatWhenSave);
  $('.match-brackets__checkbox').prop('checked', config.editor.matchBrackets);
  $('.auto-close-brackets__checkbox').prop('checked', config.editor.autoCloseBrackets);
  $('.cursor-height__input').val(config.editor.cursorHeight);
  $('.export-pdf-margins-type').val(config.export.pdf.marginsType.toString());
  $('.export-pdf-page-type').val(config.export.pdf.landscape ? 'landscape' : 'portrait'),
    $('.export-pdf-background__checkbox').prop('checked', config.export.pdf.printBackground);
  $('.export-pdf-page-size').val(
    typeof config.export.pdf.pageSize === 'object' ? 'custom' : config.export.pdf.pageSize
  );
  $('.export-pdf-page-size').val() === 'custom'
    ? $('.export-pdf-size-custom__inputs').removeClass('hidden')
    : $('.export-pdf-size-custom__inputs').addClass('hidden');
};
$(document).ready(function () {
  if (config) {
    updateConfig(config);
  }
});
$(window).focus(function () {
  config = getConfig();
  localStorage.setItem('config', JSON.stringify(config));
});
