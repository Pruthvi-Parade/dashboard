import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../Components/Components';
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import { validateActionPlan } from "../../Components/Validations";

const { TabPane } = Tabs;

/*
    Edit and Add Action Plan
        if isAddNew is true, then we will post else put

    state: 
        details
        {
            action_plan_id,                 // id of the action plan => 0 if new
            action_plan_name,              

            description,
            comments,
            audit_remark,

            zone_group_ids: [               // array of zone group ids
                id1, id2, id3
            ]

            TODO: add other fields (plan)
            action_plan_users: [        // array of user maps
                {
                    action_plan_user_id: 0,             // this is the DB primary key (Not in use) => 0 if new
                    o_type,                             // org type of the user (2 => Agency, 3 => Company, 4 => Vendor)  
                    e_id,                               // employee id (to whon it is assigned)
                    action_id,                         // action id (to which it is assigned) EG: X => Email, Y => Popup, Z => SMS etc
                                                        
                                                        // TODO: Verify This
                    level_id,                           // level id (to which it is assigned) => 0 => Auto, 1 => Level 1, 2 => Level 2, 3 => Level 3
                    comments,                           // comments   
                }
            ]
        }

    

        options: 
            zone_groups: 
                [
                    {
                        zone_group_id,
                        zone_group_name,

                        // These fields also come in the response
                        // priority_group_id
                        // priority_group_name
                        // severity_group_id
                        // severity_group_name
                        // description
                        // comments
                    }
                    {...}
                    {...}
                ]


            orgTypes: 
                [
                    {
                        "o_type": "CMS",
                        "description": null,
                        "o_type_id": 1,
                        "is_deleted": 0
                    },
                ]

            users:  // One o_type_id => under that array of users
                {
                    "o_type_id": [
                        {
                            o_id,
                            o_code,
                            o_name,
                            e_id,
                            e_name
                        }
                    ]
                    2: []       // above array structure ....
                    3: []       ....
                }

            actionTypes:
                [
                    {
                        "m_action_type_name": "Email",
                        "is_deleted": 0,
                        "description": null,
                        "m_action_type_id": 1,
                        "extra_info": null
                    },
                    {...}
                ]

            levels:
                [
                    { level_id: 0, level_name: "Auto",},
                    { level_id: 1, level_name: "Level 1",},
                ]


*/


export default function EditActionPlan({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/action-plan",
}) {

    let actionPlanId = parseInt(useParams().id);
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
        action_plan_id: 0,
        action_plan_name: "",

        description: "",
        comments: "",
        audit_remark: "",
        
        zone_group_ids: [],                 // List of ids of added zone groups

        action_plan_users: [                        // Refer Docs above
            {
                action_plan_user_id: 0,             // this is the DB primary key (Not in use) => 0 if new
                o_type: null,                             // org type of the user (2 => Agency, 3 => Company, 4 => Vendor)  
                e_id: null,                               // employee id (to whon it is assigned)
                action_id: null,                         // action id (to which it is assigned) EG: X => Email, Y => Popup, Z => SMS etc
                                                    
                                                    // TODO: Verify This
                level_id: null,                           // level id (to which it is assigned) => 0 => Auto, 1 => Level 1, 2 => Level 2, 3 => Level 3
                comments: "",                           // comments   
            }
        ] 
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const [options, setOptions] = useState({
        zoneGroups: [],

        orgTypes: [],
        users: {},
        actionTypes: [],
        levels: [],
    });


    const getDetails = async () => {
        setLoading(true);
        await axios.get('/admin-api/action_plan_by_action_plan_id', {
            params: {
                action_plan_id: actionPlanId,
            }
        })
        .then(res => {
            const data = res.data.data;
            setDetails({
                ...details,
                action_plan_id: actionPlanId,
                action_plan_name: data.action_plan_name,
                description: data.description,
                comments: data.comments,
                audit_remark: data.audit_remark || "",

                zone_group_ids: data.zone_group_ids,
                action_plan_users: data.action_plan_users.map(user => {
                    return {
                        action_plan_user_id: user.action_plan_user_id,
                        o_type: user.o_type,
                        e_id: user.e_id,
                        action_id: user.action_id,
                        level_id: user.level_id,
                        comments: user.comments || "",
                    }
                }),
            });
        })
        .catch(err => {
            console.log(err);
            message.error('Error getting Action Plan');
            navigate(homePath);

        })
        setLoading(false);
    }

    const getALLOptions = async () => {

        /*
            API res
            [
                {
                        zone_group_id,
                        zone_group_name,

                        // These fields also come in the response
                        // priority_group_id
                        // priority_group_name
                        // severity_group_id
                        // severity_group_name
                        // description
                        // comments
                    }
                    {...}
                    {...}
            ]
        */
        axios.get('/admin-api/all_zone_group_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                
                setOptions(prev => ({
                    ...prev,
                    zoneGroups: data,
                }));
            })
            .catch(err => {
                message.error(err.message);
            })


        /*
            API res
            [
                {
                    "o_type": "CMS",
                    "description": null,
                    "o_type_id": 1,
                    "is_deleted": 0
                },
                {...}
            ]
        */
        axios.get('/admin-api/all_m_o_types')
            .then(res => {
                const data = res.data.data;

                setOptions(prev => ({
                    ...prev,
                    orgTypes: data,
                }));
            })
            .catch(err => {
                console.log(err);
            });
        
        /*
            API Res
            {
                "o_type_id": [
                    {
                        o_id,
                        o_code,
                        o_name,
                        e_id,
                        e_name
                    }
                ]
                2: []       // above array structure ....
                3: []       ....
            }
        */
        axios.get('/admin-api/all_users_by_o_type_for_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setOptions(prev => ({
                    ...prev,
                    users: data,
                }));
            })
            .catch(err => {
                console.log(err);
            })

        /*
            API Res
            [
                {
                    "m_action_type_name": "Email",
                    "is_deleted": 0,
                    "description": null,
                    "m_action_type_id": 1,
                    "extra_info": null
                },
                {...}
            ]
        */
        axios.get('/admin-api/all_action_types')
            .then(res => {
                const data = res.data.data;

                setOptions(prev => ({
                    ...prev,
                    actionTypes: data,
                }));
            })
            .catch(err => {
                console.log(err);
            })

        // TODO: Check Level API (For now Hard code)
        setOptions(prev => ({
            ...prev,
            levels: [
                { level_id: 0, level_name: "Auto",},
                { level_id: 1, level_name: "Level 1",},
                { level_id: 2, level_name: "Level 2",},
                { level_id: 3, level_name: "Level 3",},
            ],
        }));
        
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        getALLOptions();
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
            [key]: value
        }))
    }


    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateActionPlan(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if (isAddNew) {
            await axios.post('/admin-api/add_action_plan', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Action Plan Added Successfully');
                    navigate(homePath);
                })
                .catch(err => {
                    message.error(err.message);
                })
        }
        else{
            await axios.put('/admin-api/modify_action_plan', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Action Plan Updated Successfully');
                    navigate(homePath);
                })
                .catch(err => {
                    message.error(err.message);
                })
        }
        setLoading(false);
    }

    // Index of that row and json {}
    const setOneActPUserByIndex = (index, all_to_set) => {
        setDetails({
            ...details,
            action_plan_users: [
                ...details.action_plan_users.slice(0, index),
                {
                    ...details.action_plan_users[index],
                    ...all_to_set,
                },
                ...details.action_plan_users.slice(index + 1),
            ]
        })
    }

    const addNewActPUser = () => {
        setDetails({
            ...details,
            action_plan_users: [
                ...details.action_plan_users,
                {
                    action_plan_user_id: 0,
                    o_type: null,
                    e_id: null,
                    action_id: null,
                    level_id: null,
                    comments: "",
                }
            ]
        })
    }

    const removeActPUser = (index) => {
        setDetails({
            ...details,
            action_plan_users: [
                ...details.action_plan_users.slice(0, index),
                ...details.action_plan_users.slice(index + 1),
            ]
        })
    }

    const handleSelectAllZoneGrps = (e) => {
        setDetails({
            ...details,
            zone_group_ids: options.zoneGroups.length !== details.zone_group_ids.length ? options.zoneGroups.map(zg => zg.zone_group_id) : [],
        })
    }

    const UserTableColumns = [
        {
            title: 'Organization Type',
            render: (text, record, index) => (
                <Select
                    value={details.action_plan_users[index].o_type}
                    onChange={(value) => {
                        setOneActPUserByIndex(index, { o_type: value, e_id: null });
                    }}
                    showSearch
                    filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    loading={options.orgTypes.length === 0}
                    disabled={options.orgTypes.length === 0}
                    style={{ width: '100%' }}
                >
                    {options.orgTypes.map(item => (
                        <Select.Option 
                            key={item.o_type_id} 
                            value={item.o_type_id} 
                            name={`${item.o_type_id} - ${item.o_type}`}
                        >
                           {item.o_type}
                        </Select.Option>
                    ))}
                </Select>
            ),
            width: '20%',
        },
        {
            title: 'User',
            render: (text, record, index) => (
                <Select
                    value={details.action_plan_users[index].e_id}
                    onChange={(value) => {
                        setOneActPUserByIndex(index, { e_id: value });
                    }}
                    key={details.action_plan_users[index]?.o_type}
                    showSearch
                    filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    loading={options.users[details.action_plan_users[index].o_type] && options.users[parseInt(details.action_plan_users[index].o_type)].length === 0}
                    disabled={!options.users[details.action_plan_users[index].o_type] || options.users[parseInt(details.action_plan_users[index].o_type)].length === 0}
                    style={{ width: '100%' }}
                >
                    {options.users[details.action_plan_users[index]?.o_type] && options.users[parseInt(details.action_plan_users[index].o_type)].map(item => item.e_id && item.e_name && (
                        <Select.Option
                            key={item.e_id + item.e_name}
                            value={item.e_id}
                            name={`${item.o_code} ${item.e_id}  ${item.e_name}`}
                            dropdownMatchSelectWidth={false}
                        >
                            {item.o_code} / {item.e_name}
                        </Select.Option>
                    ))}
                </Select>
            ),
            width: '20%',
        },
        {
            title: 'Action Type',
            render: (text, record, index) => (
                <Select
                    value={details.action_plan_users[index].action_id}
                    onChange={(value) => {
                        setOneActPUserByIndex(index, { action_id: value });
                    }}
                    showSearch
                    filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    loading={options.actionTypes.length === 0}
                    disabled={options.actionTypes.length === 0}
                    style={{ width: '100%' }}
                >
                    {options.actionTypes.map(item => (
                        <Select.Option key={item.m_action_type_id} value={item.m_action_type_id} name={`${item.m_action_type_id} - ${item.m_action_type_name}`}>
                            {item.m_action_type_name}
                        </Select.Option>
                    ))}
                </Select>
            ),
            width: '20%',
        },
        {
            title: 'Level',
            render: (text, record, index) => (
                <Select
                    value={details.action_plan_users[index].level_id}
                    onChange={(value) => {
                        setOneActPUserByIndex(index, { level_id: value });
                    }}
                    showSearch
                    filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    loading={options.levels.length === 0}
                    disabled={options.levels.length === 0}
                    style={{ width: '100%' }}
                >
                    {options.levels.map(item => (
                        <Select.Option key={item.level_id} value={item.level_id} name={`${item.level_id} - ${item.level_name}`}>
                            {item.level_name}
                        </Select.Option>
                    ))}
                </Select>
            ),
            width: '20%',
        },
        {
            title: 'Comments',
            render: (text, record, index) => (
                <Input
                    value={details.action_plan_users[index].comments}
                    onChange={(e) => {
                        setOneActPUserByIndex(index, { comments: e.target.value });
                    }}
                    style={{ width: '100%' }}
                />
            ),
            width: '20%',
        },
        {
            title: 'Remove',
            render: (text, record, index) => (
                <Button type="danger" onClick={() => {removeActPUser(index)}}>
                    Remove
                </Button>
            ),
            width: '60px'
        }
        
    ]

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Action Plan 
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
                    <TabPane className="my-form-tabpane-outer" tab="Details" key="details">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div>
                                <InputWithLabel label="Action Plan Name" error={errors.action_plan_name} reqMark={true}>
                                    <Input
                                        className="my-form-input"
                                        value={details.action_plan_name}
                                        onChange={(e) => setDetailsKey("action_plan_name", e.target.value)}
                                        status={errors?.action_plan_name?.errors?.[0]?.msg && "error"}
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
                        </Spin>
                    </TabPane>
                    <TabPane className="my-form-tabpane-outer" tab="Action Plan Users" key="actions">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            
                            <div style={{display: 'inline-flex', gap: '10px', width: '100%'}}>
                                <InputWithLabel label={<>&nbsp;</>}>
                                    <Button 
                                        onClick={handleSelectAllZoneGrps}
                                        type={options.zoneGroups.length === details.zone_group_ids.length ? "danger" : "primary"}
                                    >
                                        {options.zoneGroups.length === details.zone_group_ids.length ? "Unselect All" : "Select All"}
                                    </Button>
                                </InputWithLabel>
                                <InputWithLabel label={`Zone Group`} divStyle={{width: '100%'}}>
                                    <Select
                                        value={details.zone_group_ids}
                                        mode="multiple"
                                        onChange={(value) => {
                                            setDetailsKey('zone_group_ids', value);
                                        }}
                                        showSearch
                                        filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        loading={options.zoneGroups.length === 0}
                                        style={{ width: '100%' }}
                                    >
                                        {options.zoneGroups && options.zoneGroups.map(item => (
                                            <Select.Option key={item.zone_group_id} value={item.zone_group_id} name={`${item.zone_group_id} - ${item.zone_group_name}`}>
                                                {item.zone_group_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>
                            <Divider />
                            <Button type="primary" style={{float: 'right', marginBottom: '10px'}} onClick={addNewActPUser} disabled={!permissions.edit}>
                                Add
                            </Button>
                            <Table
                                columns={UserTableColumns}
                                dataSource={details.action_plan_users}
                                rowKey={(record, index) => index}
                                loading={loading}
                                size="small"
                                pagination={false}
                            />
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}
