import { TreeSelect } from 'antd'
import React from 'react'

const { TreeNode } = TreeSelect;

export default function PanelTreeSelect({
    panelTree,
    
    value,
    onChange=() => {alert("Panel Tree Select onChange method not defined")},

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
            status={status}
            
            showSearch={true}
            treeDefaultExpandAll={false}
        >
            {panelTree.map((region, rIndex) => (
                <TreeNode
                    selectable={false}
                    nodeType="region"
                    key={"r_" + region.region_id}
                    value={"r_" + region.region_id} 
                    title={region.region_name}
                    style={{textAlign: "left"}}
                >
                    {region.children.map((area, aIndex) => (
                        <TreeNode
                            selectable={false}
                            nodeType="area"
                            key={"a_" + area.area_id}
                            value={"a_" + area.area_id} 
                            title={area.area_name}
                            style={{textAlign: "left"}}
                        >
                            {area.children.map((site, sIndex) => (
                                <TreeNode 
                                    selectable={false}
                                    nodeType="site"
                                    key={"s_" + site.site_id}
                                    value={"s_" + site.site_id}
                                    title={site.site_name}
                                    style={{textAlign: "left"}}
                                >
                                    {site.children.map((panel, pIndex) => (
                                        <TreeNode
                                            nodeType="panel"
                                            // key={"p_" + panel.panel_id}
                                            value={JSON.stringify(panel)}
                                            title={panel.panel_name}
                                            style={{textAlign: "left"}}
                                        />
                                    ))}
                                </TreeNode>
                            ))}
                        </TreeNode>  
                    ))}
                </TreeNode>
            ))}
        </TreeSelect>


    )
}
