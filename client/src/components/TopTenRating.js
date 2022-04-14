import React from 'react'
import { Table} from 'antd' 
import {getTopRatingMovies} from '../fetcher'

const topTenRatingColumns = [
    {
        title: 'Title',
        dataIndex: 'TITLE',
        key: 'TITLE'
        // render: text => <a>{text}</a>
    },
    {
        title: 'Year',
        dataIndex: 'YEAR',
        key: 'YEAR'
        // render: text => <a>{text}</a>
    },
    {
        title: 'Rating',
        dataIndex: 'rating',
        key: 'rating'
        // render: text => <a>{text}</a>
    },
    {
        title: 'Runtime',
        dataIndex: 'runtime',
        key: 'runtime'
        // render: text => <a>{text}</a>
    },
]

class TopTenRating extends React.Component {
    state = {
        data: []
    }

    componentDidMount() {
        this.getTopTenMoveis()
    }

    getTopTenMoveis =  async () => {
        try {
            const result = await getTopRatingMovies(10)
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
            <Table columns={topTenRatingColumns} dataSource={this.state.data} />
        )
    }
}

export default TopTenRating