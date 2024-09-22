export function generateID() {
  let id = ''
  for (let i = 0; i < 64; i++) {
    const random = Math.random().toString(36).substring(2, 3)
    id += Math.random() < 0.5 ? random.toUpperCase() : random
  }
  return id
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
