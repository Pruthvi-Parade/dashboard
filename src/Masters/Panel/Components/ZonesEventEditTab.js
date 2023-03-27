import { Button, Drawer, Modal } from 'antd';
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import EditEvent from '../EditEvent';
import EditZone from '../EditZone';
import ZonesByPanelId from '../ZonesByPanelId'

// The zone_by_zone_id api is getting called for every zone_event also
// Cause the draweer component is not unmounting when we close it
// Solution is to destroyOnClose={true} in the drawer component
// But then the drawer will be unmounted and the get options will be called again everytime
// Therefor we will add a key isActuallyVisible and will only send the request when this is true

export default function ZonesEventEditTab({
    panelId,
    selectedOrg,
    permissions={},

    panelDetails={},
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
        searchParams.delete("editEvent");
        searchParams.delete("eventId");
        searchParams.delete("addEvent");
        searchParams.delete("zoneName");
        setSearchParams(searchParams, {
            replace: true,
        });
    };


    useEffect(() => {
        if(searchParams.has("addZone")) {
            setFormOpen("addZone");
        }
        else if(searchParams.has("editZone") && searchParams.has("zoneId")) {
            setFormOpen("editZone");
        }
        else if(searchParams.has("addEvent") && searchParams.has("zoneId")) {
            setFormOpen("addEvent");
        }
        else if(searchParams.has("editEvent") && searchParams.has("eventId") && searchParams.has("zoneId")) {
            setFormOpen("editEvent");
        }
        else{
            setFormOpen("none");
        }
        // console.log("searchParams", searchParams);
    }, [panelId, searchParams]);

    
    return (
        <>
            <ZonesByPanelId
                editPanelPath={window.location.pathname}
                refreshData={refreshData}
                panelId={panelId}
                selectedOrg={selectedOrg}
                permissions={permissions}
            />
                                
            <Drawer
                title={false}
                placement="right"
                closable={false}
                onClose={onClose}
                open={formOpen === "addZone"}
                // getContainer={false}
                // style={{ position: 'absolute' }}
                width={"80%"}
            >
                <EditZone
                    selectedOrg={selectedOrg}
                    panelId={panelId}
                    permissions={permissions}
                    isAddNew={true}

                    panelDetails={panelDetails}

                    isActuallyVisible={formOpen === "addZone"}              // Check documentation for use of this field
                    closeEdit={onClose}
                />
            </Drawer>
            <Drawer
                title={false}
                placement="right"
                closable={false}
                onClose={onClose}
                open={formOpen === "editZone"}
                // getContainer={false}
                // style={{ position: 'absolute' }}
                width={"80%"}
            >
                <EditZone
                    selectedOrg={selectedOrg}
                    panelId={panelId}
                    zoneId={searchParams.get("zoneId")}
                    permissions={permissions}
                    isAddNew={false}

                    panelDetails={panelDetails}

                    isActuallyVisible={formOpen === "editZone"}              // Check documentation for use of this field
                    closeEdit={onClose}
                />
            </Drawer>
            <Drawer
                title={false}
                placement="right"
                closable={false}
                onClose={onClose}
                open={formOpen === "addEvent"}
                // getContainer={false}
                // style={{ position: 'absolute' }}
                width={"80%"}
            >
                <EditEvent
                    selectedOrg={selectedOrg}
                    panelId={panelId}
                    zoneId={searchParams.get("zoneId")}
                    zoneName={searchParams.get("zoneName")}

                    permissions={permissions}
                    isAddNew={true}

                    panelDetails={panelDetails}

                    isActuallyVisible={formOpen === "addEvent"}              // Check documentation for use of this field
                    closeEdit={onClose}
                />
            </Drawer>
            <Drawer
                title={false}
                placement="right"
                closable={false}
                onClose={onClose}
                open={formOpen === "editEvent"}
                // getContainer={false}
                // style={{ position: 'absolute' }}
                width={"80%"}
            >
                <EditEvent
                    selectedOrg={selectedOrg}
                    panelId={panelId}
                    zoneId={searchParams.get("zoneId")}
                    zoneName={searchParams.get("zoneName")}
                    eventId={searchParams.get("eventId")}

                    permissions={permissions}
                    isAddNew={false}

                    panelDetails={panelDetails}

                    isActuallyVisible={formOpen === "editEvent"}              // Check documentation for use of this field
                    closeEdit={onClose}
                />
            </Drawer>


      </>
    )
}
