SELECT
    ad_unit_id,
    date,
    network,
    node_id,
    position,
    type,
    value,
    click,
    view,
    request,
    cpc,
    rpm
FROM
    aa_revenue_cpc
WHERE
    date >= @startDate AND date <= @endDate; 