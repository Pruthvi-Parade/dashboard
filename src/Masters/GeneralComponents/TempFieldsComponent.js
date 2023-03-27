import { Input } from 'antd'
import React from 'react'
import { InputWithLabel } from '../../Components/Components'

/*
    This is for the temp_field_1, temp_field_2, temp_field_3 components

*/


export default function TempFieldsComponent({
    temp_field_1="",
    temp_field_2="",
    temp_field_3="",

    tempField1Key="temp_field_1",
    tempField2Key="temp_field_2",
    tempField3Key="temp_field_3",

    showTempField1=true,
    showTempField2=true,
    showTempField3=true,

    setDetailsKey=(key, value) => {alert("SetDetailsKey Key Method not defined")},
}) {

    return (
        <div className="my-form-multiple-inline-input">
            {showTempField1 &&
                 <InputWithLabel label={`Temp 1`}>
                    <Input
                        value={temp_field_1}
                        className="my-form-input"
                        onChange={(e) => setDetailsKey(tempField1Key, e.target.value)}
                    />
                </InputWithLabel>
            }
            {showTempField2 &&
                <InputWithLabel label={`Temp 2`}>
                    <Input
                        value={temp_field_2}
                        className="my-form-input"
                        onChange={(e) => setDetailsKey(tempField2Key, e.target.value)}
                    />
                </InputWithLabel>
            }
            {showTempField3 &&
                <InputWithLabel label={`Temp 3`}>
                    <Input
                        value={temp_field_3}
                        className="my-form-input"
                        onChange={(e) => setDetailsKey(tempField3Key, e.target.value)}
                    />
                </InputWithLabel>
            }
        </div>
    )
}
