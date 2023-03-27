import { message, Table } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react'
import SearchComponent from '../Masters/GeneralComponents/SearchComponent';
import DateRange from './Components/DateRange';

export default function UnknownEvents({
    selectedOrg,
    permissions={},
}) {
    const [selected, setSelected] = useState({
        dateRange: [moment(), moment()],
    })

    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [filteredState, setFilteredState] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterOptions, setFilterOptions] = useState({
        zone_event_code: [],
        reason_code: [],
        panel_number: [],
    });


    const getData = async () => {
        setLoading(true);
        /*
            [
                {
                    "transaction_id": 11985,
                    "panel_id": "420004",
                    "zone_event_code": "NCF001",
                    "r_value": "0000235070",
                    "l_value": "0000235070",
                    "ip_address": "0000235070",
                    "sequence": 0,
                    "transaction_datetime": "2022-09-25T00:12:36",
                    "reason_code": 3
                },
            ]
        */
        await axios.get('/admin-api/unknown_event_transaction_report_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
                // from_time: selected.dateRange[0].startOf('day').format(),
                // to_time: selected.dateRange[1].endOf('day').format(),
                start_date: selected.dateRange[0].startOf('day').format(),
                end_date: selected.dateRange[1].endOf('day').format(),
            }
        })
            .then(res => {
                const data = res.data.data;

                var uniqueOptions = {
                    zone_event_code: {},
                    reason_code: {},
                    panel_number: {},
                };
                for(var event of data) {
                    if(!uniqueOptions.zone_event_code[event.zone_event_code]) {
                        uniqueOptions.zone_event_code[event.zone_event_code] = {
                            value: event.zone_event_code,
                            text: event.zone_event_code,
                        };
                    }
                    if(!uniqueOptions.reason_code[event.reason_code]) {
                        uniqueOptions.reason_code[event.reason_code] = {
                            value: event.reason_code,
                            text: event.reason_code,
                        };
                    }
                    if(!uniqueOptions.panel_number[event.panel_id]) {
                        uniqueOptions.panel_number[event.panel_id] = {
                            value: event.panel_id,
                            text: event.panel_id,
                        };
                    }
                }

                setFilterOptions(prev => ({
                    ...prev,

                    zone_event_code: Object.values(uniqueOptions.zone_event_code),
                    reason_code: Object.values(uniqueOptions.reason_code),
                    panel_number: Object.values(uniqueOptions.panel_number),
                }));

                setMasterState(data);
                setFilteredState(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error fetching data');
                setMasterState([]);
            })
        setLoading(false);
    }

    useEffect(() => {
        getData();
    }, [selectedOrg.orgId, selected]);

    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'transaction_id',
            key: 'transaction_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Panel Number',
            dataIndex: 'panel_id',
            key: 'panel_id',
            filters: filterOptions.panel_number,
            onFilter: (value, record) => record.panel_id === value,
            filterSearch: true,
        },
        {
            title: 'Event Code',
            dataIndex: 'zone_event_code',
            key: 'zone_event_code',
            filters: filterOptions.zone_event_code,
            onFilter: (value, record) => record.zone_event_code === value,
            filterSearch: true,
        },
        {
            title: 'R Value',
            dataIndex: 'r_value',
            key: 'r_value',
        },
        {
            title: 'L Value',
            dataIndex: 'l_value',
            key: 'l_value',
        },
        {
            title: 'Sequence',
            dataIndex: 'sequence',
            key: 'sequence',
        },
        {
            title: 'Time',
            dataIndex: 'transaction_datetime',
            key: 'transaction_datetime',
            render: (text, record) => moment(text).format('DD MMM YYYY hh:mm:ss a'),
            sorter: (a, b) => moment(a.transaction_datetime).diff(moment(b.transaction_datetime)),
        },
        {
            title: 'Reason Code',
            dataIndex: 'reason_code',
            key: 'reason_code',
        }
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
                <span className='my-form-title'>Unknown Events</span>
                
            </div>
            <div className="my-table-filter-row">
                <div className="my-form-multiple-inline-input">
                    {/* Read documentation inside DateRange for set methods */}
                    <DateRange
                        selectedOrg={selectedOrg}

                        value={selected.dateRange}
                        setValue={(value) => {setSelectedKey('dateRange', value)}}
                    />
                </div>
                <SearchComponent
                    masterState={masterState}
                    state={filteredState}
                    setState={setFilteredState}
                    searchOptions={[
                        // {keyName: 'panel', label: 'Name'},
                        {keyName: 'zone_event_code', label: 'Event Code'},
                        {keyName: 'r_value', label: 'R Value'},
                        {keyName: 'l_value', label: 'L Value'},
                        {keyName: 'sequence', label: 'Sequence'},
                        {keyName: 'reason_code', label: 'Reason Code'},
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
                rowKey={record => record.transaction_id}
                // onChange={
                    // (pagination, filters, sorter) => {
                    //     console.log('Various parameters', pagination, filters, sorter);
                    // }
                // }
                pagination={{
                    position: ['bottomRight'],
                    // position: ['topRight'],
                    showSizeChanger: true,
                }}
            />
        </div>
    )
}
