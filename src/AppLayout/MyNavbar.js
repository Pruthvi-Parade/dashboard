import { Layout, Menu, Spin } from "antd";
import React from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Outlet, Route, Routes } from "react-router-dom";
import OrgSelector from "../Components/OrgSelector";
import { useSelector } from "react-redux";
import GlobalSearch from "./GlobalSearch";

export default function MyNavbar({ collapsed, onCollapse, globalSearchItems }) {
    const globalReducer = useSelector(state => state.globalReducer);

    return (
        <Layout>
            <Layout.Header>
                <div style={{ display: "inline-flex", width: "100%", justifyContent: "space-between" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: '10px', alignItems: 'center'}}>
                        {collapsed ? (
                            <MenuUnfoldOutlined onClick={() => onCollapse(!collapsed)} />
                        ) : (
                            <MenuFoldOutlined onClick={() => onCollapse(!collapsed)} />
                        )}
                        <img
                            alt="logo"
                            src="https://images.smart-iam.com/logo.png"
                            style={{height: '35px', marginLeft: '0px'}}
                        />
                        <div style={{fontSize: '14px', marginLeft: '0px'}}>
                            <GlobalSearch
                                items={globalSearchItems}
                            />
                        </div>
                        <div id="navbar-page-name-portal" style={{paddingLeft: '0px'}}>

                        </div>
                    </span>
                    {/* <Routes>
                        <Route path="cms" element={cmsEventsPageContent} />
                        <Route path="companion" element={<CompanionNavbar />} />
                        <Route path="*" element={<>Home</>} />
                    </Routes> */}
                    <div id="navbar-selector-portal" style={{paddingLeft: '0px'}}>
                        {/* <OrgSelector /> */}
                    </div>
                </div>
            </Layout.Header>
            <Layout.Content className="main-content-div">
                {globalReducer.orgLoading || !globalReducer.selectedOrg.orgId ? (
                    <div className="App" style={{textAlign: 'center'}}>
                        <Spin size="large" style={{marginTop: '50px'}} />
                    </div>
                ) : (
                    <Outlet />
                )}
            </Layout.Content>
        </Layout>
    );
}
