import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
  } from 'react'
  import { message } from 'antd'
  import { ImagePlus, Loader2, Video } from 'lucide-react'
  import {
    uploadImageFile,
    uploadPrivateImageFile,
    useGetPresignedUploadUrlMutation,
    usePrivateUploadImageMutation,
  } from '../../redux/api/imageUploadApi'
  
  type ImageUploaderProps = {
    value?: string
    /** Public URL (default) or private storage key when `privateUpload` is true. */
    onChange?: (value: string) => void
    onFileSelect?: (file: File | null) => void
    autoUpload?: boolean
    /** Use private R2 upload; `onChange` receives the storage `key`, not a public URL. */
    privateUpload?: boolean
    label?: string
    required?: boolean
    disabled?: boolean
    accept?: string
    allowVideo?: boolean
    hint?: string
    className?: string
    heightClass?: string
  }
  
  export default function ImageUploader({
    value = '',
    onChange,
    onFileSelect,
    autoUpload = false,
    privateUpload = false,
    label,
    required = false,
    disabled = false,
    accept = 'image/*',
    allowVideo = false,
    hint = 'PNG, JPG, or WEBP',
    className = '',
    heightClass = 'h-48',
  }: ImageUploaderProps) {
    const fileInput = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState(value)
    const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [getPresignedUrl] = useGetPresignedUploadUrlMutation()
    const [getPrivatePresignedUrl] = usePrivateUploadImageMutation()

    const inferPreviewType = (url: string): 'image' | 'video' | null => {
      if (!url) return null
      const lowered = url.toLowerCase()
      const videoExt = ['.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v']
      if (videoExt.some((ext) => lowered.includes(ext))) return 'video'
      return 'image'
    }
  
    useEffect(() => {
      if (privateUpload) {
        if (!value) {
          setPreviewUrl((prev) => {
            if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)
            return ''
          })
          setPreviewType(null)
          return
        }
        // Storage keys are not viewable URLs — keep local blob preview after upload.
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
          setPreviewUrl(value)
          setPreviewType(inferPreviewType(value))
        }
        return
      }
      setPreviewUrl(value)
      setPreviewType(inferPreviewType(value))
    }, [value, privateUpload])
  
    useEffect(() => {
      return () => {
        if (previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl)
        }
      }
    }, [previewUrl])
  
    const setLocalPreview = (file: File) => {
      const localPreview = URL.createObjectURL(file)
      setPreviewType(file.type.startsWith('video/') ? 'video' : 'image')
  
      setPreviewUrl((prev) => {
        if (prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev)
        }
        return localPreview
      })
    }
  
    const resetPreview = () => {
      setPreviewUrl((prev) => {
        if (prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev)
        }
        return value
      })
      setPreviewType(inferPreviewType(value))
    }
  
    const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
  
      if (!file) return
  
      const fileIsImage = file.type.startsWith('image/')
      const fileIsVideo = file.type.startsWith('video/')
      const fileIsPdf =
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const canUseVideo = allowVideo || accept.includes('video/')
      const canUsePdf = accept.includes('pdf') || accept.includes('application/pdf')
      if (!fileIsImage && !(canUseVideo && fileIsVideo) && !(canUsePdf && fileIsPdf)) {
        message.warning(
          canUsePdf
            ? 'Please select an image or PDF file.'
            : canUseVideo
              ? 'Please select an image or video file.'
              : 'Please select an image file.',
        )
        return
      }
  
      if (!autoUpload) {
        setLocalPreview(file)
        onFileSelect?.(file)
        return
      }
  
      setLocalPreview(file)
      setIsUploading(true)
  
      try {
        const result = privateUpload
          ? await uploadPrivateImageFile(file, async (payload) => {
              const res = await getPrivatePresignedUrl(payload).unwrap()
              return res
            })
          : await uploadImageFile(file, async (payload) => {
              const res = await getPresignedUrl(payload).unwrap()
              return res
            })
  
        // Public uploads preview via CDN URL; private uploads keep local blob preview
        // since the API only returns a storage key (not a viewable URL).
        if (!privateUpload) {
          setPreviewUrl((prev) => {
            if (prev.startsWith('blob:')) {
              URL.revokeObjectURL(prev)
            }
            return result
          })
        } else if (fileIsPdf) {
          // PDF has no image preview — clear blob and show empty dropzone with key below.
          setPreviewUrl((prev) => {
            if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)
            return ''
          })
          setPreviewType(null)
        }
  
        onChange?.(result)
        onFileSelect?.(null)
        message.success(
          fileIsPdf
            ? 'Document uploaded successfully.'
            : fileIsVideo
              ? 'Video uploaded successfully.'
              : 'Image uploaded successfully.',
        )
      } catch (error) {
        resetPreview()
        onFileSelect?.(null)
  
        const errorMessage =
          error instanceof Error
            ? error.message
            : fileIsPdf
              ? 'Document upload failed.'
              : fileIsVideo
                ? 'Video upload failed.'
                : 'Image upload failed.'
        message.error(errorMessage)
      } finally {
        setIsUploading(false)
      }
    }
  
    const content = (
      <>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={disabled || isUploading}
          className={`group relative flex ${heightClass} w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-brand bg-transparent transition-colors hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-sm">Uploading media...</span>
            </div>
          ) : previewUrl ? (
            <>
              {previewType === 'video' ? (
                <video src={previewUrl} className="h-full w-full object-cover" controls />
              ) : (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
                  {previewType === 'video' ? <Video size={14} /> : <ImagePlus size={14} />}
                  Change media
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-gray-300">
              {allowVideo ? <Video size={28} /> : <ImagePlus size={28} />}
              <span className="text-sm">{allowVideo ? 'Click to select image/video' : 'Click to select image'}</span>
              <span className="text-[11px] text-gray-500">{hint}</span>
            </div>
          )}
        </button>
  
        <input
          ref={fileInput}
          type="file"
          accept={accept}
          onChange={onFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </>
    )
  
    if (!label) {
      return <div className={className}>{content}</div>
    }
  
    return (
      <label className={`block ${className}`}>
        <span className="mb-2 block text-sm font-medium text-white">
          {label}
          {required && <span className="ml-1 text-accent-amber">*</span>}
        </span>
        {content}
      </label>
    )
  }
  