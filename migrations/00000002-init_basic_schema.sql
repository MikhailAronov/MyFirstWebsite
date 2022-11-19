CREATE TABLE profiles (
  id SERIAL,
  cookieId UUID UNIQUE PRIMARY KEY, 
  login VARCHAR(50),
  email VARCHAR(50),
  password VARCHAR(100),
  profpicext VARCHAR(15)
);
CREATE TABLE friendship (
  id SERIAL PRIMARY KEY,
  sourceId UUID,
  targetId UUID,
  status VARCHAR(20),
  createdAt VARCHAR(100),
  updatedAt VARCHAR(100)
);
CREATE TABLE publicchat (
  id SERIAL PRIMARY KEY,
  creator UUID,
  message VARCHAR (2000),
  createdAt VARCHAR(100),
  updatedAt VARCHAR(100)
);
CREATE TABLE privatechat (
  id SERIAL PRIMARY KEY,
  creator UUID,
  receiver UUID,
  message VARCHAR (5000),
  createdAt VARCHAR(100),
  updatedAt VARCHAR(100)
);
CREATE TABLE keys (
  id SERIAL PRIMARY KEY,
  cookieId UUID UNIQUE,
  accesssecret VARCHAR (100),
  refreshsecret VARCHAR (100)
);