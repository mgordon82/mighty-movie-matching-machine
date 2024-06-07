const omdbKey = 'f1744d2a';
// const baseURL = `http://www.omdbapi.com/?apikey=${omdbKey}&s=endgame`;
const movieUpdate = document.getElementById('test');
// const searchInput = document.getElementById('input id here').value

function getSearchResults(title) {
    fetch(`http://www.omdbapi.com/?apikey=${omdbKey}&s=${title}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            console.log(data.Search[0]);
        });
}

function exactSearchResults(exactTitle) {
    fetch(`http://www.omdbapi.com/?apikey=${omdbKey}&i=${exactTitle}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            console.log(data.Title);
            movieUpdate.textContent = data.Title;
        });
}

getSearchResults('Endgame');
exactSearchResults('tt4154796');