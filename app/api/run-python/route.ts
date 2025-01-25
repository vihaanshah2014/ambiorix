import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const tempFileName = `temp_${uuidv4()}.py`;
    const tempFilePath = path.join(process.cwd(), 'temp', tempFileName);

    // Write the code to a temporary file
    writeFileSync(tempFilePath, code);

    // Execute the Python script
    const pythonProcess = spawn('python', [tempFilePath]);
    
    let output = '';
    let error = '';

    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Collect data from stderr
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    const result = await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        // Clean up the temporary file
        try {
          unlinkSync(tempFilePath);
        } catch (e) {
          console.error('Error cleaning up temp file:', e);
        }

        if (code === 0) {
          resolve(output);
        } else {
          reject(error || 'Unknown error occurred');
        }
      });
    });

    return NextResponse.json({ output: result });
  } catch (error) {
    console.error('Error executing Python code:', error);
    return NextResponse.json(
      { 
        error: 'Error executing code', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}