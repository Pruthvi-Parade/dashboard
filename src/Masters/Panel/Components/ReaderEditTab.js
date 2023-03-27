import { Drawer } from 'antd'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import EditReader from '../EditReader';
import ReaderByPanelId from '../ReaderByPanelid';

export default function ReaderEditTab({
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

        searchParams.delete("readerId");
        searchParams.delete("addReader");
        searchParams.delete("editReader");
        searchParams.delete("readerName");
        setSearchParams(searchParams, {
            replace: true,
        });
    };

    useEffect(()=>{
        if (searchParams.has("addReader")) {
            setFormOpen("addReader");
        }
        else if(searchParams.has("editReader") && searchParams.has("readerId")){
            setFormOpen("editReader");
        }
        else{
            setFormOpen("none");
        }
    },[panelId, searchParams]);

    return(
        <>
            <ReaderByPanelId
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
                open={formOpen === "addReader"}
                width={"80%"}
            >
                <EditReader
                    selectedOrg={selectedOrg}
                    panelId={panelId}
                    permissions={permissions}
                    isAddNew={true}

                    panelDetails={panelDetails}

                    isActuallyVisible={formOpen === "addReader"}
                    closeEdit={onClose}
                />
            </Drawer>

            <Drawer
                title={false}
                placement="right"
                closable={false}
                onClose={onClose}
                open={formOpen === "editReader"}
                width={"80%"}
            >
                <EditReader
                    selectedOrg={selectedOrg}
                    panelId={panelId}
                    readerId={searchParams.get("readerId")}
                    permissions={permissions}
                    isAddNew={false}

                    panelDetails={panelDetails}

                    isActuallyVisible={formOpen === "editReader"}
                    closeEdit={onClose}
                />
            </Drawer>
        </>
    )
}