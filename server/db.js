const spicedPg = require("spiced-pg");
// const { dbUserName, dbPassword} = require("./secrets.json");
const database = "finalgame";

// const db = spicedPg(
//     process.env.DATABASE_URL ||
//     `postgres:${dbUserName}:${dbPassword}@localhost:5432/${database}`
// );

let db;
if(process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    // we are running our app locally
    const { dbUserName, dbPassword} = require("./secrets.json");
    // console.log("dbUserName, dbPassword",dbUserName, dbPassword);
    db = spicedPg(
        `postgres:${dbUserName}:${dbPassword}@localhost:5432/${database}`
    );
}

console.log(`db connecting to: ${database}`);

module.exports.register = (firstName, lastName, email, hashedPw, image) => {
    const q = `INSERT INTO users (first, last, email, password, image) VALUES ($1, $2, $3, $4, $5) 
                RETURNING id`;
    const params = [firstName, lastName, email, hashedPw, `https://s3.amazonaws.com/spicedling/${image}`];
    return db.query(q, params);  
};

module.exports.getRegisterId = (email) => {
    const q = `SELECT id, first, last, image FROM users WHERE email=$1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.getHashedPw = (email) => {
    const q = `SELECT password FROM users WHERE email=$1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.getSecretCode = (email, code) => {
    const q = `INSERT INTO secretcodes (email, code) VALUES ($1, $2) 
    RETURNING code`;
    const params = [email, code];
    return db.query(q, params);
};

module.exports.checkSecretCode = (email) => {
    const q = `SELECT code FROM secretcodes 
            WHERE CURRENT_TIMESTAMP - created_at < INTERVAL '10 minutes' 
            AND  email=$1
            ORDER BY id DESC LIMIT 1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.changePassword = (email, password) => {
    const q = `UPDATE users SET password=$2 WHERE email=$1`;
    const params = [email, password];
    return db.query(q, params);  
};

module.exports.getUserData = (id) => {
    const q = `SELECT id,first,last,image  FROM users WHERE id=$1`;
    const params = [id];
    return db.query(q, params);  
};

module.exports.postProfileImage = (req) => {  
    const q = `UPDATE users SET image=$1 WHERE id=$2 RETURNING image`;
    const params = [`https://s3.amazonaws.com/spicedling/${req.file.filename}`, req.session.userId];
    return db.query(q, params);  
};

module.exports.getBio = (id) => {
    const q = `SELECT bio  FROM users WHERE id=$1`;
    const params = [id];
    return db.query(q, params);  
};

module.exports.postBio = (req) => {  
    const q = `UPDATE users SET bio=$1 WHERE id=$2 RETURNING bio`;
    const params = [req.body.draftBio, req.session.userId];
    return db.query(q, params);  
};

module.exports.getSearch = (search) => {
    const q = `SELECT id,first,last,image,bio FROM users 
                WHERE first ILIKE $1 OR last ILIKE $1`;
    const params = [search + '%'];
    return db.query(q, params);  
};

module.exports.getLatest3 = () => {
    const q = `SELECT id,first,last,image,bio FROM users 
            ORDER BY id DESC LIMIT 3`;
    return db.query(q);  
};

module.exports.getFriendshipStatus = (otherUser, loggedUser) => {
    const q = `SELECT * FROM friendships
            WHERE (recipient_id = $1 AND sender_id = $2)
            OR (recipient_id = $2 AND sender_id = $1);`;
    const params = [otherUser, loggedUser];
    return db.query(q, params);  
};

module.exports.postFriendshipStatus1 = (sender,recipient, accepted) => {
    const q = `INSERT INTO friendships (sender_id, recipient_id, accepted)
    VALUES($1,$2,$3) 
    `;
    const params = [sender,recipient, accepted];
    return db.query(q, params);  
};

module.exports.postFriendshipStatus2 = (sender,recipient, accepted) => {
    const q = `UPDATE friendships SET accepted = $3 WHERE sender_id  = $1 AND recipient_id = $2`;
    const params = [sender,recipient, accepted];
    return db.query(q, params);  
};

module.exports.deleteFriendshipStatus = (sender,recipient) => {
    const q = `DELETE FROM  friendships
    WHERE sender_id  = $1`;
    const params = [sender];
    return db.query(q, params);  
};

module.exports.getFriends = (loggedUser) => {
    const q = `SELECT users.id, first, last, image, accepted
            FROM friendships
            JOIN users
            ON (accepted = false AND recipient_id = $1 AND sender_id = users.id)
            OR (accepted = true AND recipient_id = $1 AND sender_id = users.id)
            OR (accepted = true AND sender_id = $1 AND recipient_id = users.id)`;
    const params = [loggedUser];
    return db.query(q, params);  
};

// module.exports.addFriend = (sender,recipient, accepted) => {
//     const q = `UPDATE friendships SET accepted = $3 WHERE sender_id  = $1 AND recipient_id = $2`;
//     const params = [sender, recipient,accepted];
//     return db.query(q, params);  
// };

module.exports.deleteFriend = (sender,recipient) => {
    const q = `DELETE FROM  friendships
    WHERE (sender_id  = $1 AND recipient_id = $2)
    OR (sender_id  = $2 AND recipient_id = $1)`;
    const params = [sender, recipient];
    return db.query(q, params);  
};

module.exports.getLastTenMsgs = () => {
    const q = `SELECT users.first, users.last, users.image, 
        messages.sender_id, messages.message, messages.created_at 
        FROM messages 
        JOIN users 
        ON (sender_id=users.id)
        ORDER BY messages.created_at DESC LIMIT 10`;
    return db.query(q);  
};

module.exports.postNewMsg = (newMsg, userId) => {
    const q = `INSERT INTO messages (sender_id, message) VALUES($2,$1)`;
    const params = [newMsg, userId];
    return db.query(q, params);  
};

module.exports.getLastMsg = () => {
    const q = `SELECT users.first, users.last, users.image, 
        messages.sender_id, messages.message, messages.created_at 
        FROM messages 
        JOIN users 
        ON (sender_id=users.id)
        ORDER BY messages.created_at DESC LIMIT 1`;
    return db.query(q);  
};

module.exports.getUsersOnline = (allUsersUnique) => {
    const q = `SELECT id,first,last,image  FROM users WHERE id= ANY($1)
                ORDER BY id ASC`;
    const params = [allUsersUnique];
    return db.query(q, params);  
};

// module.exports.getLastTenMsgsPrivate = (otherId, userId) => {
//     const q = `SELECT users.first, users.last, users.image, 
//         messages.sender_id, messages.message, messages.created_at 
//         FROM privatemessages
        
//         JOIN users 
//         ON (sender_id=users.id)
//         ORDER BY messages.created_at DESC LIMIT 10`;
//     const params = [otherId, userId];
//     return db.query(q, params);  
// };