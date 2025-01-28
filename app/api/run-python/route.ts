import { NextResponse } from 'next/server';
import { PythonShell, Options } from 'python-shell';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  let tempDir = '';
  let filePath = '';

  try {
    console.log('Received Python execution request');
    const { code, fileName, fileContent } = await request.json();

    if (!fileName || !fileContent) {
      console.error('Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing file data' 
      }, { status: 400 });
    }

    // Create a temporary directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'python-execution-'));
    console.log('Created temp directory:', tempDir);
    
    // Save the uploaded file to the temp directory
    filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(fileContent, 'base64'));
    console.log('Saved file to:', filePath);

    // Create the Python code with proper structure
    const pythonCode = `
import pandas as pd
import matplotlib.pyplot as plt
import base64
import json
import sys
from io import BytesIO

def main():
    try:
        # Enable detailed error reporting
        sys.stderr = sys.stdout

        # Execute the user's code with modified CSV reading
        ${code.replace(
          /pd\.read_csv\(['"](.*?)['"]\)/g, 
          "pd.read_csv('$1', encoding='latin-1')"
        )}

        # Handle plot output
        if 'plt' in locals():
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            plt.close()
            buffer.seek(0)
            plot_data = base64.b64encode(buffer.getvalue()).decode()
            
            result = {
                'plot': plot_data,
                'success': True
            }
        else:
            result = {
                'success': True,
                'message': 'Code executed successfully but no plot was generated'
            }
        
        print(json.dumps(result))

    except Exception as e:
        import traceback
        error_result = {
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_result))

if __name__ == '__main__':
    main()
`;

    // Update the file path in the code
    const finalCode = pythonCode.replace(
      new RegExp(`['"]${fileName}['"]`), 
      `'${filePath.replace(/\\/g, '\\\\')}'`
    );

    console.log('Executing Python code...');
    const options: Options = {
      pythonPath: 'python',
      pythonOptions: ['-u'], // unbuffered output
    };

    let result: string[] = await new Promise((resolve, reject) => {
      PythonShell.runString(finalCode, options, (err: Error | null, output?: string[]) => {
        // Clean up: delete the temporary file and directory
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
        } catch (cleanupError) {
          console.error('Error cleaning up:', cleanupError);
        }

        if (err) {
          console.error('Python execution error:', err);
          reject(err);
          return;
        }
        resolve(output || []);
      });
    });

    console.log('Python execution completed');
    
    // Parse the Python output as JSON
    const pythonOutput = result[0] ? JSON.parse(result[0]) : { 
      success: false, 
      error: 'No output from Python' 
    };
    
    return NextResponse.json(pythonOutput);
  } catch (error) {
    console.error('Error executing Python code:', error);
    
    // Clean up in case of error
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
    } catch (cleanupError) {
      console.error('Error cleaning up:', cleanupError);
    }

    return NextResponse.json({ 
      success: false,
      error: 'Failed to execute Python code',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}