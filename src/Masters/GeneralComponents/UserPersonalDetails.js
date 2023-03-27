import { Input, Select } from 'antd'
import React from 'react'
import { InputWithLabel } from '../../Components/Components'


/*
    This funtion has two imp parameters
     details: {                 // These keys are compulsory
        e_firstname,
        e_lastname,
        e_code,
        e_gender,

        e_contact_no,
        e_alternate_contact_no,,
        e_email,,
        e_alternate_email,,

        e_aadhar_no,
    }


    setDetails will passin 
        first parameter as :
            one of the above key and
        second parameter as:
            value of that key 

*/

export default function UserPersonalDetails({
    details={},
    setDetailsKey=(key, value) => {alert("Set UserPersonal Details Key Method not defined")},

    errors={},
}) {

    return (
        <>
            <div className="my-form-multiple-inline-input">
                <InputWithLabel label="First Name" error={errors.e_firstname} reqMark={true}>
                    <Input 
                        value={details.e_firstname}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('e_firstname', e.target.value)}}
                        status={errors?.e_firstname?.errors?.[0]?.msg && "error"}
                    />
                </InputWithLabel>
                <InputWithLabel label="Last Name" error={errors.e_lastname} reqMark={true}>
                    <Input
                        value={details.e_lastname}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('e_lastname', e.target.value)}}
                        status={errors?.e_lastname?.errors?.[0]?.msg && "error"}
                    />
                </InputWithLabel>
                <InputWithLabel label="Code" error={errors.e_code}>
                    <Input
                        value={details.e_code}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('e_code', e.target.value)}}
                        status={errors?.e_code?.errors?.[0]?.msg && "error"}
                    />
                </InputWithLabel>
                <InputWithLabel label="Gender" error={errors.e_gender} reqMark={true}>
                    <Select
                        value={details.e_gender}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey("e_gender", e)}}
                        status={errors?.e_gender?.errors?.[0]?.msg && "error"}
                    >
                        <Select.Option value={1}>Male</Select.Option>
                        <Select.Option value={2}>Female</Select.Option>
                    </Select>
                </InputWithLabel>
            </div>
            <div className="my-form-multiple-inline-input">
                <InputWithLabel label="Contact No" error={errors.e_contact_no} reqMark={true}>
                    <Input
                        value={details.e_contact_no}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('e_contact_no', e.target.value)}}
                        status={errors?.e_contact_no?.errors?.[0]?.msg && "error"}
                    />
                </InputWithLabel>
                <InputWithLabel label="Alternate Contact No" error={errors.e_alternate_contact_no}>
                    <Input
                        value={details.e_alternate_contact_no}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('e_alternate_contact_no', e.target.value)}}
                        status={errors?.e_alternate_contact_no?.errors?.[0]?.msg && "error"}
                    />
                </InputWithLabel>
            </div>
            <div className="my-form-multiple-inline-input">
                <InputWithLabel label="Email" error={errors.e_email} reqMark={true}>
                    <Input
                        value={details.e_email}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('e_email', e.target.value)}}
                        status={errors?.e_email?.errors?.[0]?.msg && "error"}
                    />
                </InputWithLabel>
                <InputWithLabel label="Alternate Email" error={errors.e_alternate_email}>
                    <Input
                        value={details.e_alternate_email}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('e_alternate_email', e.target.value)}}
                        status={errors?.e_alternate_email?.errors?.[0]?.msg && "error"}
                    />
                </InputWithLabel>
            </div>
            <div className="my-form-multiple-inline-input">
                <InputWithLabel label="Aadhar No" error={errors.e_aadhar_no}>
                    <Input
                        value={details.e_aadhar_no}
                        className="my-form-input"
                        onChange={(e) => {setDetailsKey('e_aadhar_no', e.target.value)}}
                        status={errors?.e_aadhar_no?.errors?.[0]?.msg && "error"}
                    />
                </InputWithLabel>
            </div>
        </>
    )
}
