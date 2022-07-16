import express from 'express'
import path from 'path'
import { createHash } from 'crypto'
import { createReadStream } from 'fs'
import { createGunzip } from 'zlib'
import { Transform, Readable } from 'stream'
import readline from 'readline'

const app = express()


function createFileHash(filename) {
  return createHash('sha256').update(filename).digest('hex')
}

function parseGffLine(line) {
  const arr = line.split('\t')
  return {
    seqID: arr[0],
    source: arr[1],
    type: arr[2],
    start: arr[3],
    end: arr[4],
    score: arr[5],
    strand: arr[6],
    phase: arr[7],
    attributes: arr[8]
  }
}

class FileFilterTransform extends Transform {
  constructor(filter = {}) {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    })
    this.filter = filter
  }

  _transform(chunk, encoding, next) {
    const line = chunk.toString()
    if (line[0] === '#') {
      return next(null, `${line}\n`)
    } else {
      const parsedLine = parseGffLine(line)
      if (this.filter.source && parsedLine.source === this.filter.source) {
        return next(null, `${line}\n`)
      }
    }
    next()
  }
}

app.get('/', async (req, res) => {
  const filename = path.basename(req.query.file)
  const extension = path.extname(filename)

  // Validations
  if (!req.query.file) {
    res.status(422).send('Query param "file" is required\n')
  }
  if (extension !== '.gz') {
    res.status(422).send('File should be a .gz\n')
  }

  const fileHash = createFileHash(filename)

  // Is in the server?
  let fileStream
  try {
    fileStream = createReadStream(`files/${fileHash}`)
  } catch (err) {
    if (err.code === 'ENOENT') {
      // ... Download the file
    }
    console.error(err)
    res.status(500).send('Internal server error')
    return
  }

  // Unzip, filter, send
  const fileStreamUnziped = fileStream.pipe(createGunzip())
  const readlineInterface = readline.createInterface({ 
    input: fileStreamUnziped,
    crltDelay: Infinity
  })
  const fileFilterTransform = new FileFilterTransform({
    source: 'Gnomon'
  })
  const fileStreamByLine = Readable.from(readlineInterface)
  fileStreamByLine
    .pipe(fileFilterTransform)
    .pipe(res)
    .on('finish', () => {
      res.end('File successfully sent\n')
    })



})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})
