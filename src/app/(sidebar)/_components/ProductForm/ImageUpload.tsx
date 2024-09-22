import type { FileWithPath } from '@mantine/dropzone'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import '@mantine/dropzone/styles.css'
import {
  ActionIcon,
  Box,
  Flex,
  Image,
  Paper,
  SimpleGrid,
  Text,
  useMantineTheme
} from '@mantine/core'
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react'
import { supabase } from '~/lib/supabase'
import { useEditability } from '../../hooks'
import { useFormContext } from 'react-hook-form'
import { NEXT_PUBLIC_SUPABASE_STORAGE } from '~/util/env'

type ImageUploadProps = {
  onFilesChange: (files: string[]) => void // URLを保存するためにstring[]に変更
  files: string[]
  setFiles: React.Dispatch<React.SetStateAction<string[]>>
  isEditForm?: boolean
  setIsChanged?: (isChanged: boolean) => void
}

export const ImageUpload = ({
  onFilesChange,
  files,
  setFiles,
  isEditForm,
  setIsChanged
}: ImageUploadProps) => {
  const theme = useMantineTheme()
  const { isEditable } = useEditability()
  const { watch } = useFormContext()
  const isPublished = watch('isPublished')

  const removeFile = (fileUrl: string) => {
    if (isEditForm && !isEditable && isPublished) return
    setFiles((currentFiles) => currentFiles.filter((url) => url !== fileUrl))
    setIsChanged?.(true)
  }

  const handleDrop = async (acceptedFiles: FileWithPath[]) => {
    if (isEditForm && !isEditable && isPublished) return
    const uploadPromises = acceptedFiles.map(async (file) => {
      const { data, error } = await supabase.storage
        .from(NEXT_PUBLIC_SUPABASE_STORAGE) // TODO：後で環境変数に修正
        .upload(`images/${file.name}`, file)

      if (error) {
        console.error('Error uploading file:', error)
        return null
      }
      const { publicUrl } = supabase.storage
        .from(NEXT_PUBLIC_SUPABASE_STORAGE)
        .getPublicUrl(`images/${file.name}`).data

      return publicUrl
    })

    const urls = await Promise.all(uploadPromises)
    const validUrls = urls.filter((url): url is string => url !== null)

    setFiles((currentFiles) => [...currentFiles, ...validUrls])
    onFilesChange([...files, ...validUrls])
    setIsChanged?.(true)
  }

  const previews = files.map((fileUrl) => (
    <Paper key={fileUrl} style={{ position: 'relative' }}>
      <Image src={fileUrl} />
      <ActionIcon
        color="gray"
        size="16"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          borderRadius: 4,
          transform: 'translate(50%, -50%)'
        }}
        onClick={() => removeFile(fileUrl)}
      >
        <IconX size={12} stroke={4} />
      </ActionIcon>
    </Paper>
  ))

  return (
    <>
      <Dropzone
        onDrop={handleDrop}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        style={{ maxWidth: '447px' }}
        p="60"
      >
        <Flex
          align="center"
          gap="sm"
          wrap="nowrap"
          style={{ pointerEvents: 'none' }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={32}
              stroke={2}
              color={theme.colors.dark[8]}
              style={{ flexShrink: 0 }}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              size={32}
              color={theme.colors.dark[8]}
              stroke={2}
              style={{ flexShrink: 0 }}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              size={32}
              stroke={2}
              color={theme.colors.dark[8]}
              style={{ flexShrink: 0 }}
            />
          </Dropzone.Idle>
          <Box>
            <Text size="sm">
              ファイルをドラッグするかクリックしてファイルをアップロードしてください
            </Text>
            <Text fz="10" c="dimmed" mt={3}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </Box>
        </Flex>
      </Dropzone>
      <SimpleGrid cols={4} mt="xl">
        {previews}
      </SimpleGrid>
    </>
  )
}
