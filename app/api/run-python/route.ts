import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Papa from 'papaparse';

export async function POST(request: Request) {
  let tempDir = '';
  let filePath = '';

  try {
    const { code, fileName, fileContent } = await request.json();
    
    if (!fileName || !fileContent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing file data' 
      }, { status: 400 });
    }

    // Create temp directory and save file
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-'));
    filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(fileContent, 'base64'));

    // Read and parse CSV file
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const parsedData = Papa.parse(fileData, {
      header: true,
      skipEmptyLines: true,
    });

    // Process the data according to the code instructions
    // The code will be a simplified DSL (Domain Specific Language) for chart creation
    const chartConfig = processChartInstructions(code, parsedData.data);

    // Clean up files
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return NextResponse.json({
      success: true,
      chartConfig
    });

  } catch (error) {
    // Clean up in case of error
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to process data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function processChartInstructions(code: string, data: any[]) {
  // This function will interpret the AI's instructions and convert them
  // into a Chart.js configuration object
  const instructions = JSON.parse(code);
  
  const config = {
    type: instructions.chartType || 'bar',
    data: {
      labels: data.map(row => row[instructions.xAxis]),
      datasets: [{
        label: instructions.yAxis,
        data: data.map(row => parseFloat(row[instructions.yAxis])),
        backgroundColor: instructions.color || 'rgba(75, 192, 192, 0.2)',
        borderColor: instructions.borderColor || 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: instructions.title || 'Chart'
        }
      }
    }
  };

  return config;
}