import React from 'react';
import { Form, Button, Input, Space, message } from "antd";
import { UserOutlined } from "@ant-design/icons";

class LoginPage extends React.Component {
    formRef = React.createRef();

    state = {
        loading: false
    }

    componentDidMount() {
      
    }

    onFinish = () => {
        console.log("finish form");
    };

    handleLogin = async () => {
        const formInstance = this.formRef.current;
 
        try {
          await formInstance.validateFields();
        } catch (error) {
          return;
        }
     
        this.setState({
          loading: true,
        });

        try {
          this.props.handleLogInSuccess()
        } catch (error) {
          message.error(`fail to login due to ${error.message}`)
        }

        this.setState({
            loading: false
        })
    }

    handleRegister = async () => {
        const formInstance = this.formRef.current;
 
        try {
          await formInstance.validateFields();
        } catch (error) {
          return;
        }
     
        this.setState({
          loading: true,
        });

        this.setState({
            loading : false
        })
    }

    handleClickGuestMode = () => {
      this.setState({
        loading : true
      })
      this.props.handleGuestMode()
      this.setState({
        loading : false
      })
    }

    render() {
        return (
            <div style={{ width: 500, margin: "20px auto" }}>
              <Form ref={this.formRef} onFinish={this.onFinish}>
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Username!",
                    },
                  ]}
                >
                  <Input
                    disabled={this.state.loading}
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="Username"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Password!",
                    },
                  ]}
                >
                  <Input.Password
                    disabled={this.state.loading}
                    placeholder="Password"
                  />
                </Form.Item>
              </Form>
              <Space>
                <Button
                  onClick={this.handleLogin}
                  disabled={this.state.loading}
                  shape="round"
                  type="primary"
                >
                  Log in
                </Button>
                <Button
                  onClick={this.handleRegister}
                  disabled={this.state.loading}
                  shape="round"
                  type="primary"
                >
                  Register
                </Button>
                <Button
                  onClick={this.handleClickGuestMode}
                  disabled={this.state.loading}
                  shape="round"
                  type="primary"
                >
                  Guest Mode
                </Button>
              </Space>
            </div>
          );
    }
}

export default LoginPage;