import { Button, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import SearchComponent from '../GeneralComponents/SearchComponent';
import { MdOutlineEdit } from 'react-icons/md';
import { convertSitesToTree } from '../GeneralComponents/Functions';
import { areaDeleteMessage, deleteButtonTitle, deleteButtonType, editButtonTitle, editButtonType, regionDeleteMessage, siteDeleteMessage } from '../../Constants';

/*
    :All locations for a given org => selectedOrg.orgId

    State: 
        locations:              // It will basically be an array of sites
            [
                {
                    "site_id": 220,
                    "site_name": "1962-Phoenix Market-Mumbai",
                    "site_code": "1962",

                    "area_id": 111,
                    "area_name": "Mumbai",
                    "area_code": "ARE001",
                    "area_description": null,
                    "area_comments": null,

                    "region_id": 73,
                    "region_name": "Maharashtra",
                    "region_code": "REG001",
                    "region_description": null,
                    "region_comments": null,

                },
                {...}
                {...}
            ]

    
        locationsTree:          // It will be a tree of regions => areas => sites
        [
            {
                "region_id": 73,
                "region_name": "Maharashtra",
                "region_code": "REG001",
                "region_description": null,
                "region_comments": null,

                Extra fields:
                    is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active 

                    
                "areas": [
                    {
                        "area_id": 111,
                        "area_name": "Mumbai",
                        "area_code": "ARE001",
                        "area_description": null,
                        "area_comments": null,
                        "region_id": 73,

                        Extra fields:
                            is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active

                        "sites": [
                            {
                                "site_id": 220,
                                "site_name": "1962-Phoenix Market-Mumbai",
                                "site_code": "1962",

                                "area_id": 111,
                                "region_id": 73,

                                Extra fields:
                                    is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active
                            },
                        ]
                        
                    },
                ]
            }
        ]
*/


export default function AllLocations({
    selectedOrg,
    permissions={},

    editRegionPath="/masters/location/region/edit",
    addRegionPath="/masters/location/region/add",

    editAreaPath="/masters/location/area/edit",
    addAreaPath="/masters/location/area/add",

    editSitePath="/masters/location/site/edit",
    addSitePath="/masters/location/site/add",
}) {
    const [masterState, setMasterState] = useState([]);

    // The below state is after the search is done
    // Its an array of sites
    const [locations, setLocations] = useState([]);
    const [locationsTree, setLocationsTree] = useState([]);
    const [loading, setLoading] = useState(true);

    const [defaultExpandAllRows, setDefaultExpandAllRows] = useState(false);

    const getLocations = async () => {
        setLoading(true);
        /*
            This api expects the initial scope to be in the format of:
            Above documentation Locations State 
        */
        await axios.get('/admin-api/all_sites_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
                give_all_areas_regions: true
            }
        })
            .then(res => {
                const data = res.data.data;
                
                setMasterState(data || []);
                setLocations(data || []);
            })
            .catch(err => {
                console.log(err);
                message.error('Error fetching locations');
            })
        setLoading(false);
    }

    useEffect(() => {
        getLocations();
    }, [selectedOrg.orgId]);


    const handleDelete = async (region_id) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_region', {
            params: {
                region_id: region_id,
                o_id: selectedOrg.orgId
            }
        })
            .then(res => {
                message.success('Region deleted successfully');
                getLocations();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error deleting region');
                }
                setLoading(false);
            })
        // setLoading(false);
    }


    const columns = useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'region_id',
            key: 'region_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Region Name',
            render: (text, record) => record.region_code + " / " +record.region_name,
        },
        {
            title: 'Description',
            dataIndex: 'region_description',
            key: 'region_description',
        },
        {
            title: 'Comments',
            dataIndex: 'region_comments',
            key: 'region_comments',
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type="primary" title={`Add Area in ${record.region_name}`}>
                        <Link to={`${addAreaPath}?regionId=${record.region_id}`}>
                            Add Area
                        </Link>
                    </Button>
                    <Button type={editButtonType} className='actions-button' title={`Edit Region | ${record.region_name}`}>
                        <Link to={`${editRegionPath}/${record.region_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.region_name} <br /> {regionDeleteMessage}</>} 
                        onConfirm={() => handleDelete(record.region_id)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Region | ${record.region_name}`}>
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>
                </div>
            ),
            width: '250px'
        }
    ], [selectedOrg]).filter(column => !column.hidden);


    useEffect(() => {
        setLocationsTree(
            convertSitesToTree(locations)
        );
    }, [locations]);

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>Locations</span>
                <div>
                    <Button type="primary">
                        <Link to={addRegionPath}>
                            Add Region
                        </Link>
                    </Button>
                    {/* <Button type="primary">
                        <Link to={addAreaPath}>
                            Add Area
                        </Link>
                    </Button>
                    <Button type="primary">
                        <Link to={addSitePath}>
                            Add Site
                        </Link>
                    </Button> */}
                </div>

            </div>
            <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                <div></div>
                <SearchComponent
                    masterState={masterState}
                    state={locations}
                    setState={setLocations}
                    searchOptions={[
                        {keyName: 'region_name', displayName: 'Region Name'},
                        {keyName: 'region_code', displayName: 'Region Code'},
                        {keyName: 'area_name', displayName: 'Area Name'},
                        {keyName: 'area_code', displayName: 'Area Code'},
                        {keyName: 'site_name', displayName: 'Site Name'},
                        {keyName: 'site_code', displayName: 'Site Code'},
                    ]}
                    // defaultSearchKeys={['zone_group_name']}
                    onSearchEnded={(searchText, searchKeys) => { 
                        if (searchText === "") {
                            setDefaultExpandAllRows(false);
                        }
                        else {
                            setDefaultExpandAllRows(true) 
                        } 
                    }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={locationsTree}
                loading={loading}
                size="small"
                pagination={{
                    position: ['bottomRight'],
                    // position: ['topRight'],
                    showSizeChanger: true,
                }}
                key={defaultExpandAllRows}
                rowKey={record => record.region_id}
                expandable={{
                    rowExpandable: record => record.areas.length > 0,
                    expandedRowRender: record => (
                        <AreasTable
                            selectedOrg={selectedOrg}
                            permissions={permissions}

                            editAreaPath={editAreaPath}
                            addAreaPath={addAreaPath}
                            editSitePath={editSitePath}
                            addSitePath={addSitePath}

                            areas={record.areas}
                            loading={loading}
                            setLoading={setLoading}

                            getLocations={getLocations}
                            defaultExpandAllRows={defaultExpandAllRows}
                        />    
                    ),
                    defaultExpandAllRows: defaultExpandAllRows,
                }}
            />
        </div>
    )
}


/*
    data will be in the format of:
    Array of areas of a particular region
    [
        {
            "area_id": 111,
            "area_name": "Mumbai",
            "area_code": "ARE001",
            "area_description": null,
            "area_comments": null,
            "region_id": 73,

            Extra fields:
                is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active

            "sites": [
                {
                    "site_id": 220,
                    "site_name": "1962-Phoenix Market-Mumbai",
                    "site_code": "1962",

                    "area_id": 111,
                    "region_id": 73,

                    Extra fields:
                        is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active
                },
            ]
        },
    ]
*/
const AreasTable = ({
    selectedOrg,
    permissions,

    editAreaPath="/masters/location/area/edit",
    addAreaPath="/masters/location/area/add",
    editSitePath="/masters/location/site/edit",
    addSitePath="/masters/location/site/add",

    areas,
    loading,
    setLoading,

    getLocations=() => {},
    defaultExpandAllRows,
}) => {

    const handleDelete = async (areaId) => {
        setLoading(true);
        await axios.delete('/admin-api/delete_area', {
            params: {
                area_id: areaId,
                o_id: selectedOrg.orgId
            }
        })
            .then(res => {
                message.success('Area deleted successfully');
                getLocations();
            })
            .catch(err => {
                console.log(err);
                try {
                    message.error(err.response.data.detail);
                } catch (error) {
                    message.error('Error deleting area');
                }
                setLoading(false);
            })
    }

            


    const columns = React.useMemo(() => [
        {
            title: 'Id',
            dataIndex: 'area_id',
            key: 'area_id',
            width: '50px',
            hidden: window.location.hostname !== 'localhost',
        },
        {
            title: 'Area Name',
            render: (text, record) => record.area_code + " / " +record.area_name,
            key: 'area_name',
        },
        {
            title: 'Description',
            dataIndex: 'area_description',
            key: 'area_description',
        },
        {
            title: 'Comments',
            dataIndex: 'area_comments',
            key: 'area_comments',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div className='actions-outer-div'>
                    <Button type="primary" title={`Add Site in ${record.area_name}`}>
                        <Link to={`${addSitePath}?regionId=${record.region_id}&areaId=${record.area_id}`}>
                            Add Site
                        </Link>
                    </Button>
                    <Button type={editButtonType} className='actions-button' title={`Edit Area | ${record.area_name}`}>
                        <Link to={`${editAreaPath}/${record.area_id}`}>
                            {editButtonTitle}
                        </Link>
                    </Button>
                    <Popconfirm 
                        overlayClassName='delete-popconfirm' 
                        title={<>{record.area_name} <br /> {areaDeleteMessage}</>}
                        onConfirm={() => handleDelete(record.area_id)} 
                        okText="Yes" cancelText="No" 
                        disabled={!permissions.delete}
                    >
                        <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Area | ${record.area_name}`}>
                            {deleteButtonTitle}
                        </Button>
                    </Popconfirm>

                </div>
            ),
            width: '250px'
        },
    ], [selectedOrg]).filter(column => !column.hidden);

    return (
        <div className='my-form-outer'>
            {/* <div className='my-form-header'>
                <span className='my-form-title'>Areas</span>
                <Button type="primary">
                    <Link to={addAreaPath}>
                        Add Area
                    </Link>
                </Button>
            </div> */}
            <Table
                columns={columns}
                dataSource={areas}
                loading={loading}
                size="small"
                pagination={{
                    position: ['bottomRight'],
                    // position: ['topRight'],
                    showSizeChanger: true,
                }}
                rowKey={record => record.area_id}
                key={defaultExpandAllRows}
                expandable={{
                    rowExpandable: record => record.sites.length > 0,
                    expandedRowRender: record => (
                        <SitesTable
                            selectedOrg={selectedOrg}
                            permissions={permissions}

                            editSitePath={editSitePath}
                            addSitePath={addSitePath}

                            sites={record.sites}
                            loading={loading}
                            setLoading={setLoading}

                            getLocations={getLocations}
                        />
                    ),
                    defaultExpandAllRows: defaultExpandAllRows,
                }}
            />
        </div>
    )
}


/*
    data will be in the format of:
    Array of sites of a particular area
    [
        {
            "site_id": 220,
            "site_name": "1962-Phoenix Market-Mumbai",
            "site_code": "1962",

            "address_line1": "",

            "area_id": 111,
            "region_id": 73,

            Extra fields:
                is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active
        },
    ]
*/
const SitesTable = ({
    selectedOrg,
    permissions,

    editSitePath="/masters/location/site/edit",
    addSitePath="/masters/location/site/add",

    sites,
    loading,
    setLoading,

    getLocations=() => {},
}) => {

        const handleDelete = async (siteId) => {
            setLoading(true);
            await axios.delete('/admin-api/delete_site', {
                params: {
                    site_id: siteId,
                    o_id: selectedOrg.orgId
                }
            })
                .then(res => {
                    message.success('Site deleted successfully');
                    getLocations();
                })
                .catch(err => {
                    console.log(err);
                    try {
                        message.error(err.response.data.detail);
                    } catch (error) {
                        message.error('Error deleting site');
                    }
                    setLoading(false);
                })
        }

    
        const columns = React.useMemo(() => [
            {
                title: 'Id',
                dataIndex: 'site_id',
                key: 'site_id',
                width: '50px',
                hidden: window.location.hostname !== 'localhost',
            },
            {
                title: 'Site Name',
                render: (text, record) => record.site_code + " / " +record.site_name,
                key: 'site_name',
                width: '300px'
            },
            {
                title: 'Address',
                dataIndex: 'address_line1',
                key: 'address_line1',
                ellipsis: true,
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <div className='actions-outer-div'>
                        <Button type={editButtonType} className='actions-button' title={`Edit Site | ${record.site_name}`}>
                            <Link to={`${editSitePath}/${record.site_id}`}>
                                {editButtonTitle}
                            </Link>
                        </Button>
                        <Popconfirm 
                            overlayClassName='delete-popconfirm'
                            title={<>{record.site_name} <br /> {siteDeleteMessage}</>}
                            onConfirm={() => handleDelete(record.site_id)} 
                            okText="Yes" cancelText="No" 
                            disabled={!permissions.delete}
                        >
                            <Button danger type={deleteButtonType} disabled={!permissions.delete} className='actions-button' title={`Delete Site | ${record.site_name}`}>
                                {deleteButtonTitle}
                            </Button>
                        </Popconfirm>
                    </div>
                ),
                width: '150px'
            },
        ], [selectedOrg]).filter(column => !column.hidden);
    
        return (
            <div className='my-form-outer' style={{marginLeft: '20px'}}>
                {/* <div className='my-form-header'>
                    <span className='my-form-title'>Sites</span>
                    <Button type="primary">
                        <Link to={addSitePath}>
                            Add Site
                        </Link>
                    </Button>
                </div> */}
                <Table
                    columns={columns}
                    dataSource={sites}
                    loading={loading}
                    size="small"
                    pagination={{
                        position: ['bottomRight'],
                        // position: ['topRight'],
                        showSizeChanger: true,
                    }}
                />
            </div>
        )
    }
