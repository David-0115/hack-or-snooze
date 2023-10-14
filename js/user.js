"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.login(username, password);

    $loginForm.trigger("reset");

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch (e) {
    handleError(e);
  }

}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.signup(username, password, name);

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();

    $signupForm.trigger("reset");
  } catch (e) {
    handleError(e)
  }
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();
  $loginForm.hide();
  $signupForm.hide();

  updateNavOnLogin();
}

function handleError(e) {
  $('#alert-cont').show();
  $('#alert-title').text(`${e.response.data.error.title}`);
  $('#alert-msg').text(`${e.response.data.error.message}`);
}

function hideAlert(e) {
  $('#alert-cont').hide();
}
$("#alert-ok").on("click", hideAlert);

// function manageProfileForm() {
//   $("#profile-change-form").show();
// }

// async function changeProfile(evt) {
//   evt.preventDefault();
//   let newName = $("#name-chg").val();
//   let newPw = $("#pw-chg").val();
//   if (newName == '' && newPw == '') {
//     const error = { response: { data: { error: { title: "No Values Submitted.", message: "Please enter a name or password change then click submit." } } } };
//     handleError(error);
//   } else if (newName !== '' && newPw == '') {
//     changeName(newName);
//   } else if (newName == '' && newPw !== '') {
//     changePw(newPw);
//   } else {
//     changeName(newName);
//     changePw(newPw);
//   }
// }

// async function changeName(newName) {
//   // try {
//   await axios({
//     url: (`${BASE_URL}/users/username`),
//     method: "PATCH",
//     data: {
//       "token": `${currentUser.loginToken}`,
//       "user": { "name": `${newName}` }
//     }
//   })
//   // } catch (e) {
//   //   handleError(e);
//   // }
// }

// async function changePw(newPw) {
//   // try {
//   await axios({
//     url: (`${BASE_URL}/users/password`),
//     method: "PATCH",
//     data: {
//       token: currentUser.loginToken,
//       user: { "password": `${newPw}` }
//     }
//   })
//   // } catch (e) {
//   //   handleError(e);
//   // }
// }

// $("#profile-chg-btn").on("click", changeProfile)

// $('#manage').on("click", manageProfileForm);
