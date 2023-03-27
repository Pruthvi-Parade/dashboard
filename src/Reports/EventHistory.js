import { message, Table } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react'
import SearchComponent from '../Masters/GeneralComponents/SearchComponent';
import DateRange from './Components/DateRange';
import PanelTreeMultiSelect from './Components/PanelTreeMultiSelect';
import OneEventSteps from './Components/OneEventSteps';

export default function EventHistory({
    selectedOrg,
    permissions={},
}) {
    const [selected, setSelected] = useState({
        dateRange: [moment(), moment()],
        panels: [],     // Array of panel ids
    })

    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [filteredState, setFilteredState] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterOptions, setFilterOptions] = useState({
        zone: [],
        event: [],
        status: [],
        priority: [],
    });

    const getData = async () => {
        setLoading(true);
        await axios.post('/admin-api/event_transaction_report_by_panel_id', {
            o_id: selectedOrg.orgId,
            // from_time: selected.dateRange[0].startOf('day').format(),
            // to_time: selected.dateRange[1].endOf('day').format(),
            start_date: selected.dateRange[0].startOf('day').format(),
            end_date: selected.dateRange[1].endOf('day').format(),
            panel_ids: selected.panels,
        })
            .then(res => {
                const data = res.data.data;

                var uniqueOptions = {
                    zone: {},
                    event: {},
                    status: {},
                    priority: {},
                };
                for(var event of data) {
                    if(!uniqueOptions.zone[event.zone_name]) {
                        uniqueOptions.zone[event.zone_name] = {
                            value: event.zone_name,
                            text: event.zone_code + " / " + event.zone_name,
                        };
                    }
                    if(!uniqueOptions.event[event.event_code]) {
                        uniqueOptions.event[event.event_code] = {
                            value: event.event_code,
                            text: event.event_code + " / " + event.event_name,
                        };
                    }
                    if(!uniqueOptions.status[event.status]) {
                        uniqueOptions.status[event.status] = {
                            value: event.status,
                            text: event.status,
                        };
                    }
                    if(!uniqueOptions.priority[event.priority]) {
                        uniqueOptions.priority[event.priority] = {
                            value: event.priority,
                            text: event.priority_name
                        };
                    }
                }

                setFilterOptions(prev => ({
                    ...prev,
                    zone: Object.values(uniqueOptions.zone),
                    event: Object.values(uniqueOptions.event),
                    status: Object.values(uniqueOptions.status),
                    priority: Object.values(uniqueOptions.priority),
                }));

                // console.log(data[0]);
                setMasterState(data);
                setFilteredState(data);
            })
            .catch(err => {
                setMasterState([]);
                setFilteredState([]);
                console.log(err);
                message.error('Error fetching data');
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
    }, [selected.panels, selected.date])
    // }, [selectedOrg.orgId, selected.panels, selected.date])

    // This is just for UI loading
    useEffect(() => {
        if(selectedOrg.orgId) {
            setLoading(true);
        }
    }, [selectedOrg.orgId])


    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'event_id',
            key: 'event_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Panel',
            render: (text, record) => record.panel_name + " / " + record.site_name + " / " + record.area_name + " / " + record.region_name,
            
        },
        {
            title: 'Zone',
            render: (text, record) => record.zone_code + " / " + record.zone_name,
            filters: filterOptions.zone,
            onFilter: (value, record) => record.zone_name === value,
            filterSearch: true,
            width: '280px'
        },
        {
            title: 'Event',
            render: (text, record) => record.event_code + " / " + record.event_name,
            filters: filterOptions.event,
            onFilter: (value, record) => record.event_code === value,
            filterSearch: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: filterOptions.status,
            onFilter: (value, record) => record.status === value,
            filterSearch: true,
        },
        {
            title: 'Priority',
            dataIndex: 'priority_name',
            filters: filterOptions.priority,
            onFilter: (value, record) => record.priority === value,
            filterSearch: true,
        },
        {
            title: 'Time',
            render: (text, record) => moment(record.event_occurance_time).format("DD MMM, hh:mm:ss a"),
            sorter: (a, b) => moment(a.event_occurance_time).unix() - moment(b.event_occurance_time).unix(),
            defaultSortOrder: 'descend',
            width: '140px'
        },

    ], [selectedOrg, filterOptions]).filter(column => !column.hidden);

    const setSelectedKey = (key, value) => {
        // console.log("key:", key, "value:", value);
        setSelected(prev => ({
            ...prev,
            [key]: value,
        }));
    }
    
    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>Event History</span>
                
            </div>
            <div className="my-table-filter-row">
                <div className="my-form-multiple-inline-input">
                    {/* Read documentation inside DateRange for set methods */}
                    <DateRange
                        selectedOrg={selectedOrg}

                        value={selected.dateRange}
                        setValue={(value) => {setSelectedKey('dateRange', value)}}
                    />
                    <PanelTreeMultiSelect
                        selectedOrg={selectedOrg}

                        value={selected.panels}
                        setValue={(value) => {setSelectedKey('panels', value)}}

                        // style={{width: '450px'}}
                    />
                </div>
                <SearchComponent
                    masterState={masterState}
                    state={filteredState}
                    setState={setFilteredState}
                    searchOptions={[
                        {keyName: 'panel_name', label: 'Panel'},
                        {keyName: 'site_name', label: 'Site'},
                        {keyName: 'area_name', label: 'Area'},
                        {keyName: 'region_name', label: 'Region'},
                        {keyName: 'zone_name', label: 'Zone'},
                        {keyName: 'event_code', label: 'Event Code'},
                        {keyName: 'event_name', label: 'Event'},
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
                rowKey={record => record.event_id}
                // onChange={
                    // (pagination, filters, sorter) => {
                    //     console.log('Various parameters', pagination, filters, sorter);
                    // }
                // }
                expandable={{
                    expandedRowRender: record => (
                        <OneEventSteps
                            event={record}
                        />
                    )
                }}
                pagination={{
                    position: ['bottomRight'],
                    // position: ['topRight'],
                    showSizeChanger: true,
                }}
            />
        </div>
    )

}


// pagination={{
//     pageSizeOptions: ['5', '10', '20', '30', '40', '50', '100'],
//     defaultPageSize: 20,
//     showSizeChanger: true,
//     showQuickJumper: true,
//     // simple: true,
//     showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
// }}
