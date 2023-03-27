import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../Components/Components';
import UserPersonalDetails from "../GeneralComponents/UserPersonalDetails";
import AddressesForm from "../GeneralComponents/AddressesForm";
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import { validateOrg } from "../../Components/Validations";
import CopyCompanyData from "./CopyCompanyData";

const { TabPane } = Tabs;

const orgTypeIdToDesignation = {
    2: 'AgencyAdmin',
    3: 'CompanyAdmin',
    4: 'VendorAdmin',
}

/*
    Edit and Add Company
        if isAddNew = true then post else put
    
    orgTypeId => orgTypeName                  // 2 => Agency / 3 => Company / 4 => Vendor

    state:
        details{
            o_id: 0,                        // id of the org (Company/Agency/Vendor)
            o_name,
            o_code,                         // Eg: COM001, AGN001, VEN001
            o_type_id: 2 | 3 | 4,          // 2 => Agency / 3 => Company / 4 => Vendor
            o_type_name: 'Agency' | 'Company' | 'Vendor',

            employee: {
                e_id: 0,                        // will be 0 for isAddNew else will employee id
                e_firstname: '',            
                e_lastname: '',
                e_code: '',
                e_gender: 1,                      // 1 for Male / 2 for Female

                e_contact_no: '',
                e_alternate_contact_no: '',
                e_email: '',
                e_alternate_email: '',

                e_aadhar_no: '',

                user: {
                    user_id: 0,                        // will be 0 for isAddNew else will user id
                    username: '',
                    password: '',
                }
            }

            addresses: [                    // array of addresses
                {
                    address: '',
                    country_id: 0,
                    state_id: 0,
                    city_id: 0,
                }
            ],

            description: '',
            comment: '',
            audit_remark: '',

        }

*/

export default function EditOrg({
    selectedOrg,
    isAddNew,
    permissions={},

    orgTypeId=3,                        // refer Docs above (These are defaults)
    orgTypeName='Company',
    homePath="/masters/company",
}) {
    let orgId = parseInt(useParams().id);
    const navigate = useNavigate();

    // For having the active tab in the url (for refreshing)
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState((searchParams.get('tab') && searchParams.get('tab') !== "address") ? searchParams.get('tab') : 'org');
    // Active tab for address needs to be fixed (Check EditSite.js Comment)
    const changeActiveTab = (key) => {
        setActiveTab(key);
        searchParams.set('tab', key);
        setSearchParams(searchParams, {replace: true});
    }

    const [loading, setLoading] = useState(true);

    // Here will be the default state of the form (For add new)
    // For documentation, see the comment above function 
    const [details, setDetails] = useState({
        o_id: 0,                        // id of the org (Company/Agency/Vendor)
        o_name: '',
        o_code: '',                         // Eg: COM001, AGN001, VEN001
        o_type_id: orgTypeId,               // This is not compulsory .....
        o_type_name: orgTypeName,            // This is not compulsory .....

        employee: {
            e_id: 0,                        // will be 0 for isAddNew else will employee id
            e_firstname: '',
            e_lastname: '',
            e_code: '',
            e_gender: 1,

            e_contact_no: '',
            e_alternate_contact_no: '',
            e_email: '',
            e_alternate_email: '',
            e_aadhar_no: '',

            // This is default hardcoded
            designation: orgTypeIdToDesignation[orgTypeId],
            working_start_time: "2020-01-01T00:00:00",
            working_end_time: "2020-01-01T23:59:59",

            user: {
                user_id: 0,                        // will be 0 for isAddNew else will user id
                username: '',
                password: '',
            }
        },

        addresses: [                    // array of addresses
            {
                address: 'Test',
                country_id: 0,
                state_id: 0,
                city_id: 0,
            }
        ],

        description: '',
        comment: '',
        audit_remark: '',

        copy_data_flag: true,
        copy_data: {
            copy_tab_visited: false,
            zone_groups: [],
            roles: [],
        }

    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});



    const getOrgDetails = async () => {
        setLoading(true);
        
        await axios.get('/admin-api/org_details_by_o_id', {
            params: {
                o_id: orgId,
            }
        })
        .then(res => {
                const data = res.data.data;
                setDetails({
                    ...details,
                    o_id: data.o_id,
                    o_name: data.o_name,
                    o_code: data.o_code,
                    o_type_id: data.o_type_id,
                    o_type_name: orgTypeName,

                    description: data.description || '',
                    comment: data.comment || '',
                    audit_remark: data.audit_remark || "",

                    employee: {
                        ...details.employee,
                        e_id: data.e_id,
                        e_firstname: data.e_firstname || '',
                        e_lastname: data.e_lastname || '',
                        e_code: data.e_code || '',
                        e_gender: data.e_gender || 1,

                        e_contact_no: data.e_contact_no || '',
                        e_alternate_contact_no: data.e_alternate_contact_no || '',
                        e_email: data.e_email || '',
                        e_alternate_email: data.e_alternate_email || '',

                        e_aadhar_no: data.e_aadhar_no || '',

                        designation: data.e_designation || orgTypeIdToDesignation[orgTypeId],
                        working_start_time: data.e_working_start_time,
                        working_end_time: data.e_working_end_time,
                    
                        user: {
                            ...details.employee.user,
                            user_id: data.user_id,
                            username: data.u_username || '',
                            password: data.u_password || '',
                        }
                        
                    },
                    
                    addresses: !data.addresses || data.addresses.length == 0 
                    ?  [                    
                            {
                                address: 'Address',
                                country_id: 0,
                                state_id: 0,
                                city_id: 0,
                            }
                        ] 
                    : data.addresses,
                });
            })
            .catch(err => {
                console.log(err);
                message.error(`Error in fetching ${orgTypeName} details`);
                navigate(homePath);
            })

        setLoading(false);
    }
    
    useEffect(() => {
        if(isAddNew){
            // setTimeout(() => {
            //     setLoading(false);
            // }, 2000);
            setLoading(false);
        }
        else{
            getOrgDetails();
        }
    }, []);

    const setDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }

    const setCopyDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            copy_data: {
                ...d.copy_data,
                [key]: value,
            }
        }));
    }

    const setDetailsEmployeeKey = (key, value) => {
        setDetails(d => ({
            ...details,
            employee: {
                ...details.employee,
                [key]: value,
            }
        })); 
    }
    const setDetailsEmployeeUserKey = (key, value) => {
        setDetails(d => ({
            ...d,
            employee: {
                ...d.employee,
                user: {
                    ...d.employee.user,
                    [key]: value,
                }
            }
        }));
    }

    const setAddresses = (newAddresses) => {
        setDetails(d => ({
            ...d,
            addresses: newAddresses,
        }));

        // OR 
        // setDetailsKey("addresses", newAddresses);
    }

    const handleSubmit = async () => {
        // console.log(details);
        if(isAddNew && orgTypeId === 3 && !details.copy_data.copy_tab_visited){
            message.warning("Please visit copy tab and select zones and roles to copy");
            setActiveTab("copy_data");
            setLoading(false);
            return;
        }
        setLoading(true);
        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateOrg(details, errors, isAddNew, "org", "admin", "admin"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }
        
        

        if(isAddNew){
            await axios.post('/admin-api/add_org', {
                ...details,
                parent_org_id: selectedOrg.orgId,

                copy_data: details.copy_data_flag ? details.copy_data : undefined,
            })
                .then(res => {
                    message.success(`${orgTypeName} added successfully`);
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    try {
                        if(typeof(err.response.data.detail) === 'string') {
                            message.error(err.response.data.detail);
                        }
                        else {
                            message.error(`Error in adding ${orgTypeName}`);
                        }
                    } catch (error) {
                        message.error(`Error in adding ${orgTypeName}`);
                    }

                })
        }
        else{
            await axios.put('/admin-api/modify_org', {
                ...details,
                parent_org_id: selectedOrg.orgId,

                copy_data: undefined,
            })
                .then(res => {
                    message.success(`${orgTypeName} updated successfully`);
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    try {
                        if(typeof(err.response.data.detail) === 'string') {
                            message.error(err.response.data.detail);
                        }
                        else {
                            message.error(`Error in updating ${orgTypeName}`);
                        }
                    } catch (error) {
                        message.error(`Error in updating ${orgTypeName}`);
                    }

                })
        }
        setLoading(false);
    }

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} {orgTypeName} 
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
                    <TabPane className="my-form-tabpane-outer" tab={`${orgTypeName} Details`} key="org">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label={`${orgTypeName} Name`} error={errors.o_name} reqMark={true}>
                                    <Input
                                        value={details.o_name}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey('o_name', e.target.value)}
                                        status={errors?.o_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label={`${orgTypeName} Code`} error={errors.o_code} reqMark={true}>
                                    <Input
                                        value={details.o_code}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey('o_code', e.target.value)}
                                        status={errors?.o_code?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                        </Spin>
                    </TabPane>
                    <TabPane className="my-form-tabpane-outer" tab={`${orgTypeName} Admin User`} key="admin">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <UserPersonalDetails
                                details={details.employee}
                                setDetailsKey={setDetailsEmployeeKey}

                                errors={errors.employee}
                            />
                            <Divider />
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label={`Username`} error={errors?.employee?.user?.username} reqMark={true}>
                                    <Input
                                        value={details?.employee?.user?.username}
                                        className="my-form-input" 
                                        onChange={(e) => setDetailsEmployeeUserKey('username', e.target.value)}
                                        status={errors?.employee?.user?.username?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label={`Password`} error={errors?.employee?.user?.password} reqMark={true}>
                                    <Input.Password
                                        value={details?.employee?.user?.password}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsEmployeeUserKey('password', e.target.value)}
                                        status={errors?.employee?.user?.password?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                            <Divider />
                        </Spin>
                    </TabPane>
                    <TabPane className="my-form-tabpane-outer" tab={`Address`} key="address">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <AddressesForm
                                addresses={details.addresses}
                                setAddresses={setAddresses}
                            />
                        </Spin>
                    </TabPane>
                    <TabPane className="my-form-tabpane-outer" forceRender={true} tab={`Other`} key="other">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <RemarkComponent
                                    description={details.description}
                                    comments={details.comment}
                                    audit_remark={details.audit_remark}

                                    auditRemarkError={errors.audit_remark}
                                    descriptionError={errors.description}
                                    commentsError={errors.comments}

                                    setDetailsKey={setDetailsKey}
                                    commentsKey='comment'
                                />
                            </div>
                        </Spin>
                    </TabPane>
                    {
                        isAddNew && orgTypeId === 3 && (
                            <TabPane className="my-form-tabpane-outer" tab="Copy Data" key="copy_data">
                                <Spin 
                                    spinning={loading || !permissions.edit} 
                                    tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                                    indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                                >
                                    <div>
                                        <div className="my-form-multiple-inline-input">
                                            <InputWithLabel label="Copy data" isInline={true}>
                                                <Switch
                                                    checked={details.copy_data_flag}
                                                    onChange={(e) => {setDetailsKey('copy_data_flag', e)}}
                                                    checkedChildren="Yes"
                                                    unCheckedChildren=" No "
                                                />
                                            </InputWithLabel>
                                        </div>
                                        {   
                                            details.copy_data_flag && 
                                            <CopyCompanyData
                                                selectedOrg={selectedOrg}
                                                permissions={permissions}

                                                details={details.copy_data}
                                                errors={errors.copy_data}

                                                setDetailsKey={setCopyDetailsKey}
                                            />
                                        }
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
