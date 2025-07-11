export default {
  source: 'bigquery',
  queryFile: './query.sql',
  dimensions: [
    'app_fullname', 'channel', 'country_code',
    'campaign_name', 'date', 'mmp'
  ],
  metrics: [
    'cost', 'imps_D0', 'install', 'RATIO_REVD30_REVD3',
    'retained_users_D0', 'retained_users_D1',
    'retained_users_D3', 'retained_users_D7', 'retained_users_D30',
    'REV_D0', 'REV_D3', 'REV_D7', 'REV_D30', 'REV_D60', 'REV_D90', 'REV_D120'
  ]
} 