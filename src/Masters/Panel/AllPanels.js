import { Button, Collapse, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, panelDeleteMessage } from '../../Constants';
import ReaderByPanelId from './ReaderByPanelid';

// This is the data from '/admin-api/all_panels_by_o_id' 
// {
//     "data": [
//       {
//         "panel_id": 3,
//         "panel_code": "PAN003",
//         "panel_number": "10003",
//         "panel_name": "p003",
//         "region_id": 17,
//         "region_name": "Karnataka",
//         "area_id": 10,
//         "area_name": "Bangalore",
//         "site_id": 8,
//         "site_name": "Nagarbhavi",
//         "panel_type_id": 2,
//         "panel_type_name": "Mobile Application"
//       }
//     ]
//   }


export default function AllPanels({
    selectedOrg,
    permissions={},

    editPanelPath="/masters/panel/edit",
    addPanelPath="/masters/panel/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [panels, setPanels] = useState([]);
    const [loading, setLoading] = useState(true);

    const getPanels = async () => {
        setLoading(true);
        /*
            This api expects the initial panels to be in the format of:
            Check above documentation for the api
        */
        await axios.get('/admin-api/all_panels_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data);
                setPanels(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error in fetching panels');
            })

        setLoading(false);
    }

    useEffect(() => {
        getPanels();
    } , [selectedOrg.orgId]);


    const handleDelete = async (panelId, panelTypeGroupCode) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_panel', {
            params: {
                panel_id: panelId,
                panel_type_group_code: panelTypeGroupCode,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Panel deleted successfully');
                getPanels();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error in deleting panel');
                }
                setLoading(false);
            })
    }

    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'panel_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            render: (text, record) => `${record.panel_code} / ${record.panel_number} / ${record.panel_name}`,
        },
        {
            title: 'Location',
            render: (text, record) => `${record.region_name} / ${record.area_name} / ${record.site_name}`,
        },
        {
            title: 'Panel Type',
            render: (text, record) => `${record.panel_type_id} / ${record.panel_type_name}`,
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    {/* {console.log(record)} */}
                    <Button type={editButtonType} className='actions-button' title={`Edit Panel | ${record.panel_name}`}>
                        <Link to={`${editPanelPath}/${record.panel_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.panel_name} <br /> {panelDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.panel_id, record.m_panel_type_group_code)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Panel | ${record.panel_name}`}>
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
                <span className='my-form-title'>Panel</span>
                <Button type="primary" disabled={!permissions.add}>
                    <Link to={addPanelPath}>
                        Add Panel
                    </Link>
                </Button>
            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={panels}
                    setState={setPanels}
                    searchOptions={[
                        {keyName: 'panel_name', label: 'Panel Name'},
                        {keyName: 'panel_code', label: 'Panel Code'},
                        {keyName: 'panel_number', label: 'Panel Number'},
                        
                    ]}
                />
            </div>
            <Table
                columns={columns}
                dataSource={panels}
                loading={loading}
                size="small"
                pagination={{
                    position: ['bottomRight'],
                    showSizeChanger: true,
                }}
                rowKey="panel_id"

                expandable={{
                    expandedRowRender: record => (
                    <Collapse 
                        style={{marginLeft: '30px'}} 
                    >
                        <Collapse.Panel header={"Readers"} key="readers">
                            <ReaderByPanelId
                                editPanelPath={editPanelPath + `/${record.panel_id}`}

                                panelId={record.panel_id}
                                selectedOrg={selectedOrg}
                                permissions={permissions}
                                outerDivStyle={{marginLeft: '0px'}}
                            />
                        </Collapse.Panel>
                    </Collapse>
                    ),
                }}
            />
        </div>
    )
}
