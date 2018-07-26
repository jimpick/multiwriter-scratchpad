const hyperdrive = require('@jimpick/hyperdrive')

const versions = {}

const archive = hyperdrive('./db')
archive.writeFile('/hello.txt', 'world', err => {
  if (err) throw err
  archive.readdir('/', (err, list) => {
    if (err) throw err
    console.log(list)
    archive.readFile('/hello.txt', 'utf8',  (err, data) => {
      if (err) throw err
      console.log(data)
      saveVersion(0, () => {
        dumpVersion(0, secondWrite)
      })
    })
  })
})

function secondWrite () {
  archive.writeFile('/hello.txt', 'world2', err => {
    if (err) throw err
    saveVersion(1, () => {
      dumpVersion(1, revisitFirst)
    })
  })
}

function revisitFirst () {
  dumpVersion(0, done)
}

function done () {
  console.log('Done.')
}

function saveVersion (index, cb) {
  const version = archive.db.version((err, version) => {
    if (err) throw err
    console.log(index + ' Version:', version.toString('hex'))
    versions[index] = version
    cb()
  })
}

function dumpVersion (index, cb) {
  const version = versions[index]
  const oldArchive = archive.checkout(version)
  oldArchive.readdir('/', (err, list) => {
    if (err) throw err
    console.log(index + ' old "/":', list)
    oldArchive.db.get('/hello.txt', (err, node) => {
      console.log(index + ' old db archive.db get /hello.txt', node)
      oldArchive.readFile('/hello.txt', 'utf8',  (err, data) => {
        if (err) throw err
        console.log(index + ' old /hello.txt', data)
        oldArchive.db.heads((err, heads) => {
          if (err) throw err
          console.log(index + ' heads:', heads)
          cb()
        })
      })
    })
  })
}
