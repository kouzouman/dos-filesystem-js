import DosFileSystem from './../index'
// import DosFileSystem from '../src/dos-file-system'

// const DosFileSystem = require('./../src/dos-file-system')

test('getFileList', async done => {
  const current = __dirname + '/'
  const target = current + 'testdir'

  // console.log('target -----------------')
  // console.log(target)
  const info = await DosFileSystem.getFileList(target, true)

  // console.log('info -----------------')
  // console.log(info)

  expect(info.length == 3).toBe(true)

  done()
})
