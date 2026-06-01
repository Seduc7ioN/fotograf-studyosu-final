"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { useSettings } from "@/hooks/useSettings";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import clsx from "clsx";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "waiting" | "uploading" | "done" | "error";
  error?: string;
}

interface PhotoUploaderProps {
  albumId: string;
  onUploadComplete?: () => void;
}

export default function PhotoUploader({
  albumId,
  onUploadComplete,
}: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { settings } = useSettings();
  const maxUploadSizeMB = settings.maxUploadSizeMB || 30;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "waiting",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: maxUploadSizeMB * 1024 * 1024,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((f) => f.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadAll = async () => {
    const waiting = files.filter((f) => f.status === "waiting");
    if (waiting.length === 0) return;

    setIsUploading(true);

    await Promise.all(
      waiting.map(async (uploadFile, index) => {
        const ext = uploadFile.file.name.split(".").pop();
        const photoId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const storagePath = `albums/${albumId}/originals/${photoId}.${ext}`;
        const storageRef = ref(storage, storagePath);

        // Progress'i güncelle
        const updateProgress = (progress: number, status: UploadFile["status"]) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress, status } : f
            )
          );
        };

        try {
          updateProgress(0, "uploading");

          await new Promise<void>((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, uploadFile.file);

            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const pct = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                updateProgress(pct, "uploading");
              },
              (error) => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === uploadFile.id
                      ? { ...f, status: "error", error: error.message }
                      : f
                  )
                );
                reject(error);
              },
              async () => {
                // Firestore'a photo kaydı ekle
                await addDoc(
                  collection(db, "albums", albumId, "photos"),
                  {
                    albumId,
                    storagePath,
                    thumbnailPath: null, // Cloud Function doldurur
                    isDownloadable: false,
                    order: index,
                    createdAt: serverTimestamp(),
                  }
                );

                // Albüm photoCount'ı artır
                await updateDoc(doc(db, "albums", albumId), {
                  photoCount: increment(1),
                });

                updateProgress(100, "done");
                resolve();
              }
            );
          });
        } catch (error: any) {
          updateProgress(0, "error");
        }
      })
    );

    setIsUploading(false);
    onUploadComplete?.();
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const waitingCount = files.filter((f) => f.status === "waiting").length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={clsx(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-amber-500 bg-amber-500/5"
            : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/30"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <p className="text-white font-medium">
          {isDragActive ? "Dosyaları bırakın..." : "Fotoğrafları sürükleyin"}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          veya tıklayarak seçin · JPG, PNG, WEBP · Maks {maxUploadSizeMB} MB
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {files.map((f) => (
              <div
                key={f.id}
                className="relative bg-gray-800 rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={f.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {/* Progress overlay */}
                {f.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 relative">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#374151" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke="#f59e0b" strokeWidth="3"
                          strokeDasharray={`${f.progress} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        {f.progress}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Done */}
                {f.status === "done" && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                )}

                {/* Error */}
                {f.status === "error" && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                )}

                {/* Remove */}
                {f.status === "waiting" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full
                               flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Summary + Upload Button */}
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
            <div className="text-sm text-gray-400 space-x-3">
              {waitingCount > 0 && <span>{waitingCount} bekliyor</span>}
              {doneCount > 0 && <span className="text-green-400">{doneCount} yüklendi</span>}
              {errorCount > 0 && <span className="text-red-400">{errorCount} hata</span>}
            </div>
            <button
              onClick={uploadAll}
              disabled={isUploading || waitingCount === 0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                         text-white font-medium rounded-lg text-sm transition-colors
                         flex items-center gap-2"
            >
              <Upload size={15} />
              {isUploading ? "Yükleniyor..." : `${waitingCount} Fotoğraf Yükle`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
