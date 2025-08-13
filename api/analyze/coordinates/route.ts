import { NextRequest, NextResponse } from 'next/server';
import { analyzeCoordinatesWithAI } from '@/lib/gemini';

interface CoordinateRequest {
  latitude: number;
  longitude: number;
}

interface AnalysisResponse {
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
    const body: CoordinateRequest = await request.json();
    const { latitude, longitude } = body;

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    // Perform AI analysis
    const aiAnalysis = await analyzeCoordinatesWithAI(latitude, longitude);

    const analysis: AnalysisResponse = {
      success: true,
      risk_level: aiAnalysis.risk_level,
      description: aiAnalysis.description,
      recommendations: aiAnalysis.recommendations,
      elevation: aiAnalysis.elevation,
      distance_from_water: aiAnalysis.distance_from_water,
      message: "Analysis completed successfully",
      ai_analysis: aiAnalysis.ai_analysis
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing coordinates:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
