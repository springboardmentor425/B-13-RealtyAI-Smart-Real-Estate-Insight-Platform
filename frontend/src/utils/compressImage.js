const MAX_PX = 1024          // max dimension in pixels
const QUALITY = 0.85         // jpeg quality
const THRESHOLD = 2_097_152  // only compress if > 2 MB

/**
 * Returns a compressed JPEG File if the original exceeds THRESHOLD,
 * otherwise returns the original file unchanged.
 */
export async function compressImage(file) {
  if (file.size <= THRESHOLD) return file

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale  = Math.min(1, MAX_PX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => {
          const name = file.name.replace(/\.[^.]+$/, '.jpg')
          resolve(new File([blob], name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        QUALITY,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}
