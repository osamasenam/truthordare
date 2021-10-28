DROP TABLE IF EXISTS score;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS secretcodes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS truths;
DROP TABLE IF EXISTS dares;

CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      image VARCHAR ,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

CREATE TABLE secretcodes(
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code VARCHAR(255) NOT NULL ,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


CREATE TABLE messages(
id SERIAL PRIMARY KEY,
sender_id INT REFERENCES users(id) NOT NULL,
message VARCHAR NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE score(
id SERIAL PRIMARY KEY,
player_id INT REFERENCES users(id) NOT NULL UNIQUE,
points INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);


////////////////////////

CREATE TABLE truths(
id SERIAL PRIMARY KEY,
truth VARCHAR NOT NULL);

INSERT INTO truths (truth) VALUES('Which body part of yours are you most proud of?');
INSERT INTO truths (truth) VALUES('Pick one: money, fame or power.');
INSERT INTO truths (truth) VALUES('Spill the last secret someone told you.');
INSERT INTO truths (truth) VALUES('What is the craziest thing you’ve ever done while drunk?');
INSERT INTO truths (truth) VALUES('Which celebrity would you want to be, and why?');
INSERT INTO truths (truth) VALUES('What was the most embarrassing moment of your life?');
INSERT INTO truths (truth) VALUES('What is the one thing you would never do, not for all the money in the world?');
INSERT INTO truths (truth) VALUES('What is the biggest lie you ever told?');
INSERT INTO truths (truth) VALUES('Did you ever lie about why you were too late?');
INSERT INTO truths (truth) VALUES('Would you rather have a pet or a sibling?');


CREATE TABLE dares(
id SERIAL PRIMARY KEY,
dare VARCHAR NOT NULL);

INSERT INTO dares (dare) VALUES('I dare you to say the capital of Azerbaijan');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Belgium');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Cuba');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Denmark');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Egypt');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Ethiopia');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Finland');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Indonesia');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Japan');
INSERT INTO dares (dare) VALUES('I dare you to say the capital of Lebanon');
