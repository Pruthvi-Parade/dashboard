import React, { useState } from "react";
import { Button, Input, Select, message, Tabs, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { MdOutlineEditOff } from "react-icons/md";
import { InputWithLabel } from '../../Components/Components';
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import AddressesForm from "../GeneralComponents/AddressesForm";
import TempFieldsComponent from "../GeneralComponents/TempFieldsComponent";
import SiteZoneEditTab from "./Components/SiteZoneEditTab"
import AssignActionPlans from "./AssignActionPlans";
import { validateSite } from "../../Components/Validations";

const { TabPane } = Tabs;


/*
    Edit and add Site
        if isAddNew is true => add new site

    state:
        details: {
            region_id: "",                  // The id in which this area lies
            area_id: "",                    // The id in which this site lies

            site_name: "",
            site_code: "",

            description: "",
            comments: "",
            audit_remark: "",

            temp_field_1: "",
            temp_field_2: "",
            temp_field_3: "",

            addresses: [                  // refer json format documentation at top in this file
                {
                    address: '',
                    country_id: 0,
                    state_id: 0,
                    city_id: 0,

                    latitude: '',
                    longitude: '',
                }
            ],

            action_plans: []
        }

*/


export default function EditSite({
    selectedOrg,
    isAddNew,
    permissions={},

    homePath="/masters/location",
}) {
    let siteId = parseInt(useParams().id);
    const navigate = useNavigate();

    // For having the active tab in the url (for refreshing)
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState((searchParams.get('tab') && searchParams.get('tab') !== "address") ? searchParams.get('tab') : 'details');
    
    const changeActiveTab = (key) => {
        setActiveTab(key);
        searchParams.set('tab', key);
        setSearchParams(searchParams, {replace: true});
    }    
    
    const [loading, setLoading] = useState(true);

    // Here will be the default state of the form (For add new)
    // For documentation, see the comment above function 
    const [details, setDetails] = useState({
        region_id: parseInt(searchParams.get('regionId')) || 0,
        area_id: parseInt(searchParams.get('areaId')) || 0,

        site_id: 0,
        site_name: '',
        site_code: '',

        description: '',
        comments: '',
        audit_remark: '',

        temp_field_1: "",
        temp_field_2: "",
        temp_field_3: "",

        addresses: [                  // refer json format documentation at top in this file
            {
                address: '',
                country_id: 0,
                state_id: 0,
                city_id: 0,

                latitude: '',
                longitude: '',
            }
        ],

        // action_plans: []
    });
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const [selectOptions, setSelectOptions] = useState({
        regions: [],
        areas: [],
    });

    const getDetails = async () => {
        setLoading(true);
        await axios.get(`/admin-api/site_by_site_id`, {
            params: {
                site_id: siteId,
                o_id: selectedOrg.orgId,
            }
        })
            .then(res => {
                const data = res.data.data;

                setDetails({
                    ...details,

                    region_id: data.region_id,
                    area_id: data.area_id,

                    site_id: data.site_id,
                    site_name: data.site_name || '',
                    site_code: data.site_code || '',

                    description: data.description || '',
                    comments: data.comments || '',
                    audit_remark: data.audit_remark || '',

                    temp_field_1: data.temp_field_1 || '',
                    temp_field_2: data.temp_field_2 || '',
                    temp_field_3: data.temp_field_3 || '',

                    addresses: [
                        {
                            address: data.address_line1 || '',
                            country_id: data.country_id || 0,
                            state_id: data.state_id || 0,
                            city_id: data.city_id || 0,

                            latitude: data.latitude || '',
                            longitude: data.longitude || '',
                        }
                    ],

                    // action_plans: data.action_plans
                });
            })
            .catch(err => {
                console.log(err);
                message.error("Error getting site details");
                navigate(homePath);

            });

        setLoading(false);
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        getRegions();
        if(isAddNew) {
            setLoading(false);
        } 
        else {
            getDetails();
        }
    }, []);

    useEffect(() => {
        if(details.region_id) {
            getAreas(details.region_id);
        }
    }, [details.region_id]);


    const getRegions = async () => {
        /*
            [
                {
                    region_id: "",
                    region_name: "",
                    region_code: "",
                    // And Other fields
                }
            ]
        
        */
        axios.get('/admin-api/all_regions_by_o_id', {
            params: {
                o_id: selectedOrg.orgId,
            }
        }).then(res => {
            const data = res.data.data;

            setSelectOptions(curr => ({
                ...curr,
                regions: data,
            }));

            if(isAddNew && data.length > 0 && !details.region_id) {
                setDetails(d => ({
                    ...d,
                    region_id: data[0].region_id,
                }));
            }
        }).catch(err => {
            console.log(err);
            message.error('Error getting regions');
        })
    }


    const getAreas = async (regionId) => {
        /*
            [
                {
                    area_id: "",
                    area_name: "",
                    area_code: "",
                    // And Other fields
                }
            ]
        */
        axios.get('/admin-api/all_areas_by_region_id', {
            params: {
                o_id: selectedOrg.orgId,
                region_id: regionId,
            }
        }).then(res => {
            const data = res.data.data;

            setSelectOptions(curr => ({
                ...curr,
                areas: data,
            }));

            if(isAddNew && data.length > 0 && !details.area_id) {
                setDetails(d => ({
                    ...d,
                    area_id: data[0].area_id,
                }));
            }
        }).catch(err => {
            console.log(err);
            message.error('Error getting areas');
        })
    }


    const setDetailsKey = (key, value) => {
        if(key === 'region_id') {           // This is cause we need to default select first area only when region is changed 
            setDetails(d => ({
                ...d,
                region_id: value,
                area_id: 0,
            }));
            return;
        }

        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }

        // Functions for addresses tab
    const setAddresses = (newAddresses) => {
        setDetails(d => ({
            ...d,
            addresses: newAddresses,
        }));

        // OR 
        // setDetailsKey("addresses", newAddresses);
    }
    
    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validateSite(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_site', {
                ...details,
                o_id: selectedOrg.orgId,

                address_line1: details.addresses[0]?.address,
                address_line2: "",
                country_id: details.addresses[0]?.country_id,
                state_id: details.addresses[0]?.state_id,
                city_id: details.addresses[0]?.city_id,

                latitude: details.addresses[0]?.latitude,
                longitude: details.addresses[0]?.longitude,
            })
            .then(res => {
                message.success("Site added successfully");
                navigate(homePath);
            })
            .catch(err => {
                console.log(err);
                try {
                    if(typeof(err.response.data.detail) === 'string') {
                        message.error(err.response.data.detail);
                    }
                    else {
                        message.error("Error adding site");
                    }
                } catch (error) {
                    message.error("Error adding site");
                }
            });
        }
        else {
            await axios.put('/admin-api/modify_site', {
                ...details,
                o_id: selectedOrg.orgId,

                address_line1: details.addresses[0]?.address,
                address_line2: "",
                country_id: details.addresses[0]?.country_id,
                state_id: details.addresses[0]?.state_id,
                city_id: details.addresses[0]?.city_id,
                latitude: details.addresses[0]?.latitude,
                longitude: details.addresses[0]?.longitude,
            })
            .then(res => {
                message.success("Site updated successfully");
                navigate(homePath);
            })
            .catch(err => {
                console.log(err);
                try {
                    if(typeof(err.response.data.detail) === 'string') {
                        message.error(err.response.data.detail);
                    }
                    else {
                        message.error("Error updating site");
                    }
                } catch (error) {
                    message.error("Error updating site");
                }
            });
        }
        setLoading(false);
    }


    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Site 
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
                    activeKey={activeTab}
                    onChange={changeActiveTab}
                >
                    <TabPane className="my-form-tabpane-outer" tab="Site Details" key="details">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Region" error={errors.region_id} reqMark={true}>
                                    <Select
                                        value={details.region_id}
                                        className="my-form-input"
                                        onChange={(value) => setDetailsKey('region_id', value)}
                                        loading={loading || selectOptions.regions.length == 0}
                                        disabled={!isAddNew || loading || selectOptions.regions.length == 0}
                                        showSearch={true}
                                        optionFilterProp="children"
                                        status={errors?.region_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions.regions.map(r => (
                                            <Select.Option key={r.region_id} value={r.region_id}>
                                                {r.region_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                                <InputWithLabel label="Area" error={errors.area_id} reqMark={true}>
                                    <Select
                                        value={details.area_id}
                                        className="my-form-input"
                                        onChange={(value) => setDetailsKey('area_id', value)}
                                        loading={loading || selectOptions.areas.length == 0}
                                        disabled={!isAddNew || loading || selectOptions.areas.length == 0}
                                        showSearch={true}
                                        optionFilterProp="children"
                                        status={errors?.area_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions.areas.map(a => (
                                            <Select.Option key={a.area_id} value={a.area_id}>
                                                {a.area_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>
                            </div>
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Site Name" error={errors.site_name} reqMark={true}>
                                    <Input
                                        value={details.site_name}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("site_name", e.target.value)}
                                        status={errors?.site_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                                <InputWithLabel label="Site Code" error={errors.site_code} reqMark={true}>
                                    <Input
                                        value={details.site_code}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("site_code", e.target.value)}
                                        status={errors?.site_code?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
                            </div>
                            <div>
                                <AssignActionPlans
                                    selectedOrg={selectedOrg}
                                    loading={loading}

                                    action_plans={details.action_plans}
                                    setActionPlans={(newActionPlans) => setDetailsKey("action_plans", newActionPlans)}
                                />
                            </div>
                            <div>
                                <RemarkComponent
                                    description={details.description}
                                    comments={details.comments}
                                    audit_remark={details.audit_remark}

                                    auditRemarkError={errors.audit_remark}
                                    descriptionError={errors.description}
                                    commentsError={errors.comments}

                                    setDetailsKey={setDetailsKey}
                                />
                            </div>
                            <div>
                                <TempFieldsComponent
                                    temp_field_1={details.temp_field_1}
                                    temp_field_2={details.temp_field_2}
                                    temp_field_3={details.temp_field_3}

                                    setDetailsKey={setDetailsKey}
                                />
                            </div>
                        </Spin>
                    </TabPane>
                    {
                      !isAddNew && !loading && (
                        <TabPane className="my-form-tabpane-outer" tab="Zones" key="zones" disabled={isAddNew}>
                          <Spin
                            spinning={loading || !permissions.edit}
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>}
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                          >
                            <div className="site-drawer-render-in-current-wrapper">
                              
                              <SiteZoneEditTab
                                siteId={siteId}
                                selectedOrg={selectedOrg}
                                permissions={permissions}

                                siteDetails={details}
                              />
                            </div>
                          </Spin>
                        </TabPane>
                      )
                    }
                    <TabPane className="my-form-tabpane-outer" tab="Address Details" key="address">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <AddressesForm
                                addresses={details.addresses}
                                setAddresses={setAddresses}
                                key={details.addresses?.[0]?.address}

                                allowAddRemove={false}
                                showLatitudeLongitude={true}
                            />
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}
