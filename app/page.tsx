"use client";

import React, { useState } from 'react';
import Chat from '@/components/Chat';
import FileUploader from '@/components/FileUploader';
import GraphRenderer from '@/components/GraphRenderer';

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [graphCode, setGraphCode] = useState<string>('');

  // Handler to receive the code snippet from the chat
  const handleCodeGenerated = (code: string) => {
    setGraphCode(code);
  };

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">AI Graph Platform</h1>
      
      {/* File Uploader */}
      <FileUploader onFileSelect={setUploadedFile} />

      {/* Chat Area */}
      <Chat uploadedFile={uploadedFile} onCodeGenerated={handleCodeGenerated} />

      {/* Graph Preview */}
      {graphCode && (
        <div className="border border-gray-300 p-4 rounded-md bg-white">
          <h2 className="text-xl font-semibold mb-2">Graph Preview</h2>
          <GraphRenderer code={graphCode} />
        </div>
      )}
    </main>
  );
}
