import { HFModelConfig_v1, InterfaceHF } from "outetts";
import ort from "onnxruntime-web";

ort.env.logLevel = 'error';

export interface TTSResponse {
    status: "success" | "error" | "ready" | "running" | "completed";
    data: {
        text?: string;
        audio?: string;
        speaker_id?: string;
        error?: string;
    }
}

export interface TTSConfig {
    model_path: string;
    language: "en" | "zh" | "ja" | "ko";
    speaker_id?: string;
    temperature?: number;
    repetition_penalty?: number;
    max_length?: number;
}

let tts_interface: any = null;

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert blob to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function initTTS(config: TTSConfig): Promise<TTSResponse> {
    try {
        if (tts_interface) {
            return { status: "success", data: {} };
        }

        // check webgpu support
        let fp16_supported = false;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                return {
                    status: "error",
                    data: { error: "WebGPU is not supported (no adapter found)" }
                };
            }
            fp16_supported = adapter.features.has("shader-f16");
        } catch (error) {
            return { 
                status: "error", 
                data: { error: error instanceof Error ? error.message : String(error) } 
            };
        }

        const model_config = new HFModelConfig_v1({
            model_path: config.model_path,
            language: "en", // Supported languages in v0.2: en, zh, ja, ko
            dtype: fp16_supported ? "fp16" : "q4", // Supported dtypes: fp32, fp16, q8, q4, q4f16
            device: "webgpu", // Supported devices: webgpu, wasm
        });

        console.log(`model_config: ${JSON.stringify(model_config)}`);

        tts_interface = await InterfaceHF({
            model_version: "0.2",
            cfg: model_config
        })

        return { status: "ready", data: {} };

    } catch (error) {
        console.error("Failed to initialize TTS:", error);
        return {
            status: "error",
            data: { error: error instanceof Error ? error.message : String(error) }
        };
    }
}

export async function generateSpeech(text: string, config: Partial<TTSConfig> = {}): Promise<TTSResponse> {
    try {
        // Initialize if not already done

        const model_config = new HFModelConfig_v1({
            model_path: config.model_path || "onnx-community/OuteTTS-0.2-500M",
            language: config.language || "en", // Supported languages in v0.2: en, zh, ja, ko
            dtype: "fp16", // Supported dtypes: fp32, fp16, q8, q4, q4f16
            device: "webgpu", // Supported devices: webgpu, wasm
            verbose: true,
        });

        const tts_interface = await InterfaceHF({
            model_version: "0.2",
            cfg: model_config
        })

        if (!tts_interface) {
            throw new Error("TTS interface not initialized");
        }

        const speaker = tts_interface.load_default_speaker(config.speaker_id || "female_1");
        console.log(`Generating speech for ${text} with speaker ${speaker}`);
        // Generate speech
        const output = await tts_interface.generate({
            text,
            language: config.language || "en",
            temperature: config.temperature || 0.1, // Lower temperature values may result in a more stable tone
            repetition_penalty: config.repetition_penalty || 1.1,
            max_length: config.max_length || 4096,

            speaker,
        });

        // Convert to WAV and base64
        const buffer = output.to_wav("output.wav");
        const blob = new Blob([buffer], { type: "audio/wav" });

        const base64 = await blobToBase64(blob);

        return {
            status: "success",
            data: {
                text,
                audio: base64,
            }
        };
    } catch (error) {
        console.error("Speech generation error:", error);
        return {
            status: "error",
            data: {
                error: error instanceof Error ? error.message : String(error)
            }
        };
    }
}

export async function cloneVoice(audio: string, speaker_id: string, config: Partial<TTSConfig> = {}): Promise<TTSResponse> {
    try {
        const model_config = new HFModelConfig_v1({
            model_path: config.model_path || "onnx-community/OuteTTS-0.2-500M",
            language: config.language || "en", // Supported languages in v0.2: en, zh, ja, ko
            dtype: "fp16", // Supported dtypes: fp32, fp16, q8, q4, q4f16
            device: "webgpu", // Supported devices: webgpu, wasm
            verbose: true,
        });

        const tts_interface = await InterfaceHF({
            model_version: "0.2",
            cfg: model_config
        })

        if (!tts_interface) {
            throw new Error("TTS interface not initialized");
        }

        if (!speaker_id.endsWith(".json")) {
            speaker_id = speaker_id + ".json";
        }

        const speaker = await tts_interface.create_speaker({
                audio_path: audio,
                transcript: null,
                whisper_model: "turbo",
                whisper_device: null,
            });

        tts_interface.save_speaker(speaker, "/voices/speakers/" + speaker_id);

        return { status: "success", data: { speaker_id: speaker_id }};
        
    } catch (error) {
        console.error("voice cloning error:", error);
        return {
            status: "error",
            data: {
                error: error instanceof Error ? error.message : String(error)
            }
        };
    }
}
