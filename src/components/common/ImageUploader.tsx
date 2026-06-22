import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
  } from 'react'
  import { message } from 'antd'
  import { ImagePlus, Loader2 } from 'lucide-react'
  import {
    uploadImageFile,
    useGetPresignedUploadUrlMutation,
  } from '../../redux/api/imageUploadApi'
  
  type ImageUploaderProps = {
    value?: string
    onChange?: (publicUrl: string) => void
    onFileSelect?: (file: File | null) => void
    autoUpload?: boolean
    label?: string
    required?: boolean
    disabled?: boolean
    accept?: string
    hint?: string
    className?: string
    heightClass?: string
  }
  
  export default function ImageUploader({
    value = '',
    onChange,
    onFileSelect,
    autoUpload = false,
    label,
    required = false,
    disabled = false,
    accept = 'image/*',
    hint = 'PNG, JPG, or WEBP',
    className = '',
    heightClass = 'h-48',
  }: ImageUploaderProps) {
    const fileInput = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState(value)
    const [isUploading, setIsUploading] = useState(false)
    const [getPresignedUrl] = useGetPresignedUploadUrlMutation()
  
    useEffect(() => {
      setPreviewUrl(value)
    }, [value])
  
    useEffect(() => {
      return () => {
        if (previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl)
        }
      }
    }, [previewUrl])
  
    const setLocalPreview = (file: File) => {
      const localPreview = URL.createObjectURL(file)
  
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
    }
  
    const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
  
      if (!file) return
  
      if (!file.type.startsWith('image/')) {
        message.warning('Please select an image file.')
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
        const publicUrl = await uploadImageFile(file, async (payload) => {
          const result = await getPresignedUrl(payload).unwrap()
          return result
        })
  
        setPreviewUrl((prev) => {
          if (prev.startsWith('blob:')) {
            URL.revokeObjectURL(prev)
          }
          return publicUrl
        })
  
        onChange?.(publicUrl)
        onFileSelect?.(null)
        message.success('Image uploaded successfully.')
      } catch (error) {
        resetPreview()
        onFileSelect?.(null)
  
        const errorMessage =
          error instanceof Error ? error.message : 'Image upload failed.'
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
              <span className="text-sm">Uploading image...</span>
            </div>
          ) : previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
                  <ImagePlus size={14} />
                  Change image
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-gray-300">
              <ImagePlus size={28} />
              <span className="text-sm">Click to select image</span>
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
  