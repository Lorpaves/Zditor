module.exports = () => {
  const hljs = require('../../utils/markdown-it/highlight.min.js');
  const attrs = require('markdown-it-attrs');
  const md = require('../../utils/markdown-it/markdown-it.min.js')({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        } catch (__) {}
      }

      return ''; // use external default escaping
    },
    html: true,
    linkify: true,
    typographer: true,
  });
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    // 获取图像信息
    const currentPathPt = /^\.\/(.+)/;
    const currentPathPt1 = /^\.\.\/(.+)/;
    let src = tokens[idx].attrs[tokens[idx].attrIndex('src')][1];
    let path = zeditor.path;
    if (currentPathPt.test(src)) {
      src = `${path.slice(0, path.lastIndexOf('/'))}/${currentPathPt.exec(src)[1]}`;
    } else if (currentPathPt1.test(src)) {
      let count = 0;
      src.split('/').map((w) => (w === '..' ? count++ : (count = count)));
      const pathSplitted = path.slice(0, path.lastIndexOf('/')).split('/');
      path = pathSplitted.slice(1, pathSplitted.length - count).join('/');
      const fileName = src.slice(src.lastIndexOf('/') + 1, src.length);
      src = `/${path}/${fileName}`;
    }
    const alt = tokens[idx].content;
    // 使用自定义的HTML代码渲染img元素
    return `<p ><img src="${src}" alt="${alt}""></p>`;
  };
  // 创建自定义插件;
  function lineData(md) {
    md.use(attrs); // 使用 markdown-it-attrs 插件
    let tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'pre', 'td', 'th', 'dl', 'hr'];
    let line = 0;
    md.core.ruler.push('line_data', (state) => {
      state.tokens.forEach((token, index) => {
        // if (token.type === 'inline') {
        //   token.children.forEach((child) => {
        //     // 对于 inline 元素，添加 line-data 属性
        //     child.attrs = child.attrs || [];
        //     child.attrs.push(['line-data', line.toString()]);
        //   });
        // } else {
        // 对于 block 元素，添加 line-data 属性
        if (tag.indexOf(token.tag) > -1) {
          token.attrs = token.attrs || [];
          token.attrs.push(['line-data', Math.floor(line / 2)], ['class', 'line']);
          line++;
        }
      });
    });
  }
  // , {
  //   permalink: true,
  //   permalinkBefore: true,
  //   permalinkSymbol: '#',
  // }
  md.use(require('markdown-it-mathjax3'))
    .use(require('markdown-it-anchor'))
    .use(require('markdown-it-footnote'))
    .use(lineData)
    .use(require('markdown-it-sub'))
    .use(require('markdown-it-container'), 'spoiler', {
      validate: function (params) {
        return params.trim().match(/^spoiler\s+(.*)$/);
      },

      render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);

        if (tokens[idx].nesting === 1) {
          // opening tag
          return '<details><summary>' + md.utils.escapeHtml(m[1]) + '</summary>\n';
        } else {
          // closing tag
          return '</details>\n';
        }
      },
    })
    .use(require('markdown-it-deflist'))
    .use(require('markdown-it-emoji'))
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-mark'))
    .use(require('markdown-it-sub'))
    .use(require('markdown-it-sup'));

  return md;
};
//  markdown-it-deflist markdown-it-container markdown-it-mark markdown-it-emoji
