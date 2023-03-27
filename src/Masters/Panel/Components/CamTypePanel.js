import { Input, message, Select } from 'antd'
import axios from 'axios';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { InputWithLabel } from '../../../Components/Components'

/*
    If the panel is of type "CAM" 

    Extra components to take care of here are
        p_cam_info_id,
        camera_username,
        camera_password,
        
*/
export default function CamTypePanel({
    details,
    setDetails = () => {alert("setDetails not defined")},
    setDetailsKey = () => {alert("setDetailsKey not defined")},

    errors={},

    isAddNew,
    selectedOrg,
}) {
    return (
    <>
        <div className="my-form-multiple-inline-input">
            <InputWithLabel label="Camera Username" error={errors.camera_username} reqMark={true}>
                <Input
                    value={details.camera_username}
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('camera_username', e.target.value)}}
                    status={errors?.camera_username?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
            <InputWithLabel label="Camera Password" error={errors.camera_password} reqMark={true}>
                <Input.Password
                    value={details.camera_password}
                    type="password"
                    className="my-form-input"
                    onChange={(e) => {setDetailsKey('camera_password', e.target.value)}}
                    status={errors?.camera_password?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
        </div>
    </>
    )
}
