const initialState = () => {
    // Process data if any !!

    var state = {
        orgsLoading: false,
        orgOptions: [],
        selectedOrg: {},
    }

    return state;
}

const globalReducer = (state = initialState(), action) => {
    var newState;
    switch (action.type) {
        case 'GR_SET_ORGS_LOADING':
            newState = {...state, orgsLoading: action.payload};
            return newState;
        
        case 'GR_SET_ORG_OPTIONS':
            newState = {...state, orgOptions: action.payload};
            return newState;

        case 'GR_SET_SELECTED_ORG':
            newState = {...state, selectedOrg: action.payload};
            return newState;
        
        default:
            return state;
    }
}

export default globalReducer;