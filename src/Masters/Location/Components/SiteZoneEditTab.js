import { Drawer } from 'antd'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import EditSiteZone from '../EditSiteZone';
import SiteZoneBySiteId from '../SiteZoneBySiteId';

export default function SiteZoneEditTab({
    siteId,
    selectedOrg,
    permissions={},

    siteDetails={},
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [formOpen, setFormOpen] = useState("none");
    const [refreshData, setRefreshData] = useState(0);

    const onClose = () => {
        setFormOpen("none");
        setRefreshData(refreshData + 1);

        searchParams.delete("zoneId");
        searchParams.delete("addZone");
        searchParams.delete("editZone");
        searchParams.delete("zoneName");
        setSearchParams(searchParams, {
            replace: true,
        });
    };

    useEffect(()=>{
        if (searchParams.has("addZone")) {
            setFormOpen("addZone");
        }
        else if(searchParams.has("editZone") && searchParams.has("zoneId")){
            setFormOpen("editZone");
        }
        else{
            setFormOpen("none");
        }
    },[siteId, searchParams]);


    return(
        <>
            <SiteZoneBySiteId
                editSitePath={window.location.pathname}
                refreshData={refreshData}
                siteId={siteId}
                selectedOrg={selectedOrg}
                permissions={permissions}
            />

            <Drawer 
                title={false}
                placement="right"
                closable={false}
                onClose={onClose}
                open={formOpen === "addZone"}
                width={"80%"}
            >
                <EditSiteZone
                    selectedOrg={selectedOrg}
                    siteId={siteId}
                    permissions={permissions}
                    isAddNew={true}

                    siteDetails={siteDetails}

                    isActuallyVisible={formOpen === "addZone"}
                    closeEdit={onClose}
                />
            </Drawer>

            <Drawer
                title={false}
                placement="right"
                closable={false}
                onClose={onClose}
                open={formOpen === "editZone"}
                width={"80%"}
            >
                <EditSiteZone
                    selectedOrg={selectedOrg}
                    siteId={siteId}
                    zoneId={searchParams.get("zoneId")}
                    permissions={permissions}
                    isAddNew={false}

                    siteDetails={siteDetails}

                    isActuallyVisible={formOpen === "editZone"}
                    closeEdit={onClose}
                />
            </Drawer>
        </>
    )
}