import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../../Components/Components';
import PanelTreeSelect from "../../GeneralComponents/PanelTreeSelect";
import { convertPanelsToTree } from "../../GeneralComponents/Functions";
import ZonesByPanelId from "../ZonesByPanelId";


/*
    details: {
        zones: [],              // Array of zones to copy
    }

    ////// When we setDetails key from here ... it sets the copy_data's key, value in EditPanel.js
*/
export default function CopyPanelData({
    selectedOrg,
    permissions={},

    errors={},
    details={},
    setDetailsKey=(key, value) => {alert("Set Details Key Method not defined")},
}) {
    const [selected, setSelected] = useState({
        panel_id: null,
        panel_name: '',
        panel_code: '',
        panel_type_id: null,
        panel_type_name: '',
        panel_type_group_id: null,
        panel_type_group_name: '',
    })
    const [selectOptions, setSelectOptions] = useState({
        panels: [],
        // zones: [],
    });

    const getPanelOptions = async () => {
        // Check AllPanels.js documentation for the api res documentation
        axios.get('/admin-api/all_panels_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                const {treeData, panelIds} = convertPanelsToTree(data);
                

                setSelectOptions(prev => ({
                    ...prev,
                    panels: treeData,
                }));
            })
            .catch(err => {
                console.log(err);
                message.error('Error in fetching panels');
            })
    }
    // const getZones = async (panelId, orgId) => {
    //     // For documentation check ZonesByPanelId.js
    //     axios.get('/admin-api/all_zones_by_panel_id', {
    //         params: {
    //             panel_id: panelId,
    //             o_id: orgId,
    //         }
    //     })
    //         .then(res => {
    //             const data = res.data.data;

    //             setSelectOptions(prev => ({
    //                 ...prev,
    //                 zones: data,
    //             }));
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             message.error('Error in fetching zones');
    //         })
    // }

    useEffect(() => {
        getPanelOptions();
    }, []);

    // useEffect(() => {
    //     if(selected.panel_id) {
    //         getZones(selected.panel_id, selectedOrg.orgId);
    //     }
    // }, [selected.panel_id]);
    

    const handlePanelChange = (value) => {
        value = JSON.parse(value);
        setSelected(prev => ({
            ...prev,
            panel_id: value.panel_id,
            panel_name: value.panel_name,
            panel_code: value.panel_code,

            panel_type_id: value.panel_type_id,
            panel_type_name: value.panel_type_name,

            panel_type_group_id: value.panel_type_group_id,
            panel_type_group_name: value.panel_type_group_name,
        }));
        setDetailsKey('panel_id', value.panel_id);

    }

    
    return (
    <>
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Panel" error={errors.panel_id} reqMark={true}>
                <PanelTreeSelect
                    panelTree={selectOptions.panels}

                    value={`${selected.panel_name} - (${selected.panel_type_group_name} / ${selected.panel_type_name})`}
                    onChange={handlePanelChange}
                    style={{width: '450px'}}
                    status={errors?.panel_id?.errors?.[0]?.msg && "error"}

                    loading={selectOptions.panels.length === 0}
                    disabled={selectOptions.panels.length === 0}
                />
            </InputWithLabel>
            <InputWithLabel label="The below zones and events will be added to the panel." divStyle={{width: '100%', marginTop: '15px'}}>
                {selected.panel_id && (
                    <ZonesByPanelId
                        selectedOrg={selectedOrg}
                        // permissions={}
                        showActions={false}
                        outerDivStyle={{width: '100%'}}
                        refreshData={1}
                        panelId={selected.panel_id}
                    />
                )}
            </InputWithLabel>
        </div>
    </>
    )
}
