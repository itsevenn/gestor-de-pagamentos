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
        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
            Recortar Imagem
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-6">
          {/* Controles */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Proporção:</span>
              <select
                value={aspect || ''}
                onChange={(e) => handleAspectChange(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('right')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('out')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('in')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Área de Corte */}
          <div className="flex justify-center bg-slate-100 dark:bg-slate-900 rounded-xl p-6 min-h-[400px] border border-slate-200 dark:border-slate-700">
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
                  className="object-contain rounded-lg"
                />
              </ReactCrop>
            ) : (
              <div className="flex items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Carregando imagem...</p>
                </div>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="text-sm text-slate-600 dark:text-slate-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="font-semibold mb-2 text-blue-700 dark:text-blue-300">💡 Dicas de Uso:</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Arraste para mover a área de seleção
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Redimensione arrastando as bordas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Use os controles para rotacionar e dar zoom
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Escolha uma proporção para manter o formato
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
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