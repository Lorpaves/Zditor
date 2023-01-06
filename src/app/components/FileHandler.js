const fs = require('fs');
const path = require('path');

class zditorFileHandler {
  static async traverse(dir) {
    const files = await zditorFileHandler.readDir(dir);
    if (files.length > 0) {
      let filePaths = [];
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);
        if (path.extname(filePath) === '.md') {
          filePaths.push(filePath);
        }

        if (stats.isDirectory()) {
          const subPaths = await zditorFileHandler.traverse(filePath);
          filePaths.push({ directory: filePath, filePaths: subPaths });
        }
      }
      return filePaths;
    }
  }

  static async fileHandler(dirs) {
    const promises = dirs.map((dir) => {
      return new Promise(async (resolve, reject) => {
        const filePaths = await zditorFileHandler.traverse(dir);
        // zditorFileHandler.handleDir(dir)
        if (filePaths.length > 0) {
          resolve({ directory: dir, filePaths: filePaths });
        }
      });
    });

    return Promise.all(promises).then((files) => {
      return files.map((fileList) => {
        return fileList;
      });
    });
  }
  static writeFile(filePath, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(`File Saved at ${filePath}`);
        }
      });
    });
  }
  static handleDir(dirs) {
    let result = [];
    const handleFile = (d) => {
      if (d) {
        d.forEach((dir) => {
          dir.filePaths.forEach((file) => {
            if (typeof file === 'object' && file.filePaths.length > 0) {
              handleFile(dir);
            } else {
              result.push(dir);
              return dir;
            }
          });
        });
      }
    };
    handleFile(dirs);
    return result;
  }

  static readDir(dir) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, 'utf8', (err, files) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(files);
        }
      });
    });
  }
  static files2structure(filesArray) {
    const sIndex = filesArray[0].lastIndexOf('/');
    return { directory: filesArray[0].slice(0, sIndex), filePaths: filesArray };
  }
  static addCreatedTime(path) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stat) => {
        if (err) resolve('');
        else {
          resolve(stat.ctime.toLocaleDateString().replaceAll('/', '-'));
        }
      });
    });
  }
  static copyFile(src, dest) {
    return new Promise((resolve, reject) => {
      fs.copyFile(src, dest, (err) => {
        if (err) {
          reject(err);
        } else resolve(`File copied to ${dest}`);
      });
    });
  }
  static getFileNameFromPath(src) {
    return {
      directory: src.slice(0, src.lastIndexOf('/')),
      fileName: src.slice(src.lastIndexOf('/') + 1),
    };
  }
  static renameFile(src, dest) {
    return new Promise((resolve, reject) => {
      fs.rename(src, dest, (err) => {
        if (err) reject(err);
        else resolve(dest);
      });
    });
  }
}

module.exports = zditorFileHandler;
