const searchText = (cm, query) => {
  const doc = cm.getDoc();
  const result = [];
  const TextMarkers = [];
  doc.eachLine((LineHandle) => {
    if (LineHandle.text.toLowerCase().match(query)) {
      // let queryString = ''
      const lineNumber = doc.getLineNumber(LineHandle);
      const length = query.length;
      const tokens = cm.getLineTokens(lineNumber);
      const lineString = tokens
        .map((token) => token.string)
        .join('')
        .toLowerCase();
      const index = lineString.indexOf(query);

      const from = { line: lineNumber, ch: index };
      const to = { line: lineNumber, ch: index + length };
      // lineString.slice(index, index + 1);
      result.push({ from, to });
    }
  });
  if (result.length > 0) {
    for (const r of result) {
      TextMarkers.push(
        cm.markText(r.from, r.to, {
          className: 'search-highlight',
        })
      );
    }
  }
  return { result, TextMarkers };
};
const flattenElement = (parentNode) => {
  let children = Array.from(parentNode.childNodes);
  children.forEach((child) => {
    if (child.childElementCount > 0) {
      children = [...children, ...flattenElement(child)];
    }
  });

  return children;
};
const formatPreviewQuery = (query) => {
  return query
    .replace(/<code>(.+?)<\/code>/g, '$1')
    .replace(/<strong>(.+?)<\/strong>/g, '$1')
    .replace(/<em>(.+?)<\/em>/g, '$1')
    .replace(/<a\s+href="(?:https?|ftp):\/\/[^\s]*">(.+?)<\/a>/g, '$1');
};
const searchPreviewLineByQuery = (query) => {
  const nodes = Array.from(document.querySelectorAll('.line'));
  for (let i = 0; i < nodes.length; i++) {
    let previewQuery = formatPreviewQuery(nodes[i].innerHTML);
    if (query === previewQuery) {
      return nodes[i];
    }
  }
};

const searchEditorLineByQuery = (cm, query) => {
  const doc = cm.getDoc();
  let editorMatch, line;
  const pt = /^(#+\s)*(>\s)*(\-\s)*(\*\s)*([0-9]*\.\s)*(\**)*(_)*(~~)*(\-\-\-)*(.+?)(\**)*(_)*(~~)*$/;
  const linkPt = /\[\\?(.+)\]/;
  const lineNumbers = Array.from(new Array(doc.lineCount()).keys());
  for (const lineNumber of lineNumbers) {
    const editorQuery = cm
      .getLineTokens(lineNumber)
      .map((token) => token.string)
      .join('');
    const match = pt.exec(editorQuery);
    if (match) {
      const matchResult = match[10];
      if (linkPt.test(matchResult)) {
        editorMatch = linkPt.exec(matchResult)[1];
        if (query === editorMatch) {
          line = lineNumber;
          break;
        }
      } else {
        editorMatch = matchResult;
        if (query === editorMatch) {
          line = lineNumber;
          break;
        }
      }
    }
  }
  return line;
};
module.exports = { searchText, flattenElement, searchEditorLineByQuery, formatPreviewQuery, searchPreviewLineByQuery };
