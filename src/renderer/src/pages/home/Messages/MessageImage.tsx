import {
  CopyOutlined,
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import i18n from '@renderer/i18n'
import { Message } from '@renderer/types'
import { Image as AntdImage, Space } from 'antd'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  message: Message
}

const MessageImage: FC<Props> = ({ message }) => {
  if (!message.metadata?.generateImage) {
    return null
  }

  return (
    <Container style={{ marginBottom: 8 }}>
      {message.metadata?.generateImage!.images.map((image, index) => (
        <Image
          src={image}
          key={`image-${index}`}
          width="33%"
          preview={{
            toolbarRender: (
              _,
              {
                transform: { scale },
                actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn, onReset }
              }
            ) => (
              <ToobarWrapper size={12} className="toolbar-wrapper">
                <SwapOutlined rotate={90} onClick={onFlipY} />
                <SwapOutlined onClick={onFlipX} />
                <RotateLeftOutlined onClick={onRotateLeft} />
                <RotateRightOutlined onClick={onRotateRight} />
                <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                <UndoOutlined onClick={onReset} />
                <CopyOutlined onClick={() => onCopy(message.metadata?.generateImage?.type!, image)} />
                <DownloadOutlined onClick={() => onDownload(image, index)} />
              </ToobarWrapper>
            )
          }}
        />
      ))}
    </Container>
  )
}
const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 8px;
`
const Image = styled(AntdImage)`
  border-radius: 10px;
`
const ToobarWrapper = styled(Space)`
  padding: 0px 24px;
  color: #fff;
  font-size: 20px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 100px;
  .anticon {
    padding: 12px;
    cursor: pointer;
  }
  .anticon:hover {
    opacity: 0.3;
  }
`

const onDownload = (imageBase64: string, index: number) => {
  try {
    const link = document.createElement('a')
    link.href = imageBase64
    link.download = `image-${Date.now()}-${index}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.message.success(i18n.t('message.download.success'))
  } catch (error) {
    console.error('下载图片失败:', error)
    window.message.error(i18n.t('message.download.failed'))
  }
}

// 复制图片到剪贴板
const onCopy = async (type: string, image: string) => {
  try {
    switch (type) {
      case 'base64': {
        // 处理 base64 格式的图片
        const parts = image.split(';base64,')
        if (parts.length === 2) {
          const mimeType = parts[0].replace('data:', '')
          const base64Data = parts[1]
          const byteCharacters = atob(base64Data)
          const byteArrays: Uint8Array[] = []

          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512)
            const byteNumbers = new Array(slice.length)
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            byteArrays.push(byteArray)
          }

          const blob = new Blob(byteArrays, { type: mimeType })
          await navigator.clipboard.write([new ClipboardItem({ [mimeType]: blob })])
        } else {
          throw new Error('无效的 base64 图片格式')
        }
        break
      }
      case 'url':
        {
          // 处理 URL 格式的图片
          const response = await fetch(image)
          const blob = await response.blob()

          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ])
        }
        break
    }

    window.message.success(i18n.t('message.copy.success'))
  } catch (error) {
    console.error('复制图片失败:', error)
    window.message.error(i18n.t('message.copy.failed'))
  }
}

export default MessageImage
