import { DatePicker, message, Table, Tooltip } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react'
import { InputWithLabel } from '../Components/Components';
import SearchComponent from '../Masters/GeneralComponents/SearchComponent';
import DateRange from './Components/DateRange';
import PanelTreeMultiSelect from './Components/PanelTreeMultiSelect';

export default function HourlyHeartBeat({
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
        await axios.post('/admin-api/hourly_heartbeat_report_by_o_id', {
            o_id: selectedOrg.orgId,
            start_date: selected.date.startOf('day').format(),
            end_date: selected.date.endOf('day').format(),
            panel_ids: selected.panels,
        })
            .then(res => {
                const data = res.data.data;

                /*
                    {
                        "hb_date": "2022-09-29T00:19:44",
                        "panel_id": 6,
                        "o_name": "Smart IAM",
                        "panel_name": "PuneOffice",
                        "heartbeat_duration": 15,
                        "region_id": 3,
                        "site_id": 6,
                        "area_id": 4,
                        "health_count": 5,
                        "hour_of_device": 0
                    },
                    One json represents data for a panel for every hour
                    The health_count means the number of times hb was received i.e (max 60 / heartbeat_duration)
                    
                    convert it into format:
                    {
                        panel_id: {
                            ...above data
                            dt1: health_count,
                            dt2: health_count,
                        }
                    }

                    dt1, dt2 format is like: 2022-09-29-HH
                */

                const s = {};
                for(var d of data) {
                    if(!s[d.panel_id]) {
                        s[d.panel_id] = {
                            ...d,
                            [moment(d.hb_date).format('YYYY-MM-DD-HH')]: d.health_count,
                        };
                    } else {
                        s[d.panel_id][moment(d.hb_date).format('YYYY-MM-DD-HH')] = d.health_count;
                    }
                }
                // console.log("s", s);
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
                return record.panel_number + " / " + record.panel_name
            },
        },
        {
            title: 'HB Duration',
            dataIndex: 'heartbeat_duration',
            key: 'heartbeat_duration',
            width: '100px',
        },
        ...Array.from({length: 24}, (v, i) => i).map(i => {
            const dataIndex = selected.date.format('YYYY-MM-DD') + '-' + (i < 10 ? '0' + i : i);
            return {
                title: <div style={{textAlign: 'center'}}>{i}</div>,
                dataIndex: dataIndex,
                key: i,
                width: '30px',
                // Add style and color if >= 60 / heartbeat_duration (i.e. 60 / 15 = 4) green -> if 0 red else yellow
                
                render: (text, record) => (
                    <Tooltip title={ i + " -------- " + record.panel_name} >
                        <div style={{textAlign: 'center'}}>{text || ""}</div>
                    </Tooltip>
                ),
                onCell: (record) => {
                    const text = record[dataIndex];
                    return {
                        style: { background: text >= 4 ? '#00ff00' : !text ? 'red' : '#ffff00' },
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
                <span className='my-form-title'>Hourly Heartbeat Report</span>
            </div>
            <div className="my-table-filter-row">
                <div className="my-form-multiple-inline-input">
                    {/* Read documentation inside PanelTreeMultiSelect for set methods */}
                    <InputWithLabel label={'Date'}>
                        <DatePicker
                            className="my-form-input" 
                            format={'Do MMM, YYYY'}

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
