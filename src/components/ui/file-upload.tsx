"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  onChange?: (files: File[]) => void
  onRemove?: (index: number) => void
  files?: File[]
  maxFiles?: number
  showPreview?: boolean
  label?: string
  description?: string
}

function FileUpload({
  className,
  onChange,
  onRemove,
  files = [],
  maxFiles = 10,
  showPreview = true,
  label,
  description,
  accept = "image/*",
  multiple = true,
  disabled,
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      const newFiles = multiple 
        ? [...files, ...selectedFiles].slice(0, maxFiles)
        : [selectedFiles[0]]
      onChange?.(newFiles)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      const newFiles = multiple 
        ? [...files, ...droppedFiles].slice(0, maxFiles)
        : [droppedFiles[0]]
      onChange?.(newFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemove = (index: number) => {
    onRemove?.(index)
    const newFiles = files.filter((_, i) => i !== index)
    onChange?.(newFiles)
  }

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:border-primary/50 cursor-pointer"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          {...props}
        />
        
        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
          <div className={cn(
            "rounded-full p-3",
            isDragging ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-6 w-6",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {label || "Click to upload or drag and drop"}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const preview = getFilePreview(file)
            
            return (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt={file.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                    <File className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(index)
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { FileUpload }
