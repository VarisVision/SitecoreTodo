import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GA_CONFIG } from '@/config/analytics';
import { PageViewsData, MetricType } from '@/types';

async function getAnalyticsData(
  url: string, 
  days: number = 30, 
  property: string, 
  metric: MetricType
): Promise<PageViewsData[]> {
  const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: GA_CONFIG.credentials,
  });

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${property}`,
    keepEmptyRows: true,
    dateRanges: [
      {
        startDate: `${days}daysAgo`,
        endDate: 'today',
      },
    ],
    dimensions: [
      {
        name: 'date',
      },
    ],
    metrics: [
      {
        name: metric,
      },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: {
          matchType: 'BEGINS_WITH',
          value: url,
        },
      },
    },
  });

  return response.rows?.map((row) => {
    const dateStr = row.dimensionValues?.[0]?.value ?? '';
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JavaScript months are 0-based
    const day = parseInt(dateStr.substring(6, 8), 10);
    return {
      date: new Date(year, month, day),
      pageViews: parseInt(row.metricValues?.[0]?.value ?? '0', 10),
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) ?? [];
}

export async function getPageViewsForUrl(url: string, days: number = 30, property: string): Promise<PageViewsData[]> {
  return getAnalyticsData(url, days, property, 'screenPageViews');
}

export async function getActiveUsersForUrl(url: string, days: number = 30, property: string): Promise<PageViewsData[]> {
  return getAnalyticsData(url, days, property, 'activeUsers');
} 