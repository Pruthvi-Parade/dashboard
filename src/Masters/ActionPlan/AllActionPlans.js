import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { actionPlanDeleteMessage, deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType } from '../../Constants';

/*
    ActionPlan

    state:
        actionPlans => [
            {
                action_plan_id: 1,
                action_plan_name: 'Action Plan 1',
                description: 'Action Plan 1 Description',
                comments: 'Action Plan 1 Comments',
                zone_groups: [
                    {
                        zone_group_id: 1,
                        zone_group_name: 'Zone Group 1',
                    }
                ]
            }
        ]

*/

export default function AllActionPlans({
    selectedOrg,
    permissions={},

    editPath="/masters/action-plan/edit",
    addPath="/masters/action-plan/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [actionPlans, setActionPlans] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const getActionPlans = async () => {
        setLoading(true);
        /*
            This api expects array of users:
            [
                {
                    action_plan_id: 1,
                    action_plan_name: 'Action Plan 1',
                    description: 'Action Plan 1 Description',
                    comments: 'Action Plan 1 Comments',
                    zone_groups: [
                        {
                            zone_group_id: 1,
                            zone_group_name: 'Zone Group 1',
                        }
                    ]
                }
            ]
        */
        await axios.get('/admin-api/all_action_plans_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                
                setMasterState(data);
                setActionPlans(data);
            }).catch(err => {
                console.log(err);
                message.error('Error getting action plans');
            })

        setLoading(false);
    }

    useEffect(() => {
        getActionPlans();
    } , [selectedOrg.orgId]);


    const handleDelete = async (actionPlanId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_action_plan', {
            params: {
                action_plan_id: actionPlanId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Action Plan deleted');
                getActionPlans();
            })
            .catch(err => {
                console.log(err);
                message.error('Error deleting action plan');
                setLoading(false);
            })
        // setLoading(false);
    }


    const columns = React.useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'action_plan_id',
            key: 'action_plan_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'action_plan_name',
            key: 'action_plan_name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Comments',
            dataIndex: 'comments',
            key: 'comments',
        },
        {
            title: 'Assigned to',
            dataIndex: 'assigned_to',
            key: 'assigned_to',
            // Render zone groups comma separated
            render: (text, record) => (
                text.map(location => `${location.m_location_name}: ${location.location_name}`).join(' | ')
            ),
            ellipsis: true,
            width: '350px'
        },
        {
            title: 'Zone Groups',
            dataIndex: 'zone_groups',
            key: 'zone_groups',
            // Render zone groups comma separated
            render: (text, record) => (
                text.map(zoneGroup => zoneGroup.zone_group_name).join(', ')
            ),
            ellipsis: true,
            width: '20%'
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Action Plan | ${record.action_plan_name}`}>
                        <Link to={`${editPath}/${record.action_plan_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.action_plan_name} <br/> {actionPlanDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.action_plan_id)} 
                        okText="Yes" 
                        cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Action Plan | ${record.action_plan_name}`}>
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </div>
            ),
            width: '150px'

        },
    ], [selectedOrg]).filter(column => !column.hidden);
                

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>Action Plan</span>
                    <Button type="primary" disabled={!permissions.add}>
                        <Link to={addPath}>
                            Add Action Plan
                        </Link>
                    </Button>
            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={actionPlans}
                    setState={setActionPlans}
                    searchOptions={[
                        {keyName: 'action_plan_name', label: 'Name'},
                        {keyName: 'description', label: 'Description'},
                        {keyName: 'comments', label: 'Comments'},
                        // {keyName: 'zone_groups', label: 'Zone Groups'},
                    ]}
                />
            </div>
            <div style={{position: 'relative', textAlign: 'right'}}>
                {/* {masterState.length > 0 && 
                    <SearchComponent
                        masterState={masterState}
                        state={actionPlans}
                        setState={setActionPlans}
                        searchOptions={[
                            {keyName: 'action_plan_name', label: 'Name'},
                            {keyName: 'description', label: 'Description'},
                            {keyName: 'comments', label: 'Comments'},
                        ]}
                    />
                } */}
                <Table
                    columns={columns}
                    dataSource={actionPlans}
                    loading={loading}
                    size="small"
                    pagination={{
                        position: ['bottomRight'],
                        // position: ['topRight'],
                        showSizeChanger: true,
                    }}
                />
            </div>
        </div>
    )
}
