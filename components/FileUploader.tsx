import React, { ChangeEvent } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="block text-sm font-medium text-gray-700">Upload your data file (CSV, etc.)</label>
      <input
        type="file"
        onChange={handleFileChange}
        className="cursor-pointer bg-white border border-gray-300 text-sm rounded-md"
      />
    </div>
  );
};

export default FileUploader;
