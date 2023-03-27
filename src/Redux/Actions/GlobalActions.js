export const gr_setOrgsLoading = (loading) => {
    return {
        type: "GR_SET_ORGS_LOADING",
        payload: loading,
    };
}

export const gr_setOrgOptions = (orgs) => {
    return {
        type: "GR_SET_ORG_OPTIONS",
        payload: orgs,
    };
}

export const gr_setSelectedOrg = (org) => {
    return {
        type: "GR_SET_SELECTED_ORG",
        payload: org,
    }
}
