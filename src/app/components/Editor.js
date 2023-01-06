const prettier = require('prettier');
const md = require('./md')();
const { insertBefore, insertAround } = require('./EditorInsert.js');

class ZEditor {
  constructor(ele, others) {
    this.ele = ele;
    this.path = '';
    this.rawContent = '';
    this.mdContent = md.render(this.rawContent);
    this.dom = '';
    this.isFile = false;
    this.isFileRenamed = false;
    this.name = '';
    this.domParent = '';
    this.isFormat = others.isFormat;
    this.indentUnit = others.indentUnit || 4;
    this.matchBrackets = others.matchBrackets;
    this.cursorHeight = others.cursorHeight || 1;
    this.theme = others.theme;
    this.autoSave = others.autoSave;
    this.isFormatWhenOpen = others.isFormatWhenOpen;
    this.autoCloseBrackets = others.autoCloseBrackets;
    this.root = '';
  }
  setRawContent(rawContent) {
    if (this.isFormat) {
      return (this.rawContent = prettier.format(rawContent, { semi: false, parser: 'markdown' }));
    } else {
      return (this.rawContent = rawContent);
    }
  }
  getRawContent() {
    return this.rawContent;
  }
  setMarkdown() {
    return (this.mdContent = md.render(this.rawContent));
  }
  getMarkdown() {
    this.setMarkdown();
    return this.mdContent;
  }
  cm() {
    return CodeMirror(this.ele, {
      debug: false,
      mode: 'gfm',
      // mode: 'text/plain',
      theme: this.theme,
      spellcheck: false,
      autocorrect: false,
      lineWrapping: true,
      matchBrackets: this.matchBrackets,
      indentUnit: this.indentUnit,
      firstLineNumber: 1,
      // minHeight: '100%',
      tokenTypeOverrides: { code: 'code-block' },
      lineNumbers: false,
      showCursorWhenSelecting: true,
      cursorHeight: this.cursorHeight,
      autofocus: false,
      autoFormatLineBreaks: false,
      autoCloseBrackets: this.autoCloseBrackets,
      addModeClass: false,
      // maxHighlightLength: Infinity,
      viewportMargin: Infinity,
      resetSelectionOnContextMenu: false,
      inputStyle: 'contenteditable',
      dragDrop: false,
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        Tab: function (cm) {
          if (cm.somethingSelected()) {
            cm.indentSelection('add');
          } else {
            cm.replaceSelection(
              cm.getOption('indentWithTabs') ? '\t' : Array(cm.getOption('indentUnit') + 1).join(' '),
              'end',
              '+input'
            );
          }
        },

        'Shift-Tab': 'indentLess',

        // 'Alt-Shift-M': function (cm) {
        //   insertAround(cm, '$$\begin{}{}\r\n', '\r\nend{}$$');
        //   cm.execCommand('goLineEnd');
        // },
      },

      disabledButtons: [],
    });
  }
}

module.exports = ZEditor;
