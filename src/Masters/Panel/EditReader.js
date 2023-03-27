import React, {useState, useEffect} from "react"
import { Button, Input, message, Tabs, Spin, Checkbox, Select } from "antd"
import axios from 'axios';
import { MdOutlineEditOff } from "react-icons/md";
import { InputWithLabel } from '../../Components/Components';
import { validateReader } from "../../Components/Validations";
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import TempFieldsComponent from "../GeneralComponents/TempFieldsComponent";

const { TabPane } = Tabs;

// Response from /admin-api/reader_by_reader_id
// {
//     "data": {
//       "reader_id": 3,
//       "reader_code": "R002",
//       "reader_no": 5678,
//       "application_id": 2,
//       "reader_name": "POS Reader",
//       "sz_id": 18,
//       "site_id": 10,
//       "panel_id": 3,
//       "created_time": "2022-12-08T11:35:09",
//       "updated_time": "2022-12-08T11:35:13",
//       "last_scanned": "2022-12-08T11:35:15",
//       "gps_location_details": null,
//       "is_active": 1,
//       "is_deleted": 0,
//       "o_id": 3
//     }
//   }


export default function EditReader({
    selectedOrg,
    panelId,
    readerId,
    isAddNew,
    permissions={},

    panelDetails={},

    isActuallyVisible,                        
    closeEdit=() => {alert("onClose not defined")},
}) {
    const [loading, setLoading] = useState(true);

    // Here will be the default state of the form (For add new)
    // For documentation, see the comment above function 
    const [details, setDetails] = useState({
        // Current Recieved Details
              reader_id: readerId,
              reader_code: "",
              reader_no: 0,
              application_id: 0,
              reader_name: "",
              sz_id: panelDetails.sz_id,
              site_id: panelDetails.site_id,
              panel_id: panelId,
              created_time: "2022-12-08T11:35:09",
              updated_time: "2022-12-08T11:35:13",
              last_scanned: "2022-12-08T11:35:15",
              gps_location_details: null,
              is_active: 1,
              is_deleted: 0,
              o_id: selectedOrg.orgId
    });
    console.log(details);

    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});
    const [selectOptions, setSelectOptions] = useState({
        applicationTypes: [],
    });

    const getDetails = async () => {
        setLoading(true);
        await axios.get(`/admin-api/reader_by_reader_id`, {
            params: {
                reader_id: parseInt(readerId),
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,
                    ...data,

                    reader_id: data.reader_id || "",
                    reader_code: data.reader_code || "",
                    reader_no: data.reader_no || "",
                    reader_name: data.reader_name || "",

                    application_id: data.application_id || 0,
                    sz_id: data.sz_id || panelDetails.sz_id,
                    site_id:  data.site_id || panelDetails.site_id,
                    panel_id: data.panel_id || panelId,
                    created_time: data.created_time || "2022-12-08T11:35:09",
                    updated_time: data.updated_time || "2022-12-08T11:35:13",
                    last_scanned: data.last_scanned || "2022-12-08T11:35:15",
                    gps_location_details: data.gps_location_details || null,
                    is_active: data.is_active || 1,
                    is_deleted: data.is_deleted || 0,
                    o_id: data.o_id || selectedOrg.orgId,
                }));
                console.log(details);
            })
            .catch(err => { 
                console.log(err);
                message.error("Error while fetching reader details");
                closeEdit();
            })
        setLoading(false);
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        if(isAddNew) {
            setLoading(false);
        } 
        else {
            if(readerId && isActuallyVisible) {
                getDetails();
            }
        }
    }, [readerId, isActuallyVisible]);

    const setDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }


    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateReader(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            // setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_reader', {
                ...details,
                o_id: selectedOrg.orgId,
                is_active: 1,
            })
                .then(res => {
                    message.success('Reader added successfully');
                    // navigate(homePath);
                    closeEdit();
                }).catch(err => {
                    console.log(err);
                    message.error('Error while adding REader');
                })
        }
        else {
            await axios.put('/admin-api/modify_reader', {
                ...details,
                o_id: selectedOrg.orgId,
                is_active: 1,
            })
                .then(res => {
                    message.success('Reader modified successfully');
                    closeEdit();
                })
                .catch(err => {
                    console.log(err);
                    message.error('Error while modifying Reader');
                })
        }
        setLoading(false);
    }

    const getSelectOptions = () => {
        /*
            {
                "data": [
                    {
                    "application_id": 1,
                    "reader_app_code": "POS001",
                    "reader_app_name": "Pos Reader"
                    },
                    {
                    "application_id": 2,
                    "reader_app_code": "TRL001",
                    "reader_app_name": "Trial Room Reader"
                    },
                    {
                    "application_id": 3,
                    "reader_app_code": "INW001",
                    "reader_app_name": "Inwarding "
                    },
                    {
                    "application_id": 4,
                    "reader_app_code": "OUT001",
                    "reader_app_name": "Outwarding"
                    },
                    {
                    "application_id": 5,
                    "reader_app_code": "TUN001",
                    "reader_app_name": "Tunnel"
                    }
                ]
            }
        */

                    axios.get('/admin-api/all_reader-application')
                    .then(res => {
                        const data = res.data.data;
                        setSelectOptions(prev => ({
                            ...prev,
                            applicationTypes: data,
                        }));
                        if(isAddNew && data.length > 0 && !details.application_id) {
                            setDetailsKey("application_id", data[0].application_id);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        message.error("Error in fetching panel types");
                    })
    }
    // To get all Application types
    
    useEffect(() => {
        getSelectOptions();
    }, []);

    return (
        <div className='my-form-outer' key={readerId}>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Reader 
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
                                    {panelDetails.region_name}/{panelDetails.area_name}/{panelDetails.site_name}
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                            <InputWithLabel label="Reader Name" error={errors.reader_name} reqMark={true}>
                                    <Input
                                        value={details.reader_name}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("reader_name", e.target.value)}
                                        status={errors?.reader_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Reader Code" error={errors.reader_code} reqMark={true}>
                                    <Input
                                        value={details.reader_code}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("reader_code", e.target.value)}
                                        status={errors?.reader_code?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Reader Number" errors={errors.reader_no} reqMark={true}>
                                    <Input
                                        value={details.reader_no}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("reader_no", e.target.value)}
                                        status={errors?.reader_no?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Application Type" error={errors.application_id} reqMark={true}>
                                    <Select
                                        value={selectOptions.reader_app_name}
                                        className="my-form-input"
                                        onChange={(e) => {setDetailsKey('application_id', e)}}
                                        loading={selectOptions.applicationTypes.length === 0}
                                        disabled={selectOptions.applicationTypes.length === 0 || !isAddNew}
                                        showSearch
                                        optionFilterProp='children'
                                        status={errors?.panel_type_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions.applicationTypes.map((item, index) => (
                                            <Select.Option key={index} value={item.application_id}>
                                                {item.reader_app_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>

                            {/* Do we Need This section */}
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
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}