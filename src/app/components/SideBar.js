const { sidebarDirScript } = require('./scripts');
const md = require('./md')();
const fs = require('fs');

class SideBar {
  static readArticle(filePath, isFormat) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, contents) => {
        let rawContent;
        if (isFormat) {
          rawContent = require('prettier').format(contents, { semi: false, parser: 'markdown' });
        } else {
          rawContent = contents;
        }
        let mdContent = md.render(rawContent);

        if (err) {
          reject(err);
        } else {
          resolve({
            rawContent: rawContent,
            mdContent: mdContent,
            filePath: filePath,
          });
        }
      });
    });
  }
  static async addDirToSideBar(dirs, parentNode) {
    const renderFileStructure = async (structure) => {
      let sidebar = '';
      if (structure.filePaths) {
        for (const item of structure.filePaths) {
          if (typeof item === 'object') {
            const dirTitle = SideBar.formatDirTitle(item.directory);
            sidebar += `<div class="sub-dir flex flex-cl"><li class="sub-dir__name" data-set=${item.directory}>${dirTitle}<input class="rename-input" spellcheck="false" type="text" value="${dirTitle}"/></li>`;
            sidebar += `<ul class="sub-dir__container flex flex-cl">`;
            sidebar += await renderFileStructure(item);
            sidebar += `</ul></div>`;
          } else {
            const title = SideBar.formatTitle(item);
            sidebar += `<li class="sub-dir__file flex flex-cl center" data-set="${item}"name="${title}.md"><div class="file flex start"><span class="file__name">${title}<input class="rename-input" spellcheck="false"  type="text" value="${title}.md"/></span><span class="file__extension">.md</span></div> </li>`;
          }
        }
      }
      //<div class='file-ctime flex start'><span class='file-ctime__text'>${await addCreatedTime(
      //   item
      // )}</span></div>
      return sidebar;
    };
    let sidebar = parentNode.html();
    for (const dir of dirs) {
      sidebar += await renderFileStructure(dir);
    }
    parentNode.html(sidebar);
    $('#script').remove();
    let $s = $(sidebarDirScript);
    $('body').append($s);
  }
  static saveToLocalStorage(name, fileStructureObject) {
    localStorage.setItem(name, JSON.stringify(fileStructureObject));
  }
  // static addFilesToSideBar = async (filePaths, parentNode) => {
  //   let sidebar = parentNode.html();
  //   for (const filePath of filePaths) {
  //     sidebar += `<li class="sub-dir__file" data-set="${filePath}">${SideBar.formatTitle(
  //       filePath
  //     )}<span class="file-extension">.md</span> <span>${await addCreatedTime(filePath)}</span></li>`;
  //   }

  //   parentNode.html(sidebar);
  //   $('#script').remove();
  //   let $s = $(sidebarFileScript);
  //   $('body').append($s);
  // };
  static removeChildNodes(parentNode) {
    let firstChildNode = parentNode.firstChild;

    while (firstChildNode) {
      parentNode.removeChild(firstChildNode);
      firstChildNode = parentNode.firstChild;
    }
  }

  static formatTitle(filePath) {
    const sIndex = filePath.lastIndexOf('/') + 1;
    const dIndex = filePath.lastIndexOf('.');
    return filePath.slice(sIndex, dIndex);
  }
  static formatDirTitle(dirPath) {
    const sIndex = dirPath.lastIndexOf('/') + 1;
    const dIndex = dirPath.length;
    return dirPath.slice(sIndex, dIndex);
  }
}

module.exports = SideBar;
