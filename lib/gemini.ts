import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface CoordinateAnalysis {
  risk_level: string;
  description: string;
  recommendations: string[];
  elevation: number;
  distance_from_water: number;
  ai_analysis: string;
}

export interface ImageAnalysis {
  risk_level: string;
  description: string;
  recommendations: string[];
  elevation: number;
  distance_from_water: number;
  ai_analysis: string;
}

export async function analyzeCoordinatesWithAI(lat: number, lng: number): Promise<CoordinateAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Analyze the flood risk for coordinates (${lat}, ${lng}).
    
    Please provide a JSON response with the following structure:
    {
      "risk_level": "Low|Medium|High|Very High",
      "description": "Detailed description of the flood risk",
      "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4"],
      "elevation": estimated_elevation_in_meters,
      "distance_from_water": estimated_distance_in_meters,
      "ai_analysis": "AI-powered analysis of the location"
    }
    
    Base your analysis on:
    - Geographic location and terrain
    - Proximity to water bodies
    - Historical flood data patterns
    - Elevation and topography
    - Climate and weather patterns
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        risk_level: parsed.risk_level || "Medium",
        description: parsed.description || "Analysis completed",
        recommendations: parsed.recommendations || ["Monitor weather conditions"],
        elevation: parsed.elevation || 50,
        distance_from_water: parsed.distance_from_water || 1000,
        ai_analysis: parsed.ai_analysis || text
      };
    }

    // Fallback response
    return {
      risk_level: "Medium",
      description: "Analysis completed",
      recommendations: ["Monitor weather conditions", "Stay informed about local alerts"],
      elevation: 50,
      distance_from_water: 1000,
      ai_analysis: text
    };
  } catch (error) {
    console.error('Error with Gemini AI:', error);
    
    // Fallback response
    return {
      risk_level: "Medium",
      description: "Analysis completed with fallback data",
      recommendations: ["Monitor weather conditions", "Stay informed about local alerts"],
      elevation: 50,
      distance_from_water: 1000,
      ai_analysis: "AI analysis temporarily unavailable"
    };
  }
}

export async function analyzeImageWithAI(imageData: string): Promise<ImageAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `
    Analyze this image for flood risk assessment.
    
    Please provide a JSON response with the following structure:
    {
      "risk_level": "Low|Medium|High|Very High",
      "description": "Detailed description of the flood risk based on the image",
      "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4"],
      "elevation": estimated_elevation_in_meters,
      "distance_from_water": estimated_distance_in_meters,
      "ai_analysis": "AI-powered analysis of the terrain in the image"
    }
    
    Analyze the image for:
    - Terrain characteristics
    - Water body proximity
    - Elevation indicators
    - Vegetation patterns
    - Urban development
    - Drainage patterns
    `;

    // Convert base64 to Uint8Array
    const imageBytes = Buffer.from(imageData, 'base64');
    
    const result = await model.generateContent([prompt, { inlineData: { data: imageData, mimeType: "image/jpeg" } }]);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        risk_level: parsed.risk_level || "Medium",
        description: parsed.description || "Image analysis completed",
        recommendations: parsed.recommendations || ["Monitor weather conditions"],
        elevation: parsed.elevation || 50,
        distance_from_water: parsed.distance_from_water || 1000,
        ai_analysis: parsed.ai_analysis || text
      };
    }

    // Fallback response
    return {
      risk_level: "Medium",
      description: "Image analysis completed",
      recommendations: ["Monitor weather conditions", "Stay informed about local alerts"],
      elevation: 50,
      distance_from_water: 1000,
      ai_analysis: text
    };
  } catch (error) {
    console.error('Error with Gemini AI image analysis:', error);
    
    // Fallback response
    return {
      risk_level: "Medium",
      description: "Image analysis completed with fallback data",
      recommendations: ["Monitor weather conditions", "Stay informed about local alerts"],
      elevation: 50,
      distance_from_water: 1000,
      ai_analysis: "AI image analysis temporarily unavailable"
    };
  }
}
