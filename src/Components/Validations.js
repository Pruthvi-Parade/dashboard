import { Validator as V } from "./Validator";

// The details state is `d` (For small names)
export const validatePanel = (d, e, isAddNew) => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    const pTabKey = "panel";
    ({ value: d.panel_code, error: e.panel_code } = new V(d.panel_code, "Panel Code", pTabKey).strip().req().v());
    // ({ value: d.panel_code, error: e.panel_code } = new V(d.panel_code, "Panel Code", pTabKey).strip().regex('^[A-Z0-9]{2,10}$').v());
    ({ value: d.panel_number, error: e.panel_number } = new V(d.panel_number, "Panel Number", pTabKey).strip().regex('^[A-Z0-9]{2,10}$').v());
    ({ value: d.panel_name, error: e.panel_name } = new V(d.panel_name, "Panel Name", pTabKey).strip().req().v());

    ({ value: d.panel_type_id, error: e.panel_type_id } = new V(d.panel_type_id, "Panel Type", pTabKey).opt().v());
    ({ value: d.ip_address, error: e.ip_address } = new V(d.ip_address, "IP Address", pTabKey).strip().ipAddr().v());
    ({ value: d.local_ip_address, error: e.local_ip_address} = new V(d.local_ip_address, "Local IP Address", pTabKey).strip().ipAddr().v());
    ({ value: d.port, error: e.port } = new V(d.port, "Port", pTabKey).number(null, 20).v());

    // validate site_id to opt()    
    ({ value: d.site_id, error: e.site_id } = new V(d.site_id, "Site", pTabKey).opt().v()); 

    // audit_remak to req()
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", pTabKey).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", pTabKey).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", pTabKey).strip());

    // if(isAddNew && d.copy_data_flag){
    //     e.copy_data = e.copy_data || {};
    //     // Validate panel_id to opt
    //     ({ value: d.copy_data.panel_id, error: e.copy_data.panel_id } = new V(d.copy_data.panel_id, "Panel", "copy_data").opt().v());
    // }

    // if(d.panel_type_group_code === "CAM"){
    //     // ({ value: d.camera_port, error: e.camera_port } = new V(d.camera_port, "Camera Port", cTabKey).number(null, 20).v());
    //     ({ value: d.camera_username, error: e.camera_username } = new V(d.camera_username, "Camera Username", pTabKey).strip().req().v());
    //     ({ value: d.camera_password, error: e.camera_password } = new V(d.camera_password, "Camera Password", pTabKey).strip().req().v());
    // }

    const errStatus = V.errorStatus;
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab; 

    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateEmployee = (d, e, isAddNew, empTab="employee", userTab="user") => {

    ({ value: d.e_firstname, error: e.e_firstname } = new V(d.e_firstname, "First Name", empTab).strip().req().v());
    ({ value: d.e_lastname, error: e.e_lastname } = new V(d.e_lastname, "Last Name", empTab).strip().req().v());
    // contact no.
    ({ value: d.e_contact_no, error: e.e_contact_no } = new V(d.e_contact_no, "Contact No.", empTab).strip().req().v());
    // email
    ({ value: d.e_email, error: e.e_email } = new V(d.e_email, "Email", empTab).strip().email().v());

    const errStatus = V.errorStatus;
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab; 

    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateUser = (d, e, isAddNew, empTab="employee", userTab="user", orgAdmin=false) => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    ({d, e} = validateEmployee(d, e, isAddNew, empTab, userTab));
    
    if(d.is_user){
        e.user = e.user || {};
        ({ value: d.user.username, error: e.user.username } = new V(d.user.username, "Username", userTab).strip().req().v());
        ({ value: d.user.password, error: e.user.password } = new V(d.user.password, "Password", userTab).strip().req().v());

        if(!orgAdmin){
            ({ value: d.user.role_id, error: e.user.role_id } = new V(d.user.role_id, "Role", userTab).opt().v());
            ({ value: d.user.scope_id, error: e.user.scope_id } = new V(d.user.scope_id, "Site", userTab).opt().v());
        }
    }

    const errStatus = V.errorStatus;
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab; 
    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateOrg = (d, e, isAddNew, orgTab, empTab, userTab) => {
    // Validate Employee
    d.employee.is_user = true;

    e.employee = e.employee || {};
    e.employee.user = e.employee.user || {};
    ({ d: d.employee, e: e.employee, errorTab: V.errorTab, errStatus: V.errorStatus, errorsIn: V.errorsIn } = validateUser(d.employee, e.employee, isAddNew, empTab, userTab, true));

    // Validate Organization
    // o_name: '',
    // o_code: '',                         // Eg: COM001, AGN001, VEN001

    ({ value: d.o_name, error: e.o_name } = new V(d.o_name, "Name", orgTab).strip().req().v());
    ({ value: d.o_code, error: e.o_code } = new V(d.o_code, "Code", orgTab).strip().regex('^[A-Z]{3,3}[0-9]{3,4}$').v());

    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", "other").strip().req().v());
    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", "other").strip());
    ({ value: d.comments } = new V(d.comments, "Comments", "other").strip());
    
    const errStatus = V.errorStatus;
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab; 
    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateActionPlan = (d, e, isAddNew, apTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.action_plan_name, error: e.action_plan_name } = new V(d.action_plan_name, "Name", apTab).strip().req().v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", apTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", apTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", apTab).strip());
    
    const errStatus = V.errorStatus;
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;

    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateZoneGroup = (d, e, isAddNew, zgTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.zone_group_name, error: e.zone_group_name } = new V(d.zone_group_name, "Name", zgTab).strip().req().v());
    ({ value: d.priority_group_id, error: e.priority_group_id } = new V(d.priority_group_id, "Priority", zgTab).opt().v());
    ({ value: d.severity_group_id, error: e.severity_group_id } = new V(d.severity_group_id, "Severity", zgTab).opt().v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", zgTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", zgTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", zgTab).strip());
    
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;

    return {d, e, errorTab, errStatus, errorsIn};
}

export const validatePriorityGroup = (d, e, isAddNew, pgTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.priority_group_name, error: e.priority_group_name } = new V(d.priority_group_name, "Name", pgTab).strip().req().v());
    ({ value: d.priority_group_interval, error: e.priority_group_interval } = new V(d.priority_group_interval, "Interval", pgTab).number(null, 0).v());
    ({ value: d.m_priority_id, error: e.m_priority_id } = new V(d.m_priority_id, "Master Priority", pgTab).opt().v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", pgTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", pgTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", pgTab).strip());
    
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateSeverityGroup = (d, e, isAddNew, sgTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.severity_group_name, error: e.severity_group_name } = new V(d.severity_group_name, "Name", sgTab).strip().req().v());
    ({ value: d.severity_group_type, error: e.severity_group_type } = new V(d.severity_group_type, "Type", sgTab).opt().v());
    ({ value: d.m_severity_id, error: e.m_severity_id } = new V(d.m_severity_id, "Master Severity", sgTab).opt().v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", sgTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", sgTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", sgTab).strip());
    
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateRegion = (d, e, isAddNew, regionTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.region_name, error: e.region_name } = new V(d.region_name, "Name", regionTab).strip().req().v());
    ({ value: d.region_code, error: e.region_code } = new V(d.region_code, "Region Code", regionTab).strip().regex('^REG[0-9]{3,4}$').v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", regionTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", regionTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", regionTab).strip());
    
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateArea = (d, e, isAddNew, areaTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.area_name, error: e.area_name } = new V(d.area_name, "Name", areaTab).strip().req().v());
    ({ value: d.area_code, error: e.area_code } = new V(d.area_code, "Area Code", areaTab).strip().req().v());

    ({ value: d.region_id, error: e.region_id } = new V(d.region_id, "Region", areaTab).opt().v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", areaTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", areaTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", areaTab).strip());
    
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateSite = (d, e, isAddNew, siteTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.site_name, error: e.site_name } = new V(d.site_name, "Name", siteTab).strip().req().v());
    ({ value: d.site_code, error: e.site_code } = new V(d.site_code, "Site Code", siteTab).strip().req().v());

    // Region and site id
    ({ value: d.region_id, error: e.region_id } = new V(d.region_id, "Region", siteTab).opt().v());
    ({ value: d.area_id, error: e.area_id } = new V(d.area_id, "Area", siteTab).opt().v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", siteTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", siteTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", siteTab).strip());
    
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateSiteZone = (d, e, isAddNew, zoneTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Valdate zone_name and zone_code
    ({ value: d.zone_name, error: e.zone_name } = new V(d.zone_name, "Name", zoneTab).strip().req().v());
    ({ value: d.zone_code, error: e.zone_code } = new V(d.zone_code, "Zone Code", zoneTab).strip().req().v());

    const errorTab = V.errorTab;
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;

    return {d, e, errorTab, errStatus, errorsIn};
}

export const validateZone = (d, e, isAddNew, zoneTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.zone_name, error: e.zone_name } = new V(d.zone_name, "Name", zoneTab).strip().req().v());
    ({ value: d.zone_code, error: e.zone_code } = new V(d.zone_code, "Zone Code", zoneTab).strip().req().v());

    // Validate to opt() => mode, status, physical_status, 
    ({ value: d.mode, error: e.mode } = new V(d.mode, "Mode", zoneTab).opt().v());
    ({ value: d.status_id, error: e.status_id } = new V(d.status_id, "Status", zoneTab).opt().v());
    ({ value: d.physical_status_id, error: e.physical_status_id } = new V(d.physical_status_id, "Physical Status", zoneTab).opt().v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", zoneTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", zoneTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", zoneTab).strip());
    
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};    
}

export const validateZoneEvent = (d, e, isAddNew, zoneEventTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.event_name, error: e.event_name } = new V(d.event_name, "Name", zoneEventTab).strip().req().v());
    ({ value: d.event_code, error: e.event_code } = new V(d.event_code, "Event Code", zoneEventTab).strip().req().v());

    // opt =>
    ({ value: d.event_type_id, error: e.event_type_id } = new V(d.event_type_id, "Event Type", zoneEventTab).opt().v());
    ({ value: d.status_id, error: e.status_id } = new V(d.status_id, "Status", zoneEventTab).opt().v());
    ({ value: d.priority_template_id, error: e.priority_template_id } = new V(d.priority_template_id, "Priority Template", zoneEventTab).opt().v());
    ({ value: d.severity_template_id, error: e.severity_template_id } = new V(d.severity_template_id, "Severity Template", zoneEventTab).opt().v());

    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", zoneEventTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", zoneEventTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", zoneEventTab).strip());

    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};    
}

export const validateCamera = (d, e, isAddNew, cameraTab="details") => {
    V.errorTab = "";
    V.errorStatus = "success";
    V.errorsIn = [];

    // Name
    ({ value: d.camera_name, error: e.camera_name } = new V(d.camera_name, "Name", cameraTab).strip().req().v());
    ({ value: d.channel_number, error: e.channel_number } = new V(d.channel_number, "Channel Number", cameraTab).number(null, -1).v());

    // opt =>
    ({ value: d.camera_type_id, error: e.camera_type_id } = new V(d.camera_type_id, "Camera Type", cameraTab).opt().v());
    if(d.image_capture) {
        ({ value: d.capture_interval, error: e.capture_interval } = new V(d.capture_interval, "Capture Interval", cameraTab).number(null, 0).v());
    }
    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", cameraTab).strip().req().v());

    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", cameraTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", cameraTab).strip());
    ({ value: d.rtsp_link } = new V(d.rtsp_link, "RTSP Link", cameraTab).strip());

    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};    
}

export const validateReader = (d, e, isAddNew, readerTab="details") => {
    V.errorTab = "";
    V.errorStatus = "Success";
    V.errorsIn = [];

    // Name
    ({ value: d.reader_name, error: e.reader_name } = new V(d.reader_name, "Name", readerTab).strip().req().v());
    // ({ value: d.reader_number, error: e.reader_number } = new V(d.reader_number, "Reader Number", readerTab).number(null, -1).v());
    
    // Audit Remark
    ({ value: d.audit_remark, error: e.audit_remark } = new V(d.audit_remark, "Audit Remark", readerTab).strip().req().v());
    
    // strip description and comments
    ({ value: d.description } = new V(d.description, "Description", readerTab).strip());
    ({ value: d.comments } = new V(d.comments, "Comments", readerTab).strip());
 
    const errStatus = V.errorStatus
    const errorsIn = V.errorsIn;
    const errorTab = V.errorTab;
    return {d, e, errorTab, errStatus, errorsIn};
}