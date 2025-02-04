import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

interface ClonedVoice {
    speaker_id: string;
    audio: string;
    reference_text: string;
}

interface VoiceFile {
    name: string;       // speaker_id
    base64: string;     // base64 encoded audio data
    url?: string;       // path to audio file or base64 URL
}

/**
 * Convert file buffer to base64 with proper mime type
 */
function bufferToBase64(buffer: Buffer): string {
    return `data:audio/wav;base64,${buffer.toString('base64')}`;
}

// GET: List all saved references
export async function GET(): Promise<NextResponse> {
    try {
        const referencesDir = path.join(process.cwd(), "public", "fish-speech", "references");
        const jsonPath = path.join(referencesDir, "references.json");

        try {
            const jsonContent = await fs.readFile(jsonPath, "utf-8");
            const references: ClonedVoice[] = JSON.parse(jsonContent);

            // For each reference, check if the audio file exists and convert to VoiceFile format
            const voiceFiles = await Promise.all(
                references.map(async (ref) => {
                    const audioPath = path.join(process.cwd(), "public", ref.audio);
                    try {
                        await fs.access(audioPath);
                        // Read the audio file and convert to base64
                        const buffer = await fs.readFile(audioPath);
                        const base64 = bufferToBase64(buffer);
                        
                        return {
                            name: ref.speaker_id,
                            base64,
                            url: ref.audio // Keep the relative path as URL
                        } satisfies VoiceFile;
                    } catch {
                        return null;
                    }
                })
            );

            // Filter out references with missing audio files
            const availableVoices = voiceFiles.filter((voice): voice is NonNullable<typeof voice> => voice !== null);

            return NextResponse.json({
                status: "success",
                data: availableVoices
            });
        } catch (error) {
            // If references.json doesn't exist, return empty array
            return NextResponse.json({
                status: "success",
                data: []
            });
        }
    } catch (error) {
        console.error("Error reading references:", error);
        return NextResponse.json({
            status: "error",
            error: "Failed to read references"
        }, { status: 500 });
    }
}

// Schema for POST request body
const voiceRequestSchema = z.object({
    url: z.string().url()
});

// POST: Load a remote voice file
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { url } = voiceRequestSchema.parse(body);

        console.log('Loading remote voice from:', url);

        // Load remote voice file with URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch voice from ${url}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = bufferToBase64(buffer);
        const fileName = path.basename(url, '.wav'); // Remove .wav extension for speaker_id

        return NextResponse.json({
            status: "success",
            data: {
                name: fileName,
                base64,
                url // Keep the original URL
            } satisfies VoiceFile
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                status: "error",
                error: "Invalid request body",
                details: error.errors 
            }, { status: 400 });
        }

        console.error('Error loading remote voice:', error);
        return NextResponse.json({ 
            status: "error",
            error: error instanceof Error ? error.message : "Failed to load remote voice"
        }, { status: 500 });
    }
}
