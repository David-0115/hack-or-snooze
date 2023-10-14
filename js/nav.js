"use strict";
let showFav = false;
let showOwnStories = false;
/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

function navSubmit() {
  showFav = false;
  $storyForm.show();
}

$navSubmit.on("click", navSubmit);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function showFavorites() {
  showFav = true;
  showOwnStories = false;
  $storyForm.hide();
  $("#profile").hide();
  storyObj = { stories: [] };
  currentUser.favorites.forEach((val) => storyObj.stories.push(val))
  storyList.stories = storyObj.stories;
  putStoriesOnPage();
}

$navFav.on("click", showFavorites)

function showMyStories() {
  const can = $("<span>").addClass("trash").html('<i class="fas fa-trash-alt"></i>')
  const edit = $("<span>").addClass("edit").html('<i class="fas fa-edit"></i>')
  showFav = false;
  showOwnStories = true;
  $storyForm.hide();
  $("#profile").hide();
  storyObj = { stories: [] };
  currentUser.ownStories.forEach((val) => storyObj.stories.push(val));
  storyList.stories = storyObj.stories;
  putStoriesOnPage();
  $("li").prepend(edit);
  $("li").prepend(can);


}

$myStories.on("click", showMyStories)

function returnHome() {
  showOwnStories = false;
  showFav = false;
  $storyForm.hide();
  $("#profile").hide();
  getAndShowStoriesOnStart();

}
$hackSnooze.on("click", returnHome)

function showProfile() {
  $allStoriesList.hide();
  showFav = false;
  showOwnStories = true;
  $storyForm.hide();
  $("#profile").show();
  $("#name").text(`Name: ${currentUser.name}`);
  $("#user-name").text(`Username: ${currentUser.username}`);
  $("#account-created").text(`Account Created: ${currentUser.createdAt}`);


}

$navUserProfile.on("click", showProfile)