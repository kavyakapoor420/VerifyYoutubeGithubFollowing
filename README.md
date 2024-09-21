## Installation

1. Clone this repository:
       git clone https://github.com/kavyakapoor420/VerifyYoutubeGithubFollowing.git

   cd VerifyYoutubeGithubFollowing

3.  Install dependencies:
     npm install
4. start application from terminal 
    node app.js or npm start or nodemon app.js


How It Works

1.  Google OAuth (YouTube Subscription Verification):

When users sign in with Google, they must also grant access to their YouTube account.

The app will check if they are subscribed to the BYTE YouTube channel ->the CHANNEL_ID environment variable.

If the user is subscribed, they are redirected to the success page.


2.  GitHub OAuth (Follow Verification):

When users sign in with GitHub, the app checks if they GitHub account (bytemait ).

If they are following the specified account, they are redirected to the success page.

3.  API Endpoints
  1.  Google Authentication:

      # /auth/google: Initiates the Google OAuth process.
      # /auth/google/callback: Handles the callback after Google authentication.
      # /login/success: Redirects the user to the success page after YouTube subscription verification.
4.  GitHub Authentication:

# /auth/github: Initiates the GitHub OAuth process.
# /auth/github/callback: Handles the callback after GitHub authentication.

5. Failure Routes:

# /youtube/verification/failed: Displays a failure page if the user is not subscribed to the YouTube channel.
# /github/verification/failed: Displays a failure page if the user is not following the specified GitHub account.
6. Templates
  1. login.ejs: Displays the login options for Google and GitHub.
 2. LoginSuccess.ejs: Success page if the user is authenticated and verified.
3. YtVerificationFailed.ejs: Failure page for YouTube subscription check.
4. GithubVerification.ejs: Failure page for GitHub follow check.
