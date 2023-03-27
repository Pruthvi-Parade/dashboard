import { message, Select } from 'antd';
import TreeSelect, { TreeNode } from 'antd/lib/tree-select';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ar_logoutUser, ar_setUserScopes } from '../Redux/Actions/AuthActions';
import { gr_setOrgOptions, gr_setOrgsLoading, gr_setSelectedOrg } from '../Redux/Actions/GlobalActions';
import { InputWithLabel } from './Components';

export default function OrgSelector({
    labelInline=true,
    labelDivStyle={width: '300px'}
}) {
    const globalReducer = useSelector(state => state.globalReducer);
    const dispatch = useDispatch();
    let [seachParams, setSearchParams] = useSearchParams();
    let location = useLocation();

    // Add orgid in params on route change 
    useEffect(() => {
        if(!globalReducer.selectedOrg.orgId) {
            return;
        }
        seachParams.set("orgId", globalReducer.selectedOrg.orgId);
        setSearchParams(seachParams, {
            replace: true,
        });
    }, [location.pathname, globalReducer.selectedOrg]);

    const handleSelectOrgChange = (value) => {
        var org = JSON.parse(value);
        dispatch(gr_setSelectedOrg(org));
    }

    const changeOrgKeys = (orgs, paramOrgId) => {       // orgs is a list of jsons
        return orgs.map(org => {
            if(org.o_id === paramOrgId){
                // console.log("org.o_id === paramOrgId", org.o_id, paramOrgId);
                dispatch(gr_setSelectedOrg({
                    orgId: org.o_id,
                    orgName: org.o_name,
                    orgCode: org.o_code,
                    orgTypeId: org.o_type_id,
                }));
            }

            return {
                orgId: org.o_id,
                orgName: org.o_name,
                orgCode: org.o_code,
                orgTypeId: org.o_type_id,
                children: org.children ? changeOrgKeys(org.children, paramOrgId) : [],
            }
        });
    }


    const [orgTreeOptions, setOrgTreeOptions] = useState([]);
    const [orgTreeNodeComponent, setOrgTreeNodeComponent] = useState(<></>);

    const createTreeNodes = (orgs) => {
        return orgs.map (org => (
            <TreeNode
                title={`${org.orgCode} / ${org.orgName}`}
                // key={org.orgId} 
                value={JSON.stringify({
                    orgId: org.orgId,
                    orgName: org.orgName,
                    orgCode: org.orgCode,
                    orgTypeId: org.orgTypeId,
                })}
            >
                {/* {org.children.map(c => createTreeNodes(c))} */}
                {org.children && createTreeNodes(org.children)}
            </TreeNode>
        ));
    }

    const getAllOrgs = async() => {
        dispatch(gr_setOrgsLoading(true));

        await axios.get("/admin-api/all_org_tree")
            .then(res => {
                const data = res.data.data;
                
                const userScopes = res.data.user_scopes;
                dispatch(ar_setUserScopes(userScopes));
                
                const paramOrgId = parseInt(seachParams.get('orgId'));
            
                // data is array of orgs
                var myTree = changeOrgKeys(data, paramOrgId);
                // console.log("myTree", myTree);
                setOrgTreeOptions(myTree);
                setOrgTreeNodeComponent(createTreeNodes(myTree));
                
                dispatch(gr_setOrgOptions(myTree));
            })
            .catch(err => {
                console.log(err);
                try {
                    if(err.response.status === 401) {
                        dispatch(ar_logoutUser());
                    }
                } catch (error) {
                    message.error("Something went wrong! Refresh!");
                }
            })

        dispatch(gr_setOrgsLoading(false));
    }

    
    // This useEffect Takes care that the default org is selected when there is no org in the url
    useEffect(() => {
        if(orgTreeOptions.length > 0 && !globalReducer.selectedOrg.orgId) {
            dispatch(gr_setSelectedOrg(
                {
                    orgId: orgTreeOptions[0].orgId,
                    orgName: orgTreeOptions[0].orgName,
                    orgCode: orgTreeOptions[0].orgCode,
                    orgTypeId: orgTreeOptions[0].orgTypeId,
                }
            ));
        }
    } , [orgTreeOptions]);    

    useEffect(() => {
        getAllOrgs();      
    }, []);

    // useEffect(() => {
    //     console.log(orgTreeOptions);
    //     console.log(orgTreeNodeComponent);
    // } , [orgTreeOptions, orgTreeNodeComponent]);


    
    const showTreeLine = true;
    const showLeafIcon = false;

    return (
        <InputWithLabel label="Org" divStyle={labelDivStyle} labelColor="#fff" isInline={labelInline}>
            <TreeSelect 
                // Disable if the path name includes "add" or "edit"
                disabled={globalReducer.orgsLoading || location.pathname.includes("add") || location.pathname.includes("edit")}
                loading={globalReducer.orgsLoading}
                treeLine={showTreeLine && { showLeafIcon }}
                // style={{ width: 300}} 
                style={{ width: "100%", display: "inline-flex", alignItems: "center" }}
                showSearch={true}
                value={globalReducer.selectedOrg.orgName}
                dropdownStyle={{ zIndex: 2000 }}
                onChange={handleSelectOrgChange}
                // suffixIcon={<LockOutlinedIcon />}
                // switcherIcon={<LockOutlinedIcon />}
                treeDefaultExpandAll={true}
            >
                {orgTreeNodeComponent}
            </TreeSelect>
        </InputWithLabel>    
    )
}


/*
const changeOrgKeys = (org) => {
    if(org.o_id === paramOrgId){
        // console.log("org.o_id === paramOrgId", org.o_id, paramOrgId);
        dispatch(gr_setSelectedOrg({
            orgId: org.o_id,
            orgName: org.o_name,
            orgCode: org.o_code,
            orgTypeId: org.o_type_id,
        }));
    }

    return {
        orgId: org.o_id,
        orgName: org.o_name,
        orgCode: org.o_code,
        orgTypeId: org.o_type_id,
        children: org.children.map(c => changeOrgKeys(c)),
    }
}

        // await axios.get("/admin-api/all_org")
        //     .then(res => {
        //         var orgs = [];
        //         var selectOrg = {};
        //         var paramOrgId = seachParams.get('orgId');

        //         for(var org of res.data) {
        //             if(paramOrgId && org.o_id == paramOrgId) {
        //                 selectOrg = {
        //                     orgId: org.o_id,
        //                     orgName: org.o_name
        //                 };
        //             }

        //             orgs.push({
        //                 orgId: org.o_id,
        //                 orgName: org.o_name,
        //                 orgCode: org.o_code
        //             });
        //         }
                
        //         if(!selectOrg.orgId) {
        //             selectOrg = orgs[0];
        //         }

        //         dispatch(gr_setOrgOptions(orgs));
        //         // handleSelectOrgChange(JSON.stringify(selectOrg));
        //     })
        //     .catch(err => {
        //         console.log(err);
        //     });


*/