export default {
  source: 'mysql',
  queryFile: 'query.sql',
  dimensions: [
    'ad_unit_id',
    'date',
    'network',
    'node_id',
    'position',
    'type',
  ],
  metrics: [
    'value',
    'click',
    'view',
    'request',
    'cpc',
    'rpm',
  ],
}; 