import { useEffect, useState, useMemo } from "react";
import jwt_decode from "jwt-decode";
import { Routes, Route, useLocation, Navigate, Outlet, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button, Result, Spin } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import Login from "./Auth/Login";
import { ar_loginUser, ar_logoutUser } from "./Redux/Actions/AuthActions";

// Files
import MyNavbar from "./AppLayout/MyNavbar";
import AppLayout from "./AppLayout/AppLayout";
import AllScopes from "./Masters/Scope/AllScopes";
import EditScope from "./Masters/Scope/EditScope";
import AllRoles from "./Masters/Role/AllRoles";
import EditRole from "./Masters/Role/EditRole";
import AllOrgs from "./Masters/Org/AllOrgs";
import AllUsers from "./Masters/User/AllUsers";
import EditUser from "./Masters/User/EditUser";
import EditOrg from "./Masters/Org/EditOrg";
import EditActionPlan from "./Masters/ActionPlan/EditActionPlan";
import AllActionPlans from "./Masters/ActionPlan/AllActionPlans";
import AllZoneGroups from "./Masters/ZoneGroup/AllZoneGroups";
import EditZoneGroup from "./Masters/ZoneGroup/EditZoneGroup";
import AllLocations from "./Masters/Location/AllLocations";
import EditRegion from "./Masters/Location/EditRegion";
import EditArea from "./Masters/Location/EditArea";
import EditSite from "./Masters/Location/EditSite";
import EditPriority from "./Masters/Priority/EditPriority";
import AllPriorities from "./Masters/Priority/AllPriorities";
import EditSeverity from "./Masters/Severity/EditSeverity";
import AllSeverities from "./Masters/Severity/AllSeverities";
import EditPanel from "./Masters/Panel/EditPanel";
import AllPanels from "./Masters/Panel/AllPanels";
import EventHistory from "./Reports/EventHistory";
import UnknownEvents from "./Reports/UnknownEvents";
import PanelStatusReport from "./Reports/PanelStatusReport";
import HourlyHeartBeat from "./Reports/HourlyHeartBeat";
import MonthlyHeartBeat from "./Reports/MonthlyHeartBeat";
import AuditLog from "./Reports/AuditLog";
import CurrentZoneStatus from "./Reports/CurrentZoneStatus";
import ArmDisarm from "./Reports/ArmDisarm";

// Icons
import { BsCalendar2Event } from "react-icons/bs";
import { FaWpforms, FaRegBuilding, FaChartBar, FaRegListAlt } from "react-icons/fa";
import { GiArrowScope } from "react-icons/gi";
import { CgOrganisation } from "react-icons/cg";
import { MdPermPhoneMsg } from "react-icons/md";
import { BsFilePerson, BsPeople } from "react-icons/bs";
import { DesktopOutlined } from "@ant-design/icons";
import { GiMeepleGroup } from "react-icons/gi";
import { GoLocation } from "react-icons/go";
import { MdPriorityHigh } from "react-icons/md";
import { BsExclamationTriangle } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import { VscCircuitBoard } from "react-icons/vsc";
import { VscWorkspaceUnknown } from "react-icons/vsc";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { GiHourglass } from "react-icons/gi";
import { AiOutlineAudit } from "react-icons/ai";
import { BsCalendar3Event } from "react-icons/bs";
import { Notifications } from 'react-push-notification';
import addNotification from 'react-push-notification';
import InwardOutward from "./RFIDReports/InwardOutward";


function App() {
	const [loading, setLoading] = useState(true);
	const globalReducer = useSelector(state => state.globalReducer);
	const authReducer = useSelector(state => state.authReducer);
	const myRoles = authReducer?.roles
	const dispatch = useDispatch();
	const navigate = useNavigate();

	let location = useLocation();

	const searchParams = "orgId=" + globalReducer.selectedOrg.orgId

	const getPermissions = (moduleCode) => {
		return myRoles[moduleCode] ? myRoles[moduleCode] : {};
	}

	const hasAccess = (moduleCode, perm) => {
		if (authReducer.user?.isSuperAdmin) {
			return true;
		}
		return myRoles?.[moduleCode]?.[perm]
	}

	// The name and path fields are for global search
	const menuItems = useMemo(() => [
		{
			key: "home",
			label: "Home",
			icon: <DesktopOutlined />,
			search: "home",
			onClick: () => {
				navigate("/");
			},
		},
		{
			key: "masters",
			label: "Masters",
			icon: <FaWpforms />,
			search: "masters",
			children: [
				{
					key: "scope",
					label: (
						<Link style={{ color: 'inherit' }} to={`/masters/scope?orgId=${searchParams}`}>
							Scope
						</Link>
					),
					icon: <GiArrowScope />,
					search: "scope",
					module_code: "TAGIDA_SCOPE",

					pathname: `/masters/scope?orgId=${searchParams}`,
					name: "Scope",
				},
				{
					key: 'role',
					label: (
						<Link style={{ color: 'inherit' }} to={`/masters/role?${searchParams}`}>
							Role
						</Link>
					),
					icon: <BsFilePerson />,
					search: "role",
					module_code: "TAGIDA_ROLE",

					pathname: `/masters/role?${searchParams}`,
					name: "Role",
				},
				{
					key: 'user',
					label: (
						<Link style={{ color: 'inherit' }} to={`/masters/user?${searchParams}`}>
							User
						</Link>
					),
					icon: <BsPeople />,
					search: "user employee",
					module_code: "TAGIDA_USER",

					pathname: `/masters/user?${searchParams}`,
					name: "User",
				},
				// {
				// 	key: "company",
				// 	label: (
				// 		<Link style={{ color: 'inherit' }} to={`/masters/company?${searchParams}`}>
				// 			Company
				// 		</Link>
				// 	),
				// 	icon: <CgOrganisation />,
				// 	search: "company",
				// 	module_code: "TAGIDA_COMPANY",

				// 	pathname: `/masters/company?${searchParams}`,
				// 	name: "Company",
				// },
				// {
				// 	key: "vendor",
				// 	label: (
				// 		<Link style={{ color: 'inherit' }} to={`/masters/vendor?${searchParams}`}>
				// 			Vendor
				// 		</Link>
				// 	),
				// 	icon: <FaRegBuilding />,
				// 	search: "vendor",
				// 	module_code: "TAGIDA_VENDOR",

				// 	pathname: `/masters/vendor?${searchParams}`,
				// 	name: "Vendor",
				// },
				// {
				// 	key: "actionPlan",
				// 	label: (
				// 		<Link style={{ color: 'inherit' }} to={`/masters/action-plan?${searchParams}`}>
				// 			Action Plan
				// 		</Link>
				// 	),
				// 	icon: <MdPermPhoneMsg />,
				// 	search: "action plan",
				// 	module_code: "TAGIDA_ACTION_PLAN",

				// 	pathname: `/masters/action-plan?${searchParams}`,
				// 	name: "Action Plan",
				// },
				// {
				// 	key: "zoneGroup",
				// 	label: (
				// 		<Link style={{ color: 'inherit' }} to={`/masters/zone-group?${searchParams}`}>
				// 			Zone Group
				// 		</Link>
				// 	),
				// 	icon: <GiMeepleGroup />,
				// 	search: "zone group",
				// 	module_code: "TAGIDA_ZONE_GROUP",

				// 	pathname: `/masters/zone-group?${searchParams}`,
				// 	name: "Zone Group",
				// },
				{
					key: "location",
					label: (
						<Link style={{ color: 'inherit' }} to={`/masters/location?${searchParams}`}>
							Location
						</Link>
					),
					icon: <GoLocation />,
					search: "location site area region zone",
					module_code: "TAGIDA_LOCATION",

					pathname: `/masters/location?${searchParams}`,
					name: "Location",
				},
				// {
				// 	key: "priority",
				// 	label: (
				// 		<Link style={{ color: 'inherit' }} to={`/masters/priority?${searchParams}`}>
				// 			Priority
				// 		</Link>
				// 	),
				// 	icon: <MdPriorityHigh />,
				// 	search: "priority",
				// 	module_code: "TAGIDA_PRIORITY",

				// 	pathname: `/masters/priority?${searchParams}`,
				// 	name: "Priority",
				// },
				// {
				// 	key: "severity",
				// 	label: (
				// 		<Link style={{ color: 'inherit' }} to={`/masters/severity?${searchParams}`}>
				// 			Severity
				// 		</Link>
				// 	),
				// 	icon: <BsExclamationTriangle />,
				// 	search: "severity",
				// 	module_code: "TAGIDA_SEVERITY",

				// 	pathname: `/masters/severity?${searchParams}`,
				// 	name: "Severity",
				// },
				{
					key: "panel",
					label: (
						<Link style={{ color: 'inherit' }} to={`/masters/panel?${searchParams}`}>
							Panel
						</Link>
					),
					icon: <VscCircuitBoard />,
					search: "panel",
					module: "TAGIDA_PANEL",
					pathname: `/masters/panel?${searchParams}`,
					name: "Panel",
				}
				// {
				// 	key: "panel",
				// 	label: (
				// 		<Link style={{ color: 'inherit' }} to={`/masters/panel?${searchParams}`}>
				// 			Panel
				// 		</Link>
				// 	),
				// 	icon: <VscCircuitBoard />,
				// 	search: "panel zone event camera",
				// 	module_code: "TAGIDA_PANEL",

				// 	pathname: `/masters/panel?${searchParams}`,
				// 	name: "Panel",
				// }
			].filter(item => {
				if (hasAccess(item.module_code, "view") || hasAccess(item.module_code, "all")) {
					return true;
				}
				return false;
			}),
		},
		// {
		// 	key: "reports",
		// 	label: "Reports",
		// 	icon: <FaChartBar />,
		// 	search: "reports",
		// 	children: [
		// 		{
		// 			key: "event-history",
		// 			label: (
		// 				<Link style={{ color: 'inherit' }} to={`/reports/event-history?${searchParams}`}>
		// 					Event History
		// 				</Link>
		// 			),
		// 			icon: <FaRegListAlt />,
		// 			search: "event history report",
		// 			report_code: "event_history",

		// 			pathname: `/reports/event-history?${searchParams}`,
		// 			name: "Event History Report",
		// 		},
		// 		{
		// 			key: "unknown-events",
		// 			label: (
		// 				<Link style={{ color: 'inherit' }} to={`/reports/unknown-events?${searchParams}`}>
		// 					Unknown Events
		// 				</Link>
		// 			),
		// 			icon: <VscWorkspaceUnknown />,
		// 			search: "unknown events report",
		// 			report_code: "unknown_events",

		// 			pathname: `/reports/unknown-events?${searchParams}`,
		// 			name: "Unknown Events Report",
		// 		},
		// 		{
		// 			key: "panel-status-access-report",
		// 			label: (
		// 				<Link style={{ color: 'inherit' }} to={`/reports/panel-status?${searchParams}`}>
		// 					Panel Status
		// 				</Link>
		// 			),
		// 			icon: <HiOutlineStatusOnline />,
		// 			search: "panel status report",
		// 			report_code: "panel_status",

		// 			pathname: `/reports/panel-status?${searchParams}`,
		// 			name: "Panel Status Report",
		// 		},
		// 		{
		// 			key: "hourly-heartbeat",
		// 			label: (
		// 				<Link style={{ color: 'inherit' }} to={`/reports/hourly-heartbeat?${searchParams}`}>
		// 					Hourly Heartbeat
		// 				</Link>
		// 			),
		// 			icon: <GiHourglass />,
		// 			search: "hourly heartbeat report",
		// 			report_code: "hourly_heartbeat",

		// 			pathname: `/reports/hourly-heartbeat?${searchParams}`,
		// 			name: "Hourly Heartbeat Report",
		// 		},
		// 		{
		// 			key: "monthly-heartbeat",
		// 			label: (
		// 				<Link style={{ color: 'inherit' }} to={`/reports/monthly-heartbeat?${searchParams}`}>
		// 					Monthly Heartbeat
		// 				</Link>
		// 			),
		// 			icon: <FaRegCalendarAlt />,
		// 			search: "monthly heartbeat report",
		// 			report_code: "monthly_heartbeat",

		// 			pathname: `/reports/monthly-heartbeat?${searchParams}`,
		// 			name: "Monthly Heartbeat Report",
		// 		},
		// 		{
		// 			key: "audit-log",
		// 			label: (
		// 				<Link style={{ color: 'inherit' }} to={`/reports/audit-log?${searchParams}`}>
		// 					Audit Log
		// 				</Link>
		// 			),
		// 			icon: <AiOutlineAudit />,
		// 			search: "audit log report",
		// 			report_code: "audit_log",

		// 			pathname: `/reports/audit-log?${searchParams}`,
		// 			name: "Audit Log Report",
		// 		},
		// 		{
		// 			key: "current-zone-status",
		// 			label: (
		// 				<Link style={{ color: 'inherit' }} to={`/reports/current-zone-status?${searchParams}`}>
		// 					Curren Zone Status
		// 				</Link>
		// 			),
		// 			icon: <HiOutlineStatusOnline />,
		// 			search: "current zone status report",
		// 			report_code: "current_zone_status",

		// 			pathname: `/reports/current-zone-status?${searchParams}`,
		// 			name: "Current Zone Status Report",
		// 		},
		// 		{
		// 			key: "arm-disarm",
		// 			label: (
		// 				<Link style={{ color: 'inherit' }} to={`/reports/arm-disarm?${searchParams}`}>
		// 					Arm Disarm
		// 				</Link>
		// 			),
		// 			icon: <BsCalendar3Event />,
		// 			search: "arm disarm report",
		// 			report_code: "arm_disarm",

		// 			pathname: `/reports/arm-disarm?${searchParams}`,
		// 			name: "Arm Disarm Report",
		// 		},
		// 	].filter(item => {
		// 		if (hasAccess("TAGIDA_REPORTS", item.report_code) || hasAccess("TAGIDA_REPORTS", "all")) {
		// 			return true;
		// 		}
		// 		return false;
		// 	}),
		// },
		{
			key: "rfid-reports",
			label: "RFID Reports",
			icon: <FaChartBar />,
			search: "rfid reports",
			children: [
				{
					key: "inward-outward",
					label: (
						<Link style={{ color: 'inherit' }} to={`/rfid-reports/inward-outward?${searchParams}`}>
							Inward Outward
						</Link>
					),
					icon: <FaRegListAlt />,
					search: "inward outward",
					report_code: "inward_outward",

					pathname: `/rfid-reports/inward-outward?${searchParams}`,
					name: "Inward Outward",
				},
			]
		},
		{
			label: "Logout",
			key: "logout",
			name: 'Logout',
			search: "logout",
			icon: <BiLogOut />,
			style: { marginTop: "5px" },
			onClick: () => {
				dispatch(ar_logoutUser());
			}
		}
	], [authReducer, globalReducer.selectedOrg.orgId])


	const getRoleFromToken = () => {
		const roleToken = localStorage.getItem("RoleToken");
		try {
			var decoded = jwt_decode(roleToken);

			// axios.post('/admin-api/verify_role_token', { 
			// 		"role_token": roleToken,
			// 		"token": localStorage.getItem("AdminToken")
			// 	}
			// )
			// .then(res => {})
			// .catch(err => {
			// 	console.log(err);
			// 	dispatch(ar_logoutUser());
			// });

			return decoded;
		}
		catch (err) {
			dispatch(ar_logoutUser());
			return;
		}


		// return decoded;
	}
	const validateToken = () => {
		setLoading(true);
		if (localStorage.AdminToken) {
			const token = localStorage.getItem("AdminToken");
			const decoded = jwt_decode(token);
			const currentTime = Date.now() / 1000; // to get in milliseconds
			if (currentTime <= decoded.exp) {

				// Get Roles
				var roles = getRoleFromToken();

				const data = {
					isAuthenticated: true,
					user: {
						userId: decoded.user_id,
						username: decoded.username,
						eId: decoded.e_id,
						roleId: decoded.role_id,
						scopeId: decoded.scope_id,
						isSuperAdmin: decoded.is_super_admin,
						isAdmin: decoded.is_admin,
						orgId: decoded.o_id,
						parentOrgId: decoded.parent_org_id,
						orgType: decoded.o_type
					},
					roles: roles
				};
				dispatch(ar_loginUser(data));
			}
		}
		// dispatch(ar_loginUser({ isAuthenticated: true, user: {} }));  // Uncomment this line for testing
		setLoading(false);
	}
	useEffect(() => {
		validateToken();
	}, []);


	// const buttonClick = () => {
  //       addNotification({
  //           title: 'New Updates',
  //           subtitle: 'This is a subtitle',
  //           message: 'This is a very long message',
  //           theme: 'darkblue',
  //           native: true // when using native, your OS will handle theming.
  //       });
  //   };

	// useEffect(()=>
	// {
	// 	buttonClick();

	// },[])
	return (
		<div className="App">
			<Notifications />
			{/* <Button onClick={buttonClick} type="primary">
				Notifications
			</Button> */}
			<Routes>
				<Route path="/login" element={<Login />} >
					<Route path="/login/aa" element={<MyNavbar />} />
				</Route>

				{/* 
					Validate the token first.
					Till the token is being validated, show the loading screen.
					After that loading will be false, hence check if the validation is successful or not.
					If successful, then move forward.
					Else, naviate to the login page.
				*/}
				<Route
					path="*"
					element={
						loading ? <div className="App" style={{ textAlign: 'center' }}><Spin size="large" style={{ marginTop: '50px' }} /></div>
							: authReducer.isAuthenticated
								?
								<>
									{/* The Outlet is in MyNavbar File (below the app-bar) */}
									{/* Global Search component is in the navbar file because it exports the cntrl+k icons which needs to be rendered there */}
									<AppLayout
										menuItems={menuItems}
										globalSearchItems={
											[
												...menuItems[1].children,
												// ...menuItems[2].children,
												// menuItems[3],
                        menuItems[2]
											]
										}
									/>
								</>
								: <Navigate
									to="/login"
									replace={true}
									state={{ from: location.pathname + location.search }}
								/>
					}
				>

					{/* All Authenticated Routes here ............ */}
					<Route path="abc" element={<h1>/abc Page</h1>} />

					<Route path="masters" element={<Outlet />}>

						{/* Scope Routes ===> ModuleCode: TAGIDA_SCOPE ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="scope" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_SCOPE", "edit") || hasAccess("TAGIDA_SCOPE", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditScope
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_SCOPE")}
										/>
									}
								/>
							}
							{
								(hasAccess("TAGIDA_SCOPE", "add"))
								&&
								<Route
									path="add"
									element={
										<EditScope
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_SCOPE")}
										/>
									}
								/>
							}
							{
								(hasAccess("TAGIDA_SCOPE", "view"))
								&&
								<Route
									path=""
									element={
										<AllScopes
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_SCOPE")}
										/>
									}
								/>
							}
						</Route>

						{/* Role Routes ===> ModuleCode: TAGIDA_ROLE ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="role" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_ROLE", "edit") || hasAccess("TAGIDA_ROLE", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditRole
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											my_permissions={getPermissions("TAGIDA_ROLE")}
										/>
									}
								/>
							}
							{
								(hasAccess("TAGIDA_ROLE", "add"))
								&&
								<Route
									path="add"
									element={
										<EditRole
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											my_permissions={getPermissions("TAGIDA_ROLE")}
										/>
									}
								/>
							}
							{
								(hasAccess("TAGIDA_ROLE", "view"))
								&&
								<Route
									path=""
									element={
										<AllRoles
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_ROLE")}
										/>
									}
								/>
							}
						</Route>

						{/* User Routes ===> ModuleCode: TAGIDA_USER ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="user" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_USER", "edit") || hasAccess("TAGIDA_USER", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditUser
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_USER")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_USER", "add")
								&&
								<Route
									path="add"
									element={
										<EditUser
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_USER")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_USER", "view")
								&&
								<Route
									path=""
									element={
										<AllUsers
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_USER")}
										/>
									}
								/>
							}
						</Route>

						{/* Comapny Routes ===> ModuleCode: TAGIDA_COMPANY ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="company" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_COMPANY", "edit") || hasAccess("TAGIDA_COMPANY", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditOrg
											key="companyEdit"
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={{
												// ...getPermissions("CMSA_COMPANY"),
												// edit: authReducer.user.orgType === 3 ? false : getPermissions("CMSA_COMPANY").edit,
												edit: true, 
												add: true
											}}

											orgTypeId={3}
											orgTypeName="Company"
											homePath="/masters/company"
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_COMPANY", "add")
								&&
								<Route
									path="add"
									element={
										<EditOrg
											key="companyAdd"
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_COMPANY")}

											orgTypeId={3}
											orgTypeName="Company"
											homePath="/masters/company"
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_COMPANY", "view")
								&&
								<Route
									path=""
									element={
										<AllOrgs
											key="companyAll"
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_COMPANY")}

											orgTypeId={3}
											orgTypeName="Company"
											editPath="/masters/company/edit"
											addPath="/masters/company/add"
										/>
									}
								/>
							}
						</Route>

						{/* Vendor Routes ===> ModuleCode: TAGIDA_VENDOR ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="vendor" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_VENDOR", "edit") || hasAccess("TAGIDA_VENDOR", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditOrg
											key="vendorEdit"
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_VENDOR")}

											orgTypeId={4}
											orgTypeName="Vendor"
											homePath="/masters/vendor"
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_VENDOR", "add")
								&&
								<Route
									path="add"
									element={
										<EditOrg
											key="vendorAdd"
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_VENDOR")}

											orgTypeId={4}
											orgTypeName="Vendor"
											homePath="/masters/vendor"
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_VENDOR", "view")
								&&
								<Route
									path=""
									element={
										<AllOrgs
											key="vendorAll"
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_VENDOR")}

											orgTypeId={4}
											orgTypeName="Vendor"
											editPath="/masters/vendor/edit"
											addPath="/masters/vendor/add"
										/>
									}
								/>
							}
						</Route>

						{/* Action-Plan Routes ===> ModuleCode: TAGIDA_ACTION_PLAN ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="action-plan" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_ACTION_PLAN", "edit") || hasAccess("TAGIDA_ACTION_PLAN", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditActionPlan
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_ACTION_PLAN")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_ACTION_PLAN", "add")
								&&
								<Route
									path="add"
									element={
										<EditActionPlan
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_ACTION_PLAN")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_ACTION_PLAN", "view")
								&&
								<Route
									path=""
									element={
										<AllActionPlans
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_ACTION_PLAN")}
										/>
									}
								/>
							}
						</Route>

						{/* Zone-Group Routes ===> ModuleCode: TAGIDA_ZONE_GROUP ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="zone-group" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_ZONE_GROUP", "edit") || hasAccess("TAGIDA_ZONE_GROUP", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditZoneGroup
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_ZONE_GROUP")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_ZONE_GROUP", "add")
								&&
								<Route
									path="add"
									element={
										<EditZoneGroup
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_ZONE_GROUP")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_ZONE_GROUP", "view")
								&&
								<Route
									path=""
									element={
										<AllZoneGroups
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_ZONE_GROUP")}
										/>
									}
								/>
							}
						</Route>

						{/* Priority Routes ===> ModuleCode: TAGIDA_PRIORITY ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="priority" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_PRIORITY", "edit") || hasAccess("TAGIDA_PRIORITY", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditPriority
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_PRIORITY")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_PRIORITY", "add")
								&&
								<Route
									path="add"
									element={
										<EditPriority
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_PRIORITY")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_PRIORITY", "view")
								&&
								<Route
									path=""
									element={
										<AllPriorities
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_PRIORITY")}
										/>
									}
								/>
							}
						</Route>

						{/* Severity Routes ===> ModuleCode: TAGIDA_SEVERITY ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="severity" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_SEVERITY", "edit") || hasAccess("TAGIDA_SEVERITY", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditSeverity
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_SEVERITY")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_SEVERITY", "add")
								&&
								<Route
									path="add"
									element={
										<EditSeverity
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_SEVERITY")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_SEVERITY", "view")
								&&
								<Route
									path=""
									element={
										<AllSeverities
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_SEVERITY")}
										/>
									}
								/>
							}
						</Route>

						{/* Location Routes ===> ModuleCode: TAGIDA_LOCATION ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="location" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_LOCATION", "edit") || hasAccess("TAGIDA_LOCATION", "view"))
								&&
								<Route
									path="region/edit/:id"
									element={
										<EditRegion
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_LOCATION")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_LOCATION", "add")
								&&
								<Route
									path="region/add"
									element={
										<EditRegion
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_LOCATION")}
										/>
									}
								/>
							}

							{
								(hasAccess("TAGIDA_LOCATION", "edit") || hasAccess("TAGIDA_LOCATION", "view"))
								&&
								<Route
									path="area/edit/:id"
									element={
										<EditArea
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_LOCATION")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_LOCATION", "add")
								&&
								<Route
									path="area/add"
									element={
										<EditArea
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_LOCATION")}
										/>
									}
								/>
							}

							{
								(hasAccess("TAGIDA_LOCATION", "edit") || hasAccess("TAGIDA_LOCATION", "view"))
								&&
								<Route
									path="site/edit/:id"
									element={
										<EditSite
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_LOCATION")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_LOCATION", "add")
								&&
								<Route
									path="site/add"
									element={
										<EditSite
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_LOCATION")}
										/>
									}
								/>
							}

							{
								(hasAccess("TAGIDA_LOCATION", "view"))
								&&
								<Route
									path=""
									element={
										<AllLocations
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_LOCATION")}
										/>
									}
								/>
							}
						</Route>

						{/* Panel Routes ===> ModuleCode: TAGIDA_PANEL ; ApplicationCode: APP_CMS_ADMIN */}
						<Route path="panel" element={<Outlet />}>
							{
								(hasAccess("TAGIDA_PANEL", "edit") || hasAccess("TAGIDA_PANEL", "view"))
								&&
								<Route
									path="edit/:id"
									element={
										<EditPanel
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={false}
											permissions={getPermissions("TAGIDA_PANEL")}
										/>
									}
								/>
							}
							{
								hasAccess("TAGIDA_PANEL", "add")
								&&
								<Route
									path="add"
									element={
										<EditPanel
											selectedOrg={globalReducer.selectedOrg}
											isAddNew={true}
											permissions={getPermissions("TAGIDA_PANEL")}
										/>
									}
								/>
							}
							{
								(hasAccess("TAGIDA_PANEL", "view"))
								&&
								<Route
									path=""
									element={
										<AllPanels
											selectedOrg={globalReducer.selectedOrg}
											permissions={getPermissions("TAGIDA_PANEL")}
										/>
									}
								/>
							}
						</Route>

					</Route>
					<Route path="reports" element={<Outlet />}>
						{
							hasAccess("TAGIDA_REPORTS", "event_history")
							&&
							<Route
								path="event-history"
								element={
									<EventHistory
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
						{
							hasAccess("TAGIDA_REPORTS", "unknown_events")
							&&
							<Route
								path="unknown-events"
								element={
									<UnknownEvents
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
						{
							hasAccess("TAGIDA_REPORTS", "panel_status")
							&&
							<Route
								path="panel-status"
								element={
									<PanelStatusReport
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
						{
							hasAccess("TAGIDA_REPORTS", "hourly_heartbeat")
							&&
							<Route
								path="hourly-heartbeat"
								element={
									<HourlyHeartBeat
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
						{
							hasAccess("TAGIDA_REPORTS", "monthly_heartbeat")
							&&
							<Route
								path="monthly-heartbeat"
								element={
									<MonthlyHeartBeat
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
						{
							hasAccess("TAGIDA_REPORTS", "audit_log")
							&&
							<Route
								path="audit-log"
								element={
									<AuditLog
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
						{
							hasAccess("TAGIDA_REPORTS", "current_zone_status")
							&&
							<Route
								path="current-zone-status"
								element={
									<CurrentZoneStatus
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
						{
							hasAccess("TAGIDA_REPORTS", "arm_disarm")
							&&
							<Route
								path="arm-disarm"
								element={
									<ArmDisarm
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
					</Route>
					<Route path="rfid-reports" element={<Outlet />}>
						{
							hasAccess("TAGIDA_REPORTS", "inward_outward")
							&&
							<Route
								path="inward-outward"
								element={
									<InwardOutward
										selectedOrg={globalReducer.selectedOrg}
										permissions={getPermissions("TAGIDA_REPORTS")}
									/>
								}
							/>
						}
					</Route>


					<Route path="*" element={
						<Result
							status="warning"
							title="Page Not Found"
						/>}
					/>
				</Route>

			</Routes>
		</div>
	)
}

export default App;
