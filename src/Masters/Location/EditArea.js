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
import AssignActionPlans from "./AssignActionPlans";
import { validateArea } from "../../Components/Validations";

const { TabPane } = Tabs;


/*
    Edit and add Area
        if isAddNew is true => add new area

    state:
        details: {
            region_id: "",                  // The id in which this area lies

            area_id: "",

            area_name: "",
            area_code: "",
            description: "",
            comments: "",
            audit_remark: "",

            temp_field_1: "",
            temp_field_2: "",
            temp_field_3: "",


            action_plans: []
        }

*/

export default function EditArea({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/location",
}) {
    let areaId = parseInt(useParams().id);
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
        region_id: parseInt(searchParams.get('regionId')) || 0,

        area_id: 0,
        area_name: '',
        area_code: '',

        description: '',
        comments: '',
        audit_remark: '',

        temp_field_1: "",
        temp_field_2: "",
        temp_field_3: "",

        // action_plans: [],
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const [selectOptions, setSelectOptions] = useState({
        regions: [],
    });


    const getDetails = async () => {
        setLoading(true);
        await axios.get('/admin-api/area_by_area_id', {
            params: {
                area_id: areaId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,

                    region_id: data.region_id,

                    area_id: data.area_id,
                    area_name: data.area_name || '',
                    area_code: data.area_code || '',

                    description: data.description || '',
                    comments: data.comments || '',
                    audit_remark: data.audit_remark || '',

                    temp_field_1: data.temp_field_1 || '',
                    temp_field_2: data.temp_field_2 || '',
                    temp_field_3: data.temp_field_3 || '',

                    // action_plans: data.action_plans || [],
                }))
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting area details');
                navigate(homePath);
            })

        setLoading(false);
    }

    const getOptions = async () => {
        /*
            [
                {
                    region_id: "",
                    region_name: "",
                    region_code: "",
                    // And Other fields
                }
            ]
        
        */
        axios.get('/admin-api/all_regions_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        }).then(res => {
            const data = res.data.data;

            setSelectOptions(curr => ({
                ...curr,
                regions: data,
            }));

            if(isAddNew && data.length > 0 && !details.region_id) {
                setDetails(d => ({
                    ...d,
                    region_id: data[0].region_id,
                }));
            }
        }).catch(err => {
            console.log(err);
            message.error('Error getting regions');
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
        ({d, e, errorTab, errStatus, errorsIn} = validateArea(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_area', {
                ...details,
                o_id: selectedOrg.orgId,
            })
            .then(res => {
                message.success("Area added successfully");
                navigate(homePath);
            })
            .catch(err => {
                console.log(err);
                try {
                    if(typeof(err.response.data.detail) === 'string') {
                        message.error(err.response.data.detail);
                    }
                    else {
                        message.error("Error adding Area");
                    }
                } catch (error) {
                    message.error("Error adding Area");
                }
            });
        }
        else {
            await axios.put('/admin-api/modify_area', {
                ...details,
                o_id: selectedOrg.orgId,
            })
            .then(res => {
                message.success("Area updated successfully");
                navigate(homePath);
            })
            .catch(err => {
                console.log(err);
                try {
                    if(typeof(err.response.data.detail) === 'string') {
                        message.error(err.response.data.detail);
                    }
                    else {
                        message.error("Error updating Area");
                    }
                } catch (error) {
                    message.error("Error updating Area");
                }
            });
        }     

        setLoading(false);
    }

    // useEffect(() => {
    //     console.log(details);
    // } , [details]);

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Area 
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
                    <TabPane className="my-form-tabpane-outer" tab="Area Details" key="details">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Region" error={errors.region_id} reqMark={true}>
                                    <Select
                                        value={details.region_id}
                                        className="my-form-input"
                                        onChange={(value) => setDetailsKey('region_id', value)}
                                        loading={loading || selectOptions.regions.length == 0}
                                        disabled={!isAddNew || loading || selectOptions.regions.length == 0}
                                        showSearch={true}
                                        optionFilterProp="children"
                                        status={errors?.region_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions.regions.map(r => (
                                            <Select.Option key={r.region_id} value={r.region_id}>
                                                {r.region_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Area Name" error={errors.area_name} reqMark={true}>
                                    <Input
                                        value={details.area_name}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("area_name", e.target.value)}
                                        status={errors?.area_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Area Code" error={errors.area_code} reqMark={true}>
                                    <Input
                                        value={details.area_code}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("area_code", e.target.value)}
                                        status={errors?.area_code?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                            <div>
                                <AssignActionPlans
                                    selectedOrg={selectedOrg}
                                    loading={loading}

                                    action_plans={details.action_plans}
                                    setActionPlans={(newActionPlans) => setDetailsKey("action_plans", newActionPlans)}
                                />
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
