import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import EventsByZoneId from './EventsByZoneId';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, zoneDeleteMessage } from '../../Constants';

/*
    All Zones for a Panel

    state:              // TODO: Check This and remove unecessary fields
        zones: [
            {
                "action_plan_id": null,
                "last_occurred_time": null,
                "zone_group_id": null,
                "comments": null,
                "is_active": 1,
                "mode": 20,
                "panel_id": 237,
                "status_id": 9,
                "o_id": 254,
                "is_deleted": 0,
                "group_id": 1575,
                "site_id": 220,
                "serial_number": "ACM001",
                "created_by": 14,
                "area_id": 111,
                "physical_status_id": 26,
                "created_time": "2019-07-19T13:13:43",
                "region_id": 73,
                "physical_number": null,
                "updated_by": 14,
                "zone_id": 3349,
                "zone_template_id": null,
                "last_event_occurred_time": "2022-04-16T16:04:18",
                "zone_name": "AC Mains",
                "updated_time": "2020-01-24T12:31:00",
                "description": null,

                zone_events: [
                    {
                        "action_plan_id": 141,
                        "status_id": 12,
                        "zone_id": 3349,
                        "updated_time": "2020-01-24T12:31:00",
                        "is_actionable": 1,
                        "contact_info": 0,
                        "description": null,
                        "event_name": "AC Mains Fail",
                        "o_id": 254,
                        "generate_ticket": 0,
                        "event_code": "NBA001",
                        "comments": null,
                        "is_active": 1,
                        "autogenerate_action_plan": 1,
                        "delay_time": 0,
                        "priority_template_id": 182,
                        "is_deleted": 0,
                        "severity_template_id": 182,
                        "zone_event_template_id": 0,
                        "zone_event_id": 8286,
                        "created_by": 14,
                        "panel_id": 237,
                        "event_type_id": 19,
                        "created_time": "2019-07-19T13:13:43",
                        "updated_by": 14
                    },
                ]
            }
        ]
*/
export default function ZonesByPanelId({
    editPanelPath="",           // This includes the panelId Eg : /panel/edit/123
    refreshData,                 // Int to refresh the data

    panelId,
    selectedOrg,
    permissions={},
    outerDivStyle={},

    showActions=true,
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    // Its an array of sites
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);

    const getZones = async () => {
        setLoading(true);
        await axios.get('/admin-api/all_zones_by_panel_id', {
            params: {
                panel_id: panelId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setMasterState(data || []);
                setZones(data || []);
            })
            .catch(err => {
                console.log(err);
                message.error('Error in fetching zones');
            })

        setLoading(false);
    }

    useEffect(() => {
        getZones();
    }, [panelId, refreshData]);

    const handleDelete = async (zoneId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_zone', {
            params: {
                zone_id: zoneId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                message.success('Zone deleted successfully');
                getZones();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error in deleting zone');
                }
                setLoading(false);
            })
    }



    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'zone_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'zone_name',
        },
        {
            title: 'Zone Number',
            dataIndex: 'serial_number',
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type="primary" style={{marginLeft: '10px'}}>
                        <Link to={`${editPanelPath}?addEvent=true&zoneId=${record.zone_id}&zoneName=${record.zone_name}&orgId=${selectedOrg.orgId}&tab=zones`}>
                            {/* <MdOutlineEdit /> */}
                            Add Event
                        </Link>
                    </Button>
                    <Button type={editButtonType} className='actions-button' title={`Edit Zone | ${record.zone_name}`}>
                        <Link to={`${editPanelPath}?editZone=true&zoneId=${record.zone_id}&orgId=${selectedOrg.orgId}&tab=zones`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.zone_name} <br /> {zoneDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.zone_id)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Zone | ${record.zone_name}`}>
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
            {/* <div className='my-form-header'>
                <span className='my-form-title'>Zone</span>
                
            </div> */}
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div>
                    {showActions &&
                    <Button type="primary" disabled={!panelId} >
                        <Link to={`${editPanelPath}?addZone=true&orgId=${selectedOrg.orgId}&tab=zones`}>
                            Add Zone
                        </Link>
                    </Button>
                    }
                </div>
                <SearchComponent
                    masterState={masterState}
                    state={zones}
                    setState={setZones}
                    searchOptions={[
                        // {keyName: 'keyName', label: 'label'},
                        {keyName: 'zone_name', label: 'Zone Name'},
                        {keyName: 'serial_number', label: 'Zone Number'},
                    ]}
                    // defaultSearchKeys={['zone_group_name']}
                />
            </div>
            <Table
                columns={columns}
                dataSource={zones}
                loading={loading}
                size="small"
                pagination={{
                    position: ['bottomRight'],
                    // position: ['topRight'],
                    showSizeChanger: true,
                }}
                rowKey="zone_id"
                expandable={{
                    expandedRowRender: record => (
                        <EventsByZoneId
                            editPanelPath={editPanelPath}
                            getZones={getZones}

                            loading={loading}
                            setLoading={setLoading}

                            zoneEvents={record.zone_events}
                            zoneName={record.zone_name}

                            panelId={panelId}
                            zoneId={record.zone_id}
                            selectedOrg={selectedOrg}
                            permissions={permissions}

                            showActions={showActions}
                        />
                    ),
                }}

            />
        </div>
    )
}

