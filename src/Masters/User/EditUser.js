import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../Components/Components';
import AddressesForm from "../GeneralComponents/AddressesForm";
import SecurityQuestions from "../GeneralComponents/SecurityQuestions";
import UserPersonalDetails from "../GeneralComponents/UserPersonalDetails";
import UserLoginDetails from "../GeneralComponents/UserLoginDetails";
import { validateUser } from "../../Components/Validations";

const { TabPane } = Tabs;

/*
    Edit and Add User Template:
        if isAddNew is true, then we will post else put
        
    state:
        details{
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

            addresses: [                    // array of addresses
                {
                    address: '',
                    country_id: 0,
                    state_id: 0,
                    city_id: 0,
                }
            ],

            designation: '',
            working_start_time: '',
            working_end_time: '',


            is_user: false,                 // Does the employee have a user account (Login ?)
            // user: {}                     // if not user, then this is empty
            user: {
                user_id: 0,
                role_id: 0,
                scope_id: 0,

                username: '',
                password: '',
            },

            security_questions: [           // array of security questions
                {
                    question: '',
                    answer: '',
                }
            ]



        }

*/

export default function EditUser({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/user",
}) {
    let employeeId = parseInt(useParams().id);
    const navigate = useNavigate();

    // For having the active tab in the url (for refreshing)
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState((searchParams.get('tab') && searchParams.get('tab') !== "address") ? searchParams.get('tab') : 'employee');
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
        e_id: 0,
        e_firstname: '',
        e_lastname: '',
        e_code: '',
        e_gender: 1,

        e_contact_no: '',
        e_alternate_contact_no: '',
        e_email: '',
        e_alternate_email: '',

        e_aadhar_no: '',

        addresses: [                  // refer json format documentation at top in this file
            {
                address: '',
                country_id: 0,
                state_id: 0,
                city_id: 0,
            }
        ],

        designation: '',
        working_start_time: "2020-01-01T09:00:00",
        working_end_time: "2020-01-01T18:00:00",


        is_user: false,
        user: {                         // We have kept this as default user irrespective of is_user
            user_id: 0,
            role_id: null,
            scope_id: null,

            username: '',
            password: '',

            // List of Panel IDs granted access
            panel_group_ids: [],
        },

        security_questions: []         //refer json format documentation at top in this file

    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    
    
    const getDetails = async () => {
        setLoading(true);
        await axios.get('/admin-api/employee_by_employee_id', {
            params: {
                e_id: employeeId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                const employeeData = res.data.data.e_info;
                const addressData = res.data.data.e_addresses;
                const userFlag = res.data.data.user_flag;
                const userData = res.data.data.user_info;
                setDetails(d => ({
                    ...d,

                    e_id: employeeData.e_id,
                    e_firstname: employeeData.e_firstname,
                    e_lastname: employeeData.e_lastname,
                    e_code: employeeData.e_code,
                    e_gender: employeeData.gender,

                    e_contact_no: employeeData.contact_no,
                    e_alternate_contact_no: employeeData.alternate_contact_no,
                    e_email: employeeData.e_email,
                    e_alternate_email: employeeData.alternate_email,

                    e_aadhar_no: employeeData.aadhar_card_no,

                    addresses: addressData,                 // addresses is an array of addresses => Refer format in docs above
                                                            // Its assumed that the address-jsons follow the key value in docs
                    designation: employeeData.designation,
                    working_start_time: employeeData.working_start_time,
                    working_end_time: employeeData.working_end_time,


                    is_user: userFlag,
                    user: {                            // We have kept this as default user irrespective of is_user
                        user_id: userData.user_id,
                        role_id: userData.role_id,
                        scope_id: userData.scope_id,

                        username: userData.username,
                        password: userData.password,

                        panel_group_ids: data.panel_group_ids || [],
                        // These are also available in user_info 
                        // o_id: userData.o_id,
                        // e_id: userData.e_id,
                    },
                    

                    //refer json format documentation at top in this file
                    // Its assumed that the -jsons follow the key value in docs
                    security_questions: employeeData.security_questions ? 
                                        JSON.parse(employeeData.security_questions) : [],          


                }));
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting user');
                navigate(homePath);
            })
        setLoading(false);
    }
    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        if(isAddNew){
            setLoading(false);
        }
        else{
            getDetails();
        }
    }, [])



    const setDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }

    const setUserDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            user: {
                ...d.user,
                [key]: value,
            }
        }));
    }

    // Functions for addresses tab
    const setAddresses = (newAddresses) => {
        setDetails(d => ({
            ...d,
            addresses: newAddresses,
        }));

        // OR 
        // setDetailsKey("addresses", newAddresses);
    }

    // Function for security questions tab
    const setSecurityQuestions = (newSecQuestions) => {
        setDetails(d => ({
            ...d,
            security_questions: newSecQuestions,
        }));
        // OR
        // setDetailsKey("security_questions", newSecQuestions);
    }


    const handleSubmit = async () => {
        // console.log(details);
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateUser(details, errors, isAddNew, "employee", "user", false));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew){
            await axios.post('/admin-api/add_user', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('User added successfully');
                    navigate(homePath);
                }).catch(err => {
                    console.log(err);
                    try {
                        if(typeof(err.response.data.detail) === 'string') {
                            message.error(err.response.data.detail);
                        }
                        else {
                            message.error('Error adding user');
                        }
                    } catch (error) {
                        message.error('Error adding user');
                    }
                });
        }
        else{
            await axios.put('/admin-api/modify_user', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('User updated successfully');
                    navigate(homePath);
                }).catch(err => {
                    console.log(err);
                    try {
                        if(typeof(err.response.data.detail) === 'string') {
                            message.error(err.response.data.detail);
                        }
                        else {
                            message.error('Error updating user');
                        }
                    } catch (error) {
                        message.error('Error updating user');
                    }
                });
        }
        
        setLoading(false);
    }


    return ( 
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} User 
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
                    <TabPane className="my-form-tabpane-outer" tab="Personal Details" key="employee">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <UserPersonalDetails
                                details={details}       // Instead of passing all details we can pass the key value pairs
                                setDetailsKey={setDetailsKey}

                                errors={errors}
                            />
                        </Spin>
                    </TabPane>
                    <TabPane className="my-form-tabpane-outer" tab="Address Details" key="address">
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
                    <TabPane className="my-form-tabpane-outer" tab="Work Details" key="work">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Designation">
                                    <Input
                                        value={details.designation}
                                        className="my-form-input"
                                        onChange={(e) => {setDetailsKey('designation', e.target.value)}}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Work Time From">
                                    <TimePicker
                                        value={moment(details.working_start_time)}
                                        className="my-form-input"
                                        use12Hours 
                                        format="h:mm a"
                                        minuteStep={15}
                                        showNow={false}
                                        allowClear={false}
                                        onChange={(time, timeString) => {setDetailsKey('working_start_time', time.format())}}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Work Time To">
                                    <TimePicker
                                        value={moment(details.working_end_time)}
                                        className="my-form-input"
                                        use12Hours
                                        format="h:mm a"
                                        minuteStep={15}
                                        showNow={false}
                                        allowClear={false}
                                        onChange={(time, timeString) => {setDetailsKey('working_end_time', time.format())}}
                                    />
                                </InputWithLabel>


                            </div>
                        </Spin>
                    </TabPane>
                    <TabPane className="my-form-tabpane-outer" tab="Login Details" key="user">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">

                                <InputWithLabel label="Is Login" isInline={true}>
                                    <Switch
                                        checked={details.is_user}
                                        onChange={(e) => {setDetailsKey('is_user', e)}}
                                        checkedChildren="Yes"
                                        unCheckedChildren=" No "
                                    />
                                </InputWithLabel>
                            </div>
                            {   details.is_user && 
                                <UserLoginDetails 
                                    user={details.user}
                                    setUserDetailsKey={setUserDetailsKey}
                                    isAddNew={isAddNew}

                                    errors={errors.user}

                                    selectedOrg={selectedOrg}
                                />
                            }
                        </Spin>
                    </TabPane>
                    <TabPane className="my-form-tabpane-outer" tab="Security Question" key="questions">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <SecurityQuestions 
                                security_questions={details.security_questions}
                                setSecurityQuestions={setSecurityQuestions}
                            />
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}

