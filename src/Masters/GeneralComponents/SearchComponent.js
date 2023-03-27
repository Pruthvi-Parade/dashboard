import { Input, Select } from 'antd';
import React from 'react'
import { useEffect } from 'react';
import { InputWithLabel } from '../../Components/Components';

export default function SearchComponent({
    masterState,            // The masterState that is to be searched (Array of jsons)
    state,                  // The state that is set
    setState,               // The setState function of the state

    searchOptions,          // The options of keys to search in [{keyName: 'key1', label: 'Key 1'}]

    defaultSearchKeys,      // The default search keys to be searched [{keyName: 'key1', label: 'Key 1'}]

    isLabelInline=true,    // Whether the label is inline or not
    onSearchEnded=(search, keys) => {},               // The onSearch function that is to be called when the search is done
}) {
    const [searchKeys, setSearchKeys] = React.useState(defaultSearchKeys || searchOptions.map(option => option.keyName));
    const [searchText, setSearchText] = React.useState('');


    const handleSearch = () => {
        // Return all rows that have the search text in any of the search keys
        if(searchText.length === 0 || searchKeys.length === 0) {
            setState(masterState);
            return;
        }
        const filteredRows = masterState.filter(row => {
            return searchKeys.some(key => {
                try {
                    return row[key].toLowerCase().includes(searchText.toLowerCase());
                } catch (err) {
                    return false;
                }
            });
        }); 
        setState(filteredRows);
        onSearchEnded(searchText, searchKeys);
    }

    useEffect(() => {
        handleSearch();
    }, [searchText, masterState, searchKeys]);

    return (
        <div style={{display: 'inline-flex', alignItems: 'flex-end'}}>
            <InputWithLabel isInline={isLabelInline} label="Search In">
                <Select
                    showSearch={false}
                    mode='multiple'
                    value={searchKeys}
                    onChange={(value) => setSearchKeys(value)}
                    style={{ width: '270px' } }
                    maxTagCount={2}
                >    
                    {searchOptions.map((option) => (
                        <Select.Option key={option.keyName} value={option.keyName}>{option.label}</Select.Option>
                    ))}
                </Select>
            </InputWithLabel>
            <InputWithLabel>
                <Input
                    placeholder='Search'
                    style={{ width: '250px' } }
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </InputWithLabel>
        </div>
    )
}
