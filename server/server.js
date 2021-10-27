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
    getUsersOnline } = require('./middleware');

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

let allUsers = [1];
let allUsersUnique = [];
let roundsCounter = 0;
let activeIndex = 0;
let angle;
let maxId;

io.on('connection', async (socket) => {

    const userId = socket.request.session.userId;
    allUsers.push(userId);
    allUsersUnique = [...new Set(allUsers)];
    // console.log("allUsers:", allUsers);
    // console.log("allUsersUnique:", allUsersUnique);

    const UsersOnline = await getUsersOnline(allUsersUnique);
    // console.log("UsersOnline", UsersOnline);
    // emit to all the clients/sockets already connected 
    io.sockets.emit('online users', UsersOnline);

    let newGame = true;
    // start a game round once 4 online players exist
    // let playTurns = UsersOnline; // to be rotated each new round
    // playTurns.shift(); // remove the first chatbot element 
    // console.log("connection with UsersOnline",UsersOnline);
    let playTurns = UsersOnline.filter(user=> user.id!= 1);
    // console.log("connection with playTurns",playTurns);

    // emit to all players the start signal & the current active player
    if(newGame && playTurns.length == 4) {
        angle = 0;
        roundsCounter++;
        // console.log("new activeIndex", activeIndex);
        io.sockets.emit('start game', playTurns[activeIndex],angle);
        activeIndex = activeIndex>=3? 0 : activeIndex+1;
        // console.log("new game-UsersOnline", UsersOnline);
        // console.log("new game with playTurns",playTurns);
        // console.log("new game with active player",playTurns[0]);
        newGame = false;
    }
    // console.log("playTurns outside",playTurns);

    // To Be Done // then wait for a click event from this active player to do the bottle spinning
    // console.log("round number-connection:", roundsCounter);
    // console.log("after if playTurns",playTurns);

    // listen for the signal of starting a new round
    // to send the new active player whoes turn is now
    socket.on("new round", (users) => {
        angle = 0;
        // console.log("users",users);
        playTurns = users.filter(user=> user.id!= 1);
        roundsCounter++;
        // console.log("new round-UsersOnline", UsersOnline);
        // console.log("new round-round number:", roundsCounter);
        // console.log("new round playTurns", playTurns);
        // do the array rotation
        // let temp = playTurns.shift();
        // playTurns.push(temp);
        // console.log("after roation playTurns", playTurns);
        // console.log("new activeIndex", activeIndex);
        io.sockets.emit('start game', playTurns[activeIndex],angle);
        activeIndex = activeIndex>=3? 0 : activeIndex+1;
        
        // console.log("another round with active player",playTurns[0]);
    });

    socket.on("new spin", () => {
        angle = Math.floor(Math.random() * 360); // random start position each time the bottle spins
        maxId = Math.floor(Math.random() * (100 - 50 + 1) + 50); // random motion duration each time
        console.log("Random Angle,maxId",angle, maxId);
        io.sockets.emit('do the spin',angle,maxId);
        
    });

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

    socket.on('disconnect', async () => {
        console.log(`User with the ID ${socket.id} just disconnected`,socket.request.session.userId);
        const index = allUsers.indexOf(socket.request.session.userId);
        allUsers.splice(index, 1);
        console.log("allUsers:", allUsers);
        allUsersUnique = [...new Set(allUsers)];
        console.log("allUsersUnique:", allUsersUnique);
        
        // send an updated version for the currently online users
        const UsersOnline = await getUsersOnline(allUsersUnique);
        io.sockets.emit('online users', UsersOnline);

    });
});

server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
