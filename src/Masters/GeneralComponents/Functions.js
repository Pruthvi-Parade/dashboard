export const convertSitesToTree = (sites) => {
    // This will convert the locations array into a tree
    // This will be used to display the locations in a tree format
    let regions = {};

    sites.forEach(site => {

        // Region found for the first time
        if (!regions[site.region_id]) {
            regions[site.region_id] = {
                region_id: site.region_id,
                region_name: site.region_name,
                region_code: site.region_code,
                region_description: site.region_description,
                region_comments: site.region_comments,


                // Need to check if The region has area
                areas: site.area_id ? 
                    {
                        [site.area_id]: {
                            area_id: site.area_id,
                            area_name: site.area_name,
                            area_code: site.area_code,
                            area_description: site.area_description,
                            area_comments: site.area_comments,

                            region_id: site.region_id,
                            region_name: site.region_name,
                            region_code: site.region_code,
                            region_description: site.region_description,
                            region_comments: site.region_comments,

                            // Need to check if the area has sites
                            sites: site.site_id ? [{...site}] : []
                        }
                    } 
                : 
                    {}
            }
        }
        else {
            // Region already exists
            if (site.area_id && !regions[site.region_id].areas[site.area_id]) {

                // Area not found for the region
                regions[site.region_id].areas[site.area_id] = {
                    area_id: site.area_id,
                    area_name: site.area_name,
                    area_code: site.area_code,
                    area_description: site.area_description,
                    area_comments: site.area_comments,

                    region_id: site.region_id,
                    region_name: site.region_name,
                    region_code: site.region_code,
                    region_description: site.region_description,
                    region_comments: site.region_comments,

                    // Need to check if the area has sites
                    sites: site.site_id ? [{...site}] : []
                }
            }
            else {
                // Area already exists

                // Need to check if the area has sites
                if(site.site_id) {
                    regions[site.region_id].areas[site.area_id].sites.push({...site});
                }
            }
        }
    });

    let regionsTree = [];
    for (let region in regions) {
        var regionObj = regions[region];
        regionObj.areas = Object.values(regionObj.areas);
        regionsTree.push(regionObj);
    }

    // console.log(regionsTree, locations);

    return regionsTree;
}


export const convertPanelsToTree = (panels) => {
    let regions = {};
    let panelIds = [];

    panels.forEach(panel => {
        panelIds.push(panel.panel_id);

        // Region found for the first time
        if (!regions[panel.region_id]) {
            regions[panel.region_id] = {
                title: panel.region_name,
                value: `r_${panel.region_id}`,

                region_id: panel.region_id,
                region_name: panel.region_name,

                selectable: false,

                children: {
                    [panel.area_id]: {
                        title: panel.area_name,
                        value: `a_${panel.area_id}`,

                        area_id: panel.area_id,
                        area_name: panel.area_name,
                        
                        children: {
                            [panel.site_id]: {
                                title: panel.site_name,
                                value: `s_${panel.site_id}`,

                                site_id: panel.site_id,
                                site_name: panel.site_name,
                                
                                children: [{
                                    title: panel.panel_name,
                                    value: panel.panel_id,
                                    // value: `p_${panel.panel_id}`,

                                    panel_id: panel.panel_id,
                                    panel_name: panel.panel_name,
                                    panel_code: panel.panel_code,
                                    panel_type_id: panel.m_panel_type_id,
                                    panel_type_name: panel.m_panel_type_name,
                                    panel_type_group_id: panel.m_panel_type_group_id,
                                    panel_type_group_name: panel.m_panel_type_group_name,
                                }]
                            }
                        }
                    }
                }
            }
        }

        // Area not found for the region
        else if(!regions[panel.region_id].children[panel.area_id]) {
            regions[panel.region_id].children[panel.area_id] = {
                title: panel.area_name,
                value: `a_${panel.area_id}`,

                area_id: panel.area_id,
                area_name: panel.area_name,

                children: {
                    [panel.site_id]: {
                        title: panel.site_name,
                        value: `s_${panel.site_id}`,

                        site_id: panel.site_id,
                        site_name: panel.site_name,
                        
                        children: [{
                            title: panel.panel_name,
                            value: panel.panel_id,
                            // value: `p_${panel.panel_id}`,

                            panel_id: panel.panel_id,
                            panel_name: panel.panel_name,
                            panel_code: panel.panel_code,
                            panel_type_id: panel.m_panel_type_id,
                            panel_type_name: panel.m_panel_type_name,
                            panel_type_group_id: panel.m_panel_type_group_id,
                            panel_type_group_name: panel.m_panel_type_group_name,
                        }]
                    }
                }
            }
        }

        // Site not found for the area
        else if(!regions[panel.region_id].children[panel.area_id].children[panel.site_id]) {
            regions[panel.region_id].children[panel.area_id].children[panel.site_id] = {
                title: panel.site_name,
                value: `s_${panel.site_id}`,

                site_id: panel.site_id,
                site_name: panel.site_name,
                
                children: [{
                    title: panel.panel_name,
                    value: panel.panel_id,
                    // value: `p_${panel.panel_id}`,

                    panel_id: panel.panel_id,
                    panel_name: panel.panel_name,
                    panel_code: panel.panel_code,
                    panel_type_id: panel.m_panel_type_id,
                    panel_type_name: panel.m_panel_type_name,
                    panel_type_group_id: panel.m_panel_type_group_id,
                    panel_type_group_name: panel.m_panel_type_group_name,
                }]
            }
        }

        // Site already exists
        else {
            regions[panel.region_id].children[panel.area_id].children[panel.site_id].children.push({
                title: panel.panel_name,
                value: panel.panel_id,
                // value: `p_${panel.panel_id}`,

                panel_id: panel.panel_id,
                panel_name: panel.panel_name,
                panel_code: panel.panel_code,
                panel_type_id: panel.m_panel_type_id,
                panel_type_name: panel.m_panel_type_name,
                panel_type_group_id: panel.m_panel_type_group_id,
                panel_type_group_name: panel.m_panel_type_group_name,
            });
        }
    });

    let regionsTree = [];
    for (let region in regions) {
        var regionObj = regions[region];
        regionObj.children = Object.values(regionObj.children);
        regionObj.children.forEach(area => {
            area.children = Object.values(area.children);
        });
        regionsTree.push(regionObj);
    }

    return {treeData: regionsTree, panelIds: panelIds};
}
