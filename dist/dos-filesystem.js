"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const fs = require('fs');

require('dos-array-js');

require('dos-string-js');

const iconv = require('iconv-lite');

const byline = require('byline');
/**
 * ファイルシステム関連操作のStatic
 */


class DosFileSystem {
  /**
   * フォルダからファイル一覧を取得
   * @param {String} path 探索対象のフォルダ
   * @param {Boolena} isDeep 仮想のフォルダも探索する
   * @param {Boolean} isIncludeFilePath ファイルパスを含めるかどうか
   */
  static async getFileList(path, isDeep = false) {
    // ファイルリスト取得
    const files = await DosFileSystem._readDirPromise(path);
    const fnames = [];
    files.forEach(v => fnames.push(path + '/' + v)); //  ステートを取得

    const info = await fnames.asyncMap(async f => {
      const stats = await DosFileSystem.getfileState(f);
      let children = [];
      if (stats.isDirectory() && isDeep) children = await DosFileSystem.getFileList(f);
      return {
        item: f,
        stats: stats,
        children: children
      };
    });
    return info;
  }
  /**
   * ディレクトリサーチのプロミスを返す
   * @param {*} path
   */


  static _readDirPromise(path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if (!err) resolve(files);else reject(err);
      });
    });
  }
  /**
   * ファイルステートをファイルオブジェクトから抽出
   * @param {*} file
   */


  static getfileState(file) {
    return new Promise((resolve, reject) => {
      try {
        fs.stat(file, (err, stats) => {
          // console.log({ err, stats })
          if (!err) return resolve(stats);else return reject(err);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }
  /**
   * ファイルの存在確認
   * @param {String} path
   */


  static async isFileExist(path) {
    try {
      const st = await DosFileSystem.getfileState(path); // console.log({ st, isFile: st.isFile(), isDir: st.isDirectory() })

      if (st.isFile() || st.isDirectory()) return true;
      return false;
    } catch (e) {
      return false;
    }

    return false;
  }
  /**
   * ファイルからテキスト情報を取得
   * @param {String} path
   */


  static async readText(path, encode = 'utf8') {
    if (!(await DosFileSystem.isFileExist(path))) return Promise.reject(''); // console.log('testpl')

    return new Promise((resolve, reject) => {
      // console.log(path)
      fs.readFile(path, {
        flag: 'r'
      }, (err, data) => {
        // if (encode.toLowerCase() == 'utf8') {
        //   return resolve(data)
        // }
        if (err) return reject(err);

        if (['sjis', 'shift-jis', 'shiftjis'].indexOf(encode.toLowerCase()) >= 0) {
          const resultStr = iconv.decode(new Buffer.from(data), 'Shift-JIS');
          return resolve(resultStr);
        }

        const Encoding = require('encoding-japanese');

        const res = Encoding.convert(data, {
          from: encode,
          to: 'UNICODE',
          type: 'string'
        });
        return resolve(res);
      });
    });
  }
  /**
   * 1行ごとファイル読み込み
   * @param {*} path
   * @param {*} encode
   */


  static readTextByLine(path, options, readFunc, endFunc) {
    const param = Object.assign({
      encode: 'SJIS'
    }, options);

    var fs = require('fs'),
        byline = require('byline');

    let reader = null;

    if (['sjis', 'shift-jis', 'shiftjis'].indexOf(param.encode.toLowerCase()) >= 0) {
      reader = fs.createReadStream(path).pipe(iconv.decodeStream('Shift_JIS'));
    } else {
      reader = fs.createReadStream(path, {
        encoding: 'utf-8'
      });
    }

    const stream = byline(reader); // 現在の行数を管理

    let index = 0;
    stream.on('data', async line => {
      index++;
      if (!!readFunc) await readFunc(line, index - 1);
    });
    stream.on('end', async () => {
      if (!!endFunc) await endFunc(index);
    });
  }
  /**
   * テキスト書き出し
   * @param {*} path
   * @param {*} data
   * @param {*} options
   */


  static async writeText(path, data, options = {}) {
    const param = Object.assign({
      encode: 'SJIS',
      flag: 'w',
      isNew: true
    }, options); //  フォルダがなければ作成する

    const dirPath = path.replaceAll('\\', '/').deleteFromEnd('/');
    await DosFileSystem.createDirectory(dirPath);

    if (['sjis', 'shift-jis', 'shiftjis'].indexOf(param.encode.toLowerCase()) >= 0) {
      // // ファイルが存在して新規の場合削除
      // if (await DosFileSystem.isFileExist(path)) {
      //   console.log('ファイル有り')
      //   if (param.isNew) {
      //     const delfFile = await DosFileSystem.delete(path)
      //     console.log(delfFile)
      //     if (delfFile !== true) throw '既存ファイルの削除に失敗しました'
      //   }
      // } else {
      //   console.log('ファイルなし')
      // }
      // // ファイル書き出しのための下準備
      // if ((await DosFileSystem.isFileExist(path)) == false) {
      //   const nf = await new Promise((resolve, reject) => {
      //     fs.writeFile(path, '', (err) => (!!err ? reject(err) : resolve(true)))
      //   })
      //   // console.log(nf)
      //   if (nf !== true) throw 'ファイル書き出しのための下準備に失敗しました'
      //   console.log('ファイル作った')
      // }
      const resBuff = iconv.encode(data, 'Shift-JIS');
      return new Promise((resolve, reject) => {
        fs.open(path, param.isNew ? 'w' : 'a', (err, fd) => {
          if (!!err) {
            return reject(err);
          }

          fs.write(fd, resBuff, 0, resBuff.length, (werr, rb) => {
            if (!!werr) return reject(werr);else return resolve(true);
          });
        });
      });
    } else {
      const writeFunc = param.isNew ? fs.writeFile : fs.appendFile;
      return new Promise((resolve, reject) => {
        writeFunc(path, data, param, (err, data) => {
          if (err) return reject(err);else return resolve(data);
        });
      });
    }
  }
  /**
   * ファイルを移動させる
   * @param {*} fromPath
   * @param {*} toPath
   */


  static async move(fromPath, toPath, isCopy = false) {
    const func = isCopy ? fs.copyFile : fs.rename;
    return new Promise((resolve, reject) => {
      func(fromPath, toPath, err => {
        if (err) return reject(err);else return resolve(true);
      });
    });
  }

  static async getFileEncode(path) {
    const Encoding = require('encoding-japanese');

    const fileBin = await fs.getBin(target.item); // console.log(fileBin)

    target.encode = Encoding.detect(fileBin);
  }
  /**
   * ファイル削除
   * @param {*} path
   */


  static async delete(path, isDeep = false) {
    if (!isDeep) return new Promise((resolve, reject) => {
      fs.unlink(path, err => {
        if (err) return reject(err);else return resolve(true);
      });
    });else return new Promise((resolve, reject) => {
      return fs.rmdir(path, {
        recursive: true
      }, err => {
        if (err) return reject(err);else return resolve(true);
      }); // var fsExtra = require('fs-extra')
      // fsExtra.remove(path, (err) => {
      //   if (err) return reject(err)
      //   else return resolve(true)
      // })
    });
  }
  /**
   * ディレクトリを作成
   * @param {*} path
   * @param {*} option
   */


  static async createDirectory(path, option = {}) {
    const opt = Object.assign({
      recursive: true
    }, option);
    const createPath = path;
    if (await DosFileSystem.isFileExist(createPath)) return true;
    return new Promise((resolve, reject) => {
      fs.mkdir(createPath, opt, err => {
        if (!!err) return reject(err);else return resolve(true);
      });
    });
  }
  /**
   * ファイルのBase64を取得する
   * @param {*} path
   */


  static async getBase64(path) {
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(path, 'base64', function (err, data) {
          // console.log(data)
          if (err) throw err;
          resolve(data);
        });
      } catch (e) {
        // console.log('error')
        reject(e);
      }
    });
  }
  /**
   * ファイルのBase64を取得する
   * @param {*} path
   */


  static async writeBase64(path, data) {
    //  フォルダがなければ作成する
    const dirPath = path.replaceAll('\\', '/').deleteFromEnd('/');
    await DosFileSystem.createDirectory(dirPath);
    return new Promise((resolve, reject) => {
      try {
        var decode = new Buffer(data, 'base64');
        fs.writeFile(path, decode, function (err) {
          if (err) reject(false);else resolve(true);
        });
      } catch (e) {
        // console.log('error')
        reject(false);
      }
    });
  }
  /**
   * ファイルのBase64を取得する
   * @param {*} path
   */


  static async getBin(path) {
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(path, function (err, data) {
          // console.log(data)
          if (err) throw err;
          resolve(data);
        });
      } catch (e) {
        // console.log('error')
        reject(e);
      }
    });
  }
  /**
   * ファイルパスからファイル名を取得
   * @param {*} path
   * @param {*} isIncludeExp
   */


  static getFileName(path, isIncludeExp = true) {
    const pathSplite = path.replaceAll('/', '\\').split('\\');
    if (isIncludeExp) return pathSplite[pathSplite.length - 1];
    const fileNameSplite = pathSplite[pathSplite.length - 1].split('.');
    return fileNameSplite.slice(0, fileNameSplite.length - 1).join('.');
  }

}

exports.default = DosFileSystem;