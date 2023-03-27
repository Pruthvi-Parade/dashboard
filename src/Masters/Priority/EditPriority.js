import React, { useMemo, useState } from "react";
import { Button, Input, Select, Table, Modal, message, Checkbox, Tooltip, Tabs, Switch, TimePicker, Divider, Spin } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import moment from "moment";
import { MdOutlineEditOff } from "react-icons/md";

import { InputWithLabel } from '../../Components/Components';
import RemarkComponent from "../GeneralComponents/RemarkComponent";
import { validatePriorityGroup } from "../../Components/Validations";

const { TabPane } = Tabs;


/*
    Edit and add Priority
        if isAddNew is true => add new Priority

    state:
        details: {
			"priority_group_id": 181,
			"priority_group_name": "Priority 1",
			"priority_group_interval": 1,

            "m_priority_id": 0,

			"comments": null,
			"description": null,
			"audit_remark": null,
		}

*/

export default function EditPriority({
	selectedOrg,
	isAddNew,
	permissions={},

	homePath="/masters/priority",
}) {
	let priorityGroupId = parseInt(useParams().id);
	const navigate = useNavigate();

    // For having the active tab in the url (for refreshing)
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'details');
    const changeActiveTab = (key) => {
        setActiveTab(key);
        searchParams.set('tab', key);
        setSearchParams(searchParams, {replace: true});
    }    

	const [loading, setLoading] = useState(true);

	// Here will be the default state of the form (For add new)
	// For documentation, see the comment above function
	const [details, setDetails] = useState({
		priority_group_id: 0,
		priority_group_name: "",
		priority_group_interval: "",

        m_priority_id: 1,

		description: "",
		comments: "",
		audit_remark: "",
	});
    // This state is for validation Errors
    // Key is the name of the field and value is a json {errors: [{message, type}, {...}], help: ""}
    const [errors, setErrors] = useState({});

    const [selectOptions, setSelectOptions] = useState({
        masterPriorities: [],
    });

	const getDetails = async () => {
		setLoading(true);
		await axios.get('/admin-api/priority_by_priority_group_id', {
			params: {
				priority_group_id: priorityGroupId,
				o_id: selectedOrg.orgId,
			}
		}).then(res => {
			const data = res.data.data;

			setDetails(d => ({
				...d,

				priority_group_id: data.priority_group_id,
				priority_group_name: data.priority_group_name || "",
				priority_group_interval: data.priority_group_interval || "",

                m_priority_id: data.m_priority_id || 1,

				description: data.description || "",
				comments: data.comments || "",
				audit_remark: data.audit_remark || "",
			}));
		}).catch(err => {
			console.log(err);
			message.error('Error while fetching priority details');
			navigate(homePath);
		})

		setLoading(false);
	}

    const getOptions = async () => {
        /*
            {
                "m_priority_id": 1,
                "m_priority_name": "Priority 1",
                "interval": 1,
                "description": null,
                "is_deleted": 0
            },
        */
        axios.get('admin-api/all_master_priority')
            .then(res => {
                const data = res.data.data;

                setSelectOptions(curr => ({
                    ...curr,
                    masterPriorities: data,
                }));
            })
            .catch(err => {
                console.log(err);
                message.error('Error while fetching master priorities');
            })
    }

    // HIGHLIGHT: This is the main useEffect ....... 
    useEffect(() => {
        getOptions();
        if(isAddNew) {
            setLoading(false);
        } 
        else {
            getDetails();
        }
    }, []);

	
    const setDetailsKey = (key, value) => {
        setDetails(d => ({
            ...d,
            [key]: value,
        }));
    }

    const handleSubmit = async () => {
        setLoading(true);

        let d, e, errorTab, errStatus, errorsIn;
        ({d, e, errorTab, errStatus, errorsIn} = validatePriorityGroup(details, errors, isAddNew, "details"));
        setDetails(prev => ({...prev, ...d}));  
        setErrors(prev => ({...prev, ...e}));

        if(errStatus === "error") {
            console.log("Error in form : ", errorsIn);
            setActiveTab(errorTab);

            setLoading(false);
            return;
        }

        if(isAddNew) {
            await axios.post('/admin-api/add_priority_group', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Priority added successfully');
                    navigate(homePath);
                }).catch(err => {
                    console.log(err);
                    message.error('Error while adding priority');
                })
        }
        else {
            await axios.put('/admin-api/modify_priority_group', {
                ...details,
                o_id: selectedOrg.orgId,
            })
                .then(res => {
                    message.success('Priority modified successfully');
                    navigate(homePath);
                })
                .catch(err => {
                    console.log(err);
                    message.error('Error while modifying Priority');
                })
        }
        setLoading(false);
    }

    return (
        <div className='my-form-outer'>
            <div className='my-form-header'>
                <span className='my-form-title'>
                    {isAddNew ? "Add" : "Edit"} Priority Group 
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
                    <TabPane className="my-form-tabpane-outer" tab="Priority Details" key="details">
                        <Spin 
                            spinning={loading || !permissions.edit} 
                            tip={(!loading && !permissions.edit) && <>You Cannot Edit</>} 
                            indicator={(!loading && !permissions.edit) && <MdOutlineEditOff />}
                        >
                            <div className="my-form-multiple-inline-input">
                                <InputWithLabel label="Priority Group Name" error={errors.priority_group_name} reqMark={true}>
                                    <Input
                                        value={details.priority_group_name}
                                        className="my-form-input"
                                        onChange={(e) => setDetailsKey("priority_group_name", e.target.value)}
                                        status={errors?.priority_group_name?.errors?.[0]?.msg && "error"}
                                    />
                                </InputWithLabel>
								<InputWithLabel label="Priority Group Interval" error={errors.priority_group_interval} reqMark={true}>
									<Input
										value={details.priority_group_interval}
                                        type="number"
										className="my-form-input"
										onChange={(e) => setDetailsKey("priority_group_interval", e.target.value)}
                                        status={errors?.priority_group_interval?.errors?.[0]?.msg && "error"}
									/>
								</InputWithLabel>

                                <InputWithLabel label="Master Priority" error={errors.m_priority_id} reqMark={true}>
                                    <Select
                                        value={details.m_priority_id}
                                        className="my-form-input"
                                        onChange={(value) => setDetailsKey("m_priority_id", value)}
                                        disabled={loading || selectOptions.masterPriorities.length == 0}
                                        loading={loading || selectOptions.masterPriorities.length == 0}
                                        status={errors?.m_priority_id?.errors?.[0]?.msg && "error"}
                                    >
                                        {selectOptions.masterPriorities.map(p => (
                                            <Select.Option key={p.m_priority_id} value={p.m_priority_id}>
                                                {p.m_priority_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </InputWithLabel>

                            </div>
                            <div className="my-form-multiple-inline-input">
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
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
}
