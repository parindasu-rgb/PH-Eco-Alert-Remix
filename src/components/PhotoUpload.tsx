import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../i18n';

interface PhotoUploadProps {
  photoBase64: string | undefined;
  onPhotoChange: (base64: string | undefined) => void;
  lang: Language;
  onRunAiAnalysis?: () => void;
  isAiAnalyzing?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photoBase64,
  onPhotoChange,
  lang,
  onRunAiAnalysis,
  isAiAnalyzing,
}) => {
  const t = getTranslation(lang);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(lang === 'th' ? 'กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)' : 'Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(lang === 'th' ? 'ขนาดไฟล์รูปภาพเกิน 5 MB' : 'Image size exceeds 5 MB');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onPhotoChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!photoBase64 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragActive
              ? 'border-[#16A085] bg-emerald-50/60 scale-[0.99]'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-100/80 text-[#16A085] flex items-center justify-center shadow-sm">
            <Camera className="w-7 h-7" />
          </div>

          <h4 className="text-sm font-semibold text-slate-800 mb-1">{t.photoUploadTitle}</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">{t.photoUploadSub}</p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#138a72] rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{t.takePhoto}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>{t.chooseGallery}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-md">
          <img
            src={photoBase64}
            alt="Incident photo"
            className="w-full h-64 md:h-72 object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-90 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500 text-white rounded-full shadow-sm">
                ✓ Photo Attached
              </span>

              <button
                type="button"
                onClick={() => onPhotoChange(undefined)}
                className="p-2 text-red-100 hover:text-white bg-red-600/80 hover:bg-red-600 rounded-full transition-all cursor-pointer"
                title={t.removePhoto}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {onRunAiAnalysis && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onRunAiAnalysis}
                  disabled={isAiAnalyzing}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-75"
                >
                  {isAiAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{isAiAnalyzing ? t.aiAnalyzing : t.aiAnalyzeBtn}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
