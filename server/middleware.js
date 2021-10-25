const db = require("./db.js");
const bc = require("./bc");
const cryptoRandomString = require('crypto-random-string');
const { sendEmail } = require("./ses.js");


module.exports.postRegister = function (req, res, next) {
    console.log("req.body", req.body);
    console.log("req.file", req.file);
    const firstName = req.body.first;
    const lastName = req.body.last;
    const email = req.body.email;
    const password = req.body.password;
    const image = req.file.filename;

    bc.hash(password)
        .then((hashedPw) => {
            db.register(firstName, lastName, email, hashedPw, image)
                .then((userId) => {
                    console.log("one more user was added to users table in petition db");
                    // a new user who has just registered will be directed to sign the petition
                    res.json({ success: true});
                })
            // in case problem occured while writing to db >>>> show again the register page
                .catch((err) => {
                    console.log("err in db.register: ", err);
                    res.json({ success: false});
                });

        })
        .catch((err) => {
            console.log("err in bc.hash: ", err);
        
        });
};

module.exports.postLogin = function (req, res, next) {
    // console.log("req.body", req.body);
    const email = req.body.email;
    const password = req.body.password;

    db.getHashedPw(email)
        .then((hashedPw) => {
            bc.compare(password, hashedPw.rows[0].password)
                .then((match) => {
                    if(match) {
                        console.log("correct password");
                        db.getRegisterId(email)
                            .then((data) => {
                                // set a cookie to remember the logged in user
                                // console.log("data:",data.rows[0]);
                                req.session.userId = data.rows[0].id;
                                // redirect the user to his profile
                                res.json(data.rows[0]);
                            })
                            .catch((err) => {
                                console.log("db.getRegisterId: ", err);
                                res.json({ errMsg: "Error in Database"});
                            });

                    } else {
                        console.log("wrong password");
                        res.json({ errMsg: "Wrong Password!"});
                    }
            
                })
                .catch((err) => {
                    console.log("err in bc.compare: ", err);
                    res.json({ errMsg: "Error in Database"});
                });
        })
        .catch((err) => {
            console.log("err in db.getHashedPw: ", err);
            res.json({ errMsg: "Wrong Email!"});
        });
};

module.exports.postResetPassword = function (req, res, next) {
    // console.log("req.body", req.body);
    const email = req.body.email;

    db.getRegisterId(email)
        .then((data) => {
            // console.log("getRegisterId",data.rows);
            if(data.rows.length === 1) {
                //this email exists
                // console.log("data", data);
                // console.log("email", email);
                // generate a random code
                const secretCode = cryptoRandomString({
                    length: 6
                });
                // console.log("secretCode", secretCode);
                db.getSecretCode(email, secretCode)
                    .then((data) => {
                        // console.log("data", data.rows[0]);
                        const toAddress = 'summer.burglar@spicedling.email';
                        const subject = 'reset password';
                        const text = 'your security code will expire after 10 mins: '+ data.rows[0].code;
                    
                        sendEmail(toAddress, subject, text)
                            .promise()
                            .then(() => {
                                console.log("Email sent now");
                                res.json({ success: true});
                            })
                            .catch(err => console.log("error in sendEmail",err)
                            );

                    })
                    .catch((err) => {
                        console.log("err in db.generateSecretCode: ", err);
                        res.json({ errMsg: "Error in Database"});
                    });
            } else {
                // this email does not exist
                res.json({ errMsg: "Wrong Email"});
            }
        })
        .catch((err) => {
            console.log("err in db.emailExists: ", err);
        });

};

module.exports.postSavePassword = function (req, res, next) {
    const email = req.body.email;
    const code = req.body.code;
    const password = req.body.password;

    db.checkSecretCode(email)
        .then((data) => {
            // console.log("checkSecretCode",data.rows);
            if(data.rows[0].code === code) {
            //correct secret code was used
            // new password can be saved in database
                bc.hash(password)
                    .then((hashedPw) => {
                        db.changePassword(email, hashedPw)
                            .then(() => {
                                // password changed successfully
                                res.json({ success: true});
                            })
                            .catch((err) => {
                                console.log("err in db.changePassword: ", err);
                                res.json({ errMsg: "Error in Database"});
                            });

                    })
                    .catch((err) => {
                        console.log("err in bc.hash: ", err);
                        res.json({ errMsg: "Error in Database"});
                    });
            } else {
            // invalid secret code
                res.json({ errMsg: "Invalid secret code used!"});
            }
        })
        .catch((err) => {
            console.log("err in db.checkSecretCode: ", err);
            res.json({ errMsg: "Error in Database"});
        });

};

module.exports.getUser = function (req, res, next) {
    db.getUserData(req.session.userId)
        .then((data) => {
            // send back this user's data
            // console.log("data",data.rows);
            res.json(data.rows[0]);
        })
        .catch((err) => {
            console.log("err in db.getUserData: ", err);
            res.json({ errMsg: "Error in Database"});
        });
};

module.exports.getUsersOnline = function (allUsersUnique) {
    console.log("getUsersOnline", allUsersUnique);
    return db.getUsersOnline(allUsersUnique)
        .then((data) => {
            // send back this user's data
            // console.log("data",data.rows);
            return data.rows;
        })
        .catch((err) => {
            console.log("err in db.getUsersOnline: ", err);
        });
};

module.exports.postProfileImage = function (req, res, next) {
    db.postProfileImage(req)
        .then((data) => {
            // send back this user's data
            // console.log("data",data.rows);
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("err in db.postProfileImage: ", err);
            res.json({ errMsg: "Error in Database"});
        });
};

module.exports.getBio = function (req, res, next) {
    db.getBio(req.session.userId)
        .then((data) => {
            // send back this user's Bio
            console.log("data",data.rows);
            res.json(data.rows[0]);
        })
        .catch((err) => {
            console.log("err in db.getBio: ", err);
            res.json({ errMsg: "Error in Database"});
        });
};

module.exports.postBio = function (req, res, next) {
    db.postBio(req)
        .then((data) => {
            // send back this user's data
            // console.log("data",data.rows);
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("err in db.postBio: ", err);
            res.json({ errMsg: "Error in Database"});
        });
};

module.exports.getSearch = function (req, res, next) {
    // console.log("req.params.search", req.params.search);

    if(req.params.search=== 'latest3') {
        console.log("inside getLatest3...");
        db.getLatest3()
            .then((data) => {
            // send back this user's Bio
                // console.log("data",data.rows);
                res.json(data.rows);
            })
            .catch((err) => {
                console.log("err in db.getLatest3: ", err);
                res.json({ errMsg: "Error in Database"});
            });
    } else {
        console.log("inside getsearch...");
        db.getSearch(req.params.search)
            .then((data) => {
            // send back this user's Bio
            // console.log("data",data.rows);
                res.json(data.rows);
            })
            .catch((err) => {
                console.log("err in db.getSearch: ", err);
                res.json({ errMsg: "Error in Database"});
            });
    }
};

module.exports.getClickedUser = function (req, res, next) {
    if(req.params.id == req.session.userId) {
        res.json({errMsg: "sameprofile"});
    } else {
        db.getUserData(req.params.id)
            .then((data) => {
                // send back this user's data
                // console.log("data",data.rows);
                res.json(data.rows[0]);
            })
            .catch((err) => {
                console.log("err in db.getUserData: ", err);
                res.json({ errMsg: "Error in Database"});
            });
    }
};

module.exports.getFriendshipStatus = function (req, res, next) {
    console.log("getFriendshipStatus");

    const otherUser = req.params.other;
    const loggedUser = req.session.userId;
    
    db.getFriendshipStatus(otherUser, loggedUser)
        .then((data) => {
            // console.log("data",data.rows[0]);
            if(!data.rows[0]) {
                console.log("empty data");
                res.json({btnText: "Make Friend Request"});
            } else if(data.rows[0].accepted == true) {
                console.log("friendship already exists");
                res.json({btnText: "End Friendship"});
            } else if(data.rows[0].accepted == false && data.rows[0].sender_id == loggedUser) {
                console.log("logged in user already sent a friend request");
                res.json({btnText: "Cancel Friend Request"});
            } else if(data.rows[0].accepted == false && data.rows[0].sender_id == otherUser) {
                console.log("logged in user already received a friend request");
                res.json({btnText: "Accept Friend Request"});
            }
        })
        .catch((err) => {
            console.log("err in db.getUserData: ", err);
        });
};

module.exports.postFriendshipStatus = function (req, res, next) {
    console.log("getFriendshipStatus", req.body);

    const otherUser = req.params.other;
    const loggedUser = req.session.userId;
    const text = req.body.text;

    if(text == "Make Friend Request") {
        // then update db with Request sent (accepted = false) & (sender = logged user || other user)
        const requestSent = false;
        db.postFriendshipStatus1(loggedUser,otherUser, requestSent)
            .then((data) => {
                console.log("friendships table updated",data.rows[0]);
                res.json({btnText: "Cancel Friend Request"});

            })
            .catch((err) => {
                console.log("err in db.getUserData: ", err);
            });
    } else if(text == "Cancel Friend Request") {
        // then update db with no relationship (delete accepted row) & (sender = logged user)
        db.deleteFriendshipStatus(loggedUser,otherUser)
            .then((data) => {
                console.log("friendships table updated",data.rows[0]);
                res.json({btnText: "Make Friend Request"});

            })
            .catch((err) => {
                console.log("err in db.getUserData: ", err);
            });
    } else if(text == "Accept Friend Request") {
        // then update db with Request sent (accepted = true) & (receiver = logged user)
        const requestSent = true;
        db.postFriendshipStatus2(otherUser, loggedUser, requestSent)
            .then((data) => {
                console.log("friendships table updated",data.rows[0]);
                res.json({btnText: "End Friendship"});

            })
            .catch((err) => {
                console.log("err in db.getUserData: ", err);
            });
    } else if(text == "End Friendship") {
        // then update db with no relationship (delete accepted row) & (sender = logged user || other user)
        db.deleteFriendshipStatus(loggedUser,otherUser)
            .then((data) => {
                // console.log("friendships table updated",data.rows[0]);
                res.json({btnText: "Make Friend Request"});

            })
            .catch((err) => {
                console.log("err in db.getUserData: ", err);
            });
    }
};

module.exports.getFriends = function (req, res, next) {
    console.log("getFriends");

    const loggedUser = req.session.userId;
    
    db.getFriends(loggedUser)
        .then((data) => {
            // console.log("getFriends data",data.rows);
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("err in db.getFriends: ", err);
        });
};

module.exports.addFriend = function (req, res, next) {

    const otherUser = req.params.id;
    const loggedUser = req.session.userId;
    
    // then update db with Request sent (accepted = true) & (receiver = logged user)
    const requestSent = true;
    db.postFriendshipStatus2(otherUser, loggedUser, requestSent)
        .then((data) => {
            console.log("friendships table updated",data.rows[0]);
            res.json({success: true});

        })
        .catch((err) => {
            console.log("err in db.postFriendshipStatus2: ", err);
        });
};

module.exports.removeFriend = function (req, res, next) {
    

    const otherUser = req.params.id;
    const loggedUser = req.session.userId;
    console.log("server removing...",loggedUser,otherUser);
    // then update db with no relationship (delete accepted row) & (sender = logged user || other user)
    db.deleteFriend(loggedUser,otherUser)
        .then((data) => {
            console.log("friendships table updated",data.rows[0]);
            res.json({success: true});

        })
        .catch((err) => {
            console.log("err in db.deleteFriendshipStatus: ", err);
        });
};

module.exports.getLastTenMsgs = function () {
    
    return db.getLastTenMsgs()
        .then((data) => {
            // console.log("data",data.rows);
            return data.rows.reverse();
        })
        .catch((err) => {
            console.log("err in db.getLastTenMsgs: ", err);
        });
};

module.exports.postNewMsg = function (newMsg, userId) {
    
    return db.postNewMsg(newMsg, userId)
        .then(() => {
            return db.getLastMsg()
                .then((data) => {
                    // console.log("data",data.rows);
                    return data.rows[0];
                })
                .catch((err) => {
                    console.log("err in db.getLastMsg: ", err);
                });
        })
        .catch((err) => {
            console.log("err in db.postNewMsg: ", err);
        });
};

module.exports.getLogout = function (req, res, next) {
    req.session = null;
    res.redirect("/");
};

module.exports.getLastTenMsgsPrivate = function (otherId, userId) {
    
    return db.getLastTenMsgsPrivate(otherId, userId)
        .then((data) => {
            // console.log("data",data.rows);
            return data.rows.reverse();
        })
        .catch((err) => {
            console.log("err in db.getLastTenMsgs: ", err);
        });
};