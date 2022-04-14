import React from 'react'
import { Tabs} from 'antd' 
import SearchMovie from './SearchMovie';
import TopTenRating from './TopTenRating';
import TopTenReview from './TopTenReview';

const { TabPane } = Tabs;

class UserMainPage extends React.Component {
    render () {
        return (
            <Tabs defaultActiveKey="1" destroyInactiveTabPane={true}>
                <TabPane tab="Search Movie" key="1">
                    <SearchMovie/>
                </TabPane>
                <TabPane tab="My Movie" key="2">
                    <div>My Movie Main Page</div>
                </TabPane>
                <TabPane tab="Top 10 Rating Movie" key="3">
                    <TopTenRating />
                </TabPane>
                <TabPane tab="Top 10 Review Movie" key="4">
                    <TopTenReview />
                </TabPane>
          </Tabs>
        )
    }
}

export default UserMainPage