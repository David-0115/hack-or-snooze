"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let storyObj = { stories: [] };

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}"><span class="star">
      <small class="favorite off"><i class="far fa-star"></i></small></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="author">
        <small class="story-author">by ${story.author}</small>
        </div>
        <div class="posted">
        <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
  markFavorites();

}

function newStoryCreate(evt) {
  evt.preventDefault();
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();
  const addStory = {
    "token": `${currentUser.loginToken}`,
    "story": {
      "author": author,
      "title": title,
      "url": url
    }
  }
  $storyForm.trigger("reset").hide();
  submitNewStory(addStory);
}

async function submitNewStory(addStory) {
  const postStory = await axios.post(`${BASE_URL}/stories`, addStory);
  const newStory = new Story(postStory.data.story);
  storyList.addStory(currentUser, newStory);
  currentUser.ownStories.unshift(newStory);

}

$storyForm.on("submit", newStoryCreate);

async function manageFavorites(e) {
  let t = e.target;
  const storyId = e.target.closest("li").getAttribute('id');
  const user = currentUser.username;
  let url = (`${BASE_URL}/users/${user}/favorites/${storyId}`)
  if (t.classList[0] == "far" || t.classList[1] == "far") {
    t.classList.replace("far", "fas");
    await axios({
      url: url,
      method: "POST",
      data: { token: currentUser.loginToken }
    });
    const favStory = await axios.get(`${BASE_URL}/stories/${storyId}`)
    currentUser.favorites.unshift(new Story(favStory.data.story));
  } else if (t.classList[0] == "fas" || t.classList[1] == "fas") {
    t.classList.replace("fas", "far");
    await axios({
      url: url,
      method: "DELETE",
      data: { token: currentUser.loginToken }
    });
    currentUser.favorites.forEach((obj, idx) => { if (obj.storyId == storyId) { currentUser.favorites.splice(idx, 1) } });
  }
  if (showFav) {
    showFavorites();
  }
}

function markFavorites() {
  const li = $("li")
  if (currentUser !== undefined) {
    for (let h = 0; h < li.length; h++) {
      for (let j = 0; j < currentUser.favorites.length; j++) {
        if (currentUser.favorites[j].storyId == li[h].id) {
          $(`#${li[h].id} i `).removeClass("far").addClass("fas");
        }
      }
    }
  }
}

$(document).on("click", ".star", manageFavorites)

async function removeStory(e) {
  const storyId = e.target.closest("li").getAttribute('id');
  let url = (`${BASE_URL}/stories/${storyId}`)
  await axios({
    url: url,
    method: "DELETE",
    data: { token: currentUser.loginToken }
  });
  currentUser.ownStories.forEach((obj, idx) => { if (obj.storyId == storyId) { currentUser.ownStories.splice(idx, 1) } });
  if (showOwnStories) {
    showMyStories();
  }
}

$(document).on("click", ".trash", removeStory)

async function editStory(e) {

  const storyId = e.target.closest("li").getAttribute('id');
  let storyObj;
  const findStory = currentUser.ownStories.forEach((val) => (storyId == val.storyId) ? storyObj = val : false);
  // await removeStory(e);  -- Need to fix this. 
  $storyForm.show();
  $('#author').val(`${storyObj.author}`);
  $('#title').val(`${storyObj.title}`);
  $('#url').val(`${storyObj.url}`);



}

$(document).on("click", ".edit", editStory)

let height = 100;
async function loadMoreStories() {
  const newStories = await StoryList.getStories();
  newStories.stories.forEach((val) => { storyList.stories.push(val) });
  console.log(storyList);
  putStoriesOnPage();
  height += 200;
  $(".stories-container").height(`${height}vh`);
}


window.addEventListener("scroll", () => {
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
    loadMoreStories();
  }
});


