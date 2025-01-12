import { 
    pipeline, 
    env, 
    AutoTokenizer, 
    SpeechT5ForTextToSpeech, 
    SpeechT5PreTrainedModel, 
    SpeechT5HifiGan,
    SpeechT5FeatureExtractor,
    SpeechT5Processor,
    SpeechT5Tokenizer,
    SpeechT5Model
} from "@huggingface/transformers";
import { WaveFile } from 'wavefile';


interface TTSResponse {
    blob: Blob;
    base64: string;
}

env.allowLocalModels = false;
/**
 * Convert Blob to base64 string
 */
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

/**
 * Convert text to speech and return both blob and base64 URL
 */
export async function textToSpeech(text: string, model_id: string | undefined): Promise<TTSResponse> {
    try {
        // const tokenizer = await AutoTokenizer.from_pretrained(model_id || 'Xenova/speecht5_tts');
        // const feature_extractor = await SpeechT5FeatureExtractor.from_pretrained(model_id || 'Xenova/speecht5_tts',{});
        // const processor = new SpeechT5Processor(feature_extractor, tokenizer);

        // const vocoder = await SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan", {});
        
        // let { input_ids } = await processor(text=text)

        const synthesizer = await pipeline(
            'text-to-speech', model_id || 'Xenova/speecht5_tts', 
            { dtype: 'fp32' });

        const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';

        const response = await synthesizer(text, { speaker_embeddings });

        const wav = new WaveFile(); 
        wav.fromScratch(1, response.sampling_rate, '32f', response.audio);

        const buffer = wav.toBuffer();
        const blob = new Blob([buffer], { type: 'audio/wav' });
        const base64 = await blobToBase64(blob);

        return { blob, base64 };
    } catch (error) {
        console.error('Text to speech error:', error);
        throw error;
    }
}