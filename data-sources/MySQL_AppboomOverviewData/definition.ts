export default {
  source: 'mysql',
  queryFile: 'query.sql',
  dimensions: ['date', 'app_id', 'app_name', 'platform'],
  metrics: ['revenue', 'cost', 'downloads', 'custom_costs'],
}; 