import { Button, message, Table } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react'
import SearchComponent from '../Masters/GeneralComponents/SearchComponent';
import DateRange from './Components/DateRange';
import PanelTreeMultiSelect from './Components/PanelTreeMultiSelect';
import {Helmet} from "react-helmet";

export default function PanelStatusReport({
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
        status: [
            {value: 'Online', text: 'Online'},
            {value: 'Offline', text: 'Offline'},
        ]
    });

    
    const getData = async () => {
        setLoading(true);
        await axios.post('/admin-api/panel_status_access_report_by_o_id', {
            o_id: selectedOrg.orgId,
            panel_ids: selected.panels,
        })
            .then(res => {
                const data = res.data.data;

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
            hidden: window.location.hostname !== 'localhost',
            sorter: (a, b) => a.panel_id - b.panel_id,
        },
        {
            title: 'Location',
            render: (text, record) => {
                return record.region_name + " / " + record.area_name + " / " + record.site_name;
            },
            ellipsis: true,
        },
        {
            title: 'Panel',
            // dataIndex: 'panel_name',
            // key: 'panel_name',
            render: (text, record) => {
                return record.panel_number + " / " + record.panel_name;
            },
            // ellipsis: true,
        },
        {
            title: 'Last Access DT',
            dataIndex: 'last_access_time_date',
            key: 'last_access_time_date',
            render: (text, record) => moment(text).format('DD MMM YYYY hh:mm:ss a'),
            sorter: (a, b) => moment(a.last_access_time_date).diff(moment(b.last_access_time_date)),
            width: '180px',

        },
        {
            title: "Avg HB Time",
            dataIndex: 'avg_hb_time',
            key: 'avg_hb_time',
            render: (text, record) => moment(text).format('DD MMM YYYY hh:mm:ss a'),
            sorter: (a, b) => moment(a.avg_hb_time).diff(moment(b.avg_hb_time)),
            width: '180px',
        },
        {
            title: "Status",
            dataIndex: 'status',
            key: 'status',
            filters: filterOptions.status,
            onFilter: (value, record) => record.status === value,
            width: '80px',
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
            <Helmet>
                <style>{`
                    .panel-status-row-offline {
                        background-color: var(--offlinePanelStatusRowBg);
                    }
                    .panel-status-row-online {
                        background-color: var(--onlinePanelStatusRowBg);
                    }
                    

                    .ant-table-tbody>tr.ant-table-row:hover>td {
                        background-color: inherit !important;
                        /* border: 1px solid black; */
                        cursor: pointer;
                        font-weight: bold; 
                    }

                    .ant-table-column-sort{
                        background: none !important;
                    }
                    .ant-table-column-background-none{
                        background: none !important;
                    }
                `}</style>
            </Helmet>
            <div className='my-form-header'>
                <span className='my-form-title'>Panel Status Report</span>
                
            </div>
            <div className="my-table-filter-row">
                <div className="my-form-multiple-inline-input" style={{alignItems: 'flex-end'}}>
                    {/* Read documentation inside PanelTreeMultiSelect for set methods */}
                    <PanelTreeMultiSelect
                        selectedOrg={selectedOrg}

                        value={selected.panels}
                        setValue={(value) => {setSelectedKey('panels', value)}}
                    />
                    <Button type="primary" onClick={getData}>Refresh</Button>
                </div>
                <SearchComponent
                    masterState={masterState}
                    state={filteredState}
                    setState={setFilteredState}
                    searchOptions={[
                        // {keyName: 'panel', label: 'Name'},
                        {keyName: 'panel_name', label: 'Panel Name'},
                        {keyName: 'panel_number', label: 'Panel Number'},
                        {keyName: 'site_name', label: 'Site Name'},
                        {keyName: 'area_name', label: 'Area Name'},
                        {keyName: 'region_name', label: 'Region Name'},

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
                rowClassName={(record, index) => {
                    if(record.status === 'Offline') {
                        return 'panel-status-row-offline';
                    }
                    else if(record.status === 'Online') {
                        return 'panel-status-row-online';
                    }
                }}

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
