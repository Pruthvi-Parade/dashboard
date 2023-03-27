import { Button, message, Popconfirm, Table } from "antd"
import axios from "axios"
import React, {useState, useMemo, useEffect} from "react"
import { Link } from 'react-router-dom'
import SearchComponent from '../GeneralComponents/SearchComponent';
import { deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, zoneDeleteMessage } from '../../Constants';


// Don't forget to add schema from API
// {
//     "data": [
//       {
//         "sz_id": 16,
//         "zone_name": "Nagarbhavi 124"
//       },
//       {
//         "sz_id": 18,
//         "zone_name": "Hello"
//       },
//       {
//         "sz_id": 19,
//         "zone_name": "Dharward"
//       },
//       {
//         "sz_id": 20,
//         "zone_name": "bgkjsg"
//       }
//     ]
//   }
export default function SiteZoneBySiteId({
    editSitePath="",
    refreshData,

    siteId,
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
        await axios.get('/admin-api/all_zones_by_site_id', {
            params: {
                site_id: siteId,
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

    useEffect(()=>{
        getZones();
    }, [siteId, refreshData]);


    const handleDelete = async (zoneId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_zone',{
            params: {
                sz_id: zoneId,
                o_id: selectedOrg.orgId
            }
        })
            .then(res=>{
                message.success('Zone deleted successfully');
                getZones();
            })
            .catch(err=>{
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error in deleting zone');
                }
                setLoading(false);
            })
    }

    const columns = useMemo(()=>[
        {
            title: 'Id',
            dataIndex: 'sz_id',
            widht: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Name',
            dataIndex: 'zone_name'
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type={editButtonType} className='actions-button' title={`Edit Zone | ${record.zone_name}`}>
                        <Link to={`${editSitePath}?editZone=true&zoneId=${record.sz_id}&orgId=${selectedOrg.orgId}&tab=zones`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.zone_name} <br /> {zoneDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.sz_id)} 
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

            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div>
                    {showActions &&
                    <Button type="primary" disabled={!siteId} >
                        <Link to={`${editSitePath}?addZone=true&orgId=${selectedOrg.orgId}&tab=zones`}>
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
                        {keyName: 'zone_name', label: 'Zone Name'},
                    ]}
                />
            </div>
            <Table
                columns={columns}
                dataSource={zones}
                loading={loading}
                size="small"
                pagination={{
                    position: ['bottomRight'],
                    showSizeChanger: true,
                }}
                rowKey="zone_id"
            />
        </div>
    )
} 