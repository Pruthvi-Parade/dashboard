import { DatePicker } from 'antd';
import moment from 'moment';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { InputWithLabel } from '../../Components/Components';


// This component will have its own state and then on blur it will set the main state
// This is optimization for the API calls
export default function DateRange({
    selectedOrg,

    value,
    setValue = () => {alert("DateRange setValue method not defined")},

    format = 'DD MMM YYYY',
    showTime=false,
    pickerLabel="Select Date Range",
}) {
    // const [dateRange, setDateRange] = useState(value);
    // useEffect(() => {
    //     setDateRange(value);
    // }, [value]);


    return (
        <InputWithLabel label={pickerLabel}>
            <DatePicker.RangePicker 
                className="my-form-input" 

                format={format}
                showTime={showTime}

                value={value}
                // value={dateRange}
                onChange={(value) => {
                    // setDateRange(value);
                    setValue(value);
                }}
                // onBlur={() => {setValue(dateRange)}}

                allowClear={false}

                disabledDate={(current) => {return current && current > moment().endOf('day');}}
            />
        </InputWithLabel>

    )
}
