import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import SearchComponent from '../GeneralComponents/SearchComponent';

export default function CopyCompanyData({
    selectedOrg,
    permissions={},

    errors={},
    details={},
    setDetailsKey=(key, value) => {alert("Set Details Key Method not defined")},
}) {
    const [selectOptions, setSelectOptions] = useState({
        // FOR NOW All severity and priorities are copied
        zoneGroups: [],
        // severities: [],
        // priorities: [],
        roles: [],
    });

    useEffect(() => {
        setDetailsKey('copy_tab_visited', true);
    }, []);

    const getZoneGroups = async () => {
        axios.get('/admin-api/all_master_zone_group')
            .then(res => {
                const data = res.data.data;

                setSelectOptions(prev => ({
                    ...prev,
                    zoneGroups: data.m_zone_groups,
                    // severities: data.m_severities,
                    // priorities: data.m_priorities,
                }));
                setDetailsKey('zone_groups', data.m_zone_groups.map(item => item.m_zone_group_id));
                // setDetailsKey('severities', data.m_severities.map(item => item.m_severity_id));
                // setDetailsKey('priorities', data.m_priorities.map(item => item.m_priority_id));
            })
            .catch(err => {
                console.log(err);
                message.error('Error in fetching zone groups');
            })
    }

    const getRoles = async () => {
        await axios.get('/admin-api/all_roles_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setSelectOptions(prev => ({
                    ...prev,
                    roles: data,
                }));
                setDetailsKey('roles', data.map(item => item.role_id));
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting roles');
            })
    }

    useEffect(() => {
        getZoneGroups();
        getRoles();
    }, []);

    const roleColumns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'role_id',
            key: 'role_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'role_name',
            key: 'role_name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        }
    ], [selectedOrg]).filter(col => !col.hidden);

    const zoneGroupColumns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'm_zone_group_id',
            key: 'm_zone_group_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'm_zone_group_name',
            key: 'm_zone_group_name',
        },
        {
            title: 'Priority',
            dataIndex: 'm_priority_name',
            key: 'm_priority_name',
        },
        {
            title: 'Severity',
            dataIndex: 'm_severity_name',
            key: 'm_severity_name',
        }
    ], [selectedOrg]).filter(col => !col.hidden);
    
    // FOR NOW All severity and priorities are copied
    // const severityColumns = useMemo(() => [
    //     {
    //         title: 'Id',
    //         dataIndex: 'm_severity_id',
    //         key: 'm_severity_id',
    //         width: '50px',
    //         hidden: window.location.hostname !== 'localhost',
    //     },
    //     {
    //         title: 'Name',
    //         dataIndex: 'm_severity_name',
    //         key: 'm_severity_name',
    //     },
    //     {
    //         title: 'Severity',
    //         dataIndex: 'severity_name',
    //         key: 'severity_name',
    //     },
    //     {
    //         title: 'Description',
    //         dataIndex: 'description',
    //         key: 'description',
    //     }
    // ], [selectedOrg]).filter(col => !col.hidden);

    // const priorityColumns = useMemo(() => [
    //     {
    //         title: 'Id',
    //         dataIndex: 'm_priority_id',
    //         key: 'm_priority_id',
    //         width: '50px',
    //         hidden: window.location.hostname !== 'localhost',
    //     },
    //     {
    //         title: 'Name',
    //         dataIndex: 'm_priority_name',
    //         key: 'm_priority_name',
    //     },
    //     {
    //         title: 'Interval',
    //         dataIndex: 'interval',
    //         key: 'interval',
    //     },
    //     {
    //         title: 'Description',
    //         dataIndex: 'description',
    //         key: 'description',
    //     }
    // ], [selectedOrg]).filter(col => !col.hidden);


    console.log(details);
    return (
        <div className='my-form-outer'>

            <div className='my-form-header'>
                <span className='my-form-title'>Zone Groups</span>
            </div>
            <Table
                columns={zoneGroupColumns}
                dataSource={selectOptions.zoneGroups}
                loading={selectOptions.zoneGroups.length === 0}
                size="small"
                pagination={false}
                rowSelection={{
                    onChange: (selectedRowKeys, selectedRows) => {
                        setDetailsKey('zone_groups', selectedRowKeys);
                    },
                    selectedRowKeys: details.zone_groups,
                }}
                rowKey='m_zone_group_id'
            />

            {/* <div className='my-form-header'>
                <span className='my-form-title'>Severity</span>
            </div>
            <Table
                columns={severityColumns}
                dataSource={selectOptions.severities}
                loading={selectOptions.severities.length === 0}
                size="small"
                pagination={false}
                rowSelection={{
                    onChange: (selectedRowKeys, selectedRows) => {
                        setDetailsKey('severities', selectedRowKeys);
                    },
                    selectedRowKeys: details.severities,
                }}
                rowKey='m_severity_id'
            />

            <div className='my-form-header'>
                <span className='my-form-title'>Priority</span>
            </div>
            <Table
                columns={priorityColumns}
                dataSource={selectOptions.priorities}
                loading={selectOptions.priorities.length === 0}
                size="small"
                pagination={false}
                rowSelection={{
                    onChange: (selectedRowKeys, selectedRows) => {
                        setDetailsKey('priorities', selectedRowKeys);
                    },
                    selectedRowKeys: details.priorities,
                }}
                rowKey='m_priority_id'

            /> */}

            <div className='my-form-header' style={{marginTop: '15px'}}>
                <span className='my-form-title'>Roles</span>
            </div>
            <Table
                columns={roleColumns}
                dataSource={selectOptions.roles}
                loading={selectOptions.roles.length === 0}
                size="small"
                // pagination={{
                //     position: ['bottomRight'],
                //     // position: ['topRight'],
                //     showSizeChanger: true,
                // }}
                pagination={false}
                rowSelection={{
                    // type: 'radio',
                    // selectedRowKeys: details.roles,
                    onChange: (selectedRowKeys, selectedRows) => {
                        setDetailsKey('roles', selectedRowKeys);
                    },
                    selectedRowKeys: details.roles,
                }}
                rowKey='role_id'

            />
        </div>
    )
}
