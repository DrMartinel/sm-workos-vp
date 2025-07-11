export default {
  source: 'bigquery',
  queryFile: 'query.sql',
  dimensions: [
    'date', 'adUnits', 'app_fullname', 'platform',
    'mediationPlatform', 'countryCode'
  ],
  metrics: [
    'revenue', 'impressions', 'activeUsers', 'appFillRate',
    'eCPM', 'appFills', 'appRequests', 'engagedUsers'
  ]
}; 