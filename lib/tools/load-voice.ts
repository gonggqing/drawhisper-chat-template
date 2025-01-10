import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

export interface VoiceFile {
    name: string;
    base64: string;
    url?: string;
}

/**
 * Convert audio data to a blob URL
 */
export function buildAudioUrl(audioData: Uint8Array): string {
    const blob = new Blob([audioData], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
}

/**
 * Convert file buffer to base64
 */
function bufferToBase64(buffer: Buffer): string {
    return `data:audio/wav;base64,${buffer.toString('base64')}`;
}

/**
 * Load voice files from local directory or remote URL
 */
export async function loadVoices(
    source: string,
    options?: {
        createUrls?: boolean;
    }
): Promise<VoiceFile[]> {
    // Check if source is a URL
    if (source.startsWith('http')) {
        const response = await fetch(source);
        const buffer = Buffer.from(await response.arrayBuffer());
        const fileName = path.basename(source);
        const base64 = bufferToBase64(buffer);

        const voiceFile: VoiceFile = {
            name: fileName,
            base64
        };

        if (options?.createUrls) {
            voiceFile.url = buildAudioUrl(new Uint8Array(buffer));
        }

        return [voiceFile];
    }

    // Handle local files default
    const voicesPath = process.env.NODE_ENV === 'production' 
        ? path.join(process.cwd(), 'public', 'voices')
        : path.join(process.cwd(), 'public', 'voices');

    try {
        const files = await readdir(voicesPath);
        const voiceFiles: VoiceFile[] = [];

        for (const file of files) {
            if (!file.toLowerCase().endsWith('.wav')) continue;

            const filePath = path.join(voicesPath, file);
            const buffer = await readFile(filePath);
            const base64 = bufferToBase64(buffer);

            const voiceFile: VoiceFile = {
                name: file,
                base64
            };

            if (options?.createUrls) {
                voiceFile.url = buildAudioUrl(new Uint8Array(buffer));
            }

            voiceFiles.push(voiceFile);
        }

        return voiceFiles;
    } catch (error) {
        console.error('Error loading voice files:', error);
        throw new Error(`Failed to load voice files from ${voicesPath}`);
    }
}

/**
 * Load a single voice file
 */
export async function loadVoice(
    filePath: string,
    options?: { createUrl?: boolean }
): Promise<VoiceFile> {
    const voices = await loadVoices(filePath, { createUrls: options?.createUrl });
    return voices[0];
}

/**
 * Clean up blob URLs to prevent memory leaks
 */
export function revokeVoiceUrls(voices: VoiceFile[]): void {
    voices.forEach(voice => {
        if (voice.url) {
            URL.revokeObjectURL(voice.url);
        }
    });
}
