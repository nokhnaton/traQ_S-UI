import { start, finish, initVars } from './vars'
import { loadImage, resetCanvas } from './canvas'
import { needResize, getThumbnailDimensions, Dimensions } from './size'
import { isIOS } from '../util/browser'
import { mimeToFileType } from '../util/file'

export const canResize = (mime: string) =>
  ['image/png', 'image/jpeg'].includes(mime)
export const isJpeg = (mime: string) => mime === 'image/jpeg'

const iOSFlag = isIOS()
// iOSではcanvasサイズの上限が決まっているため
// Canvas area exceeds the maximum limit (width * height > 16777216).
const cannotResizeWhenIOS = ({ width, height }: Readonly<Dimensions>) =>
  iOSFlag && width * height > 16777216

const resize = async (
  inputFile: Readonly<File>
): Promise<File | 'cannot resize' | 'error' | null> => {
  start()
  const { pica, $input, $output, $img } = await initVars()

  const inputUrl = URL.createObjectURL(inputFile)

  try {
    await loadImage(inputUrl, $img)
    const inputSize = {
      width: $img.width,
      height: $img.height
    }
    if (!needResize(inputSize)) {
      return finish(null, inputUrl)
    }

    if (cannotResizeWhenIOS(inputSize)) {
      return finish('cannot resize', inputUrl)
    }

    resetCanvas($input, inputSize, $img)

    const outputSize = getThumbnailDimensions(inputSize)
    resetCanvas($output, outputSize)
    await pica.resize($input, $output, {
      quality: 2,
      alpha: true
    })

    const output = await pica.toBlob($output, inputFile.type)
    const outputFile = new File([output], inputFile.name, {
      type: inputFile.type,
      lastModified: inputFile.lastModified
    })

    return finish(outputFile, inputUrl)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to generate thumbnail image: ${e}`, e)
    return finish('error', inputUrl)
  }
}

const IMAGE_SIZE_LIMIT = 20 * 1000 * 1000 // 20MB
const FILE_SIZE_LIMIT = 30 * 1000 * 1000 // 30MB

const tooLargeFileMessage =
  window.traQConfig.tooLargeFileMessage ??
  '大きい%sの共有には別のサービスを利用してください。'

const IMAGE_MAX_SIZE_EXCEEDED_MESSAGE = `画像サイズは20MBまでです\n${tooLargeFileMessage.replace(
  '%s',
  '画像'
)}`
const FILE_MAX_SIZE_EXCEEDED_MESSAGE = `画像サイズは30MBまでです\n${tooLargeFileMessage.replace(
  '%s',
  'ファイル'
)}`

export const getAttachmentFile = async (file: File) => {
  const fileType = mimeToFileType(file.type)

  if (fileType === 'image' && file.size > IMAGE_SIZE_LIMIT) {
    throw new Error(IMAGE_MAX_SIZE_EXCEEDED_MESSAGE)
  }
  if (file.size > FILE_SIZE_LIMIT) {
    throw new Error(FILE_MAX_SIZE_EXCEEDED_MESSAGE)
  }

  if (fileType !== 'image') {
    return file
  }

  const resizable = canResize(file.type)
  if (!resizable) {
    return file
  }

  const res = await resize(file)
  if (res === 'cannot resize') {
    throw new Error('画像が大きいためサムネイルは生成されません')
  }
  if (res === 'error') {
    throw new Error('画像の形式が不正なためサムネイルは生成されません')
  }
  return res ?? file
}
