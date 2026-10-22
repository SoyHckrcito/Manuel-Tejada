import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check, Link, RefreshCw } from 'lucide-react';

interface ImageUploadDropzoneProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  aspectHint?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  value,
  onChange,
  label = 'Subir imagen desde tu PC o arrastrar aquí',
  aspectHint = 'Formatos: PNG, JPG, WEBP. Se optimizará automáticamente.',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress & convert file to data URL
  const processImageFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    setProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize canvas if excessively large to keep DB lean & performant
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as optimized WebP or JPEG
          const optimizedDataUrl = canvas.toDataURL('image/webp', 0.88);
          onChange(optimizedDataUrl);
        } else {
          onChange(event.target?.result as string);
        }
        setProcessing(false);
      };
      img.onerror = () => {
        setProcessing(false);
      };
      img.src = event.target?.result as string;
    };

    reader.onerror = () => setProcessing(false);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyManualUrl = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setManualUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-300">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Link className="w-3 h-3" />
          <span>{showUrlInput ? 'Cerrar URL' : 'O pegar enlace/ruta'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://... o /src/assets/images/..."
            className="flex-1 bg-[#0a0b0e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-2 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
        className="hidden"
      />

      {/* Dropzone container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10'
            : value
            ? 'border-slate-700 bg-[#0a0b0e]/80 hover:border-amber-500/60'
            : 'border-slate-800 hover:border-slate-700 bg-[#0a0b0e] hover:bg-[#11131a]'
        }`}
      >
        {processing ? (
          <div className="py-6 flex flex-col items-center gap-2 text-amber-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="text-xs font-medium">Optimizando y cargando imagen...</span>
          </div>
        ) : value ? (
          /* Preview Mode */
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                <img
                  src={value}
                  alt="Vista previa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Imagen cargada correctamente</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Haz clic o arrastra para reemplazar desde tu PC
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60 hover:text-white transition-colors shrink-0"
              title="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Empty / Upload Prompt */
          <div className="py-4 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Arrastra y suelta tu imagen aquí, o{' '}
                <span className="text-amber-400 underline">examina en tu PC</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{aspectHint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
