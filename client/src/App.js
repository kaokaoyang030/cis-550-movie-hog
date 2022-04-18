import './App.css';
import React from 'react';
import {Layout, Dropdown, Menu, Button} from "antd"
import { UserOutlined } from "@ant-design/icons"
import LoginPage from './components/LoginPage'
import UserMainPage from './components/UserMainPage'


const { Header, Content } = Layout;

class App extends React.Component {
  state = {
    authed: false,
    isUser: false,
    isGuest: false
  }

  handleLogInSuccess = () => {
    this.setState({
      authed: true,
      isUser: true
    })
  }

  handleLogOut = () => {
    window.localStorage.clear()
    this.setState({
      authed: false,
      isUser: false,
    })
  }

  handleGuestLogIn = () => {
    this.setState({
      authed: false,
      isGuest: false
    })
  }

  handleGuestMode = () => {
    this.setState({
      authed : true,
      isGuest: true
    })
  }

  renderContent = () => {
    if (!this.state.authed){
      return <LoginPage 
              handleLogInSuccess={this.handleLogInSuccess}
              handleGuestMode={this.handleGuestMode}
            />
    } else if (this.state.isUser) {
      return <UserMainPage />
    } else {
      return <div>Guest Mode Main Page</div>
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
          {this.state.isUser && (
            <div>
              <Dropdown trigger="click" overlay={this.userMenu}>
                <Button icon={<UserOutlined />} shape="circle" />
              </Dropdown>
            </div>
          )}
          {this.state.isGuest && (
            <div>
              <Button type="text" style={{color: 'white'}} onClick={this.handleGuestLogIn}>Log In</Button>
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
