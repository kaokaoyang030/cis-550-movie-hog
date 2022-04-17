import React, {useState} from 'react'
import { Table, Input, Button, message} from 'antd' 
import { getSearchMovies, likeSelectedMovie} from '../fetcher'
import ShowMovieDetails from './ShowMovieDetails'

const IMG_URL = 'https://image.tmdb.org/t/p/w500';


class SearchMovie extends React.Component{
    state = {
        data: [],
        keyword: '',
        genre: '',
        year: '',
        actor: '',
        country: '',
        director:''
    }

    likeMovie = async (payload) => {
        try {
            console.log('input details: ', payload)
            // hard code
            const movie_id = payload.movie_id
            const username = window.localStorage.getItem('username')
            const input = {
                username : username,
                movie_id : movie_id
            }
    
            const result = await likeSelectedMovie(input)
            console.log('result: ', result)
            if (result.username && result.movie_id){
                message.success('successfully like selected movie')
            }
            
        } catch (e) {
            console.log('error in likeing movie')
        }
    }
    
    SearchColumns = [
        {
            title: 'Movie Name',
            dataIndex: 'name',
            key: 'name'
            // render: text => <a>{text}</a>
        },
        {
            title: 'Realease Year',
            dataIndex: 'rel_date',
            key: 'rel_date'
            // render: text => <a>{text}</a>
        },
        {
            title: 'director',
            dataIndex: 'director',
            key: 'director'
            // render: text => <a>{text}</a>
        },
        {
            title: 'Runtime',
            dataIndex: 'runtime',
            key: 'runtime'
            // render: text => <a>{text}</a>
        },
        {
            title:'Country',
            dataIndex:'country',
            key: 'country'
        }, {
            title: 'Like',
            key: 'like',
            dataIndex: 'like',
            render: (text, record) => (
                <button onClick={() => this.likeMovie(record)}>
                    {"Like"}
                </button>
            )
        }, {
            title: 'Show Details',
            key: 'Sho',
            dataIndex: 'show',
            render: (text, record) => (
                <div>
                    <ShowMovieDetails record={record}/>
                </div>
    
            )
        }
    ]



    keywordHandleOnChange = (value) => {
        this.setState({
            keyword: value.target.value
        })
        console.log('keyword: ', this.state.keyword)
    }

    genreHandleOnChange = (value) => {
        this.setState({
            genre: value.target.value
        })
    }

    actorHandleOnChange = (value) => {
        this.setState({
            actor: value.target.value
        })
    }

    yearHandleOnChage = (value) => {
        this.setState({
            year: value.target.value
        })
    }

    countryHandleOnChage = (value) => {
        this.setState({
            country: value.target.value
        })
    }

    directorHandleOnChange = (value) => {
        this.setState({
            director: value.target.value
        })
    }


    searchMovie = async () => {
        try {
            const {
                keyword,
                genre,
                actor,
                year,
                country,
                director
            } = this.state
            const result = await getSearchMovies(keyword, genre, country, actor, year, director)
            console.log('result: ', result)
            this.setState({
                data: result.results
            })
            console.log('state data: ', this.state.data)
        } catch (e) {
            console.log('error in fetching top movie: ', e)
        }
    }

    componentDidMount(){
        
    }
    render() {
        return (
            <div class="seach_movie flex">
                <div class="w-1/3">
                    <div class="flex">
                        <div class="w-1/4">Movie Name</div>
                        <div>
                            <Input 
                                placeholder='What are you looking for?'
                                value={this.state.keyword} 
                                onChange={this.keywordHandleOnChange}
                            />
                        </div>
                    </div>
                    <div class="flex mt-2">
                        <div class="w-1/4">Genre</div>
                        <div>
                            <Input placeholder='movie genre' value={this.state.genre} onChange={this.genreHandleOnChange}/>
                        </div>
                    </div>
                    <div class="flex mt-2">
                        <div class="w-1/4">Director</div>
                        <div>
                            <Input placeholder='movie actor' value={this.state.director} onChange={this.directorHandleOnChange}/>
                        </div>
                    </div>
                    <div class="flex mt-2">
                        <div class="w-1/4">Actor</div>
                        <div>
                            <Input placeholder='movie actor' value={this.state.actor} onChange={this.actorHandleOnChange}/>
                        </div>
                    </div>
                    <div class="flex mt-2">
                        <div class="w-1/4">Year</div>
                        <div>
                            <Input placeholder='movie year' value={this.state.year} onChange={this.yearHandleOnChage}/>
                        </div>
                    </div>
                    <div class="flex mt-2">
                        <div class="w-1/4">Country</div>
                        <div>
                            <Input placeholder='movie country' value={this.state.country} onChange={this.countryHandleOnChage}/>
                        </div>
                    </div>

                    <div class="flex justify-end mt-3">
                        <div class="mr-10">
                            <Button
                              onClick={this.searchMovie}   
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
                <div class="w-2/3">
                <Table columns={this.SearchColumns} dataSource={this.state.data} />
                </div>
            </div>
        )
    }
}

export default SearchMovie;