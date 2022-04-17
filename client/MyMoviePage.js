import React from 'react'
import { Table, message} from 'antd'
import { getFavoriteMovie, getMovieInfoByMovieID,unlikeSelectedMovie } from '../fetcher'
class MyMoviePage extends React.Component {
    state = {
        username: 'john',
        data: []
    }

    myMovieColumns = [
        {
            title: 'Title',
            dataIndex: 'name',
            key: 'name'
            // render: text => <a>{text}</a>
        },
        {
            title: 'Director',
            dataIndex: 'director',
            key: 'director'
            // render: text => <a>{text}</a>
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country'
            // render: text => <a>{text}</a>
        },
        {
            title: 'Release_date',
            dataIndex: 'rel_date',
            key: 'rel_date'
            // render: text => <a>{text}</a>
        },
        {
            title: 'Runtime',
            dataIndex: 'runtime',
            key: 'runtime'
            // render: text => <a>{text}</a>
        },
        {
            title: 'Unlike',
            key: 'Unlike',
            dataIndex: 'Unlike',
            render: (text, record) => (
                <button onClick={() => this.unlikeMovie(record)}>
                    {"Unlike"}
                </button>
            )
        }
    ]

    async componentDidMount() {
        await this.getUserLikedMovie()
    }

    unlikeMovie = async (payload) => {
        try {
            console.log('input details: ', payload)
            // hard code
            const movie_id = payload.movie_id
            const username = window.localStorage.getItem('username')
            const input = {
                username : username,
                movie_id : movie_id
            }
    
            const result = await unlikeSelectedMovie(input)
            console.log('result: ', result)
            if (result.username && result.movie_id){
                message.success('successfully unlike selected movie')
                const tmp = this.state.data.filter(movie => movie.movie_id !== result.movie_id)
                this.setState({
                    data: tmp
                })
            }
            
        } catch (e) {
            console.log('error in lunikeing movie')
        }
    }

    getUserLikedMovie = async () => {
        try {
            console.log('username: ', window.localStorage.getItem('username'))
            const result = await getFavoriteMovie(window.localStorage.getItem('username'))
            console.log('result:', result)
            let movie_ids = []
            if (result && result.results){
                movie_ids = result.results.map(each => each.movie_id)
            }
            console.log('movie ids', movie_ids)
            
            const liked_movies = []
            if (movie_ids.length > 0){
                for (var i = 0; i < movie_ids.length; i++){
                    const movie_info = await this.getMovieInfoByID(movie_ids[i]);
                    liked_movies.push(
                        {
                            ...movie_info, 
                            movie_id: movie_ids[i]
                        })
                }
            }

            console.log('update table data')
            this.setState({
                data: liked_movies
            })
            console.log('111111', this.state.data)
            

        } catch (e) { 
            console.log('error in getting movies', e)
        }
    }

    getMovieInfoByID = async (movie_id) => {
        const result = await getMovieInfoByMovieID(movie_id)
        return result.results[0]
    }

    render() {
        return (
            <Table columns={this.myMovieColumns} dataSource={this.state.data} />
        )
    }
}

export default MyMoviePage