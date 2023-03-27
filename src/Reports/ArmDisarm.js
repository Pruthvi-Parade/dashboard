import { DatePicker, message, Table, Tooltip } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react'
import { InputWithLabel } from '../Components/Components';
import SearchComponent from '../Masters/GeneralComponents/SearchComponent';
import DateRange from './Components/DateRange';
import PanelTreeMultiSelect from './Components/PanelTreeMultiSelect';

export default function ArmDisarm({
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
        arm_event_name: [],
        disarm_event_name: [],
    });

    const getData = async () => {
        setLoading(true);
        await axios.post('/admin-api/arm_disarm_report_by_o_id', {
            o_id: selectedOrg.orgId,
            start_date: selected.dateRange[0].startOf('day').format(),
            end_date: selected.dateRange[1].endOf('day').format(),
            panel_ids: selected.panels,
        })
            .then(res => {
                const data = res.data.data;

                var uniqueOptions = {
                    arm_event_name: {},
                    disarm_event_name: {},
                };

                for(var event of data) {
                    if(!uniqueOptions.arm_event_name[event.arm_event_name]) {
                        uniqueOptions.arm_event_name[event.arm_event_name] = {
                            value: event.arm_event_name,
                            text: event.arm_event_name,
                        }
                    }
                    if(!uniqueOptions.disarm_event_name[event.disarm_event_name]) {
                        uniqueOptions.disarm_event_name[event.disarm_event_name] = {
                            value: event.disarm_event_name,
                            text: event.disarm_event_name,
                        }
                    }
                }

                setFilterOptions(prev => ({
                    ...prev,

                    arm_event_name: Object.values(uniqueOptions.arm_event_name),
                    disarm_event_name: Object.values(uniqueOptions.disarm_event_name),
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
        // This useEffect dosent have the selectedOrg as a dependency because if 
        // new org is selected, then new panels will be loded ... and that will trigger getData
        // If we add that dependency, then it will trigger getData twice and the first time with previous org's panels
        if(selected.panels.length === 0) {
            setMasterState([]);
            setLoading(false);
            return;
        }
        getData();
    }, [selected.panels, selected.dateRange])
    // }, [selectedOrg.orgId, selected.panels, selected.dateRange])

    // This is just for UI loading
    useEffect(() => {
        if(selectedOrg.orgId) {
            setLoading(true);
        }
    }, [selectedOrg.orgId]);


    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'panel_id',
            key: 'panel_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost'
        },
        {
            title: 'Panel',
            key: 'panel',
            render: (text, record) => record.panel_number + ' / ' + record.panel_name,
        },
        {
            title: 'Location',
            key: 'location',
            render: (text, record) => record.region_name + ' / ' + record.area_name + ' / ' + record.site_name,
        },
        {
            title: 'Event Date',
            dataIndex: 'event_date',
            key: 'event_date',
            render: (text, record) => moment(text).format('DD MMM YYYY hh:mm:ss a'),
            sorter: (a, b) => moment(a.event_date).diff(moment(b.event_date)),
            width: '180px',
        },
        {
            title: 'Disarm Event',
            dataIndex: 'disarm_event_name',
            key: 'disarm_event_name',
            filters: filterOptions.disarm_event_name,
            onFilter: (value, record) => record.disarm_event_name === value,
        },
        {
            title: 'Disarm Date',
            dataIndex: 'disarm_datetime',
            key: 'disarm_datetime',
            render: (text, record) => moment(text).format('DD MMM YYYY hh:mm:ss a'),
            sorter: (a, b) => moment(a.disarm_datetime).diff(moment(b.disarm_datetime)),
            width: '180px',
        },
        {
            title: 'Arm Event',
            dataIndex: 'arm_event_name',
            key: 'arm_event_name',
            filters: filterOptions.arm_event_name,
            onFilter: (value, record) => record.arm_event_name === value,
        },
        {
            title: 'Arm Date',
            dataIndex: 'arm_datetime',
            key: 'arm_datetime',
            render: (text, record) => moment(text).format('DD MMM YYYY hh:mm:ss a'),
            sorter: (a, b) => moment(a.arm_datetime).diff(moment(b.arm_datetime)),
            width: '180px',
        },
        {
            title: 'Working time',  
            // display in format 00:00:00
            render: (text, record) => moment.utc(moment(record.arm_datetime).diff(moment(record.disarm_datetime), 'seconds')).format('hh:mm:ss'),
            sorter: (a, b) => a.arm_duration - b.arm_duration,
            width: '100px',
        },

    ], [selectedOrg, filterOptions, selected.date]).filter(column => !column.hidden);


    const setSelectedKey = (key, value) => {
        setSelected(prev => ({
            ...prev,
            [key]: value,
        }));
    }

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>Arm Disarm Report</span>
                
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
                        // {keyName: 'panel', label: 'Name'},
                        {keyName: 'panel_number', label: 'Panel Number'},
                        {keyName: 'panel_name', label: 'Panel Name'},
                        {keyName: 'region_name', label: 'Region'},
                        {keyName: 'area_name', label: 'Area'},
                        {keyName: 'site_name', label: 'Site'},
                        {keyName: 'disarm_event_name', label: 'Disarm Event'},
                        {keyName: 'arm_event_name', label: 'Arm Event'},
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
                pagination={{
                    position: ['bottomRight'],
                    // position: ['topRight'],
                    showSizeChanger: true,
                }}
            />
        </div>
    )
}
