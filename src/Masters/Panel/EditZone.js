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
import EventsByZoneId from "./EventsByZoneId";
import { validateZone } from "../../Components/Validations";

const { TabPane } = Tabs;


/*
    Edit and add Panel
        if isAddNew is true then post else put

    state:
        details:{
            "action_plan_id": null,
            "last_occurred_time": null,
            "zone_group_id": null,
            "comments": null,
            "is_active": 1,
            "mode": 54,
            "panel_id": 5,
            "o_id": 9,
            "status_id": 9,
            "is_deleted": 0,
            "group_id": 231,
            "site_id": 5,
            "serial_number": "SYS001",
            "created_by": 14,
            "area_id": 5,
            "physical_status_id": 26,
            "created_time": "2017-06-16T11:18:45",
            "region_id": 3,
            "physical_number": 0,
            "updated_by": 14,
            "zone_id": 1623,
            "zone_template_id": null,
            "last_event_occurred_time": "2022-06-06T14:04:56",
            "zone_name": "System Event",
            "updated_time": "2017-07-11T18:05:54",
            "description": null,

            temp_field_1: null,
            temp_field_2: null,
            temp_field_3: null,
        }
*/

export default function EditZone({
    selectedOrg,
    panelId,
    zoneId,
    isAddNew,
    permissions={},

    panelDetails={},

    isActuallyVisible,                        // Check ZoneEventEditTab.js documentation for use of this field
    closeEdit=() => {alert("onClose not defined")},
}) {
    const [loading, setLoading] = useState(true);

    // Here will be the default state of the form (For add new)
    // For documentation, see the comment above function 
    const [details, setDetails] = useState({
        zone_id: zoneId,
        zone_name: "",

        comments: "",
        description: "",
        audit_remark: "",

        action_plan_id: 0,
        zone_group_id: 0,                 // NOT in use
        status_id: 9,
        mode: 20,
        physical_status_id: 26,

        group_id: 231,                  // TODO: Check this

        is_active: 0,

        panel_id: panelId,
        o_id: selectedOrg.orgId,
        site_id: panelDetails?.site_id,
        area_id: panelDetails?.area_id,
        region_id: panelDetails?.region_id,

        serial_number: "",
        physical_number: 0,

        temp_field_1: "",
        temp_field_2: "",
        temp_field_3: "",

        is_active: 1,

        zone_events: [],
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const [selectOptions, setSelectOptions] = useState({
        zoneGroups: [],
        modes: [],
        statuses: [],
        physicalStatuses: [],
    });


    const getDetails = async () => {
        setLoading(true);
        await axios.get(`/admin-api/zone_by_zone_id`, {
            params: {
                zone_id: zoneId,
                o_id: selectedOrg.orgId,
                panel_id: panelId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,
                    ...data,

                    zone_id: zoneId,
                    zone_name: data.zone_name || "",

                    comments: data.comments || "",
                    description: data.description || "",
                    audit_remark: data.audit_remark || "",

                    action_plan_id: data.action_plan_id || 0,
                    zone_group_id: data.zone_group_id || 0,                 // NOT in use
                    status_id: data.status_id || 9,
                    mode: data.mode || 20,
                    physical_status_id: data.physical_status_id || 26,

                    group_id: data.group_id || 231,                  // TODO: Check this

                    is_active: data.is_active || 0,

                    panel_id: data.panel_id || panelId,
                    o_id: data.o_id || selectedOrg.orgId,
                    site_id: data.site_id || panelDetails?.site_id,
                    area_id: data.area_id || panelDetails?.area_id,
                    region_id: data.region_id || panelDetails?.region_id,

                    serial_number: data.serial_number || "",
                    physical_number: data.physical_number || 0,

                    temp_field_1: data.temp_field_1 || "",
                    temp_field_2: data.temp_field_2 || "",
                    temp_field_3: data.temp_field_3 || "",

                    zone_events: data.zone_events || [],
                }));
            })
            .catch(err => { 
                console.log(err);
                message.error("Error while fetching zone details");
                closeEdit();
            })
        setLoading(false);
    }

    const getSelectOptions = async () => {
        /*
            [
                {
                    "zone_group_id": 626,
                    "zone_group_name": "ACKKeyPress",
                    "priority_group_id": 15,
                    "priority_group_name": "Priority 3",
                    "severity_group_id": 15,
                    "severity_group_name": "Severity 3",
                    "description": null,
                    "comments": null
                },
            ]
        */
        axios.get('/admin-api/all_zone_group_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                setSelectOptions(prev => ({
                    ...prev,
                    zoneGroups: [{zone_group_id: 0, zone_group_name: "None"}, ...data],
                }));
            })
            .catch(err => {
                message.error(err.message);
            })
    
        
        /*
            [
                {
                    "status_type_id": 14,
                    "description": null,
                    "status_name": "Production",
                    "is_deleted": 0,
                    "status_id": 54
                },
            ]
        */
        axios.get('/admin-api/all_status_by_status_type_id', {
            params: {
                status_type_id: 7,
            }
        })
            .then(res => {
                const data = res.data.data;
                setSelectOptions(prev => ({
                    ...prev,
                    modes: data,
                }));
                if(isAddNew && data.length > 0 && !details.mode) {
                    setDetailsKey("mode", data[0].status_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error("Error in fetching modes");
            })

        /*
            [
                {
                    "status_id": 9,
                    "status_type_id": 3,
                    "is_deleted": 0,
                    "status_name": "Enabled",
                    "description": null
                },
            ]
        */
        axios.get('/admin-api/all_status_by_status_type_id', {
            params: {
                status_type_id: 3,
            }
        })
            .then(res => {
                const data = res.data.data;
                setSelectOptions(prev => ({
                    ...prev,
                    statuses: data,
                }));
                // console.log(data);
                if(isAddNew && data.length > 0 && !details.status_id) {
                    setDetailsKey("status_id", data[0].status_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error("Error in fetching statuses");
            })

        /*
            [
                {
                    "status_id": 26,
                    "status_type_id": 8,
                    "is_deleted": 0,
                    "status_name": "Armed",
                    "description": null
                },
            ]
        */
        axios.get('/admin-api/all_status_by_status_type_id', {
            params: {
                status_type_id: 8,
            }
        })
            .then(res => {
                const data = res.data.data;
                setSelectOptions(prev => ({
                    ...prev,
                    physicalStatuses: data,
                }));
                // console.log(data);
                if(isAddNew && data.length > 0 && !details.physical_status_id) {
                    setDetailsKey("physical_status_id", data[0].status_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error("Error in fetching physical statuses");
            })
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        if(isAddNew) {
            setLoading(false);
        } 
        else {
            if(zoneId && isActuallyVisible) {
                getDetails();
            }
        }
    }, [zoneId, isActuallyVisible]);

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
        ({d, e, errorTab, errStatus, errorsIn} = validateZone(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            // setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_zone', {
                ...details,
                o_id: selectedOrg.orgId,
                is_active: 1,
            })
                .then(res => {
                    message.success('Zone added successfully');
                    // navigate(homePath);
                    closeEdit();
                }).catch(err => {
                    console.log(err);
                    message.error('Error while adding Zone');
                })
        }
        else {
            await axios.put('/admin-api/modify_zone', {
                ...details,
                o_id: selectedOrg.orgId,
                is_active: 1,
            })
                .then(res => {
                    message.success('Zone modified successfully');
                    // navigate(homePath);
                    closeEdit();
                })
                .catch(err => {
                    console.log(err);
                    message.error('Error while modifying Zone');
                })
        }
        setLoading(false);
    }
    

    return (
        <div className='my-form-outer' key={zoneId}>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Zone 
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
                                <InputWithLabel label="Panel Name">
                                    {panelDetails.panel_name}
                                </InputWithLabel>
                                <InputWithLabel label="Panel Code" divStyle={{marginLeft: '10px'}}>
                                    {panelDetails.panel_code}
                                </InputWithLabel>
                                <InputWithLabel label="Location" divStyle={{marginLeft: '10px'}}>
                                    {panelDetails.region_name} / {panelDetails.area_name} / {panelDetails.site_name}
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Zone Name" error={errors.zone_name} reqMark={true}>
                                    <Input
                                        value={details.zone_name}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("zone_name", e.target.value)}
                                        status={errors?.zone_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Zone Code (Serial No.)" error={errors.serial_number} reqMark={true}>
                                    <Input
                                        value={details.serial_number}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("serial_number", e.target.value)}
                                        status={errors?.serial_number?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Zone Group">
                                    <Select
                                        value={details.zone_group_id}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("zone_group_id", e)}
                                        loading={loading || selectOptions?.zoneGroups?.length === 0}
                                        disabled={loading || selectOptions?.zoneGroups?.length === 0}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {selectOptions?.zoneGroups?.map((zoneGroup, index) => (
                                            <Select.Option key={index} value={zoneGroup.zone_group_id}>
                                                {zoneGroup.zone_group_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input"> 
                                <InputWithLabel label="Mode" error={errors.mode} reqMark={true}>
                                    <Select
                                        value={details.mode}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("mode", e)}
                                        loading={loading || selectOptions?.modes?.length === 0}
                                        disabled={loading || selectOptions?.modes?.length === 0}
                                        // showSearch
                                        // optionFilterProp="children"
                                        status={errors?.mode?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions?.modes?.map((mode, index) => (
                                            <Select.Option key={index} value={mode.status_id}>
                                                {mode.status_name}
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
                                        {selectOptions?.statuses?.map((status, index) => (
                                            <Select.Option key={index} value={status.status_id}>
                                                {status.status_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Physical Status" error={errors.physical_status_id} reqMark={true}>
                                    <Select
                                        value={details.physical_status_id}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("physical_status_id", e)}
                                        loading={loading || selectOptions?.physicalStatuses?.length === 0}
                                        disabled={loading || selectOptions?.physicalStatuses?.length === 0}
                                        // showSearch
                                        // optionFilterProp="children"
                                        status={errors?.physical_status_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions?.physicalStatuses?.map((status, index) => (
                                            <Select.Option key={index} value={status.status_id}>
                                                {status.status_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Physical Number">
                                    <Input
                                        value={details.physical_number}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("physical_number", e.target.value)}
                                        type="number"
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
                            {
                                !isAddNew && (
                                    <div style={{marginTop: '30px'}}>
                                        <InputWithLabel label="Zone Events" divStyle={{width: '100%'}}>
                                            <EventsByZoneId
                                                key={details.zone_id}
                                                editPanelPath={window.location.pathname}
                                                loading={loading}
                                                zoneEvents={details.zone_events}
                                                zoneName={details.zone_name}

                                                panelId={panelId}
                                                zoneId={zoneId}
                                                selectedOrg={selectedOrg}
                                                permissions={permissions}

                                                showActions={true}

                                                divStyle={{width: '100%'}}
                                            />
                                        </InputWithLabel>
                                    </div>
                                )
                            }
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}
