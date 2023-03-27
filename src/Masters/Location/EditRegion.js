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
// import AssignActionPlans from "./AssignActionPlans";
import { validateRegion } from "../../Components/Validations";

const { TabPane } = Tabs;


/*
    Edit and add Region
        if isAddNew is true => add new region

    state:
        details: {
            region_id: "",

            region_name: "",
            region_code: "",
            description: "",
            comments: "",
            audit_remark: "",

            temp_field_1: "",
            temp_field_2: "",
            temp_field_3: "",

            action_plans: []
        }

*/

export default function EditRegion({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/location",
}) {
    let regionId = parseInt(useParams().id);
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
        region_id: 0,
        region_name: '',
        region_code: '',

        description: '',
        comments: '',
        audit_remark: '',

        temp_field_1: '',
        temp_field_2: '',
        temp_field_3: '',

        // action_plans: [],
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const getDetails = async () => {
        setLoading(true);
        await axios.get('/admin-api/region_by_region_id', {
            params: {
                region_id: regionId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,

                    region_id: regionId,
                    region_name: data.region_name || '',
                    region_code: data.region_code || '',
                    description: data.description || '',
                    comments: data.comments || '',
                    audit_remarks: data.audit_remarks || '',

                    temp_field_1: data.temp_field_1 || '',
                    temp_field_2: data.temp_field_2 || '',
                    temp_field_3: data.temp_field_3 || '',

                    // action_plans: data.action_plans || [],
                }))
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting region');
                navigate(homePath);

            })
        setLoading(false);
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
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
        ({d, e, errorTab, errStatus, errorsIn} = validateRegion(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_region', {
                ...details,
                o_id: selectedOrg.orgId,
            })
            .then(res => {
                message.success("Region added successfully");
                navigate(homePath);
            })
            .catch(err => {
                console.log(err);
                try {
                    if(typeof(err.response.data.detail) === 'string') {
                        message.error(err.response.data.detail);
                    }
                    else {
                        message.error("Error adding Region");
                    }
                } catch (error) {
                    message.error("Error adding Region");
                }
            });
        }
        else {
            await axios.put('/admin-api/modify_region', {
                ...details,
                o_id: selectedOrg.orgId,
            })
            .then(res => {
                message.success("Region updated successfully");
                navigate(homePath);
            })
            .catch(err => {
                console.log(err);
                try {
                    if(typeof(err.response.data.detail) === 'string') {
                        message.error(err.response.data.detail);
                    }
                    else {
                        message.error("Error updating Region");
                    }
                } catch (error) {
                    message.error("Error updating Region");
                }
            });
        }     
        setLoading(false);
    }

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Region 
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
                    <TabPane className="my-form-tabpane-outer" tab="Region Details" key="details">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Region Name" error={errors.region_name} reqMark={true}>
                                    <Input
                                        value={details.region_name}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("region_name", e.target.value)}
                                        status={errors?.region_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Region Code" error={errors.region_code} reqMark={true}>
                                    <Input
                                        value={details.region_code}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("region_code", e.target.value)}
                                        status={errors?.region_code?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                            {/* <div>
                                <AssignActionPlans
                                    selectedOrg={selectedOrg}
                                    loading={loading}

                                    action_plans={details.action_plans}
                                    setActionPlans={(newActionPlans) => setDetailsKey("action_plans", newActionPlans)}
                                />
                            </div> */}
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
