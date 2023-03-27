import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { cameraDeleteMessage, deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType } from '../../Constants';

export default function CamerasByPanelId({
    editPanelPath="",           // This includes the panelId Eg : /panel/edit/123
    refreshData,                 // Int to refresh the data

    panelId,
    selectedOrg,
    permissions={},
    outerDivStyle={},
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    // Its an array of sites
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCameras = async () => {
        setLoading(true);
        await axios.get('/admin-api/all_cameras_by_panel_id', {
            params: {
                panel_id: panelId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data || []);
                setCameras(data || []);
            })
            .catch(err => {
                console.log(err);
                message.error('Error in fetching cameras');
            })
        setLoading(false);
    }

    useEffect(() => {
        getCameras();
    }, [panelId, refreshData]);


    const handleDelete = async (cameraId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_camera', {
            params: {
                camera_id: cameraId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Camera deleted successfully');
                getCameras();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error while deleting camera');
                }
                setLoading(false);
            })
    }

    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'camera_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'camera_name',
        },
        {
            title: 'Channel Number',
            dataIndex: 'channel_number',
            width: '150px',
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'RTSP URL',
            dataIndex: 'rtsp_link',
        },
        {
            title: 'IP Address',
            render: (text, record) => `${record.ip_address}:${record.http_port}`,
            width: '200px',
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Camera | ${record.camera_name}`}>
                        <Link to={`${editPanelPath}?editCamera=true&cameraId=${record.camera_id}&orgId=${selectedOrg.orgId}&tab=cameras`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.camera_name} <br /> {cameraDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.camera_id)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete} 
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Camera | ${record.camera_name}`} >
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </div>

            ),
            width: '150px',
        },
    ], [selectedOrg]).filter(column => !column.hidden);


    return (
        <div className='my-form-outer' style={outerDivStyle}>
            {/* <div className='my-form-header'>
                <span className='my-form-title'>Zone</span>
                
            </div> */}
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div>
                    <Button type="primary" disabled={!panelId} >
                        <Link to={`${editPanelPath}?addCamera=true&orgId=${selectedOrg.orgId}&tab=cameras`}>
                            Add Camera
                        </Link>
                    </Button>
                </div>
                <SearchComponent
                    masterState={masterState}
                    state={cameras}
                    setState={setCameras}
                    searchOptions={[
                        // {keyName: 'keyName', label: 'label'},
                        {keyName: 'camera_name', label: 'Name'},
                        {keyName: 'channel_number', label: 'Channel Number'},
                        {keyName: 'description', label: 'Description'},
                        {keyName: 'rtsp_link', label: 'RTSP URL'},
                    ]}
                    // defaultSearchKeys={['zone_group_name']}
                />
            </div>
            <Table
                columns={columns}
                dataSource={cameras}
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
