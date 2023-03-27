import { message } from "antd";


export const ar_setUserScopes = (scopes) => {
    return {
        type: 'AR_SET_SCOPES',
        payload: scopes,
    }
}


export const ar_loginUser = (details) => {
    return {
        type: "AR_LOGIN_USER",
        payload: details,
    };
};

export const ar_logoutUser = () => {
    localStorage.removeItem("AdminToken");
    message.warning("Please login !!");
    return {
        type: "AR_LOGOUT_USER",
    };
};
