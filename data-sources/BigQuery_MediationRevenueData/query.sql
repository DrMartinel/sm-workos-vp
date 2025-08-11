SELECT 
  A.* EXCEPT(package_name),
  platform,
  app_fullname
FROM `sm-data-center.Mediation.advertising_data` AS A
JOIN `sm-data-center.AppsflyerModeling.application` AS B
  ON A.package_name = B.package_name
WHERE date BETWEEN PARSE_DATE('%Y%m%d', @DS_START_DATE)
              AND PARSE_DATE('%Y%m%d', @DS_END_DATE) 