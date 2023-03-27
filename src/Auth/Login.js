import { Form, Input, Button, Typography, message, Card } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
// import "antd/dist/antd.css";
import axios from 'axios';
const { Title } = Typography;


const Login = () => {
    const location = useLocation();

    const onFinish = async(values) => {        
        await axios.post("/admin-api/login", {
			username: values.username,
			password: values.password
		})
			.then(res => {
				// console.log(res);
				localStorage.setItem("AdminToken", res.data.data.token);
				localStorage.setItem("RoleToken", res.data.data.role_token);
                // navigate();
                window.location.href = location?.state?.from || "/";
			})
			.catch(err => {
				console.log(err);
				message.error("Login failed - " + err.message);
			})

    };

    const onFinishFailed = errorInfo => {
        console.log("Failed:", errorInfo);
    };

    return (
        <>
            <div className="login">
                <div className="appAside">{/* <img src="loginpage.jpg" height="50%" width="50%"></img> */}</div>

                {/* <div className="appForm"> */}
                <div
                    style={{
                        height: "100vh",
                        backgroundImage: `url("/loginpage.jpg")`,
                        backgroundColor: "white",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "bottom",
                        backgroundSize: "cover",
                        textAlign: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            minWidth: "100%",
                            minHeight: "100%",
                            textAlign: "center",
                            display: "-webkit-flex",
                            alignItems: "center",
                        }}
                    >
                        <Card
                            bordered={true}
                            hoverable={true}
                            style={{
                                margin: "Auto",
                                width: "400px",
                            }}
                        >
                            <br></br>
                            <Title style={{ color: "black" }}>Tagid Admin Login</Title>
                            <Form
                                name="basic"
                                labelCol={{
                                    span: 8,
                                }}
                                wrapperCol={{
                                    span: 16,
                                }}
                                initialValues={{
                                    remember: true,
                                }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
                                <Form.Item
                                    style={{ color: "black" }}
                                    label={
                                        <p
                                            style={{
                                                fontSize: "20px",
                                                color: "black",
                                                marginTop: "18px",
                                            }}
                                        >
                                            Username
                                        </p>
                                    }
                                    name="username"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input your username!",
                                        },
                                    ]}
                                >
                                    <Input size="large" autoFocus />
                                </Form.Item>

                                <Form.Item
                                    label={
                                        <p
                                            style={{
                                                color: "black",
                                                fontSize: "20px",
                                                marginTop: "18px",
                                            }}
                                        >
                                            Password
                                        </p>
                                    }
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input your password!",
                                        },
                                    ]}
                                >
                                    <Input.Password size="large" />
                                </Form.Item>

                                <Form.Item
                                    wrapperCol={{
                                        offset: 8,
                                        span: 16,
                                    }}
                                >
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        style={{ backgroundColor: "#ea5150", color: "black" }}
                                    >
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Login;

