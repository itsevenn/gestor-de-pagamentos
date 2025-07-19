'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: File) => void;
  imageFile: File | null;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageCropper({ isOpen, onClose, onCropComplete, imageFile }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(1)
  const [imageSrc, setImageSrc] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onSelectFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''))
      reader.readAsDataURL(file)
    }
  }, [])

  React.useEffect(() => {
    if (imageFile) {
      onSelectFile(imageFile)
    }
  }, [imageFile, onSelectFile])

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const getCroppedImg = useCallback(async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current) {
      return null
    }

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width
    canvas.height = completedCrop.height

    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], imageFile?.name || 'cropped-image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(file)
        } else {
          resolve(null)
        }
      }, 'image/jpeg', 0.9)
    })
  }, [completedCrop, imageFile?.name])

  const handleCropComplete = async () => {
    if (!completedCrop) {
      return
    }

    setIsProcessing(true)
    try {
      const croppedFile = await getCroppedImg()
      if (croppedFile) {
        onCropComplete(croppedFile)
        onClose()
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRotate = (direction: 'left' | 'right') => {
    setRotate(prev => direction === 'left' ? prev - 90 : prev + 90)
  }

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev * 1.1 : prev / 1.1
      return Math.min(Math.max(newScale, 0.5), 3)
    })
  }

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect)
    if (newAspect && imgRef.current) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, newAspect))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <ZoomIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            Recortar Imagem
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Controles */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Proporção:</span>
              <select
                value={aspect || ''}
                onChange={(e) => handleAspectChange(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
              >
                <option value="">Livre</option>
                <option value="1">1:1 (Quadrado)</option>
                <option value="4/3">4:3</option>
                <option value="3/2">3:2</option>
                <option value="16/9">16:9</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('left')}
                className="p-2"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('right')}
                className="p-2"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('out')}
                className="p-2"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('in')}
                className="p-2"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Área de Corte */}
          <div className="flex justify-center bg-slate-100 dark:bg-slate-900 rounded-lg p-4 min-h-[400px]">
            {imageSrc ? (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                minWidth={100}
                minHeight={100}
                keepSelection
                className="max-w-full max-h-[500px]"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageSrc}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: '100%',
                    maxHeight: '500px',
                  }}
                  onLoad={onImageLoad}
                  className="object-contain"
                />
              </ReactCrop>
            ) : (
              <div className="flex items-center justify-center text-slate-500 dark:text-slate-400">
                Carregando imagem...
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Dicas:</p>
            <ul className="space-y-1 text-xs">
              <li>• Arraste para mover a área de seleção</li>
              <li>• Redimensione arrastando as bordas</li>
              <li>• Use os controles para rotacionar e dar zoom</li>
              <li>• Escolha uma proporção para manter o formato</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleCropComplete}
            disabled={!completedCrop || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Aplicar Corte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 