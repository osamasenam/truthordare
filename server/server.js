const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const exp = require("constants");
const { uploader } = require("./upload");
const s3 = require("./s3");

const server = require('http').Server(app);
const io = require('socket.io')(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000"))
});

const cookieSession = require('cookie-session');
const cookieSessionMiddleware = cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 90
});

app.use(cookieSessionMiddleware);
io.use(function(socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

const { postRegister, postLogin, 
    postResetPassword, postSavePassword, 
    getUser, postProfileImage, 
    getBio, postBio,
    getSearch, getClickedUser,
    getFriendshipStatus, postFriendshipStatus,
    getFriends, addFriend, removeFriend,
    getLastTenMsgs, postNewMsg,
    getLogout,
    getLastTenMsgsPrivate,
    getUserOnline } = require('./middleware');

app.use(compression());

//we use this middleware to parse json requests coming in 
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "client", "public")));


// client wants to know if the user is registered/ logged in
app.get('/user/id.json', function (req, res) {
    res.json({
        // return the user id stored in the server cookie once logged in/registered
        userId: req.session.userId
    });
});

app.post("/registration.json", uploader.single('file'), s3.upload, postRegister);

app.post("/login", postLogin);

app.post("/ResetPassword", postResetPassword);

app.post("/SavePassword", postSavePassword);

app.get("/user.json", getUser);

app.get("/user/:id", getUserOnline);

// app.post('/Uploader', uploader.single('file'), s3.upload, postProfileImage);

// app.get("/getBio", getBio);

// app.post("/postBio", postBio);

// app.get("/find-people/:search", getSearch);

// app.get("/user/:id.json", getClickedUser);

// app.get("/getFriendship/:other", getFriendshipStatus);

// app.post("/getFriendship/:other", postFriendshipStatus);

// app.get("/friends", getFriends);
// app.post("/addFriend/:id", addFriend);
// app.post("/removeFriend/:id", removeFriend);

// // logout : clear cookies & redirect to /login page 
app.get("/logout", getLogout);


app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

let allUsers = [];
// let allUsersArr = [];

io.on('connection', async (socket) => {

    const userId = socket.request.session.userId;
    allUsers.push(userId);
    allUsers = [...new Set(allUsers)];
    console.log("allUsers:", allUsers);

    // emit to all the clients/sockets already connected 
    io.sockets.emit('online users', allUsers);

    // allUsers.forEach(async function fn(elem) {
    //     console.log("elem:", elem);
    //     const userOnline = await getUserOnline(elem);
    //     allUsersArr.push(userOnline);
    // });

    // console.log("allUsersArr:", allUsersArr);

    if (!userId) {
        return socket.disconnect(true);
    }

    console.log(`socket.request.session`, socket.request.session);
    console.log(`User with the ID ${socket.id} just connected`);

    // emit only 1 time to the newest client got connected 
    socket.emit('greeting', {
        message: 'Hello from the server!'
    });

    
    const lastTenMsgs = await getLastTenMsgs();
    // console.log("lastTenMsgs", lastTenMsgs);
    // emit to all the clients/sockets already connected 
    io.sockets.emit('mostRecentMsgs', lastTenMsgs);
        
    // listening to the new message sent by a client
    socket.on("my new chat message", async (newMsg) => {
        // console.log("This message is coming in from chat.js component: ",newMsg);
        // console.log(`user who sent the newMsg is ${userId}`);

        const getNewMsg = await postNewMsg(newMsg, userId);
        // console.log(`newMsg`,getNewMsg);

        // 1. do a db query to store the new chat message into the chat table!!
        // 2. also do a db query to get info about the user (first name, last name, img) - will probably need to be a JOIN
        // once you have your chat object, you'll want to EMIT it to EVERYONE so they can see it immediately.
        io.sockets.emit('addChatMsg', getNewMsg);
    });

    socket.on('disconnect', () => {
        console.log(`User with the ID ${socket.id} just disconnected`);
    });
});

server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
