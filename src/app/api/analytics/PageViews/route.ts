import { NextResponse } from 'next/server';
import { getPageViewsForUrl } from '@/utils/analytics';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const daysParam = searchParams.get('days');
    const property = searchParams.get('property');

    // Input validation
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' }, 
        { status: 400 }
      );
    }

    if (!property || property === '-1') {
      return NextResponse.json(
        { error: 'Valid property parameter is required' }, 
        { status: 400 }
      );
    }

    // Validate and parse days parameter
    const days = parseInt(daysParam ?? '30', 10);
    if (isNaN(days) || days <= 0 || days > 90) {
      return NextResponse.json(
        { error: 'Days parameter must be a number between 1 and 90' }, 
        { status: 400 }
      );
    }

    const data = await getPageViewsForUrl(url, days, property);
    
    return NextResponse.json({
      success: true,
      data,
      meta: {
        url,
        days,
        property,
        recordCount: data.length
      }
    });
  } catch (error) {
    console.error('Error fetching page views:', error);
    
    // Return different error messages based on error type
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 