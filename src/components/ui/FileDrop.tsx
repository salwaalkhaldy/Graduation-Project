import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../../utils/image';
import { Button } from './Button';

export interface FileDropProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value?: string; // Data URL
  onChange: (dataUrl: string) => void;
  onRemove?: () => void;
  accept?: string;
  maxSizeMb?: number;
}

export const FileDrop: React.FC<FileDropProps> = ({
  label,
  hint = 'PNG, JPG or WebP up to 5 MB',
  error,
  required = false,
  value,
  onChange,
  onRemove,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMb = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLocalError(null);
    if (!file.type.startsWith('image/')) {
      setLocalError('Only image files (JPG, PNG, WebP) are allowed.');
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`File size exceeds maximum limit of ${maxSizeMb} MB.`);
      return;
    }

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file, 1024, 0.8);
      onChange(compressedDataUrl);
    } catch (err) {
      setLocalError('Failed to process image. Please try another file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove ? onRemove() : onChange('');
    setLocalError(null);
  };

  const displayError = error || localError;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold text-slate-700 select-none">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </span>
      )}

      {value ? (
        <div className="relative flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="w-20 h-20 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
            <img
              src={value}
              alt="Uploaded file preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800">Image attached</p>
            <p className="text-[11px] text-slate-500 truncate">
              Compressed & ready for submission
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleClick}
              >
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={handleRemove}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-teal-600 bg-teal-50/50'
              : displayError
              ? 'border-rose-300 bg-rose-50/30'
              : 'border-slate-300 hover:border-teal-600 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
            {isCompressing ? (
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {isCompressing
                ? 'Compressing image...'
                : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {displayError && (
        <p className="text-xs font-medium text-rose-600">{displayError}</p>
      )}
    </div>
  );
};
