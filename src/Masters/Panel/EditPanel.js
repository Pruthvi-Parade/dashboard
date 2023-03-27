import React, { useState } from "react";
import { Button, message, Tabs, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { MdOutlineEditOff } from "react-icons/md";
import CommonPanelDetails from "./Components/CommonPanelDetails";
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import TempFieldsComponent from "../GeneralComponents/TempFieldsComponent";
import { validatePanel } from "../../Components/Validations";
import moment from "moment";
import ReaderEditTab from "./Components/ReaderEditTab";
const { TabPane } = Tabs;


/*
    Edit and add Panel
        if isAddNew is true then post else put

    {
  "data": {
    "panel_id": 3,
    "panel_name": "p003",
    "panel_number": "10003",
    "panel_code": "PAN003",
    "panel_type_id": 2,
    "panel_type_group_code": "M001",
    "panel_multi_device_support": "1",
    "panel_hw_unique_code": null,
    "ip_address": null,
    "local_ip_address": null,
    "port": null,
    "is_deleted": 0,
    "created_time": "2022-12-07T14:06:45",
    "updated_time": "2022-12-07T14:06:48",
    "created_by": 1,
    "updated_by": 1,
    "o_id": 3,
    "site_id": 8,
    "sz_id": 3,
    "extra_info": null,
    "mac_address": null,
    "contact_number": "7845512556",
    "serial_number": null,
    "area_id": 10,
    "region_id": 17,
    "heartbeat_duration": null,
    "status_id": 1,
    "is_active": 1,
    "last_maintenance_date": "2022-12-07T14:08:13",
    "installation_date": null,
    "comments": null,
    "description": null,
    "temp_field_1": null,
    "temp_field_2": null,
    "temp_field_3": null,
    "site_name": "Nagarbhavi",
    "area_name": "Bangalore",
    "region_name": "Karnataka"
  }
}


        TODO: CHECK EVERYTHING
*/

export default function EditPanel({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/panel",
}) {
    let panelId = parseInt(useParams().id);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'panel');
    const changeActiveTab = (key) => {
        setActiveTab(key);
        searchParams.set('tab', key);
        setSearchParams(searchParams, {replace: true});
    }


    // Here will be the default state of the form (For add new)
    // For documentation, see the comment above function
    const [details, setDetails] = useState({
        panel_id: 0,
        panel_code: "",
        panel_number: "",
        panel_name: "",

        panel_type_id: 0,                                     // TODO: REMEBER TO ADD DEFAULT SELECTED
        panel_type_group_code: "",
        panel_multi_device_support: 0,
        panel_hw_unique_code: "",

        ip_address: "",
        local_ip_address: "",
        port: 0,

        o_id: selectedOrg.orgId,

        is_deleted: 0,                                        // TODO: REMEMBER TO CHECK WHETER IT'S 1/0
        created_time: "2022-1-01T13:17:56.089Z",
        updated_time: "2022-12-01T13:17:56.089Z",
        created_by: 0,
        updated_by: 0, 
        site_id: 0,
        sz_id: 0,
        mac_address:"",
        area_id: 0,
        region_id: 0,
        heart_beat_duration: 60,
        last_maintenance_date: null,
        installation_date: null,
        is_active: 1,
        status_id: 9,


        comments: "",
        description: "",
        audit_remark: "",
        
        temp_field_1: "",
        temp_field_2: "",
        temp_field_3: "",


        site_name: "",
        area_name: "",
        region_name: "",

        // // ------------------ //
        // // Only for add new panel                    WHAT IS THIS COPY DATA 
        // copy_data_flag: true,
        // copy_data: {
        //     zones: [],
        //     panel_id: null,
        // }
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});


    const getDetails = async () => {
        setLoading(true);
        await axios.get(`/admin-api/panel_by_panel_id`, {
            params: {
                panel_id: panelId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,
                    ...data,


                    panel_id: data.panel_id || panelId,
                    panel_name: data.panel_name || "",
                    panel_number: data.panel_number || "",
                    panel_code: data.panel_code || "",
                    panel_type_id: data.panel_type_id || 0,                                     // TODO: REMEBER TO ADD DEFAULT SELECTED
                    panel_type_group_code: data.panel_type_group_code || "",
                    panel_multi_device_support: data.panel_multi_device_support || 0,
                    panel_hw_unique_code: data.panel_hw_unique_code || "",
                    ip_address: data.ip_address || "",
                    local_ip_address: data.local_ip_address || "",
                    port: data.port || 0,
                    is_deleted: data.is_deleted || 0,                                        // TODO: REMEMBER TO CHECK WHETER IT'S 1/0
                    created_time: data.created_time || "",
                    updated_time: data.updated_time || "",
                    created_by: data.created_by || 0,
                    updated_by: data.updated_by || 0, 
                    o_id: selectedOrg.orgId,
                    site_id: data.site_id || 0,
                    sz_id: data.sz_id || 0,
                    mac_address: data.mac_address || "",
                    area_id: data.area_id || 0,
                    region_id: data.region_id || 0,
                    heart_beat_duration: data.heart_beat_duration || 60,
                    status_id: data.status_id || 9,
                    last_maintenance_date: data.last_maintenance_date ? moment(data.last_maintenance_date): null,
                    installation_date: data.installation_date ? moment(data.installation_date) : null,

                    comments: data.comments || "",
                    description: data.description || "",
                    audit_remark: data.audit_remark || "",
                    
                    temp_field_1: data.temp_field_1 || "",
                    temp_field_2: data.temp_field_2 || "",
                    temp_field_3: data.temp_field_3 || "",

                    site_name: data.site_name || "",
                    area_name: data.area_name || "",
                    region_name: data.region_name || "",
                }));

                console.log("Done Setting Data!", details)
            }).catch(err => {
                console.log(err);
                message.error("Something went wrong");
                navigate(homePath);
            })

        setLoading(false);
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        // getOptions();
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
    
        console.log("Done Setting Details!", details)
    }


    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validatePanel(details, errors, isAddNew));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }
        
        console.log(details.panel_type_id);
        if(isAddNew) {
            await axios.post('/admin-api/add_panel', {
                ...details,
                // o_id: selectedOrg.orgId,

                // last_maintenance_date: details.last_maintenance_date ? details.last_maintenance_date.format() : undefined,
                // installation_date: details.installation_date ? details.installation_date.format() : undefined,
                
                // copy_data: details.copy_data_flag ? details.copy_data : undefined,
            })
                .then(res => {
                    message.success('Panel added successfully');
                    navigate(homePath);
                }).catch(err => {
                    console.log(err);
                    try {
                        if(typeof(err.response.data.detail) === 'string') {
                            message.error(err.response.data.detail);
                        }
                        else {
                            message.error('Error while adding Panel');
                        }
                    } catch (error) {
                        message.error('Error while adding Panel');
                    }
                })
        }
        else {
            await axios.put('/admin-api/modify_panel', {
                ...details,
                o_id: selectedOrg.orgId,

                last_maintenance_date: details.last_maintenance_date ? details.last_maintenance_date.format() : undefined,
                installation_date: details.installation_date ? details.installation_date.format() : undefined,
                // copy_data: undefined,       
                // Removing this cause of pydantic validation
            })
                .then(res => {
                    message.success('Panel modified successfully');
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    try {
                        if(typeof(err.response.data.detail) === 'string') {
                            message.error(err.response.data.detail);
                        }
                        else {
                            message.error('Error while modifying Panel');
                        }
                    } catch (error) {
                        message.error('Error while modifying Panel');
                    }
                })
        }
        setLoading(false);
    }

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Panel 
                </span>
            </div>
            <div>
                <Tabs
                    tabBarExtraContent={
                        <div>
                            <Button type='danger' onClick={() => navigate(homePath)} loading={loading}>
                                Cancel
                            </Button>
                            <Button style={{marginLeft: '5px'}} type="primary" onClick={handleSubmit} loading={loading} disabled={!permissions.edit || !(activeTab === "panel" || activeTab === "copy_data")}>
                                {isAddNew ? "Add" : "Save"}
                            </Button>
                        </div>
                    }
                    activeKey={activeTab}
                    onChange={changeActiveTab}
                >
                    <TabPane className="my-form-tabpane-outer" tab="Panel Details" key="panel">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div>
                                <CommonPanelDetails
                                    details={details}
                                    setDetails={setDetails}
                                    setDetailsKey={setDetailsKey}

                                    errors={errors}

                                    isAddNew={isAddNew}
                                    selectedOrg={selectedOrg}
                                />
                                
                                <RemarkComponent
                                    description={details.description}
                                    comments={details.comments}
                                    audit_remark={details.audit_remark}

                                    auditRemarkError={errors.audit_remark}
                                    descriptionError={errors.description}
                                    commentsError={errors.comments}

                                    setDetailsKey={setDetailsKey}
                                />
                                <TempFieldsComponent
                                    temp_field_1={details.temp_field_1}
                                    temp_field_2={details.temp_field_2}
                                    temp_field_3={details.temp_field_3}

                                    setDetailsKey={setDetailsKey}
                                />
                            </div>
                        </Spin>
                    </TabPane>
                    {
                      !isAddNew && !loading && (
                        <TabPane className="my-form-tabpane-outer" tab="Reader" key="reader" disabled={isAddNew}>
                          <Spin
                            spinning={loading || !permissions.edit}
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>}
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                          >
                            <div className="site-drawer-render-in-current-wrapper">
                              
                              <ReaderEditTab
                                panelId={panelId}
                                selectedOrg={selectedOrg}
                                permissions={permissions}
                                
                                panelDetails={details}
                              />
                            </div>
                          </Spin>
                        </TabPane>
                      )
                    }
                </Tabs>
            </div>
        </div>
    )
}
