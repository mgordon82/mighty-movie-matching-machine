const omdbKey = 'f1744d2a';
const watchModeApiKey = 'u5P8vBevWv4TKhoIoGy7N3kSgvfsLW5OmPNNunDA';
const movieUpdate = document.getElementById('test');
const searchBtn = document.getElementById('search-button');
const searchInput = document.getElementById('search-bar');
let movieData = {};
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let upNext = JSON.parse(localStorage.getItem('upNext')) || [];
let watched = JSON.parse(localStorage.getItem('watched')) || [];

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

function addToFavorites(movie) {
  // checks if movie is already in favorites array to avoid duplicates
  let isFavorite = false;
  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].imdbID === movie.imdbID) {
      isFavorite = true;
      break;
    }
  }

  // if movie not in array already
  if (!isFavorite) {
    favorites.push(movie);

    localStorage.setItem('favorites', JSON.stringify(favorites));

    console.log(`${movie.Title} added to favorites list.`);
    // Added updateSection call to move into favorites
    updateFavoritesSection(movie);
  } else {
    console.log(`${movie.Title} is already in your favorites list.`);
  }
}

function addToWatched(movie) {
  let isWatched = false;
  for (let i = 0; i < watched.length; i++) {
    if (watched[i].imdbID === movie.imdbID) {
      isWatched = true;
      break;
    }
  }

  // if movie not in array already
  if (!isWatched) {
    watched.push(movie);

    localStorage.setItem('watched', JSON.stringify(watched));

    console.log(`${movie.Title} added to watched list.`);
    // Added updateWatchHistorySeciton call to move into watch-history.
    updateWatchHistorySection(movie);
  } else {
    console.log(`${movie.Title} is already in your watched list.`);
  }
}

function addToUpNext(movie) {
  let isUpNext = false;
  for (let i = 0; i < upNext.length; i++) {
    if (upNext[i].imdbID === movie.imdbID) {
      isUpNext = true;
      break;
    }
  }

  if (!isUpNext) {
    upNext.push(movie);
    localStorage.setItem('upNext', JSON.stringify(upNext));
    console.log(`${movie.Title} added to up-next list.`);
    getMovieId(movie.Title);
    // fixed targetting to up-next-section
    updateUpNextSection(movie);
  } else {
    console.log(`${movie.Title} is already in your up-next list.`);
  }
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
        <div class='column modal-actions'>
            <button class="button are-small" id='${movie.imdbID}Favorite'>
                <img src="./assets/img/favorite.png" alt="favorite icon" />
                Favorite
            </button>
            <button class="button are-small" id='${movie.imdbID}UpNext'>
                <img src="./assets/img/bookmark.png" alt="bookmark icon" />    
                UpNext
            </button>
            <button class="button are-small" id='${movie.imdbID}Watched'>
                <img src="./assets/img/watched.png" alt="watched icon" />
                Watched
            </button>
        </div>
      `;

      modalContent.appendChild(movieElement);

      // adds even listener to favorite button

      const favoriteButton = document.getElementById(`${movie.imdbID}Favorite`);
      favoriteButton.addEventListener('click', function () {
        addToFavorites(movie);
      });

      // adds event listener to up-next button

      const upNextButton = document.getElementById(`${movie.imdbID}UpNext`);
      upNextButton.addEventListener('click', function () {
        addToUpNext(movie);
      });

      // adds event listener to watched button

      const watchedButton = document.getElementById(`${movie.imdbID}Watched`);
      watchedButton.addEventListener('click', function () {
        addToWatched(movie);
      });
    }
  } else {
    fetch('https://api.chucknorris.io/jokes/random')
      .then((response) => response.json())
      .then((data) => {
        const modalContent = document.getElementById('search-results');
        const noResultEl = document.createElement('p');
        noResultEl.textContent = `No results were found for your search, but here is a Chuck Norris joke instead: ${data.value}`;
        modalContent.appendChild(noResultEl);
      });
  }
}

// modal functionality

document.addEventListener('DOMContentLoaded', () => {
  const chuckNorrisDialog = document.getElementById('chuckNorrisDialog');
  const jokeDisplay = document.getElementById('jokeDisplay');

  // Konami code, duh
  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
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
      .then((response) => response.json())
      .then((data) => {
        jokeDisplay.textContent = data.value;
        openDialog();
      })
      .catch((error) => {
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

// The next three are kind of redundant, but couldn't make it work as only one function
function updateUpNextSection(movie) {
  // We're targetting the up-next-container and adding our movie to it
  const sectionContainer = document.querySelector(
    '#up-next-section .up-next-container .columns'
  );
  const movieElement = document.createElement('li');
  // Creating elements and using bulma for styling for now.
  movieElement.classList.add('column', 'is-half', `movie-${movie.imdbID}`);
  movieElement.innerHTML = `    
    <div class="card">
                <div class="card-content movie-card1">
                  <div class="columns flex-wrap">
                    <div class="column is-one-quarter">
                      <img
                        src='${movie.Poster}'
                        class="upnext-image"
                        alt="${movie.Title}"
                      />
                    </div>
                    <div class="column">
                      <p class="title is-5">${movie.Title}</p>
                      <div class="description">
                        Here is the description of the movie. This is a
                        kick-arse movie that does cool tricks, but not as cool
                        as Chuck Norris. Now if we were to be as good as Chuck
                        Norris, we would implode immediately and cease to exist.
                        No one can be as good as him.
                      </div>
                    </div>
                  </div>
                  <div class="is-full">
                    <h4 class="streaming-list-header">
                      Stream on these platforms
                    </h4>
                    <ul class="streaming-list" id="streamingList">
                      <li><a target="_blank" href="#">Apple TV</a></li>
                      <li><a target="_blank" href="#">Hulu</a></li>
                    </ul>
                  </div>
                </div>
                <footer class="card-footer">
                  <button class="card-footer-item" id="favorite">
                    <img
                      src="./assets/img/favorite.png"
                      alt="favorite icon"
                    />
                    Favorite
                  </button>
                  <button class="card-footer-item" id="watched">
                    <img
                      src="./assets/img/watched.png"
                      alt="watched icon"
                      class="icon-fixed-size"
                    />
                    Watched
                  </button>
                  <button class="card-footer-item" id="remove">
                    <img
                      src="./assets/img/delete.png"
                      alt="remove icon"
                      class="icon-fixed-size"
                    />
                    Remove
                  </button>
                </footer>
              </div>
  `;
  sectionContainer.appendChild(movieElement);

  // Adding event listeners to buttons
  movieElement
    .querySelector('.favorite-button')
    .addEventListener('click', function () {
      addToFavorites(movie);
    });

  /* I thought the watched button deserved special funcitonality inside Up Next, logically it
    should funciton as both a watched button and a removed button, so that's what it does.
  */
  movieElement
    .querySelector('.watched-button')
    .addEventListener('click', function () {
      // Checks if the movie is already in the watched list
      let isWatched = watched.some((m) => m.imdbID === movie.imdbID);

      // If the movie is not in the watched list, add it
      if (!isWatched) {
        addToWatched(movie);
      }

      // Remove the movie from the up next list
      removeFromUpNext(movie);
    });

  movieElement
    .querySelector('.remove-button')
    .addEventListener('click', function () {
      removeFromUpNext(movie);
    });
}

function updateFavoritesSection(movie) {
  // Same thing here, we're targetting favorites and adding a new li with our movies
  const sectionContainer = document.querySelector('#favorites .card-list');
  const movieElement = document.createElement('li');
  movieElement.classList.add('card', 'favorite-card', `movie-${movie.imdbID}`);
  movieElement.innerHTML = `    
    <div class="card-content card-content-override">
        <div class="columns is-justify-content-space-between">
        <div class="column">                          
            <p class="title is-5">${movie.Title}</p>
        </div>
        <div class="column has-text-right is-one-quarter">
            <button id="favorite">
            <img
                src="./assets/img/bookmark.png"
                alt="upnext icon"
                class="icon-fixed-size"
            />
            </button>
            <button id="watched">
            <img
                src="./assets/img/watched.png"
                alt="watched icon"
                class="icon-fixed-size"
            />
            </button>
            <button id="remove">
            <img
                src="./assets/img/delete.png"
                alt="remove icon"
                class="icon-fixed-size"
            />
            </button>
        </div>
        </div>
    </div>
  `;
  sectionContainer.appendChild(movieElement);

  // Same deal, adding event listeners to the buttons
  movieElement
    .querySelector('.up-next-button')
    .addEventListener('click', function () {
      addToUpNext(movie);
    });

  movieElement
    .querySelector('.watched-button')
    .addEventListener('click', function () {
      addToWatched(movie);
    });

  movieElement
    .querySelector('.remove-button')
    .addEventListener('click', function () {
      removeFromFavorites(movie);
    });
}

function updateWatchHistorySection(movie) {
  // Same as last two, but for watch history
  const sectionContainer = document.querySelector('#watch-history .card-list');
  const movieElement = document.createElement('li');
  movieElement.classList.add('card', 'history-card', `movie-${movie.imdbID}`);
  movieElement.innerHTML = `
    <div class="card-content">
      <figure class="image">
        <img src="${movie.Poster}" alt="${movie.Title}">
      </figure>
      <p class="title is-5">${movie.Title}</p>
      <button class="button are-small favorite-button">
        <img src="./assets/img/favorite.png" alt="favorite icon" />
        Favorite
      </button>
      <button class="button are-small up-next-button">
        <img src="./assets/img/bookmark.png" alt="bookmark icon" />    
        UpNext
      </button>
      <button class="button are-small remove-button">
        <img src="./assets/img/delete.png" alt="remove icon" />
        Remove
      </button>
    </div>
  `;
  sectionContainer.appendChild(movieElement);

  // Add event listeners for buttons
  movieElement
    .querySelector('.favorite-button')
    .addEventListener('click', function () {
      addToFavorites(movie);
    });

  movieElement
    .querySelector('.up-next-button')
    .addEventListener('click', function () {
      addToUpNext(movie);
    });

  movieElement
    .querySelector('.remove-button')
    .addEventListener('click', function () {
      removeFromWatched(movie);
    });
}

// Functionality for remove button for Upnext
function removeFromUpNext(movie) {
  upNext = upNext.filter(function (m) {
    return m.imdbID !== movie.imdbID;
  });
  localStorage.setItem('upNext', JSON.stringify(upNext));

  // Remove the movie element from the UI
  const sectionContainer = document.querySelector(
    '#up-next-section .up-next-container .columns'
  );
  const movieElement = sectionContainer.querySelector('.movie-' + movie.imdbID);
  sectionContainer.removeChild(movieElement);
}

// Remove button functionality for favs
function removeFromFavorites(movie) {
  favorites = favorites.filter(function (m) {
    return m.imdbID !== movie.imdbID;
  });
  localStorage.setItem('favorites', JSON.stringify(favorites));

  const sectionContainer = document.querySelector('#favorites .card-list');
  const movieElement = sectionContainer.querySelector('.movie-' + movie.imdbID);
  sectionContainer.removeChild(movieElement);
}

// Remove button for watched
function removeFromWatched(movie) {
  watched = watched.filter(function (m) {
    return m.imdbID !== movie.imdbID;
  });
  localStorage.setItem('watched', JSON.stringify(watched));

  const sectionContainer = document.querySelector('#watch-history .card-list');
  const movieElement = sectionContainer.querySelector('.movie-' + movie.imdbID);
  sectionContainer.removeChild(movieElement);
}
