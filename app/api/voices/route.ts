import { NextRequest, NextResponse } from 'next/server';
import { loadVoices } from '@/lib/tools/load-voice';
import path from 'path';
import { z } from 'zod';

// Schema for POST request body
const voiceRequestSchema = z.object({
    url: z.string().url()
});

// GET: List local voices from public/voices
export async function GET(): Promise<NextResponse> {
    try {
        // Log the current working directory and voices path for debugging
        const cwd = process.cwd();
        const voicesPath = path.join(cwd, 'public', 'voices');

        console.log('Current working directory:', cwd);
        console.log('Voices path:', voicesPath);

        // Load voice files with URLs by default
        const voices = await loadVoices(voicesPath, { createUrls: true });

        if (!voices.length) {
            return NextResponse.json({ 
                message: "No voices found", 
                debug: { 
                    cwd, 
                    voicesPath 
                } 
            }, { status: 404 });
        }

        return NextResponse.json(voices);
    } catch (error) {
        console.error('Error loading voice files:', error);
        return NextResponse.json({ 
            error: "Failed to load voices",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

// POST: Load a remote voice file
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { url } = voiceRequestSchema.parse(body);

        console.log('Loading remote voice from:', url);

        // Load remote voice file with URL
        const voices = await loadVoices(url, { createUrls: true });

        if (!voices.length) {
            return NextResponse.json({ 
                message: "Failed to load remote voice", 
                debug: { url } 
            }, { status: 404 });
        }

        return NextResponse.json({
            data: voices[0] // Return single voice file for remote URL
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                error: "Invalid request body",
                details: error.errors 
            }, { status: 400 });
        }

        console.error('Error loading remote voice:', error);
        return NextResponse.json({ 
            error: "Failed to load remote voice",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
