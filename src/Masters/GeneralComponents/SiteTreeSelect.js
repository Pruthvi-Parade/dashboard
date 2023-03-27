import { TreeSelect } from 'antd'
import React from 'react'

const { TreeNode } = TreeSelect;

export default function SiteTreeSelect({
    siteTree,           // For documentation refer AllLocations.js
    
    value,
    onChange=() => {alert("Site Tree Select onChange method not defined")},

    loading=false,
    disabled=false,

    className="my-form-input",
    style={},

    status="",

    showTreeLine=true,
    showLeafIcon=false,
}) {


    return (
        <TreeSelect
            treeLine={showTreeLine && { showLeafIcon }}

            value={value}
            onChange={onChange}

            loading={loading}
            disabled={disabled}
            className={className}
            style={style}
            
            showSearch={true}
            treeDefaultExpandAll={false}

            status={status}
        >
            {siteTree.map((region, rIndex) => (
                <TreeNode
                    selectable={false}
                    nodeType="region"
                    key={"r_" + region.region_id}
                    value={"r_" + region.region_id} 
                    title={region.region_name}
                    style={{textAlign: "left"}}
                >
                    {region.areas.map((area, aIndex) => (
                        <TreeNode
                            selectable={false}
                            nodeType="area"
                            key={"a_" + area.area_id}
                            value={"a_" + area.area_id} 
                            title={area.area_name}
                            style={{textAlign: "left"}}
                        >
                            {area.sites.map((site, sIndex) => (
                                <TreeNode 
                                    nodeType="site"
                                    value={JSON.stringify(site)} 
                                    title={site.site_name} 
                                    style={{textAlign: "left"}}
                                />
                            ))}
                        </TreeNode>  
                    ))}
                </TreeNode>
            ))}
        </TreeSelect>


    )
}
