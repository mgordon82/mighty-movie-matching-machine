const omdbKey = 'f1744d2a';
const watchModeApiKey = 'u5P8vBevWv4TKhoIoGy7N3kSgvfsLW5OmPNNunDA';
const movieUpdate = document.getElementById('test');

let data = {};

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
      // movieUpdate.textContent = data.Title;
    });
}

function getMovieId(value) {
  fetch(
    `https://api.watchmode.com/v1/search/?apiKey=${watchModeApiKey}&search_field=name&search_value=${value}&types=movie`,
    {
      method: 'GET',
      credentials: 'same-origin',
      redirect: 'follow',
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      getStreamingService(data.title_results[0].id);
    });
}

function getStreamingService(id) {
  fetch(
    `https://api.watchmode.com/v1/title/${id}/sources/?apiKey=${watchModeApiKey}&regions=US`,
    {
      method: 'GET',
      credentials: 'same-origin',
      redirect: 'follow',
    }
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      data = data;
    });
}

getSearchResults('Endgame');
exactSearchResults('tt4154796');
getMovieId('Avengers: Endgame');
console.log('data', data);
