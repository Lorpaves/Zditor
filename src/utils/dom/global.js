let dirElement,
  fileElement,
  previewElements,
  preview = false,
  dirClicked = false,
  fileClicked = false,
  tocElement,
  tocBtnElement,
  treeFileElement,
  as;
const { hideSideBarFile } = require(`${api.path}/utils/dom/Utils.js`);
const sidebarItems = JSON.parse(localStorage.getItem('file-objects')) || [];
let lastOpened = JSON.parse(localStorage.getItem('last-opened')) || null;
window.config = JSON.parse(localStorage.getItem('config')) || null;
if (localStorage.getItem('recent-file')) {
  localStorage.removeItem('recent-file');
}
const recentFile = JSON.parse(localStorage.getItem('recent-file')) || [];

const highlightElement = () => {
  const inlineBlock = $(`
  .cm-comment
  .cm-builtin,
  .cm-keyword,
  .cm-variable,
  .cm-operator,
  .cm-string,
  .cm-property,
  .cm-number,
  .cm-tag`);

  inlineBlock.addClass('code-inline');
  inlineBlock.parent().parent().addClass('code-block');
};
// const MathJax = require('')
