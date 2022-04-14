import config from './config.json'

const domain = "http://localhost:8080"

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

<<<<<<< HEAD
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
=======

>>>>>>> 0e4885487d43efa8d622bacb12c0167a40cce6ef













export {
    getTopRatingMovies,
<<<<<<< HEAD
    getSearchMovies,
    login,
    getTopReviewMovies
}
=======
    getSearchMovies
}
>>>>>>> 0e4885487d43efa8d622bacb12c0167a40cce6ef
