import React, {useState, useEffect} from "react"
import { Button, Input, message, Tabs, Spin, Checkbox } from "antd"
import axios from 'axios';
import { MdOutlineEditOff } from "react-icons/md";
import { InputWithLabel } from '../../Components/Components';
import { validateSiteZone } from "../../Components/Validations";
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import TempFieldsComponent from "../GeneralComponents/TempFieldsComponent";

const { TabPane } = Tabs;

// Response from /admin-api/zone_by_sz_id
// {
//     "data": {
//         "sz_id": 16,
//         "zone_name": "Nagarbhavi 123",
//         "is_inward_zone": 1,
//         "site_id": 9,
//         "zone_code": "ZON002",
//         "is_shop_floor": 0,
//         "o_id": 2,
//         "updated_time": "2022-12-01T11:43:27.745883",
//         "created_time": "2022-11-26T19:18:38.510982",
//         "updated_by": 1,
//         "is_deleted": 0
//     }
// }

export default function EditSiteZone({
    selectedOrg,
    siteId,
    zoneId,
    isAddNew,
    permissions={},

    siteDetails={},

    isActuallyVisible,                        
    closeEdit=() => {alert("onClose not defined")},
}) {
    const [loading, setLoading] = useState(true);

    // Here will be the default state of the form (For add new)
    // For documentation, see the comment above function 
    const [details, setDetails] = useState({
        // Current Recieved Details
        sz_id: zoneId,
        zone_name: "",
        is_inward_zone: 0,
        site_id: siteId,
        zone_code: "",
        is_shop_floor: 0,
        o_id: selectedOrg.orgId,
        // updated_time,
        // created_time,
        // updated_by,
        // is_deleted,
        description:"",
        comments:"",
        audit_remark:"",
        temp_field_1:"",
        temp_field_2:"",
        temp_field_3:""
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const getDetails = async () => {
        setLoading(true);
        await axios.get(`/admin-api/zone_by_sz_id`, {
            params: {
                sz_id: zoneId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails(d => ({
                    ...d,
                    ...data,

                    sz_id: data.sz_id,
                    zone_name: data.zone_name || "",
                    is_inward_zone: data.is_inward_zone || 0,
                    o_id: data.o_id || selectedOrg.orgId,
                    site_id: data.site_id || siteDetails?.site_id,
                    zone_code: data.zone_code || "",
                    is_shop_floor: data.is_shop_floor || 0,
                    description: data.description || "",
                    comments: data.comments || "",
                    audit_remark: data.audit_remark || "",
                    temp_field_1: data.temp_field_1 || "",
                    temp_field_2: data.temp_field_2 || "",
                    temp_field_3: data.temp_field_3 || "",
                }));
            })
            .catch(err => { 
                console.log(err);
                message.error("Error while fetching zone details");
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
            if(zoneId && isActuallyVisible) {
                getDetails();
            }
        }
    }, [zoneId, isActuallyVisible]);

    const setDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }


    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateSiteZone(details, errors, isAddNew, "details"));
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
                                <InputWithLabel label="Site Name">
                                    {siteDetails.site_name}
                                </InputWithLabel>
                                <InputWithLabel label="Site Code" divStyle={{marginLeft: '10px'}}>
                                    {siteDetails.site_code}
                                </InputWithLabel>
                                <InputWithLabel label="Location" divStyle={{marginLeft: '10px'}}>
                                    {siteDetails.site_name}
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
                                <InputWithLabel label="Zone Code" error={errors.serial_number} reqMark={true}>
                                    <Input
                                        value={details.zone_code}
                                        className="my-form-input"
                                        onChange={e => setDetailsKey("zone_code", e.target.value)}
                                        status={errors?.serial_number?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <Checkbox
                                    checked={details.is_inward_zone}
                                    onChange={(e)=>{
                                        if (e.target.checked == true) {
                                            setDetailsKey('is_inward_zone', 1)
                                        }
                                        else if(e.target.checked == false) {
                                            setDetailsKey('is_inward_zone', 0)
                                        }
                                    }}
                                >
                                    Is Inward Zone
                                </Checkbox>
                                <Checkbox
                                    checked={details.is_shop_floor}
                                    onChange={(e)=>{
                                        if (e.target.checked == true) {
                                            setDetailsKey('is_shop_floor', 1)
                                        }
                                        else if(e.target.checked == false) {
                                            setDetailsKey('is_shop_floor', 0)
                                        }
                                    }}
                                >
                                    Is Shop Floor
                                </Checkbox>
                            </div>
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