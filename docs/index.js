function setup () {
  frameRate(15)
  randomSeed(1);
  createCanvas(400, 400);
}

const BOTTOM = 30
const UP = 50
const DIST = 12

function createStrand(startYPosUp) {
  const strand = []
  let count = 0
  let yPosUp = startYPosUp
  for (let i = 0; i<9; i++) {
    strand.push({x: i*DIST, y: yPosUp ? UP : BOTTOM})
    if (count === 1) {
      count = 0 
      yPosUp = !yPosUp
    } else {
      count++
    }
  }
  return strand
}

let strandOne = createStrand(true)
let strandTwo = createStrand(false) 


function drawStrand(strand) {
  beginShape();
  strand.forEach((s) => {
    s.y += random(-0.2, 0.2)
    curveVertex(s.x, s.y)
  })
  endShape();
}


let counter = 0

function draw () {

  clear()

  strokeWeight(4)
  noFill();

  if (++counter > 20) {
    counter = 0
    strandOne = createStrand(true)
    strandTwo = createStrand(false) 
  }

  drawStrand(strandOne)
  drawStrand(strandTwo)

}
