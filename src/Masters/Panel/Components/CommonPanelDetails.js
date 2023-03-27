import { DatePicker, Input, message, Select } from 'antd'
import axios from 'axios';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { InputWithLabel } from '../../../Components/Components'
import { convertSitesToTree } from '../../GeneralComponents/Functions';
import SiteTreeSelect from '../../GeneralComponents/SiteTreeSelect';


/*
    Panel Details Tab 

    state:
        refer PanelDetails.js
*/

export default function CommonPanelDetails({
    details,
    setDetails = () => {alert("setDetails not defined")},
    setDetailsKey = () => {alert("setDetailsKey not defined")},

    errors={},

    isAddNew,
    selectedOrg,
}) {
    // console.log("panelCommonDetails", errors);
    const [selectOptions, setSelectOptions] = useState({
        sites: [],
        panelTypes: [],
        site_zones :[],
    });

    const getSelectOptions = async () => {

        // Check All locations => LocationsTree for documentation
        // {
        //     "data": [
        //         {
        //             "site_id": 9,
        //             "site_name": "All Access",
        //             "site_code": "SIT000",
        //             "area_id": 11,
        //             "area_name": "Area_51",
        //             "area_code": "ARE000",
        //             "area_description": "gh oaigorg",
        //             "area_comments": "aophjpohjrwo",
        //             "region_id": 18,
        //             "region_name": "UK",
        //             "region_code": "REG022",
        //             "region_description": "dghouadg",
        //             "region_comments": "IGFEJTP"
        //         }
        //     ]
        // }
        axios.get('/admin-api/all_sites_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                setSelectOptions(prev => ({
                    ...prev,
                    sites: convertSitesToTree(data),
                }));
            })
            .catch(err => {
                console.log(err);
                message.error("Error in fetching sites");
            });

        /*
            "data": [
                        {
                            "panel_type_id": 1,
                            "panel_type_name": "Gateway",
                            "panel_type_group_code": "GAT001"
                        },
                        {
                            "panel_type_id": 2,
                            "panel_type_name": "Mobile Application",
                            "panel_type_group_code": "MOB001"
                        }
                    ],
        */

        axios.get('/admin-api/get_m_panel_type')
            .then(res => {
                const data = res.data.data;
                console.log(data);
                setSelectOptions(prev => ({
                    ...prev,
                    panelTypes: data,
                }));
                if(isAddNew && data.length > 0 && !details.panel_type_id) {
                    setDetailsKey("panel_type_id", data[0].panel_type_id);
                    setDetailsKey("panel_type_group_code", data[0].panel_type_group_code);
                }
            })
            .catch(err => {
                console.log(err);
                message.error("Error in fetching panel types");
            })

        console.log(details);
        axios.get('/admin-api/all_zones_by_site_id', {
            params: {
                site_id: details.site_id,
                o_id: selectedOrg.orgId,
            }
        })
        .then(res=> {
            const data = res.data.data;
            console.log(data);
            setSelectOptions(prev=>({
                ...prev,
                site_zones: data,
            }));
            if (isAddNew && data.length > 0 && !details.site_id) {
                setDetailsKey("sz_id", data[0].sz_id);
            }
        })
        .catch(err=> {
            console.log(err);
            message.error("Error in fetching Site Zones")
        })
    }

    const handleSiteChange = (value) => {
        value = JSON.parse(value);
        setDetails(prev => ({
            ...prev,
            site_id: value.site_id,
            site_name: value.site_name,

            region_id: value.region_id,
            region_name: value.region_name,

            area_id: value.area_id,
            area_name: value.area_name,
        }));
    }

    useEffect(() => {
        getSelectOptions();
    }, []);

    useEffect(() => {
        setDetailsKey("panel_type_group_code", selectOptions.panelTypes.find(pt => pt.panel_type_id === details.panel_type_id)?.panel_type_group_code);
    }, [details.panel_type_id]);

    return (
    <>
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Panel Type" error={errors.panel_type_id} reqMark={true}>
                <Select
                    value={details.panel_type_id}
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('panel_type_id', e)}}
                    loading={selectOptions.panelTypes.length === 0}
                    disabled={selectOptions.panelTypes.length === 0 || !isAddNew}
                    showSearch
                    optionFilterProp='children'
                    status={errors?.panel_type_id?.errors?.[0]?.msg && "error"}
                >
                    {selectOptions.panelTypes.map((item, index) => (
                        <Select.Option key={index} value={item.panel_type_id}>
                            {item.panel_type_name}
                        </Select.Option>
                    ))}
                </Select>
            </InputWithLabel>
            <InputWithLabel label="Site" error={errors.site_id} reqMark={true}>
                <SiteTreeSelect
                    siteTree={selectOptions.sites}

                    value={details.site_name}
                    onChange={handleSiteChange}
                    style={{width: '270px'}}
                    
                    status={errors?.site_id?.errors?.[0]?.msg && "error"}

                    loading={selectOptions.sites.length === 0}
                    disabled={selectOptions.sites.length === 0 || !isAddNew}
                />
            </InputWithLabel>
            <InputWithLabel label="Site Zone" error={errors.sz_id} reqMark={true}>
                <Select
                    value={details.sz_id}
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('sz_id', e)}}
                    loading={selectOptions.site_zones.length === 0}
                    disabled={selectOptions.site_zones.length === 0 || isAddNew}
                    showSearch
                    optionFilterProp='children'
                    status={errors?.sz_id?.errors?.[0]?.msg && "error"}
                >
                    {selectOptions.site_zones.map((item, index) => (
                        <Select.Option key={index} value={item.sz_id}>
                            {item.zone_name}
                        </Select.Option>
                    ))}
                </Select>
            </InputWithLabel>
        </div>
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Panel Name" error={errors.panel_name} reqMark={true}>
                <Input
                    value={details.panel_name}
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('panel_name', e.target.value)}}
                    status={errors?.panel_name?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
            <InputWithLabel label="Panel Code" error={errors.panel_code} reqMark={true}>
                <Input
                    value={details.panel_code}
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('panel_code', e.target.value)}}
                    status={errors?.panel_code?.errors?.[0]?.msg && "error"}
                    // disabled={!isAddNew}
                />
            </InputWithLabel>
            <InputWithLabel label="Panel Number" error={errors.panel_number} reqMark={true}>
                <Input
                    value={details.panel_number}
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('panel_number', e.target.value)}}
                    status={errors?.panel_number?.errors?.[0]?.msg && "error"}
                    disabled={!isAddNew}
                />
            </InputWithLabel>
        </div>
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="IP Address" error={errors.ip_address}>
                <Input
                    value={details.ip_address}
                    // type=""
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('ip_address', e.target.value)}}
                    status={errors?.ip_address?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
            <InputWithLabel label="Local IP Address" error={errors.local_ip_address}>
                <Input
                    value={details.local_ip_address}
                    // type=""
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('local_ip_address', e.target.value)}}
                    status={errors?.local_ip_address?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
            <InputWithLabel label="Port" error={errors.port}>
                <Input
                    value={details.port}
                    type="number"
                    className="my-form-input"
                    style={{minWidth: '100px'}}
                    onChange={(e) => {setDetailsKey('port', e.target.value)}}
                    status={errors?.port?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
            <InputWithLabel label="Mac Address" error={errors.mac_address}>
                <Input
                    value={details.mac_address}
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('mac_address', e.target.value)}}
                    status={errors?.mac_address?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
        </div>
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Multi Device Support">
                    <Select
                        value={details.panel_multi_device_support}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('panel_multi_device_support', e)}}
                        loading={selectOptions.panelTypes.length === 0}
                    >
                            <Select.Option value={1}>Yes</Select.Option>
                            <Select.Option value={0}>No</Select.Option>
                    </Select>
            </InputWithLabel>
            <InputWithLabel label="Panel HW Unique Code" error={errors.panel_hw_unique_code}>
                <Input
                    value={details.panel_hw_unique_code}
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('panel_hw_unique_code', e.target.value)}}
                    status={errors?.panel_hw_unique_code?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
        </div>
        
        
        
        
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Installation Date">
                <DatePicker
                    value={details.installation_date}
                    className="my-form-input"
                    onChange={(date, dateString) => {console.log(details.installation_date); setDetailsKey('installation_date', date)}}
                    format="Do MMM, YYYY"
                />
            </InputWithLabel>
            <InputWithLabel label="Last Maintenance Date">
                <DatePicker
                    value={details.last_maintenance_date}
                    className="my-form-input"
                    onChange={(date, dateString) => {setDetailsKey('last_maintenance_date', date)}}
                    format="Do MMM, YYYY"
                />
            </InputWithLabel>
        </div>

        
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Heartbeat Duration" error={errors.heart_beat_duration}>
                <Input
                    value={details.heart_beat_duration}
                    type="number"
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('heart_beat_duration', e.target.value)}}
                    status={errors?.heart_beat_duration?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
        </div>

        
    </>
    )
}
