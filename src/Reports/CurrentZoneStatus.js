import { message, Table } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react'
import SearchComponent from '../Masters/GeneralComponents/SearchComponent';
import DateRange from './Components/DateRange';
import PanelTreeMultiSelect from './Components/PanelTreeMultiSelect';

export default function CurrentZoneStatus({
    selectedOrg,
    permissions={},
}) {
    const [selected, setSelected] = useState({
        panels: [],     // Array of panel ids
    })

    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [filteredState, setFilteredState] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterOptions, setFilterOptions] = useState({
    });

    const getData = async () => {
        setLoading(true);
        /*
            [
                {
                    "panel_id": 6,
                    "panel_name": "PuneOffice",
                    "panel_code": "PUN003",
                    "zone_id": 56,
                    "zone_name": "1st floor Lobby Motion",
                    "last_event_occurred_time": "2022-10-01T03:03:38",
                    "last_occurred_event": "NBA015",
                    "zone_event_id": 151,
                    "event_name": "1st floor Lobby Motion Detected",
                    "region_id": 3,
                    "site_id": 6,
                    "area_id": 4
                },
            ]

            converting this arr to 

            [
                {
                    "panel_id": 6,
                    "panel_name": "PuneOffice",
                    "panel_code": "PUN003",
                    region_id: 3,
                    site_id: 6,
                    area_id: 4,
                    "zones": [
                        {...above obj},
                        {...above obj},
                    ]

                },
                {...},
            ]
        */
        await axios.post('/admin-api/current_zone_status_report_by_o_id', {
            o_id: selectedOrg.orgId,
            panel_ids: selected.panels,
        })
            .then(res => {
                const data = res.data.data;

                const newData = {};
                data.forEach(d => {
                    if(!newData[d.panel_id]) {
                        newData[d.panel_id] = {
                            ...d,
                            zones: [],
                        }
                    }
                    newData[d.panel_id].zones.push(d);
                })
                
                setMasterState(Object.values(newData));
                setFilteredState(Object.values(newData));
                
            })
            .catch(err => {
                console.log(err);
                message.error('Error fetching data');
                setMasterState([]);

            })
        setLoading(false);
    }

    useEffect(() => {
        // This useEffect dosent have the selectedOrg as a dependency because if 
        // new org is selected, then new panels will be loded ... and that will trigger getData
        // If we add that dependency, then it will trigger getData twice and the first time with previous org's panels
        if(selected.panels.length === 0) {
            setMasterState([]);
            setLoading(false);
            return;
        }
        getData();
    }, [selected.panels])
    // }, [selectedOrg.orgId, selected.panels])

    // This is just for UI loading
    useEffect(() => {
        if(selectedOrg.orgId) {
            setLoading(true);
        }
    }, [selectedOrg.orgId])

    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'panel_id',
            key: 'panel_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost'
        },
        {
            title: 'Panel Name',
            dataIndex: 'panel_name',
            key: 'panel_name',
        },
        {
            title: 'Panel Code',
            dataIndex: 'panel_code',
            key: 'panel_code',
        },
    ], [selectedOrg, filterOptions]).filter(column => !column.hidden);

    const zoneColumns = useMemo(() => [
        {
            title: 'Zone',
            render: (text, record) => record.zone_name,
            key: 'zone_name',
        },
        {
            title: 'Last Event',
            render: (text, record) => record.last_occurred_event + ' / ' + record.event_name,
            key: 'last_occurred_event',
        },
        {
            title: 'Last Event Time',
            dataIndex: 'last_event_occurred_time',
            key: 'last_event_occurred_time',
            render: (text, record) => moment(text).format('DD MMM YYYY hh:mm:ss a'),
            sorter: (a, b) => moment(a.last_event_occurred_time).diff(moment(b.last_event_occurred_time)),
        },
    ], [selectedOrg, filterOptions]).filter(column => !column.hidden);

    const setSelectedKey = (key, value) => {
        setSelected(prev => ({
            ...prev,
            [key]: value,
        }));
    }

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>Current Zone Status Report</span>
            </div>
            <div className="my-table-filter-row">
                <div className="my-form-multiple-inline-input">
                    {/* Read documentation inside PanelTreeMultiSelect for set methods */}
                    <PanelTreeMultiSelect
                        selectedOrg={selectedOrg}

                        value={selected.panels}
                        setValue={(value) => {setSelectedKey('panels', value)}}
                    />
                </div>
                <SearchComponent
                    masterState={masterState}
                    state={filteredState}
                    setState={setFilteredState}
                    searchOptions={[
                        // {keyName: 'panel', label: 'Name'},
                        {keyName: 'panel_name', label: 'Panel Name'},
                        {keyName: 'panel_code', label: 'Panel Code'},
                        // {keyName: 'panel_number', label: 'Panel Number'},
                        // {keyName: 'site_name', label: 'Site Name'},
                        // {keyName: 'area_name', label: 'Area Name'},
                        // {keyName: 'region_name', label: 'Region Name'},

                    ]}
                    isLabelInline={false}
                />
            </div>
            <Table 
                columns={columns} 
                dataSource={filteredState} 
                loading={loading} 
                size="small"
                key={selectedOrg.orgId}
                expandable={{
                    expandedRowRender: (record) => (
                        <div className='my-form-outer' style={{marginLeft: '40px'}}>
                            <div className="my-table-filter-row">
                                <div></div>
                                <SearchComponent
                                    masterState={masterState}
                                    state={filteredState}
                                    setState={setFilteredState}
                                    searchOptions={[
                                        // {keyName: 'panel', label: 'Name'},
                                        {keyName: 'zone_name', label: 'Zone Name'},
                                        {keyName: 'last_occurred_event', label: 'Last Event'},
                                        {keyName: 'event_name', label: 'Event Name'},
                                    ]}
                                />
                            </div>
                            <Table
                                columns={zoneColumns}
                                dataSource={record.zones}
                                size="small"
                                pagination={{
                                    position: ['bottomRight'],
                                    // position: ['topRight'],
                                    showSizeChanger: true,
                                }}
                            />
                        </div>
                    ),
                    rowExpandable: record => record.zones.length > 0,
                }}
                rowKey="panel_id"
                pagination={{
                    position: ['bottomRight'],
                    // position: ['topRight'],
                    showSizeChanger: true,
                }}
            />
        </div>
    )
}
