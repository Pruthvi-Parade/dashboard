/*
    [
        {
            "region_id": 73,
            "region_name": "Maharashtra",
            "region_code": "REG001",
            "description": null,
            "comments": null,

            Extra fields:
                is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active 

                
            "areas": [
                {
                    "area_id": 111,
                    "area_name": "Mumbai",
                    "area_code": "ARE001",
                    "description": null,
                    "comments": null,
                    "region_id": 73,

                    Extra fields:
                        is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active

                    "sites": [
                        {
                            "site_id": 220,
                            "site_name": "1962-Phoenix Market-Mumbai",
                            "site_code": "1962",

                            "area_id": 111,
                            "region_id": 73,

                            Extra fields:
                                is_deleted, created_time, updated_time, created_by, updated_by, o_id, is_active
                        },
                    ]
                    
                },
            ]
        }
    ]


*/

const allRoutes = {
    masters: [
        {
            path: "scope",
            
            moduleCode: "TAGIDA_SCOPE",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",
                    
                    moduleCode: "TAGIDA_SCOPE",
                    // It will stay if any of the following keys are true.
                    // If all are false, it will be removed.
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditScope 
                            selectedOrg={globalReducer.selectedOrg} 
                            isAddNew={false} 
                            permissions={getPermissions("TAGIDA_SCOPE")}
                        />
                    ),
                },
                {
                    path: "add",
                    
                    moduleCode: "TAGIDA_SCOPE",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditScope
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_SCOPE")}
                        />
                    ),
                },
                {
                    path: "",
                    
                    moduleCode: "TAGIDA_SCOPE",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllScopes 
                            selectedOrg={globalReducer.selectedOrg} 
                            permissions={getPermissions("TAGIDA_SCOPE")}
                        />
                    ),
                }
            ]
        },
        {
            path: "role",

            moduleCode: "TAGIDA_ROLE",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",
                    
                    moduleCode: "TAGIDA_ROLE",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditRole
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            user_permissions={getPermissions("TAGIDA_ROLE")}
                        />
                    ),
                },
                {
                    path: "add",

                    moduleCode: "TAGIDA_ROLE",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditRole
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            user_permissions={getPermissions("TAGIDA_ROLE")}
                        />
                    ),
                },
                {
                    path: "",

                    moduleCode: "TAGIDA_ROLE",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllRoles
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_ROLE")}
                        />
                    ),
                }
            ]
        },
        {
            path: "user",

            moduleCode: "TAGIDA_USER",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",

                    moduleCode: "TAGIDA_USER",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditUser
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_USER")}
                        />
                    ),
                },
                {
                    path: "add",
                    
                    moduleCode: "TAGIDA_USER",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditUser
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_USER")}
                        />
                    ),
                },
                {
                    path: "",

                    moduleCode: "TAGIDA_USER",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllUsers
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_USER")}
                        />
                    ),
                }
            ]
        },
        {
            path: "company",

            moduleCode: "TAGIDA_COMPANY",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",

                    moduleCode: "TAGIDA_COMPANY",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditOrg
                            key="companyEdit"
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_COMPANY")}

                            orgTypeId={3}
                            orgTypeName="Company"
                            homePath="/masters/company"
                        />
                    ),
                },
                {
                    path: "add",

                    moduleCode: "TAGIDA_COMPANY",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditOrg
                            key="companyAdd"
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_COMPANY")}

                            orgTypeId={3}
                            orgTypeName="Company"
                            homePath="/masters/company"
                        />
                    ),
                },
                {
                    path: "",
                    moduleCode: "TAGIDA_COMPANY",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllOrgs
                            key="companyAll"
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_COMPANY")}

                            orgTypeId={3}
                            orgTypeName="Company"
                            editPath="/masters/company/edit"
                            addPath="/masters/company/add"
                        />
                    ),
                }
            ]
        },
        {
            path: "vendor",

            moduleCode: "TAGIDA_VENDOR",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",

                    moduleCode: "TAGIDA_VENDOR",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditOrg
                            key="vendorEdit"
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_VENDOR")}

                            orgTypeId={4}
                            orgTypeName="Vendor"
                            homePath="/masters/vendor"
                        />
                    ),
                },
                {
                    path: "add",

                    moduleCode: "TAGIDA_VENDOR",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditOrg
                            key="vendorAdd"
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_VENDOR")}

                            orgTypeId={4}
                            orgTypeName="Vendor"
                            homePath="/masters/vendor"
                        />
                    ),
                },
                {
                    path: "",
                    moduleCode: "TAGIDA_VENDOR",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllOrgs
                            key="vendorAll"
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_VENDOR")}

                            orgTypeId={4}
                            orgTypeName="Vendor"
                            editPath="/masters/vendor/edit"
                            addPath="/masters/vendor/add"
                        />
                    ),
                }
            ]
        },
        {
            path: "action-plan",
            
            moduleCode: "TAGIDA_ACTION_PLAN",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",

                    moduleCode: "TAGIDA_ACTION_PLAN",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditActionPlan
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_ACTION_PLAN")}
                        />
                    ),
                },
                {
                    path: "add",

                    moduleCode: "TAGIDA_ACTION_PLAN",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditActionPlan
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_ACTION_PLAN")}
                        />
                    ),
                },
                {
                    path: "",

                    moduleCode: "TAGIDA_ACTION_PLAN",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllActionPlans
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_ACTION_PLAN")}
                        />
                    ),
                }
            ]
        },
        {
            path: "zone-group",

            moduleCode: "TAGIDA_ZONE_GROUP",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",

                    moduleCode: "TAGIDA_ZONE_GROUP",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditZoneGroup
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_ZONE_GROUP")}
                        />
                    ),
                },
                {
                    path: "add",

                    moduleCode: "TAGIDA_ZONE_GROUP",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditZoneGroup
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_ZONE_GROUP")}
                        />
                    ),
                },
                {
                    path: "",

                    moduleCode: "TAGIDA_ZONE_GROUP",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllZoneGroups 
                            selectedOrg={globalReducer.selectedOrg} 
                            permissions={getPermissions("TAGIDA_ZONE_GROUP")}
                        />
                    ),

                }
            ]
        },
        {
            path: "priority",

            moduleCode: "TAGIDA_PRIORITY",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",

                    moduleCode: "TAGIDA_PRIORITY",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditPriority
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_PRIORITY")}
                        />
                    ),
                },
                {
                    path: "add",

                    moduleCode: "TAGIDA_PRIORITY",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditPriority
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_PRIORITY")}
                        />
                    ),
                },
                {
                    path: "",
                    moduleCode: "TAGIDA_PRIORITY",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllPriorities
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_PRIORITY")}
                        />
                    ),
                }
            ]
        },
        {
            path: "severity",

            moduleCode: "TAGIDA_SEVERITY",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",

                    moduleCode: "TAGIDA_SEVERITY",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditSeverity
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_SEVERITY")}
                        />
                    ),
                },
                {
                    path: "add",

                    moduleCode: "TAGIDA_SEVERITY",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditSeverity
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_SEVERITY")}
                        />
                    ),
                },
                {
                    path: "",
                    moduleCode: "TAGIDA_SEVERITY",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllSeverities
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_SEVERITY")}
                        />
                    ),
                }
            ]
        },
        {
            path: "location",

            moduleCode: "TAGIDA_LOCATION",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "region/edit/:id",

                    moduleCode: "TAGIDA_LOCATION",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditRegion
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_LOCATION")}
                        />
                    ),
                },
                {
                    path: "region/add",

                    moduleCode: "TAGIDA_LOCATION",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditRegion
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_LOCATION")}
                        />
                    ),
                },

                {
                    path: "area/edit/:id",

                    moduleCode: "TAGIDA_LOCATION",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditArea
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_LOCATION")}
                        />
                    ),
                },
                {
                    path: "area/add",

                    moduleCode: "TAGIDA_LOCATION",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditArea
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_LOCATION")}
                        />
                    ),
                },

                {
                    path: "site/edit/:id",

                    moduleCode: "TAGIDA_LOCATION",
                    keepIf: {
                        view: true,
                        edit: true,
                    },

                    element: (
                        <EditSite
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_LOCATION")}
                        />
                    ),
                },
                {
                    path: "site/add",

                    moduleCode: "TAGIDA_LOCATION",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditSite
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_LOCATION")}
                        />
                    ),
                },

                {
                    path: "",

                    moduleCode: "TAGIDA_LOCATION",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllLocations
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_LOCATION")}
                        />
                    ),
                }

            ]

        },
        {
            path: "panel",

            moduleCode: "TAGIDA_PANEL",
            keepIf: {
                view: true,
            },

            element: <Outlet />,
            children: [
                {
                    path: "edit/:id",
                    
                    moduleCode: "TAGIDA_PANEL",
                    keepIf: {
                        view: true,
                        edit: true,
                    },
                    
                    element: (
                        <EditPanel
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={false}
                            permissions={getPermissions("TAGIDA_PANEL")}
                        />
                    ),
                },
                {
                    path: "add",
                    
                    moduleCode: "TAGIDA_PANEL",
                    keepIf: {
                        add: true,
                    },

                    element: (
                        <EditPanel
                            selectedOrg={globalReducer.selectedOrg}
                            isAddNew={true}
                            permissions={getPermissions("TAGIDA_PANEL")}
                        />
                    ),

                },
                {
                    path: "",

                    moduleCode: "TAGIDA_PANEL",
                    keepIf: {
                        view: true,
                    },

                    element: (
                        <AllPanels
                            selectedOrg={globalReducer.selectedOrg}
                            permissions={getPermissions("TAGIDA_PANEL")}
                        />
                    ),
                }
            ]
        }
            
    ]
}


const [roleAccess, setRoleAccess] = useState({
    "module_id": {
        "add": false,
        "edit": false,
        "delete": false,
    },
    "ROLE_FORM": {
        "add": true,
        "edit": true,
        "delete": false,
    },
    "USER_FORM": {
        "add": true,
        "edit": true,
        "delete": false,
    },
    "COMPANY_FORM": {
        "add": true,
        "edit": true,
        "delete": false,
    },
    "VENDOR_FORM": {
        "add": true,
        "edit": true,
        "delete": false,
    },
    "ACTION_PLAN_FORM": {
        "add": true,
        "edit": true,
        "delete": false,
    }
    ,
    "ZONE_GROUP_FORM":{
        "add":true,
        "edit":true,
        "delete":true
    },
    "TAGIDA_LOCATION":{
        "add":true,
        "edit":true,
        "delete":true
    },
    "PRIORITY_FORM":{
        "add":true,
        "edit":true,
        "delete":true
    },
    "SEVERITY_FORM":{
        "add":true,
        "edit":true,
        "delete":true
    },
    "PANEL_FORM":{
        "add":true,
        "edit":true,
        "delete":true
    }
});
