import { message, Select } from 'antd'
import axios from 'axios';
import React, { useState } from 'react'
import { useEffect } from 'react';
// import { InputWithLabel } from '../../Components/Components'

/*
    This is for Assigning action plans for site, area, region.
*/


export default function AssignActionPlans({
    selectedOrg,
    loading,

    action_plans,
    // actionPlanKey="action_plans",

    setActionPlans=(NewActionPlans) => {alert("Set Action Plans Method not defined")},
}) {

    const [selectOptions, setSelectOptions] = useState({
        actionPlans: [],
    });

    // const getActionPlans = async () => {

    //     /*
    //         [
    //              {
    //                 "action_plan_id": 147,
    //                 "action_plan_name": "7621-T Lingampally -Telangana",

    //                 Extra fields:      
    //                 is_active, is_deleted, created_time, updated_time, created_by, updated_by, m_severity_id, comments, description, o_id
    //             },
    //         ]
    //     */
    //     axios.get('/admin-api/all_action_plans_by_o_id', {
    //         params: {
    //             o_id: selectedOrg.orgId,
    //             send_z_grp_flag: false,
    //         }
    //     })
    //         .then(res => {
    //             const data = res.data.data;
                
    //             setSelectOptions(curr => ({
    //                 ...curr,
    //                 actionPlans: data,  
    //             }));
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             message.error('Error getting action plans');
    //         })
    // }
        
    // useEffect(() => {
    //     getActionPlans();
    // }, []);

    return (
        <div className="my-form-multiple-inline-input">
            {/* <InputWithLabel label="Action Plans">
                <Select
                    value={action_plans}
                    mode="multiple"
                    className="my-form-input"
                    style={{width: '410px'}}
                    // onChange={(value) => setDetailsKey(actionPlanKey, value)}
                    onChange={(value) => setActionPlans(value)}
                    loading={loading || selectOptions.actionPlans.length == 0}
                    disabled={loading || selectOptions.actionPlans.length == 0}
                    showSearch={true}
                    optionFilterProp="children"
                >
                    {selectOptions.actionPlans && selectOptions.actionPlans.map(ap => (
                        <Select.Option key={ap.action_plan_id} value={ap.action_plan_id}>
                            {ap.action_plan_name}
                        </Select.Option>
                    ))}
                </Select>
            </InputWithLabel> */}
        </div>
    )
}
