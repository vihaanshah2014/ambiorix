"use client";

import React, { useState } from 'react';
import Chat from '@/components/Chat';
import FileUploader from '@/components/FileUploader';
import Image from 'next/image';

interface ChartOutput {
  success: boolean;
  plot?: string;
  error?: string;
  message?: string;
}

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [chartOutput, setChartOutput] = useState<ChartOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeExecution = async (code: string) => {
    if (!uploadedFile) {
      console.error('No file uploaded');
      return;
    }

    try {
      console.log('Starting code execution...');
      setIsLoading(true);
      
      // Convert file to base64
      console.log('Converting file to base64...');
      const fileBuffer = await uploadedFile.arrayBuffer();
      const fileBase64 = Buffer.from(fileBuffer).toString('base64');
      console.log('File converted successfully');

      console.log('Sending request to run-python endpoint...');
      const response = await fetch('/api/run-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          fileName: uploadedFile.name,
          fileContent: fileBase64
        }),
      });
      
      console.log('Received response from run-python endpoint');
      const data = await response.json();
      console.log('Response data:', data);
      
      setChartOutput(data);
    } catch (error) {
      console.error('Error executing code:', error);
      setChartOutput({
        success: false,
        error: 'Failed to execute code'
      });
    } finally {
      console.log('Code execution completed');
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">AI Chart Generator</h1>
      
      {/* File Upload Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <FileUploader onFileSelect={setUploadedFile} />
      </section>

      {/* Chat Interface */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Chat with AI</h2>
        <Chat 
          uploadedFile={uploadedFile} 
          onCodeGenerated={handleCodeExecution}
        />
      </section>

      {/* Chart Output */}
      {(isLoading || chartOutput) && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Generated Chart</h2>
          
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {chartOutput && !isLoading && (
            <div>
              {chartOutput.error ? (
                <div className="text-red-500 p-4 bg-red-50 rounded">
                  Error: {chartOutput.error}
                </div>
              ) : chartOutput.plot ? (
                <div className="flex justify-center">
                  <Image
                    src={`data:image/png;base64,${chartOutput.plot}`}
                    alt="Generated chart"
                    width={800}
                    height={600}
                    className="max-w-full h-auto"
                  />
                </div>
              ) : (
                <div className="text-gray-500 p-4 bg-gray-50 rounded">
                  {chartOutput.message || 'No chart was generated'}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
