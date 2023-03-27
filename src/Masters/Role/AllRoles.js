import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, roleDeleteMessage } from '../../Constants';

export default function AllRoles({
    selectedOrg,
    permissions={},
    
    editPath="/masters/role/edit",
    addPath="/masters/role/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [roleTemplates, setRoleTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    const getTemplates = async () => {
        setLoading(true);
        /*
            This api return format:
            res.data => roles
            [
                {
                    role_id: 1,
                    role_name: 'Test',
                    description: 'Test',
                    o_id: 1,
                }
            ]

        
        */
        await axios.get('/admin-api/all_roles_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;
                setMasterState(data);
                setRoleTemplates(data);
            })
            .catch(err => {
                console.log(err);
                setRoleTemplates([]);
                message.error('Error getting templates');
            })
        

        // Temporary fix for getting templates
        // setRoleTemplates([
        //     {
        //         role_id: 1,
        //         role_name: 'Admin',
        //         o_id: 1,
        //         description: 'Admin role',
        //     }
        // ]);
        
        setLoading(false);
    }


    const handleDelete = async (roleId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_role', {
            params: {
                role_id: roleId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Role deleted successfully');
                getTemplates();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error deleting role');
                }
                setLoading(false);
            })
        // setLoading(false);
    }


    const columns = useMemo(() => [
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
        },
        {
            width: '80px',
            title: 'Action',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Scope | ${record.role_name}`}>
                        <Link to={`${editPath}/${record.role_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.role_name} <br/> {roleDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.role_id)} 
                        okText="Yes" 
                        cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Scope | ${record.role_name}`}>
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </div>
            ),
            width: '150px'

        },
    ], [selectedOrg]).filter(column => !column.hidden);

    useEffect(() => {
        getTemplates();
    }, [selectedOrg.orgId]);




    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>Roles</span>
                <Button type="primary" disabled={!permissions.add}>
                    <Link to={addPath}>
                        Add Role
                    </Link>
                </Button>

            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={roleTemplates}
                    setState={setRoleTemplates}
                    searchOptions={[
                        {keyName: 'role_name', label: 'Name'},
                        {keyName: 'description', label: 'Description'},
                    ]}
                    // defaultSearchKeys={['role_name']}
                />
            </div>
            <Table
                columns={columns}
                dataSource={roleTemplates}
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
