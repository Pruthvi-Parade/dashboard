import { Input, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import {useKeyPress} from '../Components/useKeyPress';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { gr_setSelectedOrg } from '../Redux/Actions/GlobalActions';
import { FaRegBuilding } from "react-icons/fa";
import { CgOrganisation } from "react-icons/cg";


/*
This component opens up in a modal and searches and navigates to the selected item.  

Items is an array of objects with the following properties:
    - name: string || React component
    - icon: React component
    - pathname: string 
    - onClick: function -- optional
    - search: string that will be searched for in the global search

*/
export default function GlobalSearch({
    items=[],
}) {
    // This is coz we also want to select org from the search
    // For generalized template https://github.com/Shlok-Zanwar/React-Template/blob/main/src/AppLayout/GlobalSearch.js
    const orgTreeOptions = useSelector(state => state.globalReducer.orgOptions);
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const location = useLocation();

    const [searchOpen, setSearchOpen] = useState(false);    // For modal
    const [search, setSearch] = useState('');               // For input box


    // This is for navigating through the up daown keys
    // We just set the index and use css to highlight the item
    // and also on click or enter pressed we sent the `item` to handleClick function  
    const [highlightedItem, setHighlightedItem] = useState(0);

    // main options array
    const [filteredItems, setFilteredItems] = useState(items);


    // On search change we set the highlighted item to 0
    const onSearchChange = (e) => {
        setSearch(e.target.value);
        setHighlightedItem(0);
    }

    const handleCancel = () => {
        setSearchOpen(false);
        // setSearch('');
    }

    // On click we either run the function or we navigate to the page
    const handleClick = (item) => {
        if (!item) return;

        if (item.onClick) {
            item.onClick();
        } else {
            navigate(item.pathname);
        }
        setSearchOpen(false);
    }

    // This is for the up donw keys highlight item 
    const arrowUpPressed = useKeyPress('ArrowUp');
    const arrowDownPressed = useKeyPress('ArrowDown');
    const enterPressed = useKeyPress('Enter');
    useEffect(() => {
        if(searchOpen){
            // console.log("Hii")
            if (arrowUpPressed) {
                setHighlightedItem(prev => (highlightedItem - 1 + filteredItems.length) % filteredItems.length);
            }
            if (arrowDownPressed) {
                setHighlightedItem(prev => (prev + 1) % filteredItems.length);
            }    
            // If enter is pressed the handleClick will take care of navigation / function
            if (enterPressed) {
                handleClick(filteredItems[highlightedItem]);
            }
        }
    }, [arrowUpPressed, arrowDownPressed, enterPressed]);
  

    // This is the search shortcut key .... Change the if to change the keys
    const handleSearchShortcut = (e) => {
        if (e.key === "k" && e.ctrlKey) {
            e.preventDefault();
            setSearchOpen(true);
        }
    }
    React.useEffect(() => {
        document.addEventListener('keydown', (e) => {
            handleSearchShortcut(e);
        });
        return () => document.removeEventListener('keydown', handleSearchShortcut);
    }, [searchOpen, highlightedItem])

    // Whenever the search window closes we reset the search and item
    useEffect(() => {
        if (!searchOpen) {
            setHighlightedItem(0);
            setSearch('');
        }
    }, [searchOpen])


    useEffect(() => {
        var trimmedSearch = search.trim();

        // If no search show the items ( menu items )
        if(trimmedSearch === ""){
            setFilteredItems(items);
        }
        // > means we will search and select org
        else if (trimmedSearch[0] === ">"){
            // If the path has edit we dont allow to change the org
            if(location.pathname.includes("add") || location.pathname.includes("edit")){
                setFilteredItems([]);
                message.error("Cannot change the org while adding or editing");
                return;
            }

            // orgTreeOptions 
            /*
                {
                    orgId: 
                    orgName:
                    children: [
                        {orgId, orgName},
                        ///////

                    ]
                }
            
                if the org or any of the children match add then to the list

                This is not taken care recursively...
                Assuming at max there will be two level nested trr in the org

                We will search the org that matches and add it to the list and also add
                a onClick function which dispatches the selection of the org to the central redux. 
            */
            const newSearch = trimmedSearch.split(">")[1]?.trim()
            
            const searchOrgs = [];
            for(var org of orgTreeOptions){
                if (org.orgName.toLowerCase().includes(newSearch.toLowerCase())) {
                    searchOrgs.push({
                        name: org.orgName,
                        icon: <CgOrganisation />,
                        ...org,
                        onClick: () => {
                            // console.log("clicked")
                            dispatch(gr_setSelectedOrg({
                                ...org
                            }));
                        }
                    })
                }

                if(org.children){
                    for(const child of org.children){
                        // console.log(child)
                        if (child.orgName.toLowerCase().includes(newSearch.toLowerCase())) {
                            searchOrgs.push({
                                name: child.orgName,
                                icon: <FaRegBuilding />,
                                ...child,
                                onClick: () => {
                                    // console.log("clicked")
                                    dispatch(gr_setSelectedOrg({
                                        ...child
                                    }));
                                }
                            })
                        }
                    }
                }
            }

            setFilteredItems(searchOrgs);
        }
        // Else we just search it in the menu items
        else{
            const newFilteredItems = items.filter(item => {
                if (item.search) {
                    return item.search.toLowerCase().includes(trimmedSearch.toLowerCase());
                }
                return false;
            })
            setFilteredItems(newFilteredItems);
        }
    }, [search])

    // const filteredItems = items.filter(item => {
    //     if (item.search) {
    //         return item.search.toLowerCase().includes(search.toLowerCase());
    //     }
    //     return false;
    // })
 
    return (
        <div className="global-search">
            <Modal
                title={(<>
                    Global Search 
                    <span 
                        onClick={() => {
                            setSearch(">");
                            setHighlightedItem(0);
                        }} 
                        style={{fontSize: '12px', marginLeft: '20px', cursor: 'pointer'}}
                    >
                        ( Start with &gt; to search orgs )
                    </span>
                </>)}
                open={searchOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose={true}
            >
                <Input
                    placeholder="Search"
                    key={searchOpen}
                    value={search}
                    onChange={onSearchChange}
                    allowClear={true}
                    // this should always be infocus
                    autoFocus={true}
                />
                <div style={{ marginTop: 10, maxHeight: 400, overflowY: 'auto' }}>
                    {/* Div should automatically scroll to highlighted item */}
                    {
                        filteredItems.map((item, index) => (
                            <div
                                // The highlighted item is just for visulization and handled in CSS.
                                style={{
                                    padding: 5,
                                    backgroundColor: index === highlightedItem ? 'var(--navbarBackground)' : 'white',
                                    color: index === highlightedItem ? 'var(--navbarColor)' : 'black',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    fontSize: '20px'
                                }}

                                // Check logic and comments above
                                onClick={() => handleClick(item) }

                                // if this is the highlighted item, scroll to it
                                ref={index === highlightedItem ? (el) => {
                                    if (el) {
                                        el.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                                    }
                                } : null}

                                // Mouse enter should highlight the item
                                // But it should not be affected by the automatic scrolling
                                onMouseEnter={() => {
                                    setHighlightedItem(index);
                                }}
                                key={item.key || item.name}
                            >
                                <span>
                                    {item.icon}
                                </span>
                                <span style={{ marginLeft: 10 }} >
                                    {item.name}
                                </span>
                            </div>
                        ))
                    }
                </div>
            </Modal>
            <div style={{ color: '#9e9e9e', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} onClick={() => setSearchOpen(true)}>
                <FaSearch />
                <span style={{ marginLeft: 5 }}>Ctrl + K</span>
            </div>
        </div>
    )
}
