import { z } from "zod";
import { encode } from "@msgpack/msgpack";  // Add MessagePack encoding

// Types and Validation Schemas
export const ReferenceAudioSchema = z.object({
    audio: z.instanceof(Blob).or(z.string()),  // Can be Blob or base64 string
    text: z.string()
});

export const TTSRequestSchema = z.object({
    text: z.string(),
    // Audio generation parameters
    chunk_length: z.number().int().min(100).max(300).default(200),
    format: z.enum(["wav", "mp3", "flac"]).default("wav"),
    latency: z.enum(["normal", "balanced"]).default("normal"),
    max_new_tokens: z.number().int().min(0).default(1024),
    top_p: z.number().min(0.1).max(1.0).default(0.7),
    repetition_penalty: z.number().min(0.9).max(2.0).default(1.2),
    temperature: z.number().min(0.1).max(1.0).default(0.7),
    
    // Reference audio parameters
    references: z.array(ReferenceAudioSchema).default([]),
    reference_id: z.string().nullable().default(null),
    
    // Audio quality parameters
    channels: z.number().int().min(1).max(2).default(1),
    rate: z.number().int().min(8000).max(48000).default(44100),
    
    // Processing options
    normalize: z.boolean().default(true),
    streaming: z.boolean().default(false),
    use_memory_cache: z.enum(["on", "off"]).default("off"),
    seed: z.number().int().nullable().default(null),
});

export type ReferenceAudio = z.infer<typeof ReferenceAudioSchema>;
export type TTSRequest = z.infer<typeof TTSRequestSchema>;

export interface TTSResponse {
    status: "success" | "error";
    data: {
        audio?: {
            blob: Blob;
            base64: string;
        };
        error?: string;
    };
}

export interface FishTTSConfig {
    apiKey?: string;
    baseUrl?: string;
    streaming?: boolean;
}

/**
 * Helper function to convert a Blob to base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                // Remove data URL prefix
                const base64 = reader.result.split(",")[1];
                resolve(base64);
            } else {
                reject(new Error("Failed to convert Blob to base64"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Helper function to process reference audio
 */
async function processReferenceAudio(audio: File | Blob | string, text: string): Promise<ReferenceAudio> {
    let audioData: string;
    
    if (audio instanceof File || audio instanceof Blob) {
        audioData = await blobToBase64(audio);
    } else {
        audioData = audio;
    }

    return { audio: audioData, text };
}

export class FishTTS {
    private apiKey: string;
    private baseUrl: string;
    private streaming: boolean;

    constructor(config: FishTTSConfig) {
        this.apiKey = config.apiKey || process.env.FISH_API_KEY!;
        this.baseUrl = config.baseUrl || "http://127.0.0.1:8080/v1/tts";
        this.streaming = config.streaming || false;
    }

    /**
     * Generate speech from text with optional reference audio
     */
    async generateSpeech({
        text,
        referenceAudio,
        referenceText,
        referenceId,
        options = {}
    }: {
        text: string;
        referenceAudio?: (File | Blob | string)[];
        referenceText?: string[];
        referenceId?: string;
        options?: Partial<TTSRequest>;
    }): Promise<TTSResponse> {
        try {
            let references: ReferenceAudio[] = [];

            // Process reference audios if provided
            if (referenceAudio && referenceText && referenceAudio.length === referenceText.length) {
                references = await Promise.all(
                    referenceAudio.map((audio, index) => 
                        processReferenceAudio(audio, referenceText[index])
                    )
                );
            }

            // Prepare request data following Python client structure
            const requestData = TTSRequestSchema.parse({
                text,
                references: references.map(ref => ({
                    audio: ref.audio,
                    text: ref.text
                })),
                reference_id: referenceId || null,
                normalize: options.normalize ?? true,
                format: options.format || "wav",
                max_new_tokens: options.max_new_tokens || 1024,
                chunk_length: options.chunk_length || 200,
                top_p: options.top_p || 0.7,
                repetition_penalty: options.repetition_penalty || 1.2,
                temperature: options.temperature || 0.7,
                streaming: this.streaming,
                use_memory_cache: options.use_memory_cache || "off",
                seed: options.seed || null,
                channels: options.channels || 1,
                rate: options.rate || 44100,
                latency: options.latency || "normal"
            });

            // Convert request data to MessagePack format
            // Use encode with a more strict serialization to match Python's behavior
            const msgpackData = encode(requestData, {
                ignoreUndefined: true,  // Similar to Pydantic's behavior
                forceFloat32: false,    // Use full precision for floats
                forceIntegerToFloat: false,
                sortKeys: true,         // Consistent ordering like Pydantic
            });

            // Make API request
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/msgpack",  // More specific content type
                    "Accept": "audio/wav"
                },
                body: msgpackData
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorMessage: string;
                
                if (contentType?.includes("application/json")) {
                    const error = await response.json();
                    errorMessage = error.message || error.detail || "Failed to generate speech";
                } else {
                    errorMessage = await response.text();
                }
                
                throw new Error(errorMessage);
            }

            if (this.streaming) {
                // Handle streaming response
                const reader = response.body?.getReader();
                if (!reader) throw new Error("No response stream available");

                // Convert stream to blob
                const blob = await new Response(response.body).blob();
                // Convert blob to base64
                const base64 = await blobToBase64(blob);
                
                return {
                    status: "success",
                    data: {
                        audio: {
                            blob,
                            base64: `data:audio/wav;base64,${base64}`
                        }
                    }
                };
            } else {
                // Handle regular response
                const audioBlob = await response.blob();
                const base64 = await blobToBase64(audioBlob);

                return {
                    status: "success",
                    data: {
                        audio: {
                            blob: audioBlob,
                            base64: `data:audio/wav;base64,${base64}`
                        }
                    }
                };
            }
        } catch (error) {
            console.error("TTS Error:", error);
            return {
                status: "error",
                data: {
                    error: error instanceof Error ? error.message : "Unknown error occurred"
                }
            };
        }
    }
}

// Example usage:
/*
const tts = new FishTTS({
    apiKey: "YOUR_API_KEY",
    baseUrl: "http://api.fish.audio/v1/tts",
    streaming: false
});

// Generate speech with multiple reference audios
const response = await tts.generateSpeech({
    text: "Text to generate speech from",
    referenceAudio: [audioFile1, audioFile2],
    referenceText: ["Reference text 1", "Reference text 2"],
    options: {
        format: "wav",
        normalize: true,
        chunk_length: 200,
        latency: "normal",
        channels: 1,
        rate: 44100,
        top_p: 0.7,
        temperature: 0.7,
        repetition_penalty: 1.2
    }
});

if (response.status === "success" && response.data.audio) {
    // Use with Live2D character
    const { base64, blob } = response.data.audio;
    // For Live2D playback
    character.speak(base64);
    // For audio element playback
    const audioUrl = URL.createObjectURL(blob);
    audioElement.src = audioUrl;
}
*/
