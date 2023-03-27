import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../Components/Components';
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import { validateSeverityGroup } from "../../Components/Validations";

const { TabPane } = Tabs;


/*
    Edit and add Severity
        if isAddNew is true => add new Severity

    state:
        details: {
            severity_group_id: "",                  // The id in which this area lies
            severity_group_name: "",
            severity_group_type: 0,

            m_severity_id: "",                     // The id of the severity

            description: "",
            comments: "",
            audit_remark: "",
        }

*/

export default function EditSeverity({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/severity",
}) {
    let severityGroupId = parseInt(useParams().id);
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
        severity_group_id: 0,
        severity_group_name: "",
        severity_group_type: 0,

        m_severity_id: 0,

        description: "",
        comments: "",
        audit_remark: "",
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const [selectOptions, setSelectOptions] = useState({
        severityTypes: [],
        masterSeverities: [],
    });

    const getDetails = async () => {
        setLoading(true);
        await axios.get('/admin-api/severity_by_severity_group_id', {
            params: {
                severity_group_id: severityGroupId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,

                    severity_group_id: data.severity_group_id,
                    severity_group_name: data.severity_group_name || "",
                    severity_group_type: data.severity_group_type || 0,

                    m_severity_id: data.m_severity_id || 1,

                    description: data.description || "",
                    comments: data.comments || "",
                    audit_remark: data.audit_remark || "",
                }));
            })
            .catch(err => {
                console.log(err);
                message.error('Error while fetching severity');
                navigate(homePath);
            })


        setLoading(false);
    }

    const getOptions = async () => {
        /*
            [
                {
                    "severity_type": 1,
                    "severity_name": "High",
                }
                {...}
            ]
        */
        axios.get('admin-api/all_severity_types')
            .then(res => {
                const data = res.data.data;

                setSelectOptions(curr => ({
                    ...curr,
                    severityTypes: data,
                }));

                if(isAddNew && data.length > 0 && !details.severity_group_type) {
                    setDetails(d => ({
                        ...d,
                        severity_group_type: data[0].severity_type,
                    }));
                }
            })
            .catch(err => {
                console.log(err);
                message.error('Error while fetching severity types');
            })


        /*
            {
                "m_severity_name": "Severity 1",
                "m_severity_type": 1,
                "is_deleted": 0,
                "description": null,
                "m_severity_id": 1
            },
        */
        axios.get('admin-api/all_master_severity')
            .then(res => {
                const data = res.data.data;

                setSelectOptions(curr => ({
                    ...curr,
                    masterSeverities: data,
                }));

                if(isAddNew && data.length > 0 && !details.m_severity_id) {
                    setDetails(d => ({
                        ...d,
                        m_severity_id: data[0].m_severity_id,
                    }));
                }

            })
            .catch(err => {
                console.log(err);
                message.error('Error while fetching master severities');
            })
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        getOptions();
        if(isAddNew) {
            setLoading(false);
        } 
        else {
            getDetails();
        }
    }, []);


    const setDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }

    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateSeverityGroup(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_severity_group', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Severity added successfully');
                    navigate(homePath);
                }).catch(err => {
                    console.log(err);
                    message.error('Error while adding severity');
                })
        }
        else {
            await axios.put('/admin-api/modify_severity_group', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Severity modified successfully');
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    message.error('Error while modifying severity');
                })
        }
        setLoading(false);
    }



    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Severity Group 
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
                    <TabPane className="my-form-tabpane-outer" tab="Severity Details" key="details">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Severity Group Name" error={errors.severity_group_name} reqMark={true}>
                                    <Input
                                        value={details.severity_group_name}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("severity_group_name", e.target.value)}
                                        status={errors?.severity_group_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Severity" error={errors.severity_group_type} reqMark={true}>
                                    <Select
                                        value={details.severity_group_type}
                                        className="my-form-input"
                                        onChange={(value) => setDetailsKey('severity_group_type', value)}
                                        loading={loading || selectOptions.severityTypes.length == 0}
                                        disabled={loading || selectOptions.severityTypes.length == 0}
                                        status={errors?.severity_group_type?.errors?.[0]?.msg && "error"}
                                        // showSearch={true}
                                        // optionFilterProp="children"
                                    >
                                        {selectOptions.severityTypes.map(type => (
                                            <Select.Option key={type.severity_type} value={type.severity_type}>
                                                {type.severity_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Master Severity" error={errors.m_severity_id} reqMark={true}>
                                    <Select
                                        value={details.m_severity_id}
                                        className="my-form-input"
                                        onChange={(value) => setDetailsKey('m_severity_id', value)}
                                        loading={loading || selectOptions.masterSeverities.length == 0}
                                        disabled={loading || selectOptions.masterSeverities.length == 0}
                                        // showSearch={true}
                                        // optionFilterProp="children"
                                        status={errors?.m_severity_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions.masterSeverities.map(type => (
                                            <Select.Option key={type.m_severity_id} value={type.m_severity_id}>
                                                {type.m_severity_name}
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
