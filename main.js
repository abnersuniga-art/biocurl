import fs from 'fs'
import readline from 'readline'
import { Readable, Transform } from 'stream'
import { createServer } from 'http'
import { request } from 'https'
import { createGunzip } from 'zlib'


function parseLine(line) {
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

class FilterTest extends Transform {
  constructor(filter) {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    })
    this.filter = filter
  }

  _transform(line, encoding, next) {
    // const parsedLine = parseLine(line)
    if (line[0] === '#') {
      return next(null, `${line}\n`)
    } else {
      const parsedLine = parseLine(line)
      if (this.filter.source && parsedLine.source === this.filter.source) {
        return next(null, `${line}\n`)
      }
    }
    next()
  }
}


const server = createServer((req, res) => {
  const filename = '../data/GCF_000002035.6_GRCz11_genomic.gff'
  const fileStream = fs.createReadStream(filename, {encoding: 'utf8'})




  const filterTransform = new FilterTest({ source: 'Gnomon' })
  const rl = readline.createInterface({
    input: fileStream,
    crltDelay: Infinity
  })
  const fileStreamByLine = Readable.from(rl)
  fileStreamByLine
    .pipe(filterTransform)
    .pipe(res)
    .on('finish', () => {
      res.end('Done')
    })
})


const req = request('https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/002/035/GCF_000002035.6_GRCz11/GCF_000002035.6_GRCz11_genomic.gff.gz', (res) => {

  const filterTransform = new FilterTest({ source: 'Gnomon' })
  const rl = readline.createInterface({
    input: res.pipe(createGunzip()),
    crltDelay: Infinity
  })
  const fileStreamByLine = Readable.from(rl)
  const writeStream = fs.createWriteStream('./download.gff')
  const filteredStream = fileStreamByLine.pipe(filterTransform)

  filteredStream.pipe(process.stdout)
  filteredStream.pipe(writeStream)
})

req.on('error', (err) => {
  console.error(err)
})
req.end()

// server.listen(3000, () => console.log('Server listening ...'))
