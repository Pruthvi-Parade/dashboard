import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../Components/Components';
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import { validateZoneGroup } from "../../Components/Validations";

const { TabPane } = Tabs;

/*
    Edit and add zonegroup:
        if isAddNew is true, then we will post else put

    state:
        details: {
            zone_group_name: "",
            description: "",
            comments: "",
            audit_remark: "",

            priority_group_id: 0,           // priority of that zone group
            severity_group_id: 0,           // severity of that zone group
            action_plan_id: 0,               // Id of action plan that is assigned to this zone group ( Org Level )
        }

*/
export default function EditZoneGroup({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/zone-group",
}) {
    let zoneGroupId = parseInt(useParams().id);
    const navigate = useNavigate();

    // For having the active tab in the url (for refreshing)
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'details');
    const changeActiveTab = (key) => {
        setActiveTab(key);
        searchParams.set('tab', key);
        setSearchParams(searchParams, {replace: true});
    }    
    
    const [loading, setLoading] = useState(true);

    // Here will be the default state of the form (For add new)
    // For documentation, see the comment above function 
    const [details, setDetails] = useState({
        zone_group_id: zoneGroupId || 0,
        zone_group_name: "",
        description: "",
        comments: "",
        audit_remark: "",

        priority_group_id: 0,
        severity_group_id: 0,
        action_plan_id: 0,
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});
    
    const [selectOptions, setSelectOptions] = useState({
        severities: [],
        priorities: [],
        actionPlans: [],
    });

    const getDetails = async () => {
        setLoading(true);

        /*
            {
                action_plan_id: []
                comments: "Test CMS V2"
                description: "Test CMS V2"
                priority_group_id: 184
                severity_group_id: 183
                zone_group_name: "Test CMS V2"
            }
        */
        await axios.get('/admin-api/zone_group_by_zone_group_id?', {
            params: {
                o_id: selectedOrg.orgId,
                zone_group_id : zoneGroupId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,
                    zone_group_name: data.zone_group_name,
                    description: data.description || "",
                    comments: data.comments || "",
                    audit_remark: data.audit_remark || "",

                    priority_group_id: data.priority_group_id,
                    severity_group_id: data.severity_group_id,
                    action_plan_id: data.action_plan_id || 0,
                }));

            })
            .catch(err => {
                console.log(err);
                message.error('Error getting zone group');
                navigate(homePath);
            })
        setLoading(false);
    }

    const getOptions = () => {
        /*
            [
                {
                    "severity_group_id": 323,
                    "severity_group_name": "Severity 1",
                    "severity_group_type": 1,
                    "severity_name": "High",
                    "description": "D",
                    "comments": "C",
                    "m_severity_id": 1

                    Extra fields:      
                        severity_group_type, o_id, comments, description, is_active, is_deleted, created_time, updated_time, created_by, updated_by, m_severity_id
                },
            ]
        */
        axios.get('/admin-api/all_severity_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                
                setSelectOptions(curr => ({
                    ...curr,
                    severities: data,
                }));
                if(isAddNew && !details.severity_group_id && data.length > 0) {
                    setDetailsKey("severity_group_id", data[0].severity_group_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting severities');
            })

        /*
            [
                {
                    "priority_group_id": 181,
                    "priority_group_name": "Priority 1",
                    "priority_group_interval": 1,
                    "m_priority_id": 1,


                    Extra fields:  
                        priority_group_type, o_id, comments, description, is_active, is_deleted, created_time, updated_time, created_by, updated_by, m_priority_id
                },
            ]
        */
        axios.get('/admin-api/all_priority_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                
                setSelectOptions(curr => ({
                    ...curr,
                    priorities: data,
                }));
                if(isAddNew && !details.priority_group_id && data.length > 0) {
                    setDetailsKey("priority_group_id", data[0].priority_group_id);
                }
            }).catch(err => {
                console.log(err);
                message.error('Error getting priorities');
            })

        /*
            [
                 {
                    "action_plan_id": 147,
                    "action_plan_name": "7621-T Lingampally -Telangana",

                    Extra fields:       TODO: Remove these fields from API
                    is_active, is_deleted, created_time, updated_time, created_by, updated_by, m_severity_id, comments, description, o_id
                },
            ]
        */
        axios.get('/admin-api/all_action_plans_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
                send_z_grp_flag: false,
            }
        })
            .then(res => {
                const data = res.data.data;
                
                setSelectOptions(curr => ({
                    ...curr,
                    actionPlans: [
                        {
                            action_plan_id: 0,
                            action_plan_name: "Select Action Plan",
                        }, 
                        ...data,
                    ],  
                }));
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting action plans');
            })


    }

    const setDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        getOptions();
        if(isAddNew){
            setLoading(false);
        }
        else{
            getDetails();
        }
    }, [])


    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateZoneGroup(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }
        
        if(isAddNew){
            await axios.post('/admin-api/add_zone_grp', {
                ...details,
                o_id: selectedOrg.orgId,
                m_severity_id: selectOptions.severities.find(s => s.severity_group_id === details.severity_group_id)?.m_severity_id,
                m_priority_id: selectOptions.priorities.find(p => p.priority_group_id === details.priority_group_id)?.m_priority_id,
            })
                .then(res => {
                    message.success('Zone group added successfully');
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    message.error('Error adding zone group');
                })
        }
        else{
            await axios.put('/admin-api/modify_zone_grp', {
                ...details,
                o_id: selectedOrg.orgId,
                m_severity_id: selectOptions.severities.find(s => s.severity_group_id === details.severity_group_id)?.m_severity_id,
                m_priority_id: selectOptions.priorities.find(p => p.priority_group_id === details.priority_group_id)?.m_priority_id,
            })
                .then(res => {
                    message.success('Zone group updated successfully');
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    message.error('Error updating zone group');
                })
        }
        setLoading(false);
    }
    
    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Zone Group 
                </span>
            </div>
            <div>
                <Tabs
                    tabBarExtraContent={
                        <div>
                            <Button type='danger' onClick={() => navigate(homePath)} loading={loading}>
                                Cancel
                            </Button>
                            <Button style={{marginLeft: '5px'}} type="primary" onClick={handleSubmit} loading={loading} disabled={!permissions.edit}>
                                {isAddNew ? "Add" : "Save"}
                            </Button>
                        </div>
                    }
                    activeKey={activeTab}
                    onChange={changeActiveTab}
                >
                    <TabPane className="my-form-tabpane-outer" tab="Zone Group Details" key="details">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Zone Group Name" error={errors.zone_group_name} reqMark={true}>
                                    <Input
                                        value={details.zone_group_name}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("zone_group_name", e.target.value)}
                                        status={errors?.zone_group_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Priority" error={errors.priority_group_id} reqMark={true}>
                                    <Select
                                        value={details.priority_group_id}
                                        className="my-form-input"
                                        onChange={(value) => setDetailsKey("priority_group_id", value)}
                                        loading={loading || selectOptions.priorities.length === 0}
                                        disabled={loading || selectOptions.priorities.length === 0}
                                        status={errors?.priority_group_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions.priorities.map(p => (
                                            <Select.Option key={p.priority_group_id} value={p.priority_group_id}>
                                                {p.priority_group_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Severity" error={errors.severity_group_id} reqMark={true}>
                                    <Select
                                        value={details.severity_group_id}
                                        className="my-form-input"
                                        onChange={(value) => setDetailsKey("severity_group_id", value)}
                                        loading={loading || selectOptions.severities.length === 0}
                                        disabled={loading || selectOptions.severities.length === 0}
                                    >
                                        {selectOptions.severities.map(s => (
                                            <Select.Option key={s.severity_group_id} value={s.severity_group_id}>
                                                {s.severity_group_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Action Plans">
                                    <Select
                                        value={details.action_plan_id}
                                        onChange={(value) => setDetailsKey("action_plan_id", value)}
                                        showSearch
                                        filterOption={(input, option) => option.children?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0}
                                        loading={loading || selectOptions.actionPlans.length === 0}
                                        disabled={loading || selectOptions.actionPlans.length === 0}
                                        className="my-form-input"
                                    >
                                        {selectOptions.actionPlans.map(a => (
                                            <Select.Option key={a.action_plan_id} value={a.action_plan_id}>
                                                {a.action_plan_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <RemarkComponent
                                    description={details.description}
                                    comments={details.comments}
                                    audit_remark={details.audit_remark}

                                    auditRemarkError={errors.audit_remark}
                                    descriptionError={errors.description}
                                    commentsError={errors.comments}

                                    setDetailsKey={setDetailsKey}
                                />
                            </div>

                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}
