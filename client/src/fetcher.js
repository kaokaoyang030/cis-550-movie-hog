import config from './config.json'

const domain = "http://localhost:8080"
//API Connection
const API_KEY = 'api_key=fc9f519488c11a17e9c91f5d397bbd38';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?'+API_KEY;

const login = async (input) => {
    const url = `${domain}/sign_in`
    const postObj = JSON.stringify(input)
    console.log('json obj: ', postObj)
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body: postObj
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })
}

const getTopRatingMovies = async (limit) => {
    const url = `${domain}/top_rating?max=${limit}`
    return fetch(url, {
        method: 'GET',
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })
}

const getSearchMovies = async (keyword, genre, actor, country, year, director) => {
    const url = `${domain}/search?title=${keyword}&genre=${genre}&actor=${actor}&country=${country}&year=${year}&director=${director}`
    return fetch(url, {
        method: 'GET',
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })
}

const getTopReviewMovies = async (limit) => {
    const url = `${domain}/top_review?max=${limit}`
    return fetch(url, {
        method: 'GET',
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })
}

const likeSelectedMovie = async (input) => {
    console.log('like input obj:', input)
    const url = `${domain}/like`
    const postObj = JSON.stringify(input)
    console.log('json obj: ', postObj)
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body: postObj
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })
}

const unlikeSelectedMovie = async (input) => {
    console.log('like input obj:', input)
    const url = `${domain}/unlike`
    const postObj = JSON.stringify(input)
    console.log('json obj: ', postObj)
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body: postObj
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })
}

const getFavoriteMovie = async (username) => {
    const url = `${domain}/favorites?username=${username}`
    console.log('11111', url)
    return fetch(url, {
        method: 'GET',
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })
}

const getMovieInfoByMovieID = async (movie_id) => {
    const url = `${domain}/get_movie_info_by_MovieID?movie_id=${movie_id}`
    return fetch(url, {
        method: 'GET',
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })

}

const sign_up = async (input) => {
    const url = `${domain}/sign_up`
    const postObj = JSON.stringify(input)
    console.log('json obj: ', postObj)
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body: postObj
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })
}

const getMovieInfoByImdbid = async (Imdb_id) => {
    const url = `${BASE_URL}/find/${Imdb_id}?external_source=imdb_id&${API_KEY}`
    console.log('url: ', url)
    return fetch(url, {
        method: 'GET',
    })
    .then((response) => {
        if (response.status !== 200){
            console.log('error')
        }
        return response.json()
    })

}


export {
    getTopRatingMovies,
    getSearchMovies,
    login,
    getTopReviewMovies,
    likeSelectedMovie,
    getFavoriteMovie,
    getMovieInfoByMovieID,
    sign_up,
    getMovieInfoByImdbid,
    unlikeSelectedMovie
}
