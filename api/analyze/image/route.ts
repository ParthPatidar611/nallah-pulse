import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithAI } from '@/lib/gemini';

interface ImageAnalysisResponse {
  success: boolean;
  risk_level: string;
  description: string;
  recommendations: string[];
  elevation: number;
  distance_from_water: number;
  message: string;
  ai_analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Please upload an image smaller than 10MB." },
        { status: 400 }
      );
    }

    // Convert file to base64 for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Perform AI analysis
    const aiAnalysis = await analyzeImageWithAI(base64Image);

    const analysis: ImageAnalysisResponse = {
      success: true,
      risk_level: aiAnalysis.risk_level,
      description: aiAnalysis.description,
      recommendations: aiAnalysis.recommendations,
      elevation: aiAnalysis.elevation,
      distance_from_water: aiAnalysis.distance_from_water,
      message: "Image analysis completed successfully",
      ai_analysis: aiAnalysis.ai_analysis
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
