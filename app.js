// npm i express cors dotenv express-session passport  passport-github2
// axios passport-google-oauth20  ejs


import express from 'express'
import path from 'path'
import cors from 'cors'
import passport from 'passport'
import  session from 'express-session'
import {Strategy as  GithubStrategy} from 'passport-github2'
import  {Strategy as  GoogleStrategy} from 'passport-google-oauth20'
import axios from 'axios'
import ejs from 'ejs'
import dotenv from 'dotenv'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

const CHANNEL_ID=process.env.CHANNEL_ID

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));


// passport js strategy for authenticating with google for youtube channel subscription check
passport.use(new GoogleStrategy({
    clientID:  process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['https://www.googleapis.com/auth/youtube.readonly']
}, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
}));

// passport js strategy for authenticating with github 
passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret:  process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL_GITHUB,
    },
    (accessToken, refreshToken, profile, done) => {
        profile.accessToken = accessToken;
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('login.ejs')
});
// Routes or api endpoints for Google Login

app.get('/auth/google', passport.authenticate('google', { scope: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
    const { accessToken } = req.user;
    req.session.googleaccessToken = accessToken;
    
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        console.log('YouTube API response:', response.data);

        // Check if user is subscribed to your specific channel
        const isSubscribed = response.data.items.some(subscription => 
            subscription.snippet.resourceId.channelId === CHANNEL_ID
        );
        
        console.log('Subscription check:', isSubscribed);

        // If subscribed, redirect to success page, otherwise redirect to failure page
        if (isSubscribed) {
            res.redirect('/login/success'); // Redirect to the success route
        } else {
            res.redirect('/youtube/verification/failed'); // Redirect to failure route
        }
    } catch (error) {
   console.error('Error with YouTube API:',error.response ? error.response.data : error.message  );
   
        res.redirect('/youtube/verification/failed');
    }
});



async function ensureSubscribed(req, res, next) {
    if (req.isAuthenticated() && req.session.googleaccessToken) {
        const accessToken = req.session.googleaccessToken;
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&forChannelId=${CHANNEL_ID}&mine=true`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const isSubscribed = response.data.items.length > 0;

            req.session.isSubscribed = isSubscribed;

            if(isSubscribed) {
                return next(); 
            }else {
                res.redirect('/youtube/verification/failed');
            }
        } catch (error) {
            console.error('Error:', error);
            res.redirect('/youtube/verification/failed');
        }
    }   else {
        return res.redirect('/');
    }
}

app.get('/youtube/verification/failed', (req, res) => {
    if(req.isAuthenticated()) {
        res.render("YtVerificationFailed.ejs")
    }else {
        res.redirect('/');
    }
});

//Routes or api endpoints for Github

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));


app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/' }),
    async (req, res) => {
        const accessToken = req.user.accessToken; // Extract access token from user object

        try {
            const response = await axios.get('https://api.github.com/user/following/bytemait', {
                headers: {
                    Authorization:`token ${accessToken}`,// Use the GitHub OAuth token for authentication                  Authorization: `token ${accessToken}`, 
                    'Accept': 'application/vnd.github+json', // Optional, for versioning the API
                }
            });

            // If the response status is 204, it means the user follows the target
            if (response.status === 204) {
                res.render('LoginSuccess.ejs');
            } else {
                res.redirect('/github/verification/failed');
            }
        } catch (error) {
            // If the user does not follow or there is any error, redirect to failure
            if (error.response && error.response.status === 404) {
                console.log('User is not following the account.');
                res.redirect('/github/verification/failed');
            } else {
                console.error('Error checking GitHub follow status:', error);
                res.redirect('/github/verification/failed');
            }
        }
    }
);



app.get('/github/verification/failed', (req, res) => {
    if(req.isAuthenticated()) {
        res.render('GithubVerification.ejs')
    }else {
        res.redirect('/');
    }
});

app.get('/login/success', ensureSubscribed, (req, res) => {
    res.render('LoginSuccess.ejs')
});

app.get('*', (req, res) => {
    res.redirect('/'); // Redirect to the homepage if user any url which does not exists
});


app.listen(PORT, () => {
    console.log("app is listening on port");
});