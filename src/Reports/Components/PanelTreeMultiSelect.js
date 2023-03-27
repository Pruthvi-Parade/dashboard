import { message, TreeSelect } from 'antd';
import { convertPanelsToTree } from '../../Masters/GeneralComponents/Functions';
import React, { useState, useEffect } from 'react'
import { InputWithLabel } from '../../Components/Components';
import axios from 'axios';

// On blur we will set the main state which is responsible for the filter
export default function PanelTreeMultiSelect({
    selectedOrg,

    value,
    setValue = () => {alert("Panel Select setValue method not defined")},

    className="my-form-input",
    style={width: "300px"},
    status="",

    showTreeLine=true,
    showLeafIcon=false,

    pickerLabel="Select Panels",
}) {
    const [loading, setLoading] = useState(true);
    // Options for panel select
    const [panelTree, setPanelTree] = useState([]);

    // This is the state which will handle Change
    // Then on blur we will set the main state which is responsible for the filter
    const [selectedPanels, setSelectedPanels] = useState(value);

    const getPanelOptions = async () => {
        setLoading(true);
        await axios.get('/admin-api/all_panels_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                const {treeData, panelIds} = convertPanelsToTree(data);

                setPanelTree(treeData);
                setSelectedPanels(panelIds);
                setValue(panelIds);     // Set the panelIds as the value of the select
            })
            .catch(err => {
                setPanelTree([]);
                setSelectedPanels([]);
                console.log(err);
                message.error('Error in fetching panels');
            })
        setLoading(false);
    }

    useEffect(() => {
        getPanelOptions();
    }, [selectedOrg.orgId]);


    return (
        <InputWithLabel label={pickerLabel}>
            <TreeSelect
                style={style}
                className={className}

                key={selectedOrg.orgId}

                treeData={panelTree}
                treeLine={showTreeLine && { showLeafIcon }}

                value={selectedPanels}
                onChange={setSelectedPanels}
                maxTagCount={0}
                maxTagPlaceholder={s => `+ ${s.length} Panels Selected`}
                treeCheckable={true}
                showCheckedStrategy={'SHOW_CHILD'}
                placeholder={!loading && "Select Panels"}

                onBlur={() => {setValue(selectedPanels)}}

                loading={loading}
                disabled={loading}

                showSearch
                filterTreeNode={(inputValue, treeNode) => {
                    return treeNode.title.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
                }}
            />
        </InputWithLabel>
    )
}
