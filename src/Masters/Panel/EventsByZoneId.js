import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, eventDeleteMessage } from '../../Constants';


// For documetation refer to ZonesByPanelId.js
export default function EventsByZoneId({
    editPanelPath="",
    getZones=()=>{},

    loading,
    setLoading,

    zoneEvents=[],
    zoneName,
    
    panelId,
    zoneId,
    selectedOrg,
    permissions={},
    divStyle={},
    showActions=true,
}) {

    const handleDelete = async (eventId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_zone_event', {
            params: {
                zone_event_id: eventId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Event deleted successfully');
                getZones();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error in deleting event');
                }
                setLoading(false);
            })
    }


    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'zone_event_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'event_name',
        },
        {
            title: 'Event Code',
            dataIndex: 'event_code',
        },
        {
            title: "Priority",
            dataIndex: 'priority_group_name',
        },
        {
            title: "Severity",
            dataIndex: 'severity_group_name',
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Event | ${record.event_name}`}>
                        <Link to={`${editPanelPath}?editEvent=true&zoneId=${zoneId}&zoneName=${zoneName}&eventId=${record.zone_event_id}&orgId=${selectedOrg.orgId}&tab=zones`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.event_name} <br /> {eventDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.zone_event_id)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Event | ${record.event_name}`}>
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>


                </div>
            ),
            width: '150px',
            hidden: !showActions,
        },
    ], [selectedOrg]).filter(column => !column.hidden);

    return (
        <div className='my-form-outer' style={{...divStyle}}>
            {/* <div className='my-form-header'>
                <span className='my-form-title'>Zone</span>
                <Button type="primary" >
                    <Link to={addPath}>
                        Add Zone
                    </Link>
                </Button>
            </div> */}
            <Table
                columns={columns}
                dataSource={zoneEvents}
                loading={loading}
                size="small"
                pagination={false}
                // pagination={{
                //     position: ['bottomRight'],
                //     // position: ['topRight'],
                //     showSizeChanger: true,
                // }}
                rowKey="zone_event_id"
            />
        </div>
    )

}
