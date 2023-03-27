import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";
import { InputWithLabel } from '../../Components/Components';
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import TempFieldsComponent from "../GeneralComponents/TempFieldsComponent";
import { validateZoneEvent } from "../../Components/Validations";

const { TabPane } = Tabs;


/*
    Edit and add Panel
        if isAddNew is true then post else put

    state:
        details:{
            "action_plan_id": 0,
            "status_id": 12,
            "zone_id": 1623,
            "updated_time": "2017-07-11T18:05:54",
            "is_actionable": 1,
            "contact_info": 0,
            "description": "CHECK EVENT BEFORE SYSTEM RESTARTED AND MAIL SEND TO UJJWAL AND PANKAJ SIR",
            "event_name": "System Restarted",
            "o_id": 9,
            "generate_ticket": 0,
            "event_code": "NZZ014",
            "comments": "CHECK EVENT BEFORE SYSTEM RESTARTED AND MAIL SEND TO UJJWAL AND PANKAJ SIR",
            "is_active": 1,
            "autogenerate_action_plan": 0,
            "delay_time": 0,
            "priority_template_id": 13,
            "is_deleted": 0,
            "severity_template_id": 13,
            "zone_event_template_id": 0,
            "zone_event_id": 3911,
            "created_by": 14,
            "panel_id": 5,
            "event_type_id": 19,
            "created_time": "2017-06-16T11:18:46",
            "updated_by": 14
        }
        // TODO: Check zone_short_code and zone_bit_value
*/

export default function EditEvent({
    selectedOrg,
    panelId,
    zoneId,
    eventId,

    isAddNew,
    permissions={},

    panelDetails={},
    zoneName="",

    isActuallyVisible,                        // Check ZoneEventEditTab.js documentation for use of this field
    // Above key is not useful for this component only for zoneEdit component
    
    closeEdit=() => {alert("onClose not defined")},
}) {
    const [loading, setLoading] = useState(true);

    // Here will be the default state of the form (For add new)
    // For documentation, see the comment above function 
    const [details, setDetails] = useState({
        zone_event_id: 0,
        event_name: "",
        event_code: "",

        event_type_id: 18,
        status_id: 12,
        priority_template_id: 0,
        severity_template_id: 0,
        action_plan_id: 0,
        contact_info: 0,

        delay_time: 0,
        generate_ticket: 0,
        autogenerate_action_plan: 0,
        is_actionable: 1,

        panel_id: panelId,
        zone_id: zoneId,
        o_id: selectedOrg,

        description: "",
        comments: "",
        audit_remark: "",

        temp_field_1: "",
        temp_field_2: "",
        temp_field_3: "",

        is_active: 1,
        is_deleted: 0,

        tags: {},

    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const [selectOptions, setSelectOptions] = useState({
        types: [],
        statuses: [],
        priorities: [],
        severities: [],
        actionPlans: [],
        contactInfos: [],
        // Tags is a json type field
        tags: [
            {key: "arm_disarm", value: "arm", label: "ARM"},
            {key: "arm_disarm", value: "disarm", label: "DISARM"},
            // {key: "event", value: "event", label: "EVENT"},
        ],
    });

    const getDetails = async () => {
        setLoading(true);
        await axios.get("/admin-api/zone_event_by_zone_event_id", {
            params: {
                zone_event_id: eventId,
                o_id: selectedOrg.orgId
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,
                    ...data,

                    zone_event_id: data.zone_event_id || 0,
                    event_name: data.event_name || "",
                    event_code: data.event_code || "",

                    event_type_id: data.event_type_id || 18,
                    status_id: data.status_id || 12,
                    priority_template_id: data.priority_template_id || 0,
                    severity_template_id: data.severity_template_id || 0,
                    action_plan_id: data.action_plan_id || 0,
                    contact_info: data.contact_info || 0,

                    delay_time: data.delay_time || 0,
                    generate_ticket: data.generate_ticket || 0,
                    autogenerate_action_plan: data.autogenerate_action_plan || 0,
                    is_actionable: data.is_actionable || 1,

                    panel_id: data.panel_id || panelId,
                    zone_id: data.zone_id || zoneId,
                    o_id: data.o_id || selectedOrg,

                    description: data.description || "",
                    comments: data.comments || "",
                    audit_remark: data.audit_remark || "",

                    temp_field_1: data.temp_field_1 || "",
                    temp_field_2: data.temp_field_2 || "",
                    temp_field_3: data.temp_field_3 || "",

                    tags: data.tags || {},
                }));
            })
            .catch(err => {
                console.log(err);
                message.error("Error while fetching details");
                closeEdit();

            })
        setLoading(false);
    }

    const getSelectOptions = async () => {
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
                            action_plan_name: "None",
                        }, 
                        ...data,
                    ],  
                }));
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting action plans');
            })

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
                if(isAddNew && !details.severity_template_id && data.length > 0) {
                    setDetailsKey("severity_template_id", data[0].severity_group_id);
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
                if(isAddNew && !details.priority_template_id && data.length > 0) {
                    setDetailsKey("priority_template_id", data[0].priority_group_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting priorities');
            })

        /*
            [
                {
                    "status_id": 12,
                    "status_type_id": 4,
                    "is_deleted": 0,
                    "status_name": "Enabled",
                    "description": null
                },
            ]
        */
        axios.get('/admin-api/all_status_by_status_type_id', {
            params: {
                status_type_id: 4,
            }
        })
            .then(res => {
                const data = res.data.data;
                setSelectOptions(prev => ({
                    ...prev,
                    statuses: data,
                }));
                if(isAddNew && data.length > 0 && !details.status_id) {
                    setDetailsKey("status_id", data[0].status_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error("Error in fetching statuses");
            })

        /*
            {
                "status_id": 18,
                "status_type_id": 6,
                "is_deleted": 0,
                "status_name": "Good",
                "description": null
            },
        */
        axios.get('/admin-api/all_status_by_status_type_id', {
            params: {
                status_type_id: 6,
            }
        })
            .then(res => {
                const data = res.data.data;
                setSelectOptions(prev => ({
                    ...prev,
                    types: data,
                }));
                if(isAddNew && data.length > 0 && !details.event_type_id) {
                    setDetailsKey("event_type_id", data[0].status_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error("Error in fetching types");
            })   
            
            
        /*
            [
                {
                    "e_firstname": "Pankaj",
                    "e_lastname": "Zanwar",
                    "e_email": "pankaj.zanwar@smartisystems.com",
                    "contact_no": "98908151516",
                    "e_id": 15,
                    "user_id": 15,
                    "username": "smartica",
                    "role_id": 0,
                    "scope_id": 0,
                    "scope_name": null,
                    "role_name": null
                },
            ]
        */
        axios.get('/admin-api/all_employee_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                setSelectOptions(prev => ({
                    ...prev,
                    contactInfos: [
                        {
                            e_id: 0,
                            e_firstname: "None",
                        },
                        ...data,
                    ],
                }));
            })
            .catch(err => {
                console.log(err);
                message.error("Error in fetching employees");
            })
    
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        if(isAddNew) {
            setLoading(false);
        } 
        else {
            if(zoneId) {
                getDetails();
            }
        }
    }, [eventId]);

    useEffect(() => {
        getSelectOptions();
    }, [])

    
    const setDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }

    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateZoneEvent(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            // setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_zone_event', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Panel added successfully');
                    // navigate(homePath);
                    closeEdit();
                }).catch(err => {
                    console.log(err);
                    message.error('Error while adding Panel');
                })
        }
        else {
            await axios.put('/admin-api/modify_zone_event', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Panel modified successfully');
                    // navigate(homePath);
                    closeEdit();
                })
                .catch(err => {
                    console.log(err);
                    message.error('Error while modifying Panel');
                })
        }
        setLoading(false);
    }

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Zone Event 
                </span>
            </div>
            <div>
                <Tabs
                    tabBarExtraContent={
                        <div>
                            <Button type='danger' onClick={() => closeEdit()} loading={loading}>
                                Cancel
                            </Button>
                            <Button style={{marginLeft: '5px'}} type="primary" onClick={handleSubmit} loading={loading} disabled={!permissions.edit}>
                                {isAddNew ? "Add" : "Save"}
                            </Button>
                        </div>
                    }
                >
                    <TabPane className="my-form-tabpane-outer" tab="Details" key="1">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Panel">
                                    {panelDetails.panel_code} / {panelDetails.panel_name}
                                </InputWithLabel>
                                <InputWithLabel label="Zone" divStyle={{marginLeft: '10px'}}>
                                    {zoneName}
                                </InputWithLabel>
                                <InputWithLabel label="Location" divStyle={{marginLeft: '10px'}}>
                                    {panelDetails.region_name} / {panelDetails.area_name} / {panelDetails.site_name}
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Zone Event Name" error={errors.event_name} reqMark={true}>
                                    <Input
                                        value={details.event_name}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("event_name", e.target.value)}
                                        status={errors?.event_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Event Code" error={errors.event_code} reqMark={true}>
                                    <Input
                                        value={details.event_code}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("event_code", e.target.value)}
                                        status={errors?.event_code?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Delay Time">
                                    <Input
                                        value={details.delay_time}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("delay_time", e.target.value)}
                                        type="number"
                                    />
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Event Type" error={errors.event_type_id} reqMark={true}>
                                    <Select
                                        value={details.event_type_id}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("event_type_id", e)}
                                        loading={loading || !selectOptions?.types?.length}
                                        disabled={loading || !selectOptions?.types?.length}
                                        // showSearch
                                        // optionFilterProp="children"
                                        status={errors?.event_type_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions?.types?.map((item, index) => (
                                            <Select.Option key={index} value={item.status_id}>
                                                {item.status_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Status" error={errors.status_id} reqMark={true}>
                                    <Select
                                        value={details.status_id}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("status_id", e)}
                                        loading={loading || selectOptions?.statuses?.length === 0}
                                        disabled={loading || selectOptions?.statuses?.length === 0}
                                        // showSearch
                                        // optionFilterProp="children"
                                        status={errors?.status_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions?.statuses?.map((item, index) => (
                                            <Select.Option key={index} value={item.status_id}>
                                                {item.status_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Action Plan">
                                    <Select
                                        value={details.action_plan_id}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("action_plan_id", e)}
                                        loading={loading || !selectOptions?.actionPlans?.length}
                                        disabled={loading || !selectOptions?.actionPlans?.length}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {selectOptions?.actionPlans?.map((item, index) => (
                                            <Select.Option key={index} value={item.action_plan_id}>
                                                {item.action_plan_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Tags" error={errors.tags}>
                                    <div className="my-form-multiple-inline-input" style={{paddingTop: '0px'}}>
                                        {selectOptions?.tags?.map((item, index) => (
                                            <Checkbox
                                                key={index}
                                                checked={details.tags?.[item.key] === item.value}
                                                onChange={e => {
                                                    var newTags = {...details.tags};
                                                    if (e.target.checked) {
                                                        newTags[item.key] = item.value; 
                                                    } else {
                                                        delete newTags[item.key];
                                                    }
                                                    setDetailsKey("tags", newTags);
                                                }}
                                            >
                                                {item.value}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Priority" error={errors.priority_template_id} reqMark={true}>
                                    <Select
                                        value={details.priority_template_id}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("priority_template_id", e)}
                                        loading={loading || !selectOptions?.priorities?.length}
                                        disabled={loading || !selectOptions?.priorities?.length}
                                        // showSearch
                                        // optionFilterProp="children"
                                        status={errors?.priority_template_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions?.priorities?.map((item, index) => (
                                            <Select.Option key={index} value={item.priority_group_id}>
                                                {item.priority_group_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Severity" error={errors.severity_template_id} reqMark={true}>
                                    <Select
                                        value={details.severity_template_id}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("severity_template_id", e)}
                                        loading={loading || !selectOptions?.severities?.length}
                                        disabled={loading || !selectOptions?.severities?.length}
                                        // showSearch
                                        // optionFilterProp="children"
                                        status={errors?.severity_template_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions?.severities?.map((item, index) => (
                                            <Select.Option key={index} value={item.severity_group_id}>
                                                {item.severity_group_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Contact">
                                    <Select
                                        value={details.contact_info}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("contact_info", e)}
                                        loading={loading || !selectOptions.contactInfos.length}
                                        disabled={loading || !selectOptions.contactInfos.length}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {selectOptions?.contactInfos?.map((item, index) => (
                                            <Select.Option key={index} value={item.e_id}>
                                                {item.e_firstname} {item.e_lastname}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Generate Ticket">
                                    <Checkbox
                                        checked={details.generate_ticket}
                                        onChange={e => setDetailsKey("generate_ticket", e.target.checked)}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Auto Generate AP">
                                    <Checkbox
                                        checked={details.autogenerate_action_plan}
                                        onChange={e => setDetailsKey("autogenerate_action_plan", e.target.checked)}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Needs Action">
                                    <Checkbox
                                        checked={details.is_actionable}
                                        onChange={e => setDetailsKey("is_actionable", e.target.checked)}
                                    />
                                </InputWithLabel>
                            </div>
                            <div>
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
                            <div>
                                <TempFieldsComponent
                                    temp_field_1={details.temp_field_1}
                                    temp_field_2={details.temp_field_2}
                                    temp_field_3={details.temp_field_3}
                                        
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
