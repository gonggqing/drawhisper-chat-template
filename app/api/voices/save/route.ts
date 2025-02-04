import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Validation schema
const SaveVoiceSchema = z.object({
    speaker_id: z.string(),
    audio: z.string(),  // base64 string
    reference_text: z.string()
});

interface ClonedVoice {
    speaker_id: string;
    audio: string;
    reference_text: string;
}

/**
 * Convert base64 to buffer
 */
function base64ToBuffer(base64: string): Buffer {
    const base64Data = base64.replace(/^data:audio\/wav;base64,/, "");
    return Buffer.from(base64Data, "base64");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { speaker_id, audio, reference_text } = SaveVoiceSchema.parse(body);

        // Create references directory if it doesn't exist
        const referencesDir = path.join(process.cwd(), "public", "fish-speech", "references");
        await fs.mkdir(referencesDir, { recursive: true });

        // Save audio file
        const audioBuffer = base64ToBuffer(audio);
        const audioFileName = `${speaker_id}.wav`;
        const audioPath = path.join(referencesDir, audioFileName);
        await fs.writeFile(audioPath, audioBuffer);

        // Prepare voice data
        const voiceData: ClonedVoice = {
            speaker_id,
            audio: `/fish-speech/references/${audioFileName}`,
            reference_text
        };

        // Read or create references.json
        const jsonPath = path.join(referencesDir, "references.json");
        let references: ClonedVoice[] = [];

        try {
            const jsonContent = await fs.readFile(jsonPath, "utf-8");
            references = JSON.parse(jsonContent);
        } catch (error) {
            // File doesn't exist or is invalid, start with empty array
            references = [];
        }

        // Check if speaker_id already exists
        const existingIndex = references.findIndex(ref => ref.speaker_id === speaker_id);
        if (existingIndex !== -1) {
            // Update existing entry
            references[existingIndex] = voiceData;
        } else {
            // Add new entry
            references.push(voiceData);
        }

        // Save updated references.json
        await fs.writeFile(
            jsonPath, 
            JSON.stringify(references, null, 2), 
            "utf-8"
        );

        return NextResponse.json({ 
            status: "success", 
            data: voiceData 
        });
    } catch (error) {
        console.error("Error saving voice:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                status: "error",
                error: "Invalid request data",
                details: error.errors 
            }, { status: 400 });
        }
        return NextResponse.json({ 
            status: "error",
            error: error instanceof Error ? error.message : "Failed to save voice" 
        }, { status: 500 });
    }
} 