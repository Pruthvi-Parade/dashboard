import { combineReducers } from "redux";
import authReducer from "./AuthReducer";
import globalReducer from "./GlobalReducer";

const combinedReducer = combineReducers({
    authReducer,
    globalReducer
})

export default combinedReducer;