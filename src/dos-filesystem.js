const fs = require('fs')
require('dos-array-js')

/**
 * ファイルシステム関連操作のStatic
 */
export default class DosFileSystem {
  /**
   * フォルダからファイル一覧を取得
   * @param {String} path 探索対象のフォルダ
   * @param {Boolena} isDeep 仮想のフォルダも探索する
   * @param {Boolean} isIncludeFilePath ファイルパスを含めるかどうか
   */
  static async getFileList(path, isDeep = false) {
    // /**
    //  * key、valueの配列をMapに変更
    //  */
    // Array.prototype.asyncMap2 = async function(mapFunc) {
    //   return Promise.all(this.map(v => mapFunc(v)))
    // }

    // ファイルリスト取得
    const files = await DosFileSystem._readDirPromise(path)
    const fnames = []
    files.forEach(v => fnames.push(path + '/' + v))

    //  ステートを取得
    const info = await fnames.asyncMap(async f => {
      const stats = await DosFileSystem.getfileState(f)

      let children = []

      if (stats.isDirectory() && isDeep)
        children = await DosFileSystem.getFileList(f)

      return { item: f, stats: stats, children: children }
    })
    return info
  }

  /**
   * ディレクトリサーチのプロミスを返す
   * @param {*} path
   */
  static _readDirPromise(path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if (!err) resolve(files)
        else reject(err)
      })
    })
  }

  /**
   * ファイルステートをファイルオブジェクトから抽出
   * @param {*} file
   */
  static getfileState(file) {
    return new Promise((resolve, reject) => {
      try {
        fs.stat(file, (err, stats) => {
          if (!err) resolve(stats)
          else reject(err)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * ファイルの存在確認
   * @param {String} path
   */
  static async isFileExist(path) {
    try {
      const st = await DosFileSystem.getfileState(path)

      return true
    } catch (e) {
      return false
    }
  }

  /**
   * ファイルからテキスト情報を取得
   * @param {String} path
   */
  static async readText(path, encode = 'utf8') {
    if (!(await DosFileSystem.isFileExist(path))) return ''
    console.log('testpl')
    return new Promise((resolve, reject) => {
      console.log(path)
      fs.readFile(path, { encoding: encode, flag: 'r' }, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  // /**
  //  * ファイルのオブジェクトを引数にファイルのmd5を取得
  //  * @param {String} path
  //  */
  // static async filemd5(fileObj) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       //FileReaderオブジェクトを生成
  //       const fileReader = new FileReader()

  //       //読み込み時に実行されるイベント
  //       fileReader.onload = function() {
  //         const res = fileReader.result
  //         //MD5ハッシュ関数でハッシュ化
  //         const hash = require('md5')(res)
  //         resolve(hash)
  //       }

  //       //読み込みを開始する(ArrayBufferオブジェクトを得る)
  //       fileReader.readAsArrayBuffer(fileObj)
  //     } catch (e) {
  //       reject(e)
  //     }
  //   })
  // }
}
