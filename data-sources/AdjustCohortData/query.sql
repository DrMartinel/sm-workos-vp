WITH  
A as (
  SELECT date, country_code , channel, mmp, 
  campaign_name, 
  package_name,
           sum(case when period = 0 then ad_revenue_total + revenue_total end) as REV_D0,      
           sum(case when period = 0 then cost end) as cost,
           sum(case when period = 0 then users end) as install,
           sum(case when period = 3 then ad_revenue_total + revenue_total end) as REV_D3,
           sum(case when period = 7 then ad_revenue_total + revenue_total end) as REV_D7,
           sum(case when period = 30 then ad_revenue_total + revenue_total end) as REV_D30,
           sum(case when period = 60 then ad_revenue_total + revenue_total end) as REV_D60,
           sum(case when period = 90 then ad_revenue_total + revenue_total end) as REV_D90,
           sum(case when period = 120 then ad_revenue_total + revenue_total end) as REV_D120,
           sum(case when period = 0 then retained_users end) as retained_users_D0,
           sum(case when period = 1 then retained_users end) as retained_users_D1,
           sum(case when period = 3 then retained_users end) as retained_users_D3,
           sum(case when period = 7 then retained_users end) as retained_users_D7,
           sum(case when period = 30 then retained_users end) as retained_users_D30,
           sum(case when period = 0 then ad_impressions_total end) as imps_D0
    FROM sm-data-center.Adjust.cumulative_cohort
    WHERE date BETWEEN PARSE_DATE('%Y%m%d', @DS_START_DATE) AND PARSE_DATE('%Y%m%d', @DS_END_DATE)
      AND cost IS NOT NULL and period IN (0, 1, 3, 7, 30, 60, 90,120) and channel != 'Google Organic Search'
    GROUP BY date, country_code , channel, campaign_name, package_name, mmp
  ),

B as (
  SELECT * FROM sm-data-center.Adjust.avg_ratio_ROAS_D30_D3
),

C as (
SELECT A.*, B.ratio_d30_d3 as RATIO_REVD30_REVD3
FROM A 
LEFT JOIN B
ON DATE_SUB(A.date, INTERVAL 30 DAY) = B.date AND A.campaign_name = B.campaign
ORDER BY A.date ASC)

SELECT C.* except(package_name),
D.app_fullname
from C join
sm-data-center.AppsflyerModeling.application as D 
ON C.package_name = D.package_name 