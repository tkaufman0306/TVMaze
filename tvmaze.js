"use strict";


const MISSING_IMAGE_URL = "http://tinyurl.com/missing-tv";
const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $castArea = $("#cast-area");
const $searchForm = $("#search-form");
const $searchTerm = $("#search-query");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm($searchTerm) {
  let response = await axios.get(`https://api.tvmaze.com/search/shows?q=${$searchTerm}`);

  let shows = response.data.map(result => {
    let show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL,
    };
  });
  

  console.log(shows);
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    const $item = $(
        `<div data-show-id="${show.id}" class="Show col-md-6 col-lg-3 mb-4">
         <div class="card" data-show-id="${show.id}">
           <img class="card-img-top w-25 mr-3"
              src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             
             <button class="btn btn-secondary get-episodes">
      Episodes
      </button>
             <button class="btn btn-info get-cast">
      Cast
      </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($item);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $searchTerm.val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  $castArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));
  return episodes;
}
 
function populateEpisodes(episodes) { 
  const $episodeList = $('#episodes-list');
  $episodeList.empty();

  for (let episode of episodes) {
    let $item = $(
      `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
        </li>
        `);
    $episodeList.append($item);
  }
  $episodesArea.show();
}


async function getCastOfShow(id) {
  let response = await axios.get(`https://api.tvmaze.com/shows/${id}/cast`)
  let cast = response.data.map(person => ({
    id:  person.id,
    name: person.name,
  }));
  return cast;
}

async function populateCast(id) { 
  const cast = await getCastOfShow(id);
  const $castList = $('#cast-list');
  $castList.empty();

  for (let actor of cast) {
        let $item = $(`<li>${actor.name}</li>)`);
    $castList.append($item);
  }
  $castArea.show();
}

$("#shows-list").on("click", ".get-episodes", async function handleEpisodeClick(evt) {
  let showId = $(evt.target).closest(".Show").data("show-id");
  let episodes = await getEpisodesOfShow(showId);
  let cast = await getCastOfShow(showId);
  populateEpisodes(episodes);
  await populateCast(showId);
});

