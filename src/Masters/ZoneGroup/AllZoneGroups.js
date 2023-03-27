import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, zoneGroupDeleteMessage } from '../../Constants';

/*
    :All zonegroup for a given org => selectedOrg.orgId

    State: 
        zonegroup: 
            [
                {
                    "zone_group_id": 128,
                    "zone_group_name": "Smoke",
                    "priority_group_id": 13,
                    "priority_group_name": "Priority 1",
                    "severity_group_id": 13,
                    "severity_group_name": "Severity 1",
                    "description": null,
                    "comments": null
                },
                {...}
                {...}
            ]

    Table:
        - Id            // apikey => zone_group_id
        - ZoneGroup Name	          // apikey => zone_group_name
        - Priority Group Name	// apikey => priority_group_name
        - Severity Group Name	// apikey => severity_group_name
        - Description    // apikey => description
        - Comments     // apikey => comments
        - Edit          // Edit button => redirect to edit page (/edit/:z_g_id)


*/

export default function AllZoneGroups({
    selectedOrg,
    permissions={},

    editPath="/masters/zone-group/edit",
    addPath="/masters/zone-group/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [zoneGroups, setZoneGroups] = useState([]);
    const [loading, setLoading] = useState(true);


    const getZoneGroups = async () => {
        setLoading(true);
        /*
            This api expects the initial scope to be in the format of:
            res.data => scopes
            [
                {
                    "zone_group_id": 128,
                    "zone_group_name": "Smoke",
                    "priority_group_id": 13,
                    "priority_group_name": "Priority 1",
                    "severity_group_id": 13,
                    "severity_group_name": "Severity 1",
                    "description": null,
                    "comments": null
                },
            ]
        */
        await axios.get('/admin-api/all_zone_group_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data);
                setZoneGroups(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting templates');
            })
        setLoading(false);
    }

    useEffect(() => {
        getZoneGroups();
    }, [selectedOrg.orgId]);

    const handleDelete = async (zone_group_id) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_zone_group', {
            params: {
                zone_group_id: zone_group_id,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Deleted successfully');
                getZoneGroups();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error deleting Zone group');
                }
                setLoading(false);
            })
        // setLoading(false);
    }

    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'zone_group_id',
            key: 'zone_group_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Zone group Name',
            dataIndex: 'zone_group_name',
            key: 'zone_group_name',
        },
        {
            title: 'Priority',
            dataIndex: 'priority_group_name',
            key: 'priority_group_name',
        },
        {
            title: ' Severity',
            dataIndex: 'severity_group_name',
            key: 'severity_group_name',
        },
        {
            title: ' Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: ' Comments',
            dataIndex: 'comments',
            key: 'comments',
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Zone Group | ${record.zone_group_name}`}>
                        <Link to={`${editPath}/${record.zone_group_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.zone_group_name} <br /> {zoneGroupDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.zone_group_id)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Zone Group | ${record.zone_group_name}`}>
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </div>
            ),
            width: '150px'

        }
    ], [selectedOrg]).filter(column => !column.hidden);
        

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>ZoneGroup</span>
                <Button type="primary" disabled={!permissions.add}>
                    <Link to={addPath}>
                        Add ZoneGroup
                    </Link>
                </Button>
            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={zoneGroups}
                    setState={setZoneGroups}
                    searchOptions={[
                        {keyName: 'zone_group_name', label: 'ZoneGroup'},
                        {keyName:'priority_group_name', label:'Priority'},
                        {keyName:'severity_group_name', label:'Severity'},
                        {keyName:'description', label:'Description'},
                        {keyName:'comments', label:'Comments'},
                    ]}
                    // defaultSearchKeys={['zone_group_name']}
                />
            </div>
            <Table
                columns={columns}
                dataSource={zoneGroups}
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
