import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, priorityDeleteMessage } from '../../Constants';


/*
    :All priority for a given org => selectedOrg.orgId

    State:
        priorities:
            [
                {
                    "priority_group_id": 181,
                    "priority_group_name": "Priority 1",
                    "priority_group_interval": 1,
                    "m_priority_id": 1,
                    "o_id": 254,
                    "is_active": 1,
                    "is_deleted": 0,
                    "comments": null,
                    "description": null,
                    "created_time": "2019-07-16T19:52:40",
                    "updated_time": "2019-07-16T19:52:40",
                    "created_by": 14,
                    "updated_by": 14
                },
                {...}
                {...}
            ]
*/

export default function AllPriorities({
    selectedOrg,
    permissions={},

    editPath="/masters/priority/edit",
    addPath="/masters/priority/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [priorities, setPriorities] = useState([]);
    const [loading, setLoading] = useState(true);

    const getPriorities = async () => {
        setLoading(true);
        /*
            This api expects the initial scope to be in the format of:
            Check above documentation for the api
        */
        await axios.get('/admin-api/all_priority_by_o_id', {
                params: {
                    o_id: selectedOrg.orgId,
                }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data);
                setPriorities(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error while fetching priorities');
            })
        setLoading(false);                
    }

    useEffect(() => {
        getPriorities();
    } , [selectedOrg.orgId]);


    const handleDelete = async (priorityId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_priority_group', {
            params: {
                priority_group_id: priorityId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Priority deleted successfully');
                getPriorities();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error while deleting priority');
                }
                setLoading(false);
            })
    }



    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'priority_group_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'priority_group_name',
        },
        {
            title: 'Interval',
            dataIndex: 'priority_group_interval',
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Comments',
            dataIndex: 'comments',
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Priority | ${record.priority_group_name}`}>
                        <Link to={`${editPath}/${record.priority_group_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.priority_group_name} <br /> {priorityDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.priority_group_id)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Priority | ${record.priority_group_name}`}>
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </div>

            ),
            width: '80px',
        },
    ], [selectedOrg]).filter(column => !column.hidden);


    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>Priority</span>
                <Button type="primary" disabled={!permissions.add}>
                    <Link to={addPath}>
                        Add Priority
                    </Link>
                </Button>
            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={priorities}
                    setState={setPriorities}
                    searchOptions={[
                        // {keyName: 'keyName', label: 'label'},
                        {keyName: 'priority_group_name', label: 'Name'},
                        {keyName: 'priority_group_interval', label: 'Interval'},
                        {keyName: 'description', label: 'Description'},
                        {keyName: 'comments', label: 'Comments'},
                    ]}
                    // defaultSearchKeys={['zone_group_name']}
                />
            </div>
            <Table
                columns={columns}
                dataSource={priorities}
                loading={loading}
                size="small"
                pagination={{
                    position: ['bottomRight'],
                    // position: ['topRight'],
                    showSizeChanger: true,
                }}
            />
        </div>
    )
}
