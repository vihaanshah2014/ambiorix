import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge'; // Attempt to run on the edge

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const prompt = formData.get('prompt')?.toString() || '';
    const file = formData.get('file') as File | null;

    // If needed, read the file contents
    let fileText = '';
    if (file) {
      // In a real app, you'd parse the CSV or other content
      // For now, let's just read the text
      fileText = await file.text();
    }

    // Create a context that includes file content
    // Warning: This might be large, so be mindful of token limits
    const systemMessage = `
      You are a data analysis AI. The user has uploaded the following file contents:
      ${fileText ? fileText.slice(0, 1000) : 'No file content provided or too large.'}
      (Note: only partial or truncated content shown if very large.)

      The user will ask questions or request code to generate charts.
      Return two fields in JSON:
       1. "answer": your direct answer or explanation
       2. "codeSnippet": a minimal python script that can be embedded in the UI
          to visualize the data in some chart and when executed will generate the chart. Keep it short if possible.

        If no chart type is specified, use a chart that you feel is most appropriate.
    `;

    const userMessage = `
      User Prompt: ${prompt}
      File Provided: ${file ? file.name : 'no file'}
    `;

    // Call OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
    });

    const fullResponse = chatCompletion.choices[0]?.message?.content || '';

    /**
     * For simplicity, we expect the AI to follow instructions and produce
     * a JSON-like result with an "answer" and "codeSnippet". Since the model
     * can occasionally deviate from instructions, you may need a more robust
     * parsing strategy here. We'll do a naive parse for demonstration.
     */
    let answer = 'Sorry, could not parse answer.';
    let codeSnippet = '';

    try {
      // Attempt to find a JSON block in the response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        answer = extracted.answer || 'No answer found.';
        codeSnippet = extracted.codeSnippet || '';
      } else {
        // If not found, fallback to entire text
        answer = fullResponse;
      }
    } catch (err) {
      // If JSON parse fails, fallback to entire text
      answer = fullResponse;
    }

    return NextResponse.json({
      answer,
      codeSnippet,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
