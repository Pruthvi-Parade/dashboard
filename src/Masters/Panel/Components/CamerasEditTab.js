import { Button, Drawer, Modal } from 'antd';
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';
import CamerasByPanelId from '../CamerasByPanelId';
import EditCamera from '../EditCamera';

export default function CamerasEditTab({
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
        setRefreshData(r => (r + 1));

        searchParams.delete("cameraId");
        searchParams.delete("addCamera");
        searchParams.delete("editCamera");
        setSearchParams(searchParams, {
            replace: true,
        });
    };

    useEffect(() => {
        if(searchParams.has("addCamera")) {
            setFormOpen("addCamera");
        }
        else if(searchParams.has("editCamera") && searchParams.has("cameraId")) {
            setFormOpen("editCamera");
        }
        else{
            setFormOpen("none");
        }
        // console.log("searchParams", searchParams);
    }, [panelId, searchParams]);

    return (
        <>
            <CamerasByPanelId
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
                open={formOpen === "addCamera"}
                // getContainer={false}
                // style={{ position: 'absolute' }}
                width={"80%"}
            >
                <EditCamera
                    selectedOrg={selectedOrg}
                    panelId={panelId}
                    cameraId={null}
                    permissions={permissions}
                    isAddNew={true}

                    panelDetails={panelDetails}
                    closeEdit={onClose}
                />
            </Drawer>
            <Drawer
                title={false}
                placement="right"
                closable={false}
                onClose={onClose}
                open={formOpen === "editCamera"}
                // getContainer={false}
                // style={{ position: 'absolute' }}
                width={"80%"}
            >
                <EditCamera
                    selectedOrg={selectedOrg}
                    panelId={panelId}
                    cameraId={searchParams.get("cameraId")}
                    permissions={permissions}
                    isAddNew={false}

                    panelDetails={panelDetails}
                    closeEdit={onClose}
                />
            </Drawer>
        </>
    )
}
