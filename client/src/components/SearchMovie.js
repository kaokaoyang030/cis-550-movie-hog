import React from 'react'
import { Table, Input, Button} from 'antd' 
import { getSearchMovies} from '../fetcher'


const SearchColumns = [
    {
        title: 'Movie Name',
        dataIndex: 'name',
        key: 'name'
        // render: text => <a>{text}</a>
    },
    {
        title: 'Realease Date',
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
        title:'genre',
        dataIndex:'genre',
        key: 'genre'
    },    
    {
        title:'Country',
        dataIndex:'country',
        key: 'country'
    }
]

class SearchMovie extends React.Component{
    state = {
        data: [],
        keyword: '',
        genre: '',
        year: '',
        actor: '',
        country: ''
    }

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

    searchMovie = async () => {
        try {
            const {
                keyword,
                genre,
                actor,
                year,
                country
            } = this.state
            const result = await getSearchMovies(keyword, genre, country, actor, year)
            console.log('result: ', result)
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
            <div class="seach_movie flex">
                <div class="w-1/3">
                    <div class="flex">
                        <div class="w-1/4">Keyword</div>
                        <div>
                            <Input 
                                placeholder='movie keyword'
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
                        <div class="mr-9">
                            <Button
                              onClick={this.searchMovie}   
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
                <div class="w-2/3">
                <Table columns={SearchColumns} dataSource={this.state.data} />
                </div>
            </div>
        )
    }
}

export default SearchMovie;