const getTopElement = (elements) => {
  let topDistance = Infinity;
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    const rect = element.getBoundingClientRect();
    if (rect.top >= 20 && rect.bottom <= window.innerHeight) {
      // 如果在视口内，就计算元素到视口顶部的距离
      const distance = rect.top;
      if (distance < topDistance) {
        return { topElement: element, lineNumber: index };
      }
    }
  }
};

const getEditorLineQuery = (cm, lineNumber) => {
  let pt = /^(#+\s)*(>\s)*(\-\s)*(\*\s)*([0-9]*\.\s)*(\**)*(_)*(~~)*(\-\-\-)*(.+?)(\**)*(_)*(~~)*$/;
  let query = cm
    .getLineTokens(lineNumber)
    .map((token) => token.string)
    .join('');
  if (query !== '') {
    const match = pt.exec(query);
    const linkPt = /\[\\?(.+)\]/;
    if (match) {
      let matchResult = match[10];
      if (linkPt.test(matchResult)) {
        return linkPt.exec(matchResult)[1];
      } // else if (matchResult === '---') return null;
      else return matchResult;
    } else return query;
  }
  return null;
};
const preview2editor = () => {
  const editorScrollElements = document.querySelectorAll('.CodeMirror-line');
  const { topElement } = getTopElement(Array.from(document.querySelectorAll('.line')));
  try {
    if (topElement.innerHTML) {
      const previewQuery = formatPreviewQuery(topElement.innerHTML);

      const lineNumber = searchEditorLineByQuery(Editor, previewQuery);
      if (lineNumber) {
        gsap.to(document.querySelector('.CodeMirror-scroll'), {
          scrollTo: { y: editorScrollElements[lineNumber], ease: 'power2' },
        });
      }
    }
  } catch (error) {}
};
const editor2preview = () => {
  const { topElement, lineNumber } = getTopElement(Array.from(document.querySelectorAll('.CodeMirror-line')));
  const query = getEditorLineQuery(Editor, lineNumber);
  const nodes = document.querySelectorAll('.line');
  if (query !== null) {
    for (let i = 0; i < nodes.length; i++) {
      try {
        if (nodes[i + 1].innerHTML) {
          const previewQuery = formatPreviewQuery(nodes[i + 1].innerHTML);

          if (query === previewQuery) {
            gsap.to(document.querySelector('.editor-preview-box'), { scrollTo: { y: nodes[i + 1], ease: 'power2' } });
            break;
          }
        }
      } catch (error) {
        break;
      }
    }
  }
};
const scrollCheckBottom = (scrollArea, view, viewWrapper) => {
  let containerChildNodes = view.childNodes;
  const { scrollTop, scrollHeight, clientHeight } = scrollArea;
  if (scrollTop + clientHeight >= scrollHeight - 80) {
    gsap.to(viewWrapper, { scrollTo: containerChildNodes[containerChildNodes.length - 2] });
  }
};
const scrollCheckTop = (scrollArea, view, viewWrapper) => {
  let containerChildNodes = view.childNodes;
  const { scrollTop } = scrollArea;

  if (scrollTop <= 40) {
    gsap.to(viewWrapper, { scrollTo: { y: containerChildNodes[0], offsetY: 40, ease: 'power2' } });
  }
};
module.exports = { editor2preview, scrollCheckBottom, scrollCheckTop, preview2editor };
