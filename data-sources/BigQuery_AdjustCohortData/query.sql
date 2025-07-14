WITH  
A AS (
  SELECT
    date,
    country_code,
    channel,
    mmp,
    campaign_name,
    package_name,
    SUM(CASE WHEN period = 0 THEN ad_revenue_total + revenue_total END) AS REV_D0,      
    SUM(CASE WHEN period = 0 THEN cost END) AS cost,
    SUM(CASE WHEN period = 0 THEN users END) AS install,
    SUM(CASE WHEN period = 3 THEN ad_revenue_total + revenue_total END) AS REV_D3,
    SUM(CASE WHEN period = 7 THEN ad_revenue_total + revenue_total END) AS REV_D7,
    SUM(CASE WHEN period = 30 THEN ad_revenue_total + revenue_total END) AS REV_D30,
    SUM(CASE WHEN period = 60 THEN ad_revenue_total + revenue_total END) AS REV_D60,
    SUM(CASE WHEN period = 90 THEN ad_revenue_total + revenue_total END) AS REV_D90,
    SUM(CASE WHEN period = 120 THEN ad_revenue_total + revenue_total END) AS REV_D120,
    SUM(CASE WHEN period = 0 THEN retained_users END) AS retained_users_D0,
    SUM(CASE WHEN period = 1 THEN retained_users END) AS retained_users_D1,
    SUM(CASE WHEN period = 3 THEN retained_users END) AS retained_users_D3,
    SUM(CASE WHEN period = 7 THEN retained_users END) AS retained_users_D7,
    SUM(CASE WHEN period = 30 THEN retained_users END) AS retained_users_D30, 
    SUM(CASE WHEN period = 0 THEN ad_impressions_total END) AS imps_D0
  FROM `sm-data-center.Adjust.cumulative_cohort`
  WHERE 
    date BETWEEN PARSE_DATE('%Y%m%d', @DS_START_DATE) AND PARSE_DATE('%Y%m%d', @DS_END_DATE)
    AND cost IS NOT NULL 
    AND period IN (0, 1, 3, 7, 30, 60, 90, 120)
    AND channel != 'Google Organic Search'
  GROUP BY
    date, country_code, channel, campaign_name, package_name, mmp
),

B AS (
  SELECT
    DATE_ADD(date, INTERVAL 30 DAY) AS date,  -- precompute to avoid DATE_SUB
    campaign,
    ratio_d30_d3
  FROM `sm-data-center.Adjust.avg_ratio_ROAS_D30_D3`
),

C AS (
  SELECT
    A.*,
    B.ratio_d30_d3 AS RATIO_REVD30_REVD3
  FROM A
  LEFT JOIN B
    ON A.date = B.date AND A.campaign_name = B.campaign
)

SELECT
  C.date,
  C.country_code,
  C.channel,
  C.mmp,
  C.campaign_name,
  C.REV_D0,
  C.cost,
  C.install,
  C.REV_D3,
  C.REV_D7,
  C.REV_D30,
  C.REV_D60,
  C.REV_D90,
  C.REV_D120,
  C.retained_users_D0,
  C.retained_users_D1,
  C.retained_users_D3,
  C.retained_users_D7,
  C.retained_users_D30,
  C.imps_D0,
  C.RATIO_REVD30_REVD3,
  D.app_fullname
FROM C
JOIN `sm-data-center.AppsflyerModeling.application` AS D
  ON C.package_name = D.package_name