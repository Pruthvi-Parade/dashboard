import { Input } from 'antd'
import React from 'react'
import { InputWithLabel } from '../../Components/Components'

/*
    This is for the description, comment and audit_remark components

*/

export default function RemarkComponent({
    description="",
    comments="",
    audit_remark="",

    descriptionKey="description",
    commentsKey="comments",
    auditRemarkKey="audit_remark",

    auditRemarkError={},
    descriptionError={},
    commentsError={},

    showAuditRemark=true,

    setDetailsKey=(key, value) => {alert("Set Remark Component Key Method not defined")},
}) {


    return (
        <div className='my-form-multiple-inline-input'>
            <InputWithLabel label={`Description`} error={descriptionError}>
                <Input.TextArea
                    value={description}
                    style={{width: '500px'}}
                    onChange={(e) => setDetailsKey(descriptionKey, e.target.value)}
                    placeholder="Description"
                    autosize={{ minRows: 2, maxRows: 6 }}

                    status={descriptionError?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
            <InputWithLabel label={`Comments`} error={commentsError}>
                <Input.TextArea
                    value={comments}
                    style={{width: '500px'}}
                    onChange={(e) => setDetailsKey(commentsKey, e.target.value)}
                    placeholder="Comments"
                    autosize={{ minRows: 2, maxRows: 6 }}

                    status={commentsError?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
            <InputWithLabel label={`Audit Remark`} error={auditRemarkError} reqMark={true}>
                <Input.TextArea
                    value={audit_remark}
                    style={{width: '500px'}}
                    onChange={(e) => setDetailsKey(auditRemarkKey, e.target.value)}
                    placeholder="Audit Remark"
                    autosize={{ minRows: 2, maxRows: 6 }}

                    status={auditRemarkError?.errors?.[0]?.msg && "error"}
                />
            </InputWithLabel>
        </div>
    )
}
