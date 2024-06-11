const omdbKey = 'f1744d2a';
const watchModeApiKey = 'u5P8vBevWv4TKhoIoGy7N3kSgvfsLW5OmPNNunDA';
const movieUpdate = document.getElementById('test');
const searchBtn = document.getElementById('search-button');
const searchInput = document.getElementById('search-bar');
let movieData = {};

function getSearchResults(title) {
  fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&s=${title}&type=movie`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log('results', data);
      if (data.Search) {
        displaySearchResults(data.Search);
      } else {
        displaySearchResults([]); // passes an empty array if no results found
      }
    });
}

function exactSearchResults(imdbId) {
  fetch(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${imdbId}&type=movie`)
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

function displaySearchResults(results) {
  const p = document.getElementById('numOfResults');
  p.textContent = `Showing ${results.length} Result(s)`;
  p.setAttribute('class', 'my-4');
  const modalContent = document.getElementById('search-results');
  modalContent.innerHTML = ''; // clears past search results
  // checks if 'results' exists and if the fetch actually returns results
  if (results && results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      // stores movie object
      const movie = results[i];
      const movieElement = document.createElement('section');
      movieElement.setAttribute(
        'class',
        'columns card has-background-info-dark my-4'
      );
      movieElement.innerHTML = `
        <div class='column is-one-quarter'>
            <figure class="image">
                <img src="${movie.Poster}" alt="${movie.Title}">
            </figure>
        </div>
        <div class='column'>
            <div>
                <p><strong>${movie.Title}</strong> (${movie.Year})</p>
            </div>
        </div>
      `;

      modalContent.appendChild(movieElement);
    }
  } else {
    // something about 'no results found'
  }
}

// modal functionality

document.addEventListener('DOMContentLoaded', () => {
  const chuckNorrisDialog = document.getElementById('chuckNorrisDialog');
  const jokeDisplay = document.getElementById('jokeDisplay');

  // Konami code, duh
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'
  ];
  let konamiCodePosition = 0;

  // Function to open the dialog
  function openDialog() {
    chuckNorrisDialog.style.display = 'flex';
  }

  // Function to close the dialog, duh
  function closeDialogBox() {
    chuckNorrisDialog.style.display = 'none';
  }

  // Fetch a Chuck Norris joke
  function fetchJoke() {
    const apiUrl = 'https://api.chucknorris.io/jokes/random';
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        jokeDisplay.textContent = data.value;
        openDialog();
      })
      .catch(error => {
        jokeDisplay.textContent = 'Failed to fetch joke';
        console.error('Error fetching joke:', error);
      });
  }

  // Event listener for Konami code
  document.addEventListener('keydown', (event) => {
    const key = event.key;
    const requiredKey = konamiCode[konamiCodePosition];

    if (key === requiredKey) {
      konamiCodePosition++;
      if (konamiCodePosition === konamiCode.length) {
        fetchJoke();
        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
  });

  // Close dialog if clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target === chuckNorrisDialog) {
      closeDialogBox();
    }
  });

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
