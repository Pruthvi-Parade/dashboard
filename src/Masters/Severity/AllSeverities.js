import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, severityDeleteMessage } from '../../Constants';


/*
    :All severity for a given org => selectedOrg.orgId

    State:
        severities:
            [
                 {
					"severity_group_id": 181,
					"severity_group_name": "Severity 1",
					"severity_group_type": 1,
					"severity_name": "High",
					"description": null,
					"comments": null
				},
                {...}
                {...}
            ]
*/

export default function AllSeverities({
    selectedOrg,
    permissions={},

	editPath="/masters/severity/edit",
	addPath="/masters/severity/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [severities, setSeverities] = useState([]);
    const [loading, setLoading] = useState(true);

    const getSeverities = async () => {
        setLoading(true);
        /*
            This api expects the initial scope to be in the format of:
            Check above documentation for the api
        */
        await axios.get('/admin-api/all_severity_by_o_id', {
                params: {
                    o_id: selectedOrg.orgId,
                }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data);
                setSeverities(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error while fetching severities');
            })
        setLoading(false);                
    }

    useEffect(() => {
        getSeverities();
    } , [selectedOrg.orgId]);


    const handleDelete = async (severity_group_id) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_severity_group', {
            params: {
                severity_group_id: severity_group_id,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Severity deleted successfully');
                getSeverities();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error while deleting severity');
                }
                setLoading(false);
            })
    }


    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'severity_group_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'severity_group_name',
        },
        {
            title: 'Severity Name',
            dataIndex: 'severity_name',
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
                    <Button type={editButtonType} className='actions-button' title={`Edit Severity | ${record.severity_group_name}`}>
                        <Link to={`${editPath}/${record.severity_group_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.severity_group_name} <br /> {severityDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.severity_group_id)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Severity | ${record.severity_group_name}`}>
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </div>
            ),
			width: '150px',
        },
    ], [selectedOrg]).filter(column => !column.hidden);


    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>Severity Group</span>
                <Button type="primary">
                    <Link to={addPath} disabled={!permissions.add}>
                        Add Severity Group
                    </Link>
                </Button>
            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={severities}
                    setState={setSeverities}
                    searchOptions={[
                        // {keyName: 'keyName', label: 'label'},
                        {keyName: 'severity_group_name', label: 'Name'},
                        {keyName: 'severity_name', label: 'Severity'},
                        {keyName: 'description', label: 'Description'},
                        {keyName: 'comments', label: 'Comments'},
                    ]}
                    // defaultSearchKeys={['zone_group_name']}
                />
            </div>
            <Table
                columns={columns}
                dataSource={severities}
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
