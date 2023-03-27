import React, { useEffect, useState } from "react";
import { Breadcrumb, Layout, Menu, Divider, Input } from "antd";
import { ar_logoutUser } from "../Redux/Actions/AuthActions";
import { useSelector, useDispatch } from "react-redux";

import { FiUser } from "react-icons/fi";
import { MdOutlineClear } from "react-icons/md";
import OrgSelector from "../Components/OrgSelector";

export default function MySider({ collapsed, onCollapse, menuItems=[] }) {
    const globalReducer = useSelector(state => state.globalReducer);
	const authReducer = useSelector(state => state.authReducer);
    const searchInputRef = React.useRef(null);

    const [search, setSearch] = useState("");
    const [filteredItems, setFilteredItems] = useState(menuItems);
    const [openKeys, setOpenKeys] = useState(["masters", "reports"]);

    useEffect(() => {
        if(!collapsed){
            searchInputRef.current.focus();
        }
        setSearch("");
    }, [collapsed]);

    // Filter items recursively if match then keep else remove
    // if any of the children is matched only keep the child and its parent and remove the rest children
    const filterItemsRecursively = (items) => {
        return items.map((item) => {
            if (item.search?.toLowerCase()?.includes(search?.toLowerCase())) {
                return item;
            }
            if (item.children) {
                const filteredChildren = filterItemsRecursively(item.children)
                if (filteredChildren.length > 0) {
                    setOpenKeys(prev => [...prev, item.key])
                    return { ...item, children: filteredChildren };
                }
            }
            return null;
        }).filter(item => item !== null);
    };

    useEffect(() => {
        setFilteredItems(filterItemsRecursively(menuItems));
    }, [search, globalReducer.selectedOrg.orgId]);



    // useEffect(() => {
    //     setFilteredItems(filterItems);
    // }, [search]);


    return (
        <Layout.Sider 
            // style={{ background: "red", height: "100vh", overflow: 'auto' }} 
            className="sidebar-component"
            width={'var(--sidebarOpenWidth)'} 
            collapsedWidth={'var(--sidebarClosedWidth)'}
            collapsed={collapsed} 
            onCollapse={onCollapse}
            // collapsible={true}
        >
            <div className="sidebar-top-logo" style={collapsed ? {textAlign: 'center'} : {} }>
                <FiUser />
                {!collapsed && 
                    <>{authReducer?.user?.username}</>
                }
            </div>
            <>
                {!collapsed &&
                    <div style={{display: 'inline-flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #fff"}}>
                        <input 
                            className="navbar-search-input"
                            placeholder="Search" 
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                            ref={searchInputRef}
                        />
                        <MdOutlineClear
                            onClick={() => {setSearch("")}}
                            style={{fontSize: '15px', marginRight: '10px', cursor: 'pointer'}}
                        />
                    </div>
                }
            </>
            <div className="sidebar-content">
                {/* TODO: Fix menu is flickering when the sidebar is collapsed and expanded */}
                <OrgSelector labelInline={false} labelDivStyle={{padding: '10px', width: '100%', borderBottom: '1px solid grey'}} />

                <Menu 
                    style={{background: "var(--sidebarBackground)", padding: '0px'}}
                    inlineIndent={12}
                    theme="dark"
                    openKeys={openKeys}
                    onOpenChange={(keys) => setOpenKeys(keys)}
                    // defaultSelectedKeys={["masters"]} 
                    // selectable={false}
                    mode={"inline"} 
                    items={filteredItems} 
                    key={globalReducer.selectedOrg.orgId}
                />
            </div>
            <div className="sidebar-footer">
                {collapsed ? "" : "Version : "}
                {process.env.REACT_APP_VERSION || "0.5.1"}
            </div>
        </Layout.Sider>
    );
}
