import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { Select, Input, Button, Divider } from 'antd'
import { InputWithLabel } from '../../Components/Components';
import {BiRefresh} from 'react-icons/bi';

/*
    This form expects an array of address
    [
        {
            address: 'Test',
            country_id: 1,
            state_id: 1,
            city_id: 1,

            latitude: 1,
            longitude: 1,
        },
        {..},
        {..},
    ]
    and then it will set the array of address to the state

*/
export default function AddressesForm({
    addresses=[],
    showLatitudeLongitude=false,
    allowAddRemove=true,
    setAddresses=(newAddresses) => {alert("Set Addresses Method not defined")},           // This basically sets the array of address
}) {

    const setOneAddressByIndex = (index, full_address) => {
        setAddresses(
            [
                ...addresses.slice(0, index),
                {
                    ...addresses[index],
                    ...full_address,
                },
                ...addresses.slice(index + 1),
            ]
        );
    }

    const removeAddress = (index) => {
        
        setAddresses(
            [
                ...addresses.slice(0, index),
                ...addresses.slice(index + 1),
            ]
        );
    }

    const addAddress = () => {
        setAddresses(
            [
                ...addresses, 
                {
                    address: '',
                    country_id: 0,
                    state_id: 0,
                    city_id: 0,

                    latitude: '',
                    longitude: '',
                }
            ]
        );
    }

    return (
        <>
            <div className="my-form-multiple-inline-input">
                <Button type="primary" onClick={addAddress} disabled={!allowAddRemove}>
                    Add
                </Button>
            </div>
            {addresses.map((full_address, index) => (
                <div key={index}>
                    <OneAddress
                        index={index}

                        address={full_address.address}
                        countryId={full_address.country_id}
                        stateId={full_address.state_id}
                        cityId={full_address.city_id}
                        latitude={full_address.latitude}
                        longitude={full_address.longitude}

                        showLatitudeLongitude={showLatitudeLongitude}

                        addressKey="address"
                        countryKey="country_id"
                        stateKey="state_id"
                        cityKey="city_id"
                        latitudeKey='latitude'
                        longitudeKey='longitude'

                        setOneAddressByIndex={setOneAddressByIndex}
                    />
                    <Button style={{marginTop: '10px'}} disabled={index === 0 || !allowAddRemove} type="danger" onClick={() => removeAddress(index)}>
                        Remove
                    </Button>
                    <Divider />
                </div>
            ))}
        </>
    )
}


function OneAddress({
    index,

    address,
    countryId,
    stateId,
    cityId,

    latitude,
    longitude,

    showLatitudeLongitude=false,

    addressKey='address',
    countryIdKey='country_id',
    stateIdKey='state_id',
    cityIdKey='city_id',
    latitudeKey='latitude',
    longitudeKey='longitude',

    setOneAddressByIndex=(index, address) => {alert("Set OneAddressByIndex Method not defined")},                  // This should be a function => index and address ==> {address: 'Test', country_id: 1, state_id: 1, city_id: 1}               
}) {

    const setMultiKeyValue = (dict) => {
        // console.log("CALLED", dict);
        setOneAddressByIndex(
            index,
            dict
            // {
            //     [addressKey]: dict[addressKey] || address,
            //     [countryIdKey]: dict[countryIdKey] || countryId,
            //     [stateIdKey]: dict[stateIdKey] || stateId,
            //     [cityIdKey]: dict[cityIdKey] || cityId,
            // }
        );
    }


    return (
        <div>
            <div className="my-form-multiple-inline-input">
                <InputWithLabel label={`Address ${index + 1}`}>
                    <Input.TextArea
                        value={address}
                        onChange={(e) => {
                            setMultiKeyValue({
                                [addressKey]: e.target.value,
                            });
                        }}
                        placeholder={`Address`}
                        style={{width: '770px'}}
                        autosize={{ minRows: 2, maxRows: 6 }}
                    />
                </InputWithLabel>
            </div>
            <CountryOptions
                countryId={countryId}
                stateId={stateId}
                cityId={cityId}

                countryIdKey={countryIdKey}
                stateIdKey={stateIdKey}
                cityIdKey={cityIdKey}

                setMultiKeyValue={setMultiKeyValue}
            />  
            {showLatitudeLongitude && (
                <div className="my-form-multiple-inline-input">
                    <InputWithLabel label={`Latitude`}>
                        <Input
                            value={latitude}
                            onChange={(e) => {
                                setMultiKeyValue({
                                    [latitudeKey]: e.target.value,
                                });
                            }}
                            placeholder={`Latitude`}
                            style={{ width: '100%', minWidth: '250px' }}
                        />
                    </InputWithLabel>
                    <InputWithLabel label={`Longitude`}>
                        <Input
                            value={longitude}
                            onChange={(e) => {
                                setMultiKeyValue({
                                    [longitudeKey]: e.target.value,
                                });
                            }}
                            placeholder={`Longitude`}
                            style={{ width: '100%', minWidth: '250px' }}
                        />
                    </InputWithLabel>
                </div>
            )}
        </div>
    )
}


function CountryOptions({
    countryId,
    stateId,
    cityId,

    countryIdKey='country_id',
    stateIdKey='state_id',
    cityIdKey='city_id',

    disabled=false,

    setMultiKeyValue=(dict) => {},              // This should be a function => json ==> {country_id: 1, state_id: 1, city_id: 1} || {country_id: 1}
}) {

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const getCountries = async () => {
        /*
            This api returns array of countries:
            [
                {
                    m_country_id: 1,
                    m_country_name: 'Test',
                    description: 'Test',
                    is_delete: 0,
                }
            ]
        */
        await axios.get('/admin-api/all_master_country')
            .then(res => {
                const data = res.data.data;

                setCountries(data);

                if(!countryId){
                    setMultiKeyValue({
                        [countryIdKey]: data[0].m_country_id,
                    });
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const getStates = async (c_id) => {
        /*
            This api returns array of states:
            [
                {
                    m_state_id: 1,
                    m_state_name: 'Test',
                    description: 'Test',

                    m_country_id: 1,
                    is_delete: 0,
                }
            ]
        */
        await axios.get('/admin-api/all_master_state_by_country_id', {
            params: {
                country_id: c_id,
            }
        })
            .then(res => {
                const data = res.data.data;

                setStates(data); 
                if(!stateId){
                    setMultiKeyValue({
                        [stateIdKey]: data[0].m_state_id,
                    });
                }               

            }).catch(err => {
                console.log(err);
            })

    }

    const getCities = async (c_id, s_id) => {
        /*
            This api returns array of cities:
            [
                {
                    m_city_id: 1,
                    m_city_name: 'Test',
                    description: 'Test',

                    m_state_id: 1,
                    m_country_id: 1,
                    is_delete: 0,

                    m_latitude: float,
                    m_longitude: float,
                }
            ]
        */
        await axios.get('/admin-api/all_master_city_by_state_id', {
            params: {
                country_id: c_id,
                state_id: s_id,
            }
        })
            .then(res => {
                const data = res.data.data;

                setCities(data);
                if(!cityId){
                    setMultiKeyValue({
                        [cityIdKey]: data[0].m_city_id,
                    });
                }
            }).catch(err => {
                console.log(err);
            })

    }

    useEffect(() => {
        getCountries();
    }, []);

    useEffect(() => {
        if (countryId) {
            getStates(countryId);
        }
    }, [countryId]);

    useEffect(() => {
        if (stateId) {
            getCities(countryId, stateId);
        }
    }, [stateId]);

    const handleCountryChange = (id) => {
        setMultiKeyValue({
            [countryIdKey]: id,
            [stateIdKey]: null,
            [cityIdKey]: null,
        });
    }
    const handleStateChange = (id) => {
        setMultiKeyValue({
            [stateIdKey]: id,
            [cityIdKey]: null,
        });
    }
    const handleCityChange = (id) => {
        setMultiKeyValue({
            [cityIdKey]: id,
        });
    }




    return (
        <div className='my-form-multiple-inline-input'>
            <InputWithLabel label={<>Country <BiRefresh style={{cursor: 'pointer'}} onClick={getCountries} /></>}>
                <Select 
                    value={countryId} 
                    onChange={handleCountryChange}
                    showSearch
                    filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    style={{ width: '100%', minWidth: '250px' }}
                    loading={countries.length === 0}
                    disabled={disabled}
                >
                    {countries.map(country => (
                        <Select.Option key={country.m_country_id} value={country.m_country_id} name={country.m_country_name}>
                            {country.m_country_name}
                        </Select.Option>
                    ))}
                </Select>
                
            </InputWithLabel>

            <InputWithLabel 
                label={<>State <BiRefresh style={{cursor: 'pointer'}} onClick={() => getStates(countryId)} /></>}
            >
                <Select 
                    value={stateId} 
                    onChange={handleStateChange}
                    showSearch
                    filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    style={{ width: '100%', minWidth: '250px' }}
                    loading={states.length === 0 || !countryId}
                    disabled={disabled}
                >
                    {states.map(state => (
                        <Select.Option key={state.m_state_id} value={state.m_state_id} name={state.m_state_name}>
                            {state.m_state_name}
                        </Select.Option>
                    ))}
                </Select>
            </InputWithLabel>

            <InputWithLabel label={<>City <BiRefresh style={{cursor: 'pointer'}} onClick={() => getCities(countryId, stateId)} /></>}>
                <Select 
                    value={cityId} 
                    onChange={handleCityChange}
                    showSearch
                    filterOption={(input, option) => option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    style={{ width: '100%', minWidth: '250px' }}
                    loading={cities.length === 0 || !stateId}
                    disabled={disabled}
                >
                    {cities.map(city => (
                        <Select.Option key={city.m_city_id} value={city.m_city_id} name={city.m_city_name}>
                            {city.m_city_name}
                        </Select.Option>
                    ))}
                </Select>
            </InputWithLabel>
        </div>
    )
}
