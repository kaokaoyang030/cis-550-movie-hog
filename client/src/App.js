import './App.css';
import React from 'react';
import {Layout, Dropdown, Menu, Button} from "antd"
import { UserOutlined } from "@ant-design/icons";
import LoginPage from './components/LoginPage';

const { Header, Content } = Layout;

class App extends React.Component {
  state = {
    authed: false
  }

  handleLogInSuccess = () => {
    this.setState({
      authed: true
    })
  }

  handleLogOut = () => {
    this.setState({
      authed: false
    })
  }

  renderContent = () => {
    if (!this.state.authed){
      return <LoginPage handleLogInSuccess={this.handleLogInSuccess} />
    } else {
      return <div>MovieHog Main Page</div>
    }
  }

  userMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={this.handleLogOut}>
        Log Out
      </Menu.Item>
    </Menu>
  )
  
  render(){
    return (
      <Layout style={{ height: "100vh" }}>
        <Header style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "white" }}>
            MovieHog
          </div>
          {this.state.authed && (
            <div>
              <Dropdown trigger="click" overlay={this.userMenu}>
                <Button icon={<UserOutlined />} shape="circle" />
              </Dropdown>
            </div>
          )}
        </Header>
        <Content
          style={{ height: "calc(100% - 64px)", margin: 20, overflow: "auto" }}
        >
          {this.renderContent()}
        </Content>
      </Layout>
    )
  }
}

export default App
