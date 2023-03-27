import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, readerDeleteMessage } from '../../Constants';

/*
    All Readers for a Panel

    state:              // TODO: Check This and remove unecessary fields
        readers: [
            {
                "reader_code": "R002",
                "application_id": 2,
                "sz_id": 18,
                "panel_id": 3,
                "updated_time": "2022-12-08T11:35:13",
                "last_scanned": "2022-12-08T11:35:15",
                "is_active": 1,
                "o_id": 3,
                "reader_id": 3,
                "reader_no": 5678,
                "reader_name": "POS Reader",
                "site_id": 8,
                "created_time": "2022-12-08T11:35:09",
                "gps_location_details": null,
                "is_deleted": 0
            }
        ]
*/


export default function ReaderByPanelId({
    editPanelPath = "",           // This includes the panelId Eg : /panel/edit/123
    refreshData,                 // Int to refresh the data

    panelId,
    selectedOrg,
    permissions = {},
    outerDivStyle = {},

    showActions = true,
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    // Its an array of sites

    const [readers, setReaders] = useState([]);
    const [loading, setLoading] = useState(true);

    const getReaders = async () => {
        setLoading(true);
        await axios.get('/admin-api/reader_by_panel_id', {
            params: {
                panel_id: panelId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data || []);
                setReaders(data || []);
            })
            .catch(err => {
                console.log(err);
                message.error('Error in fetching Readers');
            })

        setLoading(false);
    }





    useEffect(() => {
        getReaders();
    }, [panelId, refreshData]);

    const handleDelete = async (readerId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_reader', {
            params: {
                reader_id: readerId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Reader deleted successfully');
                getReaders();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error in deleting Reader');
                }
                setLoading(false);
            })
    }



    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'reader_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'reader_name',
        },
        {
            title: 'Reader Number',
            dataIndex: 'reader_no',
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Reader | ${record.reader_name}`}>
                        <Link to={`${editPanelPath}?editReader=true&readerId=${record.reader_id}&orgId=${selectedOrg.orgId}&tab=reader`}>
                            {editButtonTitle}
                        </Link>

                    </Button>
                    <Popconfirm
                        overlayClassName='delete-popconfirm'
                        title={<>{record.reader_name} <br /> {readerDeleteMessage}</>}
                        onConfirm={() => handleDelete(record.reader_id)}
                        okText="Yes" cancelText="No"
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Reader | ${record.reader_name}`}>
                            {deleteButtonTitle}
                        </Button>

                    </Popconfirm>
                </div>
            ),
            width: '250px',
            hidden: !showActions,
        },
    ], [selectedOrg]).filter(column => !column.hidden);

    return (
        <div className='my-form-outer' style={outerDivStyle}>
            <div style={{ display: 'inline-flex', justifyContent: 'space-between', width: '100%' }}>
                <div>
                    {showActions &&
                        <Button type="primary" disabled={!panelId} >
                            <Link to={`${editPanelPath}?addReader=true&orgId=${selectedOrg.orgId}&tab=reader`}>
                                Add Reader
                            </Link>
                        </Button>
                    }
                </div>
                <SearchComponent
                    masterState={masterState}
                    state={readers}
                    setState={setReaders}
                    searchOptions={[
                        // {keyName: 'keyName', label: 'label'},
                        { keyName: 'reader_name', label: 'Reader Name' },
                        { keyName: 'reader_no', label: 'Reader Number' },
                    ]}
                />
            </div>
            <Table
                columns={columns}
                dataSource={readers}
                loading={loading}
                size="small"
                pagination={{
                    position: ['bottomRight'],
                    showSizeChanger: true,
                }}
            />
        </div>
    )
}

