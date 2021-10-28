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
    getUsersOnline,
    initializScore, updateScore, getScores, getTwoQuestions } = require('./middleware');

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

app.post("/zeroScores", initializScore);


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
let vote1Sum = 0;
let vote2Sum = 0;
let roundFinish = false;

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

    socket.on("next step", async (currentRoundStep,victim) => {
        if(userId == victim.id && currentRoundStep == 0) {
            let msg = `Do you choose Truth or Dare?, ${victim.first}`;
            let userId = 1;
            const getNewMsg = await postNewMsg(msg, userId);
            io.sockets.emit('chatbot msg', getNewMsg);
        }
        
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
    socket.on("my new chat message", async (newMsg, currentRoundStep, currentVictim, activePlayer, onlines) => {
        if(userId == currentVictim.id && currentRoundStep == 0) {
            let getNewMsg = await postNewMsg(newMsg, userId);
            io.sockets.emit('addChatMsg', getNewMsg);
            // check the player chose truth or dare
            // then grab 2 random questions from database to show

            // generate 2 different random numbers
            let num1 = Math.floor(Math.random() * 10);
            let num2;
            do {
                num2 = Math.floor(Math.random() * 10);
            } while(num2 === num1);

            if(newMsg.toLowerCase() == 'truth') {
                // get 2 Questions from the truths db
                const dbQuestions = await getTwoQuestions('truths',num1,num2);
                // console.log("dbQuestions",dbQuestions);
                let chatbotMsg = `${dbQuestions[0].truth} (vote1) or ${dbQuestions[1].truth} (vote2)`;
                let getNewMsg = await postNewMsg(chatbotMsg, 1);
                io.sockets.emit('chatbot msg', getNewMsg);
                chatbotMsg = `All players except ${currentVictim.first} write now vote1 or vote2`;
                getNewMsg = await postNewMsg(chatbotMsg, 1);
                io.sockets.emit('chatbot msg', getNewMsg);
                io.sockets.emit('upgrade the gameround step');
            } else if(newMsg.toLowerCase() == 'dare') {
                // get 2 Questions from the dares db
                const dbQuestions = await getTwoQuestions('dares',num1,num2);
                // console.log("dbQuestions",dbQuestions);
                let chatbotMsg = `${dbQuestions[0].dare} (vote1) or ${dbQuestions[1].dare} (vote2)`;
                let getNewMsg = await postNewMsg(chatbotMsg, 1);
                io.sockets.emit('chatbot msg', getNewMsg);
                chatbotMsg = `All players except ${currentVictim.first} write now vote1 or vote2`;
                getNewMsg = await postNewMsg(chatbotMsg, 1);
                io.sockets.emit('chatbot msg', getNewMsg);
                io.sockets.emit('upgrade the gameround step');
            } else {
                // repeate the question if no valid answer given
                let chatbotMsg = `Do you choose Truth or Dare?, ${currentVictim.first}`;
                let getNewMsg = await postNewMsg(chatbotMsg, 1);
                io.sockets.emit('chatbot msg', getNewMsg);
            }
            
        }

        if(userId != currentVictim.id && currentRoundStep == 1) {
            // add the other players votes in the chat box
            let getNewMsg = await postNewMsg(newMsg, userId);
            io.sockets.emit('addChatMsg', getNewMsg);
            // collecting votes
            if(newMsg == 'vote1') {
                vote1Sum++;
            } else if(newMsg == 'vote2') {
                vote2Sum++;
            }
            
            if((vote1Sum==2 && vote2Sum==1) || vote1Sum==3) {
                let chatbotMsg = `vote1 was chosen, waiting ${currentVictim.first} to write (done) after the task is completed`;
                let getNewMsg = await postNewMsg(chatbotMsg, 1);
                io.sockets.emit('chatbot msg', getNewMsg);
                io.sockets.emit('upgrade the gameround step');
            } else if((vote2Sum==2 && vote1Sum==1)  || vote2Sum==3) {
                let chatbotMsg = `vote2 was chosen, waiting ${currentVictim.first} to write (done) after the task is completed`;
                let getNewMsg = await postNewMsg(chatbotMsg, 1);
                io.sockets.emit('chatbot msg', getNewMsg);
                io.sockets.emit('upgrade the gameround step');
            }
        }

        if(userId == currentVictim.id && currentRoundStep == 2) {
            // add msg to chat box
            let getNewMsg = await postNewMsg(newMsg, userId);
            io.sockets.emit('addChatMsg', getNewMsg);
            // ask the active player to confirm
            let chatbotMsg = `Did ${currentVictim.first} pass or fail?, ${activePlayer.first}`;
            getNewMsg = await postNewMsg(chatbotMsg, 1);
            io.sockets.emit('chatbot msg', getNewMsg);
            io.sockets.emit('upgrade the gameround step');
        }


        if(userId == activePlayer.id && currentRoundStep == 3) {
            // add the other players votes in the chat box
            let getNewMsg = await postNewMsg(newMsg, userId);
            io.sockets.emit('addChatMsg', getNewMsg);

            let chatbotMsg = `Write (score) to see the latest scores`;
            getNewMsg = await postNewMsg(chatbotMsg, 1);
            io.sockets.emit('chatbot msg', getNewMsg);

            // update the score db
            if(newMsg == 'pass') {
                // add 1 point to the victim's score
                let scoreflag = await updateScore(currentVictim.id,1);
                console.log("scoreflag",scoreflag);
                io.sockets.emit('upgrade the gameround step');
                roundFinish = true;
            } else if(newMsg == 'fail') {
                // add -1 point to the victim's score
                let scoreflag = await updateScore(currentVictim.id,-1);
                console.log("scoreflag",scoreflag);
                io.sockets.emit('upgrade the gameround step');
                roundFinish = true;
            }

        }

        if(userId == activePlayer.id && currentRoundStep == 4) {
            let roundScore = await getScores(onlines);
            console.log('roundScore',roundScore);
            
            // score announce
            let chatbotMsg = `<${roundScore[0].first} : ${roundScore[0].points}> \n
                        <${roundScore[1].first} : ${roundScore[1].points}> \n
                        <${roundScore[2].first} : ${roundScore[2].points}> \n
                        <${roundScore[3].first} : ${roundScore[3].points}>`;
            let getNewMsg = await postNewMsg(chatbotMsg, 1);
            io.sockets.emit('chatbot msg', getNewMsg);
            io.sockets.emit('clear gameround step');

            // round finished
            chatbotMsg = `Round Finished. If you want start a new one, click NEW ROUND!`;
            getNewMsg = await postNewMsg(chatbotMsg, 1);
            io.sockets.emit('chatbot msg', getNewMsg);
            io.sockets.emit('clear gameround step');
    
            
            vote1Sum = 0;
            vote2Sum = 0;
        }
        
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
