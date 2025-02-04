export interface ClonedVoice {
    speaker_id: string;
    audio: string; // relative path, default is fish-speech/references/${speaker_id}.wav
    reference_text: string;
}

/**
 * Convert base64 or blob to buffer
 */
async function convertToBuffer(audio: string | Blob): Promise<Buffer> {
    if (typeof audio === "string") {
        // Remove data URL prefix if present
        const base64Data = audio.replace(/^data:audio\/wav;base64,/, "");
        return Buffer.from(base64Data, "base64");
    } else {
        const arrayBuffer = await audio.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
}

/**
 * Save cloned voice data including audio file and reference information
 */
export async function saveClonedVoice({ 
    speaker_id, 
    audio, 
    reference_text 
}: { 
    speaker_id: string;
    audio: string;  // base64 string
    reference_text: string;
}): Promise<ClonedVoice> {
    const response = await fetch('/api/voices/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            speaker_id,
            audio,
            reference_text
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to save voice');
    }

    if (result.status === 'error') {
        throw new Error(result.error);
    }

    return result.data;
} 