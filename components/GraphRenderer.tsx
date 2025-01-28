import React, { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * A very simplistic component that just dangerously sets inner HTML.
 * In a real app, you might parse the code or integrate with a known
 * React chart library to safely render the chart.
 */
interface GraphRendererProps {
  code: string;
  uploadedFile: File | null;
}

interface OutputData {
  success: boolean;
  plot?: string;
  error?: string;
  message?: string;
}

export default function GraphRenderer({ code, uploadedFile }: GraphRendererProps) {
  const [output, setOutput] = useState<OutputData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const executeCode = async () => {
      try {
        console.log('Executing code with:', { code, fileName: uploadedFile?.name });
        setIsLoading(true);
        setError(null);
        
        if (!uploadedFile) {
          setError('Please upload a file first');
          setIsLoading(false);
          return;
        }

        // Convert file to base64
        const fileBuffer = await uploadedFile.arrayBuffer();
        const fileBase64 = Buffer.from(fileBuffer).toString('base64');
        console.log('File converted to base64');

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

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!data.success) {
          console.error('Error from Python execution:', data.error);
          setError(data.error || 'An error occurred while executing the code');
          setOutput(null);
          return;
        }

        setOutput(data);
        setError(null);
      } catch (error) {
        console.error('Error executing code:', error);
        setError('Failed to execute code');
        setOutput(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (code && uploadedFile) {
      executeCode();
    }
  }, [code, uploadedFile]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <div className="mt-2 text-gray-600">Processing...</div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-gray-600">
          {!uploadedFile ? 'Please upload a file first' : 'Ready to generate graph'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {output.plot && (
        <div className="border border-gray-200 rounded-md p-4 bg-white">
          <Image
            src={`data:image/png;base64,${output.plot}`}
            alt="Generated plot"
            width={800}
            height={600}
          />
        </div>
      )}
      {output.message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-blue-600">{output.message}</div>
        </div>
      )}
    </div>
  );
}
