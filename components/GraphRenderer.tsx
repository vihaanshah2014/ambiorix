import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';

/**
 * A very simplistic component that just dangerously sets inner HTML.
 * In a real app, you might parse the code or integrate with a known
 * React chart library to safely render the chart.
 */
interface GraphRendererProps {
  code: string;
}

interface OutputData {
  plot?: string;
  stats?: string;
  error?: string;
}

const GraphRenderer: React.FC<GraphRendererProps> = ({ code }) => {
  const [output, setOutput] = useState<OutputData | null>(null);
  
  const handleRun = async () => {
    try {
      const response = await fetch('/api/run-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      // Parse the output string which is a JSON string
      const outputData = JSON.parse(data.output);
      setOutput(outputData);
    } catch (error) {
      console.error('Failed to run code:', error);
      setOutput({ error: 'Error running code' });
    }
  };

  return (
    <div className="graph-renderer">
      <div className="code-section">
        <SyntaxHighlighter language="python" style={github}>
          {code}
        </SyntaxHighlighter>
        <button 
          onClick={handleRun}
          className="run-button"
        >
          Run Code
        </button>
      </div>
      {output && (
        <div className="output-section">
          {output.error && (
            <div className="error">{output.error}</div>
          )}
          {output.plot && (
            <img 
              src={`data:image/png;base64,${output.plot}`} 
              alt="Generated Plot" 
              className="plot-image"
            />
          )}
          {output.stats && (
            <pre className="stats-output">{output.stats}</pre>
          )}
        </div>
      )}
      <style jsx>{`
        .graph-renderer {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 16px;
          margin: 16px 0;
        }
        .code-section {
          position: relative;
          margin-bottom: 16px;
        }
        .run-button {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 6px 12px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .run-button:hover {
          background-color: #0051cc;
        }
        .output-section {
          border-top: 1px solid #ddd;
          padding-top: 16px;
        }
        .plot-image {
          max-width: 100%;
          height: auto;
          margin: 16px 0;
        }
        .stats-output {
          white-space: pre-wrap;
          background: #f5f5f5;
          padding: 16px;
          border-radius: 4px;
        }
        .error {
          color: red;
          padding: 8px;
          background: #fff5f5;
          border-radius: 4px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default GraphRenderer;
