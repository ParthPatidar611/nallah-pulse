import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Flood Detection API with Gemini AI",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
}
