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
  // console.log(files)

  const file = files.filter(v => !v.stats.isDirectory())[0]
  // console.log(file)
  // console.log(file.item)
  const data = await DosFileSystem.readText(file.item)

  console.log('data -----------------')
  console.log(data)

  expect(data == file.item.split('/')[file.item.split('/').length - 1]).toBe(
    true
  )

  done()
})
