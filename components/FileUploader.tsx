import React from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <label className="w-full">
        <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Drop your data file here or click to browse</p>
          <p className="text-xs text-gray-500">(CSV, Excel, etc.)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onFileSelect(file);
          }}
        />
      </label>
    </div>
  );
}
