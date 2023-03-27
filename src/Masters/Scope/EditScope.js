import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../Components/Components';
import { useSelector } from "react-redux";

const { TabPane } = Tabs;

/*
    Edit and Add Scope:
        if isAddNew is true, then just the api and intial state changes.

    State: 
        scopeDetails: {
            id              // id of the scope
            name            // name of the scope
            scopes          // array of scopes

        }

        scope_array:{
            scope_id:               // id of the current scope-template
            scope_type_id           // 1 => organization, 
                                    // 2 => region
                                    // 3 => area
                                    // 4 => site
                                    
            filter_id               // actual od of the scope_type_id

            o_name                  // name of the organization
            region_name:            // name of the region
            area_name:              // name of the area
            site_name:              // name of the site
        }



    Logic:
        We get orgs by the users-scope:
        We get regions by the users-scope for that org:
        We get areas by the users-scope for that region:
        We get sites by the users-scope for that area:

        When rightcliked on any of the dropdows we add it to users scope

*/

export default function EditScope({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/scope",
}) {
    let templateId = parseInt(useParams().id);
    const navigate = useNavigate();

    const [selected, setSelected] = useState({
        orgId: null,
        regionId: null,
        areaId: null,
        siteId: null,
    });
    const [orgs, setOrgs] = useState([]);
    const [regions, setRegions] = useState([]);
    const [areas, setAreas] = useState([]);
    const [sites, setSites] = useState([]);

	const [loading, setLoading] = useState(true);
	const [templateDetails, setTemplateDetails] = useState({
		id: 0,
		name: "NEW TEMPLATE",
		scopes: [],
	});

    const myTokenScopes = useSelector(state => state.authReducer.scopes);

	const getTemplateDetails = async () => {
		setLoading(true);

        /*
            params:
                scope_id:               id of the scope-template to be edited

            This api expects the initial scope to be in the format of:
            {
                scope_id: ,
                scope_name: ,
                scope_maps: [
                    {
                        scope_id:               // id of the current scope-template
                        scope_type_id           // 1 => organization, 
                                                // 2 => region
                                                // 3 => area
                                                // 4 => site
                        filter_id               // actual od of the scope_type_id

                        o_name                  // if scope_type_id >= 2
                        region_name:            // if scope_type_id >= 3
                        area_name:              // if scope_type_id >= 4
                        site_name:              // if scope_type_id >= 5
                    }
                ]


            LOGIC:
                Adding a scope depends on the type of scope (Hiearchy).
                i.e the scope type id.
        */
        axios.get("/admin-api/scope_by_scope_id", {
                params: {
                    scope_id: templateId,
                    o_id: selectedOrg.orgId,
                },
            })
            .then(res => {
                const data = res.data.data;

                setTemplateDetails({
					id: data.scope_id,
					name: data.scope_name,
					scopes: data.scope_maps,
				});
            })
            .catch(err => {
                console.log(err);
                navigate(homePath);
            });
		setLoading(false);
	}

	// Get All data related to this template
    useEffect(() => {
		if(isAddNew) {
			// Set Default State ----- Its already set in the state
            setLoading(false);
		}
		else {
			getTemplateDetails();
		}
    }, []);

    // Get all orgs from backend
    useEffect(() => {
        // setSelected({...selected, orgId: null,regionId: null, areaId: null, siteId: null});
        axios.get('/admin-api/all_org_child_by_org_id', {
            params: {
                o_id: selectedOrg.orgId,
                o_type: 3,
            }
        })
            .then(res => {
                const data = res.data.data;

                setOrgs(data);
                setSelected({ ...selected, orgId: data[0].o_id });
            })
            .catch(err => {
                // console.log(err);
            });
    }, []);

    // Whenever org selection changes get new regions for that org
    useEffect(() => {
        if (!selected.orgId) {
            return;
        }
        // setSelected({...selected, regionId: null, areaId: null, siteId: null});

        axios
            .get("/admin-api/all_regions_by_o_id", {
                params: {
                    o_id: selected.orgId,
                },
            })
            .then(res => {
                const data = res.data.data;

                setRegions(data);
                setSelected({ ...selected, regionId: data[0].region_id });
            })
            .catch(err => {
                // console.log("Region Request Error", err);
            });
    }, [selected.orgId]);

    // Whenever region selection changes get new areas for that region
    useEffect(() => {
        if (!selected.regionId) {
            return;
        }
        // setSelected({...selected, areaId: null, siteId: null});

        axios
            .get("/admin-api/all_areas_by_region_id", {
                params: {
                    o_id: selected.orgId,
                    region_id: selected.regionId,
                },
            })
            .then(res => {
                const data = res.data.data;

                setAreas(data);
                setSelected({ ...selected, areaId: data[0].area_id });
            })
            .catch(err => {
                // console.log(err);
            });
    }, [selected.regionId]);

    // Whenever area selection changes get new sites for that area
    useEffect(() => {
        if (!selected.areaId) {
            return;
        }
        // setSelected({...selected, siteId: null});

        axios
            .get("/admin-api/all_sites_by_area_id", {
                params: {
                    o_id: selected.orgId,
                    region_id: selected.regionId,
                    area_id: selected.areaId,
                },
            })
            .then(res => {
                const data = res.data.data;

                setSites(data);
                setSelected({ ...selected, siteId: data[0].site_id });
            })
            .catch(err => {
                // console.log(err);
            });
    }, [selected.areaId]);

	const setScopes = (scopes) => {
		setTemplateDetails({
			...templateDetails,
			scopes: scopes,
		});
	}

	const setTemplateName = (name) => {
		setTemplateDetails({
			...templateDetails,
			name: name,
		});
	}


    const hasAccessToSelect = (scope_type_id, orgId=0, regionId=0, areaId=0, siteId=0) => {
        if (myTokenScopes?.[1]){
            return true;
        }
        else if(orgId && myTokenScopes?.[`2_${orgId}`]){
            return true;
        }
        else if(regionId && myTokenScopes?.[`3_${regionId}`]){
            return true;
        }
        else if(areaId && myTokenScopes?.[`4_${areaId}`]){
            return true;
        }
        else if(siteId && myTokenScopes?.[`5_${siteId}`]){
            return true;
        }
        else{
            return false;
        }
        return false;
    }

    const addNewScope = (scope_type_id, filter_id, o_name, region_name, area_name, site_name) => {
        if (!o_name) {
            o_name = orgs.find(org => org.o_id === selected.orgId).o_name;
            // console.log(o_name);
        }
        if (scope_type_id > 2 && !region_name) {
            region_name = regions.find(region => region.region_id === selected.regionId).region_name;
        }
        if (scope_type_id > 3 && !area_name) {
            area_name = areas.find(area => area.area_id === selected.areaId).area_name;
        }
        if (scope_type_id > 4 && !site_name) {
            site_name = sites.find(site => site.site_id === selected.siteId).site_name;
        }

        var newScopes = [...templateDetails.scopes];
        newScopes.push({
            template_id: templateDetails.id,
            scope_type_id: scope_type_id,
            filter_id: filter_id,
            o_name: o_name,
            region_name: region_name,
            area_name: area_name,
            site_name: site_name,
        });
        // console.log(newScopes.at(-1));
        setScopes(newScopes);
    };


	const handleSubmit = async () => {
		setLoading(true);
		if(isAddNew) {
			await axios.post("/admin-api/add_scope", {
                o_id: selectedOrg.orgId,
				scope_name: templateDetails.name,
				scope_maps: templateDetails.scopes.map(scope => (
                    {
                        scope_type_id: scope.scope_type_id,
                        filter_id: scope.filter_id
                    }
                )),
			})
			.then(res => {
				// console.log(res);
				navigate(homePath);
			})
			.catch(err => {
				console.log(err);
				message.error("Error adding template");
			});
		}
		else {
			await axios.put("/admin-api/modify_scope", {
                o_id: selectedOrg.orgId,
				scope_id: templateDetails.id,
				scope_name: templateDetails.name,
				scope_maps: templateDetails.scopes.map(scope => (
                    {
                        scope_type_id: scope.scope_type_id,
                        filter_id: scope.filter_id
                    }
                )),
			})
			.then(res => {
				// console.log(res);
                message.success("Scope details saved !")
				// navigate(homePath)
			})
			.catch(err => {
				console.log(err);
				message.error("Error updating template");
			});
		}
		setLoading(false);
	}


    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Scope 
                </span>
            </div>
            <div>
                <Tabs
                    tabBarExtraContent={
                        <div>
                            <Button type='danger' onClick={() => navigate(homePath)} loading={loading}>
                                Cancel
                            </Button>
                            <Button style={{marginLeft: '5px'}} type="primary" onClick={handleSubmit} loading={loading} disabled={!permissions.edit}>
                                {isAddNew ? "Add" : "Save"}
                            </Button>
                        </div>
                    }
                >
                    <TabPane className="my-form-tabpane-outer" tab="Details" key="1">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Scope Name" isInline={true}>
                                    <Input
                                        value={templateDetails.name}
                                        onChange={(e) => {setTemplateName(e.target.value)}}
                                        style={{width: '400px'}}
                                        disabled={loading}
                                    />
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input" style={{width: '100%', justifyContent: "center",}}>
                                <InputWithLabel label="Orgs">
                                    <Select
                                        value={selected.orgId}
                                        optionLabelProp="name"
                                        showSearch
                                        filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        onChange={e => {
                                            setSelected({ ...selected, orgId: e, regionId: null, areaId: null, siteId: null });
                                        }}
                                        style={{ width: "100%", minWidth: "250px" }}
                                        loading={!selected.orgId}
                                        disabled={!selected.orgId}
                                    >
                                        {orgs.map(org => (
                                            <Select.Option key={org.o_id} value={org.o_id} name={org.o_name}>
                                                <div style={{ width: "100%", display: "inline-flex", justifyContent: "space-between" }}>
                                                    {org.o_name}
                                                    <Button
                                                        onContextMenu={e => {
                                                            e.preventDefault();
                                                            if(hasAccessToSelect(2, org.o_id)) {
                                                                addNewScope(2, org.o_id, org.o_name, null, null, null);
                                                            }
                                                        }}
                                                        disabled={loading || !hasAccessToSelect(2, org.o_id)}
                                                        size="small"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                
                                <InputWithLabel label="Region">
                                    <Select
                                        value={selected.regionId}
                                        optionLabelProp="name"
                                        showSearch
                                        filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        onChange={e => {
                                            setSelected({ ...selected, regionId: e, areaId: null, siteId: null });
                                        }}
                                        style={{ width: "100%", minWidth: "250px" }}
                                        loading={!selected.regionId}
                                        disabled={!selected.regionId}
                                    >
                                        {regions.map(region => (
                                            <Select.Option key={region.region_id} value={region.region_id} name={region.region_name}>
                                                <div style={{ width: "100%", display: "inline-flex", justifyContent: "space-between" }}>
                                                    {region.region_name}
                                                    <Button
                                                        onContextMenu={e => {
                                                            e.preventDefault();
                                                            if(hasAccessToSelect(3, selected.orgId, region.region_id)) {
                                                                addNewScope(3, region.region_id, null, region.region_name, null, null);
                                                            }
                                                        }}
                                                        disabled={loading || !hasAccessToSelect(3, selected.orgId, region.region_id)}
                                                        size="small"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                
                                <InputWithLabel label="Area">
                                    <Select
                                        value={selected.areaId}
                                        optionLabelProp="name"
                                        showSearch
                                        filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        onChange={e => {
                                            setSelected({ ...selected, areaId: e, siteId: null });
                                        }}
                                        style={{ width: "100%", minWidth: "250px" }}
                                        loading={!selected.areaId}
                                        disabled={!selected.areaId}
                                    >
                                        {areas.map(area => (
                                            <Select.Option key={area.area_id} value={area.area_id} name={area.area_name}>
                                                <div style={{ width: "100%", display: "inline-flex", justifyContent: "space-between" }}>
                                                    {area.area_name}
                                                    <Button
                                                        onContextMenu={e => {
                                                            e.preventDefault();
                                                            if(hasAccessToSelect(4, selected.orgId, selected.regionId, area.area_id)) {
                                                                addNewScope(4, area.area_id, null, null, area.area_name, null);
                                                            }
                                                        }}
                                                        disabled={loading || !hasAccessToSelect(4, selected.orgId, selected.regionId, area.area_id)}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                
                                <InputWithLabel label="Site">
                                    <Select
                                        value={selected.siteId}
                                        optionLabelProp="name"
                                        showSearch
                                        filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        onChange={e => {
                                            setSelected({ ...selected, siteId: e });
                                        }}
                                        style={{ width: "100%", minWidth: "250px" }}
                                        loading={!selected.siteId}
                                        disabled={!selected.siteId}
                                    >
                                        {sites.map(site => (
                                            <Select.Option key={site.site_id} value={site.site_id} name={site.site_name}>
                                                <div style={{ width: "100%", display: "inline-flex", justifyContent: "space-between" }}>
                                                    {site.site_name}
                                                    <Button
                                                        onContextMenu={e => {
                                                            e.preventDefault();
                                                            if(hasAccessToSelect(5, selected.orgId, selected.regionId, selected.areaId, site.site_id)) {
                                                                addNewScope(5, site.site_id, null, null, null, site.site_name);
                                                            }
                                                        }}
                                                        disabled={loading || !hasAccessToSelect(5, selected.orgId, selected.regionId, selected.areaId, site.site_id)}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>

                            <div style={{marginTop: '10px'}}>
                                <ScopeTable 
                                    scopes={templateDetails.scopes} 
                                    setScopes={setScopes} 
                                    loading={loading}
                                />
                            </div>
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>

        </div>
    );
}


/*
    This component s for rendering the scope table.
    ids are hardcoded.

    The name has the full hierarchy in the name.

    OnClick on remove button, we will delete that index of the scope.
*/
const ScopeTable = ({ scopes, setScopes, loading }) => {

    const scopeTypeIdMap = {
        2: "Organization",
        3: "Region",
        4: "Area",
        5: "Site",
    }

    const columns = [
        {
            title: "Scope On",
            render: (text, record) => {
                var scopeOn = scopeTypeIdMap[record.scope_type_id] || "ERROR";
                return <span>{scopeOn}</span>;
            },
        },
        {
            title: "Scope Filter Name",
            render: (text, record) => {
                var name = "";
                if (record.scope_type_id >= 2) {
                    name += record.o_name;
                }
                if (record.scope_type_id >= 3) {
                    name += " / " + record.region_name;
                } 
                if (record.scope_type_id >= 4) {
                    name += " / " + record.area_name;
                }
                if (record.scope_type_id >= 5) {
                    name += " / " + record.site_name;
                }

                return <span>{name}</span>;
            },
        },
        {
            title: "Remove",
            render: (text, record, index) => (
                <Button
                    type="danger"
                    onClick={() => {
                        var arr = [...scopes];
                        arr.splice(index, 1);
                        setScopes(arr);
                    }}
                >
                    Remove
                </Button>
            ),
            width: "100px",
        },
    ];

    return (
		<Table 
			columns={columns} 
			loading={loading} 
			dataSource={scopes} 
			pagination={false} 
			size="small"
		/>
	);
};

