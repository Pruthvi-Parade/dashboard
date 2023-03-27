import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, deleteCompanyMessage, deleteVendorMessage, editButtonTitle, editButtonType } from '../../Constants';


/*
    Edit and Add Company
        if isAddNew = true then post else put
    
    orgTypeId => orgTypeName                  // 2 => Agency / 3 => Company / 4 => Vendor

    state:
        orgs => [
            {
                o_id: 1,
                o_type: 2 | 3 | 4,
                o_name: 'ICICI | 'Kotak', 
                o_code: 'COM123' | AGN123 | VEN123

                e_firstname: 'John',
                e_lastname: 'Doe',
                e_email: 'email',
                e_contact_no: 'phone',
                e_designation: 'designation',
            }
        ]
*/

export default function AllOrgs({
    selectedOrg,
    permissions={},

    orgTypeId=3,                        // refer Docs above (These are defaults)
    orgTypeName='Company',
    editPath="/masters/company/edit",
    addPath="/masters/company/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);


    const getOrgs = async () => {
        setLoading(true);
        // await
        await axios.get('/admin-api/all_org_child_by_org_id', {
            params: {
                o_id: selectedOrg.orgId,
                o_type: orgTypeId,
            }
        })
            .then(res => {
                const data = res.data.data;
                setMasterState(data);
                setOrgs(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error getting orgs');
            })

        setLoading(false);
    }


    const handleDeleteOrg = async (orgId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_org', {
            params: {
                o_id: orgId,
                o_type: orgTypeId,
            }
        })
            .then(res => {
                message.success('Org deleted successfully');
                getOrgs();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error deleting org');
                }
                setLoading(false);
            })
        // setLoading(false);
    }


    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'o_id',
            key: 'o_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            render: (text, record) => (
                <span>
                    {record.o_code} / {record.o_name}
                </span>
            ),
        },
        {
            title: 'Employee Name',
            render: (text, record) => (
                <span>
                    {record.e_firstname} {record.e_lastname}
                </span>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'e_email',
        },
        {
            title: 'Contact Number',
            dataIndex: 'contact_no',
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit ${orgTypeName} | ${record.o_name}`}>
                        <Link to={`${editPath}/${record.o_id}`} >
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.o_name} <br /> {orgTypeId === 3 ? deleteCompanyMessage : deleteVendorMessage}</>} 
                        onConfirm={() => handleDeleteOrg(record.o_id)}
                        okText="Yes" 
                        cancelText="No" 
                        disabled={!permissions.delete || selectedOrg.orgId === record.o_id}
                    >
                        <Button 
                            danger 
                            type={deleteButtonType} 
                            disabled={!permissions.delete || selectedOrg.orgId === record.o_id} 
                            className='actions-button' 
                            title={`Delete ${orgTypeName} | ${record.o_name}`}
                        >
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </div>
            ),
            width: '150px'

        },
    ], [selectedOrg]).filter(column => !column.hidden);

    useEffect(() => {
        getOrgs();
    }, [selectedOrg.orgId]);

    
    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>{orgTypeName}</span>
                    <Button 
                        type="primary" 
                        disabled={!permissions.add 
                            // If it is company form and the selected org is also company then disable it
                            || (orgTypeId === 3 && selectedOrg.orgTypeId === 3) 
                            // If it is vendor form and the selected org is agency then disable it
                            || (orgTypeId === 4 && selectedOrg.orgTypeId === 2)
                        }
                    >
                        <Link to={addPath}>
                            Add {orgTypeName}
                        </Link>
                    </Button>
            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={orgs}
                    setState={setOrgs}
                    searchOptions={[
                        {keyName: 'o_name', label: 'Name'},
                        {keyName: 'o_code', label: 'Code'},
                    ]}
                    defaultSearchKeys={['o_name', 'o_code']}
                />
            </div>
            <Table
                columns={columns}
                dataSource={orgs}
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
