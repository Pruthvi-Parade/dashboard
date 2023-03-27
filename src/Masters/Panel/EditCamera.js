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
import { validateCamera } from "../../Components/Validations";

const { TabPane } = Tabs;

// For documentation, refer the state (details)
export default function EditCamera({
    selectedOrg,
    panelId,
    cameraId,
    isAddNew,
    permissions={},

    panelDetails={},

    closeEdit=() => {alert("onClose not defined")},
}) {
    const [loading, setLoading] = useState(true);

    // Here will be the default state of the form (For add new)
    // For documentation, refer this state (details)
    const [details, setDetails] = useState({
        camera_id: cameraId,
        camera_name: "",
        channel_number: 0,

        description: "",
        comments: "",
        audit_remark: "",

        rtsp_link: "",
        image_capture: true,
        capture_interval: 15,
        camera_type_id: 0,

        // From panelDetails
        camera_username: panelDetails.camera_username,         
        camera_password: panelDetails.camera_password,
        ip_address: panelDetails.ip_address,
        http_port: panelDetails.port,
        camera_port: panelDetails.camera_port,

        panel_id: panelId,
        panel_code: panelDetails.panel_code,
        p_cam_info_id: panelDetails.p_cam_info_id,
        o_id: selectedOrg.orgId,
        site_id: panelDetails.site_id,

    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const [selectOptions, setSelectOptions] = useState({
        camera_types: [],
    });

    const getDetails = async () => {
        setLoading(true);
        await axios.get('/admin-api/camera_by_camera_id', {
            params: {
                o_id: selectedOrg.orgId,
                panel_id: panelId,
                camera_id: cameraId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,
                    ...data,

                    camera_name: data.camera_name || "",
                    channel_number: data.channel_number || 0,

                    description: data.description || "",
                    comments: data.comments || "",
                    audit_remark: data.audit_remark || "",
                    
                    rtsp_link: data.rtsp_link || "",
                    image_capture: data.image_capture || true,
                    capture_interval: data.capture_interval || 0,
                    camera_type_id: data.camera_type_id || 0,

                    // From panelDetails
                    camera_username: data.camera_username || panelDetails.camera_username,
                    camera_password: data.camera_password || panelDetails.camera_password,
                    ip_address: data.ip_address || panelDetails.ip_address,
                    http_port: data.http_port || panelDetails.port,
                    camera_port: data.camera_port || panelDetails.camera_port,

                    panel_id: data.panel_id || panelId,
                    panel_code: data.panel_code || panelDetails.panel_code,
                    p_cam_info_id: data.p_cam_info_id || panelDetails.p_cam_info_id,
                    o_id: data.o_id || selectedOrg.orgId,
                    site_id: data.site_id || panelDetails.site_id,
                }));
            })
            .catch(err => {
                console.log(err);
                message.error('Error in fetching camera details');
                closeEdit();
            })
        setLoading(false);
    }

    const getSelectOptions = async () => {
        /*
            [
                {
                    "m_camera_type_name": "CP Plus",
                    "description": null,
                    "is_deleted": 0,
                    "m_camera_type_id": 1
                },
            ]
        */
        await axios.get('/admin-api/all_camera_types')
            .then(res => {
                const data = res.data.data;

                setSelectOptions(prev => ({
                    ...prev,
                    camera_types: data,
                }));
            })
            .catch(err => {
                message.error('Error in fetching camera types');
            })
    }

    useEffect(() => {
        if (isAddNew) {
            setLoading(false);
        }
        else {
            if(cameraId) {
                getDetails();
            }
        }
    }, [cameraId]);

    useEffect(() => {
        getSelectOptions();
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
        ({d, e, errorTab, errStatus, errorsIn} = validateCamera(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            // setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_camera', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Camera added successfully');
                    // navigate(homePath);
                    closeEdit();
                }).catch(err => {
                    console.log(err);
                    message.error('Error while adding Camera');
                })
        }
        else {
            await axios.put('/admin-api/modify_camera', {
                ...details,
                o_id: selectedOrg.orgId,
                camera_id: cameraId,
            })
                .then(res => {
                    message.success('Camera modified successfully');
                    // navigate(homePath);
                    closeEdit();
                })
                .catch(err => {
                    console.log(err);
                    message.error('Error while modifying Camera');
                })
        }
        setLoading(false);
    }


    return (
        <div className='my-form-outer' key={cameraId}>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Camera 
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
                            {/* camera_username: panelDetails.camera_username,         
        camera_password: panelDetails.camera_password,
        ip_address: panelDetails.ip_address,
        http_port: panelDetails.port,
        camera_port: panelDetails.camera_port, */}

                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Camera UserName">
                                    {panelDetails.camera_username || "-"}
                                </InputWithLabel>
                                <InputWithLabel label="Camera Password" divStyle={{marginLeft: '10px'}}>
                                    {panelDetails.camera_password || "-"}
                                </InputWithLabel>
                                <InputWithLabel label="IP Address" divStyle={{marginLeft: '10px'}}>
                                    {panelDetails.ip_address || "-"}
                                </InputWithLabel>
                                <InputWithLabel label="HTTP Port" divStyle={{marginLeft: '10px'}}>
                                    {panelDetails.port || "-"}
                                </InputWithLabel>
                                <InputWithLabel label="Camera Port" divStyle={{marginLeft: '10px'}}>
                                    {panelDetails.camera_port || "-"}
                                </InputWithLabel>
                            </div>

                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Camera Type" error={errors.camera_type_id} reqMark={true}>
                                    <Select
                                        value={details.camera_type_id}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey('camera_type_id', e)}
                                        loading={loading || selectOptions.camera_types?.length === 0}
                                        disabled={loading || selectOptions.camera_types?.length === 0}
                                        showSearch
                                        optionFilterProp="children"
                                        status={errors?.camera_type_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions.camera_types?.map((item, index) => (
                                            <Select.Option key={index} value={item.m_camera_type_id}>
                                                {item.m_camera_type_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Camera Name" error={errors.camera_name} reqMark={true}>
                                    <Input
                                        value={details.camera_name}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey('camera_name', e.target.value)}
                                        status={errors?.camera_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Channel Number" error={errors.channel_number} reqMark={true}>
                                    <Input
                                        value={details.channel_number}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey('channel_number', e.target.value)}
                                        type="number"
                                        status={errors?.channel_number?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Image Capture">
                                    <Checkbox
                                        checked={details.image_capture}
                                        onChange={e => setDetailsKey("image_capture", e.target.checked)}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Capture Interval" error={errors.capture_interval} reqMark={true}>
                                    <Input
                                        value={details.capture_interval}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey('capture_interval', e.target.value)}
                                        type="number"
                                        disabled={!details.image_capture}
                                        status={errors?.capture_interval?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Rtsp Link">
                                    <Input
                                        value={details.rtsp_link}
                                        className="my-form-input"
                                        style={{minWidth: '310px'}}
                                        onChange={e => setDetailsKey('rtsp_link', e.target.value)}
                                    />
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
