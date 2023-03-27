import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, deleteUserMessage, editButtonTitle, editButtonType } from '../../Constants';

export default function AllUsers({
    selectedOrg,
    permissions={},

    editPath="/masters/user/edit",
    addPath="/masters/user/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const getusers = async () => {
        setLoading(true);
        /*
            This api expects array of users:
            [
                {
                    contact_no: "Contact 1"
                    e_email: "email1"
                    e_firstname: "Shlok"
                    e_id: 2918
                    e_lastname: "Zanwar"
                    role_id: 5
                    role_name: "NEW ROLE"
                    scope_id: 20
                    scope_name: "Heyyyy"
                    user_id: 17
                    username: "shlok"
                }
            ]
        
        */
        await axios.get('/admin-api/all_employee_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data);
                setUsers(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting users');
            })

        setLoading(false);
    }

    useEffect(() => {
        getusers();
    }, [selectedOrg.orgId]);


    const handleDeleteUser = async (user) => {
        setLoading(true);
        console.log(localStorage.getItem('AdminToken'));
        await axios.delete('/admin-api/delete_employee', {
            params: {
                // e_id: user.e_id,
                e_id: user,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('User deleted successfully');
                getusers();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error deleting user');
                }
                setLoading(false);
            })
        // setLoading(false);
    }


    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'e_id',
            key: 'e_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            render: (text, record) => (
                <span>
                    {record.e_firstname} {record.e_lastname}
                </span>
            )
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'e_email',   
            key: 'e_email',
        },
        {
            title: 'Phone',
            dataIndex: 'contact_no',
            key: 'contact_no',
        },
        {
            title: 'Role',
            dataIndex: 'role_name',
        },
        {
            title: 'Scope',
            dataIndex: 'scope_name',  
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit User | ${record.e_firstname} ${record.e_lastname}`}>
                        <Link to={`${editPath}/${record.e_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.e_firstname} {record.e_lastname} <br /> {deleteUserMessage}</>} 
                        onConfirm={() => handleDeleteUser(record.e_id)} 
                        okText="Yes" 
                        cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete User | ${record.e_firstname} ${record.e_lastname}`}>
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
                <span className='my-form-title'>Users</span>
                <Button type="primary" disabled={!permissions.add}>
                    <Link to={addPath}>
                        Add New User
                    </Link>
                </Button>
            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={users}
                    setState={setUsers}
                    searchOptions={[
                        {keyName: 'e_firstname', label: 'First Name'},
                        {keyName: 'e_lastname', label: 'Last Name'},
                        {keyName: 'username', label: 'Username'},
                        {keyName: 'e_email', label: 'Email'},
                        {keyName: 'contact_no', label: 'Phone'},
                        {keyName: 'role_name', label: 'Role'},
                        {keyName: 'scope_name', label: 'Scope'},
                    ]}
                />
            </div>
            <Table
                columns={columns}
                dataSource={users}
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
