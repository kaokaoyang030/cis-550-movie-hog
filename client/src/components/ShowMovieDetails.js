import React, {useState} from 'react'
import { Modal} from 'antd' 
import {getMovieInfoByImdbid} from '../fetcher'
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

class ShowMovieDetails extends React.Component {
    state= {
        visible: false,
        title: '',
        overview: ''
    }

    handleOk = () => {
        this.setState({
            visible : false
        })
    }
    
    handleCancle = () => {

        this.setState({
            visible : false
        })

    }
    
    getDirector = (record) => {
        console.log(record)
        return record.director ? record.director : 'N/A'
    }
    showDetais = async () => {
        const result = await this.fetechImdbInfo()
        console.log('results imbd ', result)
        this.setState({
            movie_info: result.movie_results[0],
            title: result.movie_results[0].title,
            overview: result.movie_results[0].overview
        })
        console.log('details: ', this.state.movie_info)
        this.setState({
            visible : true,
        })
    }

    fetechImdbInfo = async () => {
        try {
           const result = await getMovieInfoByImdbid(this.props.record.imdbid)
           return result
        } catch (error) {
            console.log('error')
        }
    }

    componentDidMount(){
      
    }
    render() {
        const { record } = this.props;
        return (
            <div>
                <div>
                <button onClick={this.showDetais}>
                    {"Details"}
                </button>
                {this.state.visible && (
                    <Modal title={record.name} visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancle}>
                    <div class="flex">
                        <div class="w-1/3"> 
                            <img src ={`https://image.tmdb.org/t/p/w500${this.state.movie_info.poster_path}`} height={375} width={200} />
                        </div>

                        <div class="w-2/3 ml-5">
                           <div class="flex mt-3">
                               <div>Title</div>
                               <div class="ml-3">{this.state.movie_info.title}</div>
                           </div>
                           <hr />
                           <div class="flex mt-3">
                               <div>Run Time</div>
                               <div class="ml-3">{record.runtime} min</div>
                           </div>
                            <hr />
                            <div class="flex mt-3">
                               <div>Director</div>
                               <div class="ml-3">{this.getDirector(this.props.record)}</div>
                           </div>
                            <hr />
                            <div class="mt-3">
                               <div>Overview</div>
                               <hr />
                               <div>{this.state.movie_info.overview}</div>
                           </div>
                        </div>
                    </div>
                </Modal>
                )}
                </div>
            </div>
        )
    }
}
export default ShowMovieDetails