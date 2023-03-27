import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin, Collapse } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../Components/Components';
import { useSelector } from "react-redux";

const { TabPane } = Tabs;
/*
    Edit and Add Role
        if isAddNew is true, then we will post else put

    state:
        roleDetails
        {
            id,
            name,
            description,
            permissions: {
                "module_code": {
                    add: true,
                    edit: true,
                    delete: true,
                }
                "EG1": {
                    export: false
                }
            },
        }

    // TODO: Document this (MasterModules)
    master Modules we will get from API

*/

export default function EditRole({
    selectedOrg,
    isAddNew,
    my_permissions={},

    homePath='/masters/role',
}) {
    let roleId = parseInt(useParams().id);
    const navigate = useNavigate();
    const myRoles = useSelector(state => state.authReducer.roles);

    const [loading, setLoading] = useState(true);
    const [roleDetails, setRoleDetails] = useState({
        id: 0,
        name: 'NEW ROLE',
        description: 'description',
        permissions: {},
    });
    const [masterModules, setMasterModules] = useState([]);

    const getMasterModules = async () => {
        /*
            This api return format:
            [
                {
                    id: 1,
                    module_code: "TAGIDA_COMPANY",
                    module_name: "Company Form",
                    
                    application_code: "APP_CMS_ADMIN",              // this can also be an module code for addition. 
                    
                    permissions: {
                        add: true,
                        edit: true,

                        all: true,              if this is true, all other permissions are ignored
                    }


                }
            ]

        */
            await axios.get('/admin-api/all_role_modules')
            .then(res => {
                const data = res.data.data;
                var temp = {};
                for(var module of data){
                    if(!temp[module.application_code]){
                        temp[module.application_code] = {
                            application_code: module.application_code,
                            modules: [],
                        };
                    }
                    temp[module.application_code].modules.push({
                        module_name: module.module_name,
                        module_code: module.module_code,
                        permissions: module.permissions,
                    });
                }

                var master = [];
                for(var module in temp){
                    master.push(temp[module]);
                }
                setMasterModules(master);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const getRoleDetails = async () => {
        setLoading(true);

        /*
            This api return format:
            {
                role_id
                role_name
                o_id
                description
                is_editable
                role_actions: [
                    {
                        module_code
                        permissions
                    }
                ]
            }

        */

        await axios.get('/admin-api/role_by_role_id', {
            params: {
                o_id: selectedOrg.orgId,
                role_id: roleId,
            }
        })
            .then(res => {
                const data = res.data.data;

                var perms = {};
                for (var perm of data.role_actions){
                    perms[perm.module_code] = perm.permissions;
                }

                setRoleDetails({
                    id: data.role_id,
                    name: data.role_name,
                    description: data.description,
                    permissions: perms,
                });
            })
            .catch(err => {
                console.log(err);
                navigate(homePath);
                // message.error('Error getting role details');
            })
        setLoading(false);
    }


    useEffect(() => {
        getMasterModules();
        if(isAddNew){
            // set Default state ------ Its already set in useState
            setLoading(false);
        }
        else{
            getRoleDetails();
        }
    }, []);



    const handleSubmit = async () => {
        setLoading(true);

        var perms = [];
        for(var moduleCode in roleDetails.permissions){
            perms.push({
                module_code: moduleCode,
                permissions: roleDetails.permissions[moduleCode],
            })
        }

        if(isAddNew){
            // Send request to create new role
            // /admin-api/role_action

            await axios.post('/admin-api/add_role', {
                role_name: roleDetails.name,
                o_id: selectedOrg.orgId,
                description: roleDetails.description,
                role_actions: perms,
            })
                .then(res => {
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    message.error("Error updating role data !")
                })
        }
        else{
            // Send request to update role
            await axios.put('/admin-api/modify_role', {
                role_id: roleDetails.id,
                o_id: selectedOrg.orgId,
                role_name: roleDetails.name,
                description: roleDetails.description,
                role_actions: perms,
            })
                .then(res => {
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    message.error("Error updating role data !")
                })
        }
        setLoading(false);

    }


    const setRoleDetailsByKey = (key, value) => {
        setRoleDetails({
            ...roleDetails,
            [key]: value,
        });
    }

    const handleModuleActionChange = (module_code, action_name, value) => {
        setRoleDetailsByKey('permissions', {
            ...roleDetails.permissions,
            [module_code]: {
                ...roleDetails.permissions[module_code],
                [action_name]: value,
            }
        });
    }

    const handleApplicationCheckbox = (application_code, checked) => {
        var perms = {...roleDetails.permissions};
        if(checked){
            perms[application_code] = {all: true};
        }
        else{
            delete perms[application_code];
        }
        setRoleDetailsByKey('permissions', perms);
    }



    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    Edit Role
                </span>
            </div>
            <div>
                <Tabs
                    tabBarExtraContent={
                        <div>
                            <Button type='danger' onClick={() => navigate(homePath)} loading={loading}>
                                Cancel
                            </Button>
                            <Button style={{marginLeft: '5px'}} type="primary" onClick={handleSubmit} loading={loading} disabled={!my_permissions.edit}>
                                {isAddNew ? "Add" : "Save"}
                            </Button>
                        </div>
                    }
                >
                    <TabPane className="my-form-tabpane-outer" tab="Details" key="1">
                        <Spin 
                            spinning={loading || !my_permissions.edit} 
                            tip={(!loading && !my_permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !my_permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Name" labelWidth="100px">
                                    <Input
                                        value={roleDetails.name}
                                        onChange={(e) => {setRoleDetailsByKey('name', e.target.value)}}
                                        style={{width: '200px'}}
                                        disabled={!my_permissions.edit || loading}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Description" labelWidth="100px">
                                    <Input
                                        value={roleDetails.description}
                                        onChange={(e) => {setRoleDetailsByKey('description', e.target.value)}}
                                        style={{width: '400px'}}
                                        disabled={!my_permissions.edit || loading}
                                    />
                                </InputWithLabel>
                            </div>
                            <div style={{marginTop: '20px'}}>

                                <InputWithLabel label="Permissions" divStyle={{width: '100%'}}>
                                        <div style={{padding: '0px 10px 0px 0px', display: 'inline-flex', flexDirection: 'column', width: '100%'}}>
                                            <Collapse style={{width: '100%'}} defaultActiveKey={["APP_IMAGES_DASHBOARD", "APP_CMS_ADMIN"]}>
                                            {
                                                masterModules.map(application => (
                                                    <Collapse.Panel
                                                        header={application.application_code}
                                                        key={application.application_code}
                                                    >

                                                        <InputWithLabel 
                                                            label={
                                                                <Tooltip title="If this is checked, all the modules inside this app are allowed.">
                                                                    <Checkbox
                                                                        checked={roleDetails.permissions[application.application_code]?.all}
                                                                        onChange={(e) => {handleApplicationCheckbox(application.application_code, e.target.checked)}}
                                                                        style={{marginRight: '10px'}}
                                                                        disabled={!my_permissions.edit || loading || !myRoles?.[application.application_code]?.all}
                                                                    >
                                                                        {application.application_code}
                                                                    </Checkbox>
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <div style={{padding: '10px 0px 10px 40px', display: 'inline-flex', flexDirection: 'column'}}>
                                                                {
                                                                    application.modules.map(module => (
                                                                        <InputWithLabel 
                                                                            label={
                                                                                <Tooltip title="If this is checked, every permission of this module is allowed.">
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            roleDetails.permissions[module.module_code]?.all
                                                                                            || roleDetails.permissions[application.application_code]?.all
                                                                                        }
                                                                                        onChange={(e) => {handleModuleActionChange(module.module_code, "all",e.target.checked)}}
                                                                                        style={{marginRight: '10px'}}
                                                                                        disabled={!my_permissions.edit || loading || !myRoles?.[module.module_code]?.all}
                                                                                    >
                                                                                        {module.module_name} / {module.module_code}
                                                                                    </Checkbox>
                                                                                </Tooltip>
                                                                            }
                                                                        >
                                                                            <div style={{padding: '0px 10px 20px 40px'}}>
                                                                                {
                                                                                    Object.keys(module.permissions).map(perm => (
                                                                                        <Checkbox
                                                                                            checked={
                                                                                                roleDetails.permissions[module.module_code]?.[perm]
                                                                                                || roleDetails.permissions[module.module_code]?.all
                                                                                                || roleDetails.permissions[application.application_code]?.all    
                                                                                            }
                                                                                            onChange={(e) => {handleModuleActionChange(module.module_code, perm, e.target.checked)}}
                                                                                            style={{marginRight: '20px'}}
                                                                                            disabled={!my_permissions.edit || loading || !myRoles?.[module.module_code]?.[perm]}
                                                                                        >
                                                                                            {perm}
                                                                                        </Checkbox>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        </InputWithLabel>
                                                                    ))
                                                                }
                                                            </div>
                                                        </InputWithLabel>
                                                    </Collapse.Panel>
                                                ))
                                            }
                                            </Collapse>
                                        </div>
                                </InputWithLabel>
                            </div>
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}


const masterModules = [
    {
        module_id: 1,
        module_name: 'Admin',
        module_code: 'ADMIN_FORM',
        types_of_permissions: {
            delete: true,
            save: true,
            edit: true,
            view: true,
            export: true,
        }
    },
    {
        module_id: 2,
        module_name: 'User',
        module_code: 'USER_FORM',
        types_of_permissions: {
            save: true,
            edit: true,
        }
    }
]