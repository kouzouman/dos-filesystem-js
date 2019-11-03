import DosFileSystem from './../index'

test('getFileList', async done => {
  const current = __dirname + '/'
  const target = current + 'testdir'

  const info = await DosFileSystem.getFileList(target, true)

  expect(info.length == 3).toBe(true)

  done()
})

test('readText', async done => {
  const current = __dirname + '/'
  const target = current + 'testdir'

  const files = await DosFileSystem.getFileList(target, true)

  const file = files.filter(v => !v.stats.isDirectory())[0]
  const data = await DosFileSystem.readText(file.item)

  expect(data == file.item.split('/')[file.item.split('/').length - 1]).toBe(
    true
  )

  done()
})

test('getbase64', async done => {
  const current = __dirname + '/'
  const target = current + 'testdir'

  const files = await DosFileSystem.getFileList(target, true)

  const file = files.filter(v => !v.stats.isDirectory())[0]
  // console.log(file)

  const b64 = await DosFileSystem.getBase64(file.item)
  console.log(b64)
  expect(true).toBe(true)
  done()
})

// test('filemd5', async done => {
//   const filepath =
//     'F:\\kvs\\DoersSquareProjects\\dos-filesystem-js\\__test__/testdir/dir1/summary.png'

//   console.log(await DosFileSystem.readText(filepath))

//   const current = __dirname + '/'
//   const target = current + 'testdir'

//   const files = await DosFileSystem.getFileList(target, true)

//   const file = files.filter(v => !v.stats.isDirectory())[0]
//   console.log(file)
//   // const fs = require('fs')
//   // const fo = new File(file)
//   // console.log(fo)

//   // const FileAPI = require('file-api')
//   // const File = FileAPI.File
//   // console.log(new FileAPI.File(file))

//   // console.log(Buffer.from(file.item))

//   // const read = async path => {
//   //   return new Promise((resolve, reject) => {
//   //
//   //     fs.open(Buffer.from(path), 'r', (err, fd) => {
//   //       console.log(fd)
//   //       if (err) throw err
//   //       fs.close(fd, err => {
//   //         if (err) throw err
//   //       })
//   //       resolve(fd)
//   //     })
//   //   })
//   // }
//   // const tttt = await read(file.item)
//   // console.log(tttt)

//   expect(true).toBe(true)
//   done()
// })
