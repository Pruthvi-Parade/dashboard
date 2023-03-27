import { DatePicker, message, Table, Tooltip } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react'
import { InputWithLabel } from '../Components/Components';
import SearchComponent from '../Masters/GeneralComponents/SearchComponent';
import DateRange from './Components/DateRange';
import PanelTreeMultiSelect from './Components/PanelTreeMultiSelect';

export default function MonthlyHeartBeat({
    selectedOrg,
    permissions={},
}) {
    const [selected, setSelected] = useState({
        date: moment(),
        panels: [],     // Array of panel ids
    });

    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    const [filteredState, setFilteredState] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterOptions, setFilterOptions] = useState({});

    const getData = async () => {
        setLoading(true);
        await axios.post('/admin-api/monthly_heartbeat_report_by_o_id', {
            o_id: selectedOrg.orgId,
            start_date: selected.date.startOf('month').format(),
            end_date: selected.date.endOf('month').format(),
            panel_ids: selected.panels,
        })
            .then(res => {
                const data = res.data.data;

                /*
                    {
                        "hb_date": "2022-06-10",
                        "health_count": 4,
                        "panel_id": 6,
                        "heartbeat_duration": 15,
                        "o_name": "Smart IAM",
                        "panel_name": "PuneOffice",
                        "site_id": 6,
                        "region_id": 3,
                        "area_id": 4,
                        "o_id": 9
                    },
                    One json represents data for a panel for a whole day
                    The health_count means the number of hours hb was received i.e max 24
                    
                    convert it into format: 
                    {
                        panel_id: {
                            ...above data
                            date1: health_count,
                            date2: health_count,
                        }
                    }
                */
                    
                const s = {};
                for(var d of data) {
                    if(!s[d.panel_id]) {
                        s[d.panel_id] = {
                            ...d,
                            [d.hb_date]: d.health_count,
                        };
                    } else {
                        s[d.panel_id][d.hb_date] = d.health_count;
                    }
                }

                setMasterState(Object.values(s));
                setFilteredState(Object.values(s));
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
            dataIndex: 'panel_id',
            key: 'panel_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost'
        },
        {
            title: 'Panel Name',
            // dataIndex: 'panel_name',
            render: (text, record) => {
                return record.panel_number + " / " + record.panel_name;
            },
        },
        // Add all the dates of the month
        ...[...Array(selected.date.daysInMonth()).keys()].map((i) => {
            const date = selected.date.clone().startOf('month').add(i, 'days');
            return {
                title: <div style={{textAlign: 'center'}}>{date.format('DD')}</div>,
                dataIndex: date.format('YYYY-MM-DD'),
                key: date.format('YYYY-MM-DD'),
                width: '30px',
                // Add style and color if === 24 ten green -> if >20 then light green -> if > 10 then yellow -> else red
                render: (text, record) => (
                    <Tooltip title={ date.format('DD MMM YYYY')+ " -------- " + record.panel_name} >
                        <div style={{textAlign: 'center'}}>{text || ""}</div>
                    </Tooltip>
                ),
                onCell: (record) => {
                    const text = record[date.format('YYYY-MM-DD')];
                    return {
                        style: { 
                            background: text === 24 ? '#09991f' : text > 20 ? '#00ff00' : text > 10 ? '#ffff00' : '#ff0000'
                        },
                    };
                }

            }
        }),
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
                <span className='my-form-title'>Monthly Heartbeat Report</span>
            </div>
            <div className="my-table-filter-row">
                <div className="my-form-multiple-inline-input">
                    {/* Read documentation inside PanelTreeMultiSelect for set methods */}
                    <InputWithLabel label={'Month'}>
                        <DatePicker.MonthPicker
                            className="my-form-input" 
                            format={'MMMM YYYY'}

                            value={selected.date}
                            onChange={(value) => {setSelectedKey('date', value)}}

                            allowClear={false}

                            disabledDate={(current) => {return current && current > moment().endOf('day');}}
                        />
                    </InputWithLabel>


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
                    ]}
                    isLabelInline={false}
                />
            </div>
            <Table 
                // bordered={true}
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
