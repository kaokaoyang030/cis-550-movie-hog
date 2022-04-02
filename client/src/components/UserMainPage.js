import React from 'react'
import { Tabs } from 'antd' 

const { TabPane } = Tabs;

class UserMainPage extends React.Component {
    render () {
        return (
            <Tabs defaultActiveKey="1" destroyInactiveTabPane={true}>
                <TabPane tab="Search Movie" key="1">
                    <div>Search Movie Main Page</div>
                </TabPane>
                <TabPane tab="My Movie" key="2">
                    <div>My Movie Main Page</div>
                </TabPane>
          </Tabs>
        )
    }
}

export default UserMainPage