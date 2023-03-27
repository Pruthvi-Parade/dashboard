import { message, Table } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react'
import SearchComponent from '../Masters/GeneralComponents/SearchComponent';
import DateRange from './Components/DateRange';

export default function AuditLog({
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
        module_name: [],
        form_type: [],
        created_by: [],
    });

    const getData = async () => {
        setLoading(true);
        /*
            [
                {
                    "module_name": "Action Plan",
                    "o_name": "ICICI Bank",
                    "username": "smarti",
                    "component_audit_log_id": 52,
                    "module_code": "TAGIDA_ACTION_PLAN",
                    "o_id": 254,
                    "map_id": 151,
                    "form_type": "DELETE",
                    "audit_remark": "",
                    "created_by": 14,
                    "created_time": "2022-09-16T18:19:53.075299",
                    "component_details": null
                },
            ]
        */
        await axios.post('/admin-api/audit_log_report_by_o_id', {
            o_id: selectedOrg.orgId,
            start_date: selected.dateRange[0].startOf('day').format(),
            end_date: selected.dateRange[1].endOf('day').format(),
        })
            .then(res => {
                const data = res.data.data;

                var uniqueOptions = {
                    module_name: {},
                    form_type: {},
                    created_by: {},
                };

                for(var al of data) {
                    if(!uniqueOptions.module_name[al.module_name]) {
                        uniqueOptions.module_name[al.module_name] = {
                            text: al.module_name,
                            value: al.module_name,
                        }
                    }
                    if(!uniqueOptions.form_type[al.form_type]) {
                        uniqueOptions.form_type[al.form_type] = {
                            text: al.form_type,
                            value: al.form_type,
                        }
                    }
                    if(!uniqueOptions.created_by[al.username]) {
                        uniqueOptions.created_by[al.username] = {
                            text: al.username,
                            value: al.username,
                        }
                    }
                }

                setFilterOptions(prev => ({
                    ...prev,
                    
                    module_name: Object.values(uniqueOptions.module_name),
                    form_type: Object.values(uniqueOptions.form_type),
                    created_by: Object.values(uniqueOptions.created_by),
                }))
                
                setMasterState(data);
                setFilteredState(data);
            })
            .catch(err => {
                console.log(err);
                message.error('Error fetching data');
                setMasterState([]);
                setFilteredState([]);
            })
        setLoading(false);
    }

    useEffect(() => {
        getData();
    }, [selectedOrg.orgId, selected.dateRange]);

    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'component_audit_log_id',
            key: 'component_audit_log_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Component',
            dataIndex: 'module_name',
            key: 'module_name',
            filters: filterOptions.module_name,
            onFilter: (value, record) => record.module_name === value,
            filterSearch: true,
        },
        {
            title: 'Form Type',
            dataIndex: 'form_type',
            key: 'form_type',
            filters: filterOptions.form_type,
            onFilter: (value, record) => record.form_type === value,
            filterSearch: true,
        },
        {
            title: 'Component Details',
            dataIndex: 'component_details',
            key: 'component_details',
        },
        {
            title: 'Audit Remark',
            dataIndex: 'audit_remark',
            key: 'audit_remark',
        },
        {
            title: 'Created By',
            dataIndex: 'username',
            key: 'username',
            filters: filterOptions.created_by,
            onFilter: (value, record) => record.username === value,
            filterSearch: true,
        },
        {
            title: 'Created Time',
            dataIndex: 'created_time',
            key: 'created_time',
            render: (text, record) => moment(text).format('DD MMM YYYY hh:mm:ss a'),
            sorter: (a, b) => moment(a.created_time).diff(moment(b.created_time)),
            width: '180px',
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
                <span className='my-form-title'>Audit Log Report</span>
                
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
                        {keyName: 'module_name', label: 'Component'},
                        {keyName: 'form_type', label: 'Form Type'},
                        {keyName: 'component_details', label: 'Component Details'},
                        {keyName: 'audit_remark', label: 'Audit Remark'},
                        {keyName: 'username', label: 'Created By'},
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
