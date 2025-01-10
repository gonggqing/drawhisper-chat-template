import { NextRequest, NextResponse } from 'next/server';
import { loadVoices } from '@/lib/tools/load-voice';

/**
 * Load voice files from local directory or remote URL
 * const response = await fetch('/api/voices?path=character/idle&createUrls=true');
 * const { data: voices } = await response.json();
 */
export async function GET(request: NextRequest) {
    try {
        // Get path from query params
        const searchParams = request.nextUrl.searchParams;
        const path = searchParams.get('path');
        const createUrls = searchParams.get('createUrls') === 'true';

        if (!path) {
            return NextResponse.json(
                { error: 'Path parameter is required' },
                { status: 400 }
            );
        }

        // Load voice files
        const voices = await loadVoices(path, { createUrls });

        if (!voices.length) {
            return NextResponse.json(
                { error: 'No voice files found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: voices
        });

    } catch (error) {
        console.error('Error loading voice files:', error);
        return NextResponse.json(
            { 
                error: 'Failed to load voice files',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
