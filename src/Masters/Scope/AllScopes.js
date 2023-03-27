import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, scopeDeleteMessage } from '../../Constants';
import SearchComponent from '../GeneralComponents/SearchComponent';

/*
    :All scopes for a given org => selectedOrg.orgId

    State: 
        scopes: 
            [
                {
                    scope_id: 1,
                    scope_name: 'Test',
                }
                {...}
                {...}
            ]

    Table:
        - Id            // apikey => scope_id
        - Name          // apikey => scope_name
        - Edit          // Edit button => redirect to edit page (/edit/:scopeid)


*/

export default function AllScopes({
    selectedOrg,
    permissions={},

    editPath="/masters/scope/edit",
    addPath="/masters/scope/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [scopeTemplates, setScopeTemplates] = useState([]);
    const [loading, setLoading] = useState(true);


    const getTemplates = async () => {
        setLoading(true);
        /*
            This api expects the initial scope to be in the format of:
            res.data => scopes
            [
                {
                    scope_id: 1,
                    scope_name: 'Test',
                }
            ]
        */
        await axios.get('/admin-api/all_scope_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data);
                setScopeTemplates(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting templates');
            })
        setLoading(false);
    }

    useEffect(() => {
        getTemplates();
    }, [selectedOrg.orgId]);


    const handleDelete = async (scopeId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_scope', {
            params: {
                scope_id: scopeId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Scope deleted');
                getTemplates();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error deleting scope');
                }
                setLoading(false);
            })
        // setLoading(false);
    }

    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'scope_id',
            key: 'scope_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'scope_name',
            key: 'scope_name',
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Scope | ${record.scope_name}`}>
                        <Link to={`${editPath}/${record.scope_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.scope_name} <br /> {scopeDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.scope_id)} 
                        okText="Yes" 
                        cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Scope | ${record.scope_name}`}>
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
                <span className='my-form-title'>Scope</span>
                <Button type="primary" disabled={!permissions.add}>
                    <Link to={addPath}>
                        Add Scope
                    </Link>
                </Button>
            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={scopeTemplates}
                    setState={setScopeTemplates}
                    searchOptions={[
                        {keyName: 'scope_name', label: 'Name'},
                    ]}
                    // defaultSearchKeys={['scope_name']}
                />
            </div>
            <Table
                columns={columns}
                dataSource={scopeTemplates}
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
