SELECT
  ds.date,
  n.package_name AS app_id,
  n.node_name AS app_name,
  CASE 
    WHEN n.appstore_id = 'NULL' THEN 'Android'
    ELSE 'iOS'
  END AS platform,
  IFNULL(i.revenue_iap, 0) + IFNULL(c.revenue_cpc, 0) AS revenue,
  IFNULL(s.cost, 0) AS cost,
  IFNULL(ds.downloads, 0) AS downloads,
  IFNULL(cc.custom_costs, 0) AS custom_costs
FROM (
  SELECT node_id, date, SUM(total_install) AS downloads
  FROM aa_node_dailystat
  WHERE date BETWEEN @startDate AND @endDate
  GROUP BY node_id, date
) AS ds
LEFT JOIN aa_node n ON n.node_id = ds.node_id

LEFT JOIN (
  SELECT node_id, date, SUM(revenue) AS revenue_iap
  FROM aa_revenue_iap
  WHERE date BETWEEN @startDate AND @endDate
  GROUP BY node_id, date
) AS i ON i.node_id = ds.node_id AND i.date = ds.date

LEFT JOIN (
  SELECT node_id, date, SUM(value) AS revenue_cpc
  FROM aa_revenue_cpc
  WHERE date BETWEEN @startDate AND @endDate
  GROUP BY node_id, date
) AS c ON c.node_id = ds.node_id AND c.date = ds.date

LEFT JOIN (
  SELECT node_id, date, SUM(spend) AS cost
  FROM aa_spend
  WHERE date BETWEEN @startDate AND @endDate
  GROUP BY node_id, date
) AS s ON s.node_id = ds.node_id AND s.date = ds.date

LEFT JOIN (
  SELECT date, SUM(amount) AS custom_costs
  FROM aa_custom_cost
  WHERE date BETWEEN @startDate AND @endDate
  GROUP BY date
) AS cc ON cc.date = ds.date

ORDER BY ds.date DESC; 