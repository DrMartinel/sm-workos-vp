export function transformCampaignData(campaign: any, installs: number, installs_d1: number, installs_d3: number) {
    const { cost, REV_D30, REV_D3, RATIO_REVD30_REVD3 } = campaign;

    const cpi = (cost ?? 0) / (installs ?? 1);
    const roasD3 = ((REV_D3 ?? 0) / (cost ?? 1)) * 100;
    const roasD30 = ((REV_D30 ?? 0) / (cost ?? 1)) * 100;
    const eRoasD30 = ((REV_D3 ?? 0) * (RATIO_REVD30_REVD3 ?? 0)) / (cost ?? 1) * 100;

    const retentionD1 = ((installs_d1 ?? 0) / (installs ?? 1)) * 100;
    const retentionD3 = ((installs_d3 ?? 0) / (installs ?? 1)) * 100;

    return {
        ...campaign,
        cpi,
        roasD3,
        roasD30,
        eRoasD30,
        retentionD1,
        retentionD3,
    };
} 