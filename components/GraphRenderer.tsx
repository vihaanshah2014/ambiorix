import React from 'react';

/**
 * A very simplistic component that just dangerously sets inner HTML.
 * In a real app, you might parse the code or integrate with a known
 * React chart library to safely render the chart.
 */
interface GraphRendererProps {
  code: string;
}

const GraphRenderer: React.FC<GraphRendererProps> = ({ code }) => {
  return (
    <div
      className="graph-container"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
};

export default GraphRenderer;
