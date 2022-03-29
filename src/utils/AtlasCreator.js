import Jimp from "jimp"

function nextPow2 (value) {
  const e = Math.ceil(Math.log(value) / Math.log(2))
  return Math.pow(2, e)
}

export default class AtlasCreator {
  constructor(buffers, useNextPow2) {
    this.buffers = buffers
    this.useNextPow2 = useNextPow2
  }

  calculateFrame() {
    // calculating max size of single frame if images has different w/h    
    const w = Math.max(...this.images.map(image => image.bitmap.width))
    const h = Math.max(...this.images.map(image => image.bitmap.height))

    const frame = {
      width: this.useNextPow2 ? nextPow2(w) : w,
      height: this.useNextPow2 ? nextPow2(h) : h
    }
    return frame
  }

  getOffset(image, frame, pivot) {
    const { width, height } = image.bitmap

    const offset = {
      x: (frame.width - width) * pivot.x,
      y: (frame.height - height) * pivot.y
    }
    return offset
  }

  async createGrid(grid, pivot) {

    this.images = await Promise.all(this.buffers.map(b => Jimp.read(b)))

    const frame = this.calculateFrame()

    this.options = {
      grid,
      pivot,
      frame
    }

    const w = frame.width * grid.x
    const h = frame.height * grid.y

    const jimp = new Jimp(w, h)

    for (let y = 0; y < grid.y; y++) {
      for (let x = 0; x < grid.x; x++) {
        const index = y * grid.x + x
        const img = this.images[index]
        if (!img) break
        const offset = this.getOffset(img, frame, pivot)
        const position = {
          x: x * frame.width + offset.x,
          y: y * frame.height + offset.y
        }
        jimp.composite(img, position.x, position.y)
      }
    }

    return jimp.getBase64Async(Jimp.MIME_PNG)
  }

  createHorizontal(pivot) {
    const grid = {
      x: this.buffers.length,
      y: 1
    }
    return this.createGrid(grid, pivot)
  }

  createVertical(pivot) {
    const grid = {
      x: 1,
      y: this.buffers.length
    }
    return this.createGrid(grid, pivot)
  }
}
