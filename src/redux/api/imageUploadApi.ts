import { baseApi } from './baseApi'

export interface ImageUploadPayload {
  fileName: string
  fileSize: string
}

export interface PresignedUrlData {
  uploadUrl: string
  key: string
  publicUrl: string
  contentType: string
  folder: string
}

export interface ImageUploadResponse {
  success: boolean
  message: string
  data: PresignedUrlData
}

export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || `Upload failed (${response.status})`)
  }
}

export async function uploadImageFile(
  file: File,
  getPresignedUrl: (
    payload: ImageUploadPayload,
  ) => Promise<ImageUploadResponse>,
): Promise<string> {
  const presigned = await getPresignedUrl({
    fileName: file.name,
    fileSize: String(file.size),
  })

  if (!presigned.success) {
    throw new Error(presigned.message || 'Failed to get upload URL')
  }

  await uploadFileToPresignedUrl(
    presigned.data.uploadUrl,
    file,
    presigned.data.contentType,
  )

  return presigned.data.publicUrl
}

const imageUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresignedUploadUrl: builder.mutation<
      ImageUploadResponse,
      ImageUploadPayload
    >({
      query: (body) => ({
        url: '/uploads/presigned-url',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useGetPresignedUploadUrlMutation } = imageUploadApi
