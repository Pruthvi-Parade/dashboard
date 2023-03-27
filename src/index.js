import './App.css';
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import combinedReducer from "./Redux/Reducers/Combined";
import axios from "axios";



// TagID API Routes 
axios.defaults.baseURL='http://192.168.1.234:5017'
// axios.defaults.baseURL='http://192.168.2.131:5017'
// axios.defaults.baseURL='http://192.168.2.118:5017'


axios.defaults.headers.common['Authorization'] = localStorage.getItem('AdminToken');

const store = configureStore({
	reducer: combinedReducer,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();



/*
    {
        "permissions": {                    // Types_of module and types_of_permissions in them
            "module_code": {
                "module_id": "some_id",
                "module_code": "module_code_1",
                "permissions": {
                    "permission_id_1": 1,        // Value could be anything ... dosent matter,
                    "permission_id_2": 1        // ... just needs to be unique for each permission
                }
            },

            "panel_form": {
                "module_id": 11,
                "module_code": "panel_form",
                "permissions": {
                    "save": 1,        // Value could be anything ... dosent matter,
                    "edit": 1,        // 
                    "delete": 1212121,
                    "view": 1
                }
            }
            

            
        }
    }



    {
        "panel_form": {
            "save": true,
            "delete": false,

        },
        "location_form":{
            
        }
    }


*/