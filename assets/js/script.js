const omdbKey = 'f1744d2a';
const watchModeApiKey = 'u5P8vBevWv4TKhoIoGy7N3kSgvfsLW5OmPNNunDA';
const movieUpdate = document.getElementById('test');
const searchBtn = document.getElementById('search-button');
const searchInput = document.getElementById('search-bar');
let movieData = {};

function getSearchResults(title) {
  fetch(`http://www.omdbapi.com/?apikey=${omdbKey}&s=${title}&type=movie`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log('results', data);
    });
}

function exactSearchResults(imdbId) {
  fetch(`http://www.omdbapi.com/?apikey=${omdbKey}&i=${imdbId}&type=movie`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      console.log(data.Title);
      // movieUpdate.textContent = data.Title;
    });
}

searchBtn.addEventListener('click', function () {
  if (searchInput.value !== '') {
    console.log('input value', searchInput.value);
    getSearchResults(searchInput.value);
  }
});

searchInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    searchBtn.click();
  }
});

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
      const unique = {};
      const filteredData = data.filter((item) => {
        if (!unique[item.source_id]) {
          unique[item.source_id] = true;
          return true;
        }
        return false;
      });
      movieData = filteredData;
      console.log('movie data', movieData);
    });
}

// modal functionality

document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (
    document.querySelectorAll(
      '.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button'
    ) || []
  ).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  });
});
