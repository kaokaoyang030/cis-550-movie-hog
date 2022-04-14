import React from 'react'
import { Table} from 'antd' 
import { getTopReviewMovies} from '../fetcher'

const topTenReviewColumns = [
    {
        title: 'Title',
        dataIndex: 'TITLE',
        key: 'TITLE'
        // render: text => <a>{text}</a>
    },
    {
        title: 'Year',
        dataIndex: 'year',
        key: 'YEAR'
        // render: text => <a>{text}</a>
    },
    {
        title: 'RatingCounts',
        dataIndex: 'RatingCounts',
        key: 'RatingCounts'
        // render: text => <a>{text}</a>
    },
    {
        title: 'Runtime',
        dataIndex: 'runtime',
        key: 'runtime'
        // render: text => <a>{text}</a>
    },
]

class TopTenReview extends React.Component {
    state = {
        data: [],
        comment:  ''
    }

    componentDidMount() {
        this.getTopTenReviewMoveis()
    }

    getTopTenReviewMoveis =  async () => {
        try {
            const result = await getTopReviewMovies(10)
            console.log('result: ', result.results)
            this.setState({
                data: result.results
            })
            console.log('state data: ', this.state.data)
        } catch (e) {
            console.log('error in fetching top movie: ', e)
        }
    }

    render() {
        return (
            <Table columns={topTenReviewColumns} dataSource={this.state.data} />
        )
    }
}

export default TopTenReview;