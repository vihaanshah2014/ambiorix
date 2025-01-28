"use client";

import React, { useState } from 'react';
import Chat from '@/components/Chat';
import FileUploader from '@/components/FileUploader';
import GraphRenderer from '@/components/GraphRenderer';
import Image from 'next/image';

// Add interface for OutputType
interface OutputType {
  plot?: string;
  stats?: string;
}

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [graphCode, setGraphCode] = useState<string>('');
  const [output, setOutput] = useState<OutputType | null>(null);
  const [results, setResults] = useState<any>(null);

  const runCode = async (codeToRun: string) => {
    try {
      if (!uploadedFile) {
        console.error('No file uploaded');
        return;
      }

      // Convert file to base64
      const fileBuffer = await uploadedFile.arrayBuffer();
      const fileBase64 = Buffer.from(fileBuffer).toString('base64');

      const response = await fetch('/api/run-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeToRun,
          fileName: uploadedFile.name,
          fileContent: fileBase64
        }),
      });
      
      const data = await response.json();
      setResults(data);
      
      if (data.output) {
        try {
          // Parse the output string into a JavaScript object
          const outputString = data.output.replace(/'/g, '"');
          const parsedOutput = JSON.parse(outputString);
          setOutput(parsedOutput);
        } catch (error) {
          console.error('Error parsing output:', error);
          setOutput(null);
        }
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(null);
    }
  };

  // Handler to receive the code snippet from the chat
  const handleCodeGenerated = (code: string) => {
    setGraphCode(code);
    runCode(code);  // Automatically run the code when received
  };

  // Test function to run complex Python code
  const runHelloWorld = async () => {
    try {
      const complexCode = `
import numpy as np
import matplotlib.pyplot as plt
import base64
from io import BytesIO

# Generate sample data
x = np.linspace(-5, 5, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# Create a plot
plt.figure(figsize=(10, 6))
plt.plot(x, y1, label='sin(x)', color='blue')
plt.plot(x, y2, label='cos(x)', color='red')
plt.grid(True)
plt.title('Trigonometric Functions')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()

# Save plot to a base64 string
buffer = BytesIO()
plt.savefig(buffer, format='png')
plt.close()
buffer.seek(0)
plot_data = base64.b64encode(buffer.getvalue()).decode()

# Do some calculations
mean_sin = np.mean(y1)
mean_cos = np.mean(y2)
std_sin = np.std(y1)
std_cos = np.std(y2)

result = {
    'plot': plot_data,
    'stats': f"""
Statistical Analysis:
-------------------
Sin(x):
  Mean: {mean_sin:.4f}
  Std Dev: {std_sin:.4f}
  
Cos(x):
  Mean: {mean_cos:.4f}
  Std Dev: {std_cos:.4f}
"""
}

print(result)`;

      const response = await fetch('/api/run-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: complexCode
        }),
      });
      
      const data = await response.json();
      setResults(data);
      
      // Parse the output string into a JavaScript object
      const outputString = data.output.replace(/'/g, '"'); // Replace single quotes with double quotes
      const parsedOutput = JSON.parse(outputString);
      setOutput(parsedOutput);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(null);
    }
  };

  // Add proper image display
  const PlotDisplay = ({ plotData }: { plotData: string }) => {
    return (
      <Image 
        src={`data:image/png;base64,${plotData}`}
        alt="Statistical plot"
        width={800}
        height={600}
      />
    );
  };

  // Add stats formatting
  const StatsDisplay = ({ stats }: { stats: string }) => {
    // Replace escaped newlines with actual newline characters
    const formattedStats = stats.replace(/\\n/g, '\n');
    return (
      <pre className="whitespace-pre-wrap font-mono text-sm">
        {formattedStats}
      </pre>
    );
  };

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">AI Graph Platform</h1>
      
      {/* Test Button */}
      <div className="flex flex-col items-center gap-4">
        {/* <button 
          onClick={runHelloWorld}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Run Python
        </button> */}
        {output && (
          <div className="space-y-4 w-full">
            {/* Display the plot if available */}
            {output.plot && (
              <PlotDisplay plotData={output.plot} />
            )}
            {/* Display the statistics */}
            {output.stats && (
              <StatsDisplay stats={output.stats} />
            )}
          </div>
        )}
      </div>
      
      {/* File Uploader */}
      <FileUploader onFileSelect={setUploadedFile} />

      {/* Chat Area */}
      <Chat uploadedFile={uploadedFile} onCodeGenerated={handleCodeGenerated} />

      {/* Graph Preview */}
      {graphCode && (
        <div className="border border-gray-300 p-4 rounded-md bg-white">
          <h2 className="text-xl font-semibold mb-2">Graph Preview</h2>
          <GraphRenderer code={graphCode} uploadedFile={uploadedFile} />
        </div>
      )}

      {results && (
        <div className="mt-4 space-y-4">
          {/* <div>Debug - Raw results:</div>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(results, null, 2)}
          </pre>
          
          <div>Debug - Plot data exists: {results.plot ? 'Yes' : 'No'}</div>
          <div>Debug - Stats exists: {results.stats ? 'Yes' : 'No'}</div> */}
          
          {results.plot && (
            <div>
              <div>Plot:</div>
              <PlotDisplay plotData={results.plot} />
            </div>
          )}
          
          {results.stats && (
            <div>
              <div>Stats:</div>
              <StatsDisplay stats={results.stats} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
