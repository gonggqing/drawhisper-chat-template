import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/tts/legacy/worker";
import { z } from "zod";

// Validate request body
const generateVoiceSchema = z.object({
    text: z.string().min(1).max(1000)
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();

        console.log(`Request body: ${JSON.stringify(body)}`);
        const { text } = generateVoiceSchema.parse(body);

        console.log('Generating voice for text:', text);

        const { base64 } = await textToSpeech(text, undefined);

        return NextResponse.json({
            success: true,
            data: {
                base64,
                name: `tts_${Date.now()}.wav`
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: "Invalid request body",
                details: error.errors
            }, { status: 400 });
        }

        console.error('Voice generation error:', error);
        return NextResponse.json({
            error: "Failed to generate voice",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
