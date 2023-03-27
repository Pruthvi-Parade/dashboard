const initialState = () => {
    // Process data if any !!

    var state = {
        isAuthenticated: false,
        user: {},
        roles: {},
        scopes: {},
    }

    return state;
}

const authReducer = (state = initialState(), action) => {
    var newState;
    switch (action.type) {
        case 'AR_LOGIN_USER':
            newState = {...action.payload};
            return newState;

        case 'AR_SET_SCOPES':
            newState = {...state, scopes: action.payload};
            return newState;
        
        case 'AR_LOGOUT_USER':
            newState = {
                isAuthenticated: false,
                user: {},
                roles: {},
                scopes: {},
            };
            return newState;
        
        default:
            return state;
    }
}

export default authReducer;