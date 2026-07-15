import { baseApi } from './baseApi'

export interface ImageUploadPayload {
  fileName: string
  fileSize: string
}

export interface PresignedUrlData {
  uploadUrl: string
  key: string
  /** Present for public uploads; private uploads only return a storage key. */
  publicUrl?: string
  contentType: string
  folder: string
}

export interface ImageUploadResponse {
  success: boolean
  message: string
  data: PresignedUrlData
}

/** Exact JSON body expected by `/uploads/presigned-url` APIs. */
export function toImageUploadPayload(file: File): ImageUploadPayload {
  return {
    fileName: file.name,
    fileSize: String(file.size),
  }
}

function normalizeImageUploadBody(body: ImageUploadPayload): ImageUploadPayload {
  return {
    fileName: String(body.fileName ?? ''),
    fileSize: String(body.fileSize ?? ''),
  }
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
  const presigned = await getPresignedUrl(toImageUploadPayload(file))

  if (!presigned.success) {
    throw new Error(presigned.message || 'Failed to get upload URL')
  }

  await uploadFileToPresignedUrl(
    presigned.data.uploadUrl,
    file,
    presigned.data.contentType,
  )

  if (!presigned.data.publicUrl) {
    throw new Error('Upload succeeded but no public URL was returned')
  }

  return presigned.data.publicUrl
}

/** Private uploads: PUT to R2, then return the storage `key` (not a public URL). */
export async function uploadPrivateImageFile(
  file: File,
  getPresignedUrl: (
    payload: ImageUploadPayload,
  ) => Promise<ImageUploadResponse>,
): Promise<string> {
  const presigned = await getPresignedUrl(toImageUploadPayload(file))

  if (!presigned.success) {
    throw new Error(presigned.message || 'Failed to get upload URL')
  }

  await uploadFileToPresignedUrl(
    presigned.data.uploadUrl,
    file,
    presigned.data.contentType,
  )

  if (!presigned.data.key) {
    throw new Error('Upload succeeded but no storage key was returned')
  }

  return presigned.data.key
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
        headers: { 'Content-Type': 'application/json' },
        body: normalizeImageUploadBody(body),
      }),
    }),
    privateUploadImage: builder.mutation<
      ImageUploadResponse,
      ImageUploadPayload
    >({
      query: (body) => ({
        url: '/uploads/presigned-url/private',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: normalizeImageUploadBody(body),
      }),
    }),
  }),
})

export const { useGetPresignedUploadUrlMutation, usePrivateUploadImageMutation } = imageUploadApi
