import { Button, Input, message, Select } from 'antd'
import axios from 'axios';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { InputWithLabel } from '../../Components/Components'
import SearchComponent from './SearchComponent';



/*
    This funtion has two imp parameters

    user: {
        user_id: 0,
        role_id: 0,
        scope_id: 0,

        username: '',
        password: '',
    }

    setUser will passin
        first parameter as :
            one of the above key and
        second parameter as:
            value of that key
*/
export default function UserLoginDetails({
    user={},
    setUserDetailsKey=(key, value) => {alert("Set UserLoginDetails Key Method not defined")},
    selectedOrg={},
    isAddNew,

    errors={},
}) {
    // TODO: FIX Roles list is Empty

    const [selectOptions, setSelectOptions] = useState({
        roles: [],
        scopes: [],
        panelList:[],
    });
    const getSelectOptions = async () => {
        axios.get('/admin-api/all_roles_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                // console.log(res.data);
                setSelectOptions(curr => ({
                    ...curr,
                    roles: data,
                }));
                if(isAddNew && !user.role_id && data.length > 0) {
                    setUserDetailsKey("role_id", data[0].role_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting roles');
            });

        axios.get('/admin-api/all_scope_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setSelectOptions(curr => ({
                    ...curr,
                    scopes: data,
                }));
                if(isAddNew && !user.scope_id && data.length > 0) {
                    setUserDetailsKey("scope_id", data[0].scope_id);
                }
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting scopes');
            })

        // Fetch All panels under the Organisation
        // {
        //     "data": [
        //       {
        //         "panel_id": 5,
        //         "panel_code": "pan001",
        //         "panel_number": "PAN001",
        //         "panel_name": "pan001",
        //         "region_id": 18,
        //         "region_name": "Maharashtra",
        //         "area_id": 11,
        //         "area_name": "Pune",
        //         "site_id": 9,
        //         "site_name": "Swargate",
        //         "panel_type_id": 1,
        //         "panel_type_name": "Gateway",
        //         "readers": []
        //       },
        //       {
        //         "panel_id": 6,
        //         "panel_code": "PAN050",
        //         "panel_number": "1000012",
        //         "panel_name": "TestPanelAdd",
        //         "region_id": 18,
        //         "region_name": "Maharashtra",
        //         "area_id": 11,
        //         "area_name": "Pune",
        //         "site_id": 9,
        //         "site_name": "Swargate",
        //         "panel_type_id": 2,
        //         "panel_type_name": "Mobile Application",
        //       }
        //     ]
        //   }
        axios.get('/admin-api/all_panels_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setSelectOptions(curr =>({
                    ...curr,
                    panelList: data,
                }));

            })
            .catch(err => {

            })
    }

    const handleSelectAllPanelIds = (e) => {
        setUserDetailsKey({
            ...user,
            panel_group_ids: selectOptions.panelList.length !== user.panel_group_ids.length ? selectOptions.panelList.map(pL => pL.panel_id) : [],
        })
    }
    useEffect(() => {
        getSelectOptions();
    }, []);

    // useEffect(() => {
    //     console.log(selectOptions);
    // }, [selectOptions])

    return (
        <>
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Username" error={errors.username} reqMark={true}>
                <Input
                    value={user?.username}
                    className="my-form-input"
                    onChange={(e) => {setUserDetailsKey('username', e.target.value)}}
                    status={errors?.username?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
            <InputWithLabel label="Password" error={errors.password} reqMark={true}>
                <Input.Password
                    type="password"
                    value={user?.password}
                    className="my-form-input"
                    onChange={(e) => {setUserDetailsKey('password', e.target.value)}}
                    status={errors?.password?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
        </div>
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Role" error={errors.role_id} reqMark={true}>
                <Select
                    value={user?.role_id}
                    className="my-form-input"
                    onChange={(e) => {setUserDetailsKey('role_id', e)}}
                    loading={selectOptions.roles.length === 0}
                    status={errors?.role_id?.errors?.[0]?.msg && "error"}
                >
                    {selectOptions.roles.map((role) => (
                        <Select.Option value={role.role_id}>{role.role_name}</Select.Option>
                    ))}
                </Select>
            </InputWithLabel>
            <InputWithLabel label="Scope" error={errors.scope_id} reqMark={true}>
                <Select
                    value={user?.scope_id}
                    className="my-form-input"
                    onChange={(e) => {setUserDetailsKey('scope_id', e)}}
                    loading={selectOptions.scopes.length === 0}
                    status={errors?.scope_id?.errors?.[0]?.msg && "error"}
                >
                    {selectOptions.scopes.map((scope) => (
                        <Select.Option value={scope.scope_id}>{scope.scope_name}</Select.Option>
                    ))}
                </Select>
            </InputWithLabel>
            <InputWithLabel label={<>&nbsp;</>}>
                <Button 
                    onClick={handleSelectAllPanelIds}
                    type={selectOptions.panelList.length === user.panel_group_ids.length ? "danger" : "primary"}
                >
                    {selectOptions.panelList.length === user.panel_group_ids.length ? "Unselect All" : "Select All"}
                </Button>
            </InputWithLabel>
            <InputWithLabel label={`Assign panel`} divStyle={{width: '30%'}}>
                <Select
                    value={user.panel_group_ids}
                    mode="multiple"
                    onChange={(value) => {
                        setUserDetailsKey('panel_group_ids', value);
                    }}
                    showSearch
                    filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    loading={selectOptions.panelList.length === 0}
                    style={{ width: '100%' }}
                >
                    {selectOptions.panelList && selectOptions.panelList.map(item => (
                        <Select.Option key={item.panel_id} value={item.panel_id} name={`${item.panel_id} - ${item.panel_name}`}>
                            {item.panel_name}
                        </Select.Option>
                    ))}
                </Select>
            </InputWithLabel>
        </div>
        </>
    )
}
