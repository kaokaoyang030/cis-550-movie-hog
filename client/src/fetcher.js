import config from './config.json'

const domain = "http://localhost:3000"
const getAllMatches = async (page, pagesize, league) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/matches/${league}?page=${page}&pagesize=${pagesize}`, {
        method: 'GET',
    })
    return res.json()
}

const login = async (username, password) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sign_in?username=${username}&password=${password}`, {
        method: 'POST',
    })
    return res.json()
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

const getSearchMovies = async (keyword, genre, actor, country, year) => {
    const url = `${domain}/search_movies?moviename=${keyword}&genre=${genre}&actor=${actor}&country=${country}&year=${year}`
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
    getSearchMovies
}