const insertBefore = (cm, str) => {
  const selection = cm.getSelection();
  const doc = cm.getDoc();
  const cursor = doc.getCursor();
  const to = {
    line: cursor.line,
    ch: cursor.ch,
  };
  const from = {
    line: cursor.line,
    ch: 0,
  };
  const headerPt = /^(#+\s)*(>\s)*(\-\s)*(\*\s)*([0-9]*\.\s)*(.*)/;

  const lineTokens = cm.getLineTokens(to.line);
  const lineQuery = lineTokens.map((tk) => tk.string).join('');
  cm.execCommand('goLineStart');
  if (headerPt.test(lineQuery)) {
    const match = headerPt.exec(lineQuery);
    if (match[match.length - 1] === '') {
      to.ch = lineQuery.length;
      doc.replaceRange(`${str} `, from, to);
    } else {
      to.ch = lineQuery.length;
      doc.replaceRange(`${str} ${match[6]}`, from, to);
    }
  } else if (lineQuery.length === 0) {
    cm.replaceSelection(`${str} `);
  }
};

const insertAround = (cm, strBf, strAf) => {
  const doc = cm.getDoc();
  const selection = cm.getSelection();
  if (selection.length === 0) {
    const pos = doc.getCursor();
    cm.replaceSelection(`${strBf}${strAf}`, pos);
  } else {
    const content = doc.getRange(cm.getCursor(true), cm.getCursor(false));
    if (content !== '') {
      doc.replaceRange(`${strBf}${content}${strAf}`, cm.getCursor(true), cm.getCursor(false));
    } else {
      const pos = doc.getCursor();
      cm.replaceSelection(`${strBf}${strAf}`, pos);
    }
  }
};

module.exports = { insertBefore, insertAround };
