import React from 'react'
import MyPortal from '../Components/MyPortal'

export default function InwardOutward({
    selectedOrg={},
    permissions={},
}) {


    return (
        <>
            <MyPortal id="navbar-page-name-portal">
                <>| Inward Outward Report</>
            </MyPortal>

            <div>InwardOutward</div>
        </>
    )
}
