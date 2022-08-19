// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");

const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

require("dotenv").config();
const authRouter = require("./auth");
const render = require("pug");
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const dbo = require("./db/conn");
const fs = require('fs');
const AWS = require('aws-sdk');
const S3Client = require("./libs/S3Client.js");
const s3Client = require('@aws-sdk/client-s3');
const fileUpload = require('express-fileupload');
const JSONfilter = require("node-json-filter");
const socketio = require('socket.io') 
//const Checkout = require('./checkout')
/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
var [ access0, 
        access1, 
        access2, 
        access3, 
        access4, 
        access5, 
        access6] = Array(7).fill(false);
var pakietNum;
var lessonNum;
/**
 * Session Configuration (New!)
 */
const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};
const bucketParams = {
  Bucket: process.env.BUCKET_NAME,
  Key: process.env.AWS_ACCESS_KEY,
};
if (app.get("env") === "production") {
// Serve secure cookies, requires HTTPS
    session.cookie.secure = true;
}

/**
 * Passport Configuration (New!)
 */
let userID;
const strategy = new Auth0Strategy(
{
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL
},
function(accessToken, refreshToken, extraParams, profile, done) {
  /**
   * Access tokens are used to authorize users to an API
   * (resource server)
   * accessToken is the token to call the Auth0 API
   * or a secured third-party API
   * extraParams.id_token has the JSON Web Token
   * profile has all the information from the user
   */
    var info = {
    "profile": profile,
    "accessToken": accessToken,
    "refreshToken": refreshToken,
    "extraParams": extraParams
  };
  let filter = new JSONfilter({"id":"$string"});
  let output = filter.apply(info.profile)
  userID = output.id; 
  return done(null, profile);
}
);
/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSession(session));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
    done(null, user);
  });
  
passport.deserializeUser((user, done) => {
    done(null, user);
});  

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.use("/", authRouter);
app.use(cors());
app.use(fileUpload());
app.use(express.json());       // to support JSON-encoded bodies
const io = socketio(8001,{
  cors: {
    origin: "http://localhost:8000",
    methods: ["GET", "POST"]
  }
});
const Message = require('./db/models/message');
const User = require('./db/models/user');
/* Routes Definitions
 */

const secured = (req, res, next) => {
  if (req.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

app.get("/", (req,res) => {
    res.render("index", { title: "Home" });
});

app.get("/user", secured, (req, res) => {
    const { _raw, _json, ...userProfile } = req.user;
    res.render("user", {
      title: "Profile",
      userProfile: userProfile,
      access0: access0,
      access1: access1,
      access2: access2,
      access3: access3,
      access4: access4,
      access5: access5,
      access6: access6
    });
});

app.get("/settings", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("settings", {
    title: "Ustawienia",
    userProfile: userProfile
  });
});

app.get("/checkout", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("checkout", {
    title: "Koszyk",
    userProfile: userProfile
  });
});

/*app.post('/checkout-process', function (req, res) {
  dbConn.then(function(db) {
      delete req.body._id; // for safety reasons
      db.collection('feedbacks').insertOne(req.body);
  });    
  res.send('Data received:\n' + JSON.stringify(req.body));
});*/


app.get("/pakiet1", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("pakiet_1", {
    title: "Pakiet 1",
    userProfile: userProfile,
    pakietnum: pakietNum,
    lessonnum: lessonNum,
  });
});

app.get("/pakiet2", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("pakiet_2", {
    title: "Pakiet 2",
    userProfile: userProfile,
    pakietnum: pakietNum,
    lessonnum: lessonNum,
  });
});

app.get("/pakiet3", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("pakiet_3", {
    title: "Pakiet 3",
    userProfile: userProfile,
    pakietnum: pakietNum,
    lessonnum: lessonNum,
  });
});

app.get("/pakiet4", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("pakiet_4", {
    title: "Pakiet 4",
    userProfile: userProfile,
    pakietnum: pakietNum,
    lessonnum: lessonNum,
  });
});

app.get("/pakiet5", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("pakiet_5", {
    title: "Pakiet 5",
    userProfile: userProfile,
    pakietnum: pakietNum,
    lessonnum: lessonNum,
  });
});

app.get("/pakiet6", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("pakiet_6", {
    title: "Pakiet 6",
    userProfile: userProfile,
    pakietnum: pakietNum,
    lessonnum: lessonNum,
  });
});

app.get("/pakiet7", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("pakiet_7", {
    title: "Pakiet 7",
    userProfile: userProfile,
    pakietnum: pakietNum,
    lessonnum: lessonNum,
  });
});

app.get("/upload-page", secured, (req, res) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("upload", {
    title: "Upload",
    userProfile: userProfile
  });
});

/*

*/
// Upload file to specified bucket.
const uploadFile = async (FileName) => {
  const file = './uploads/'+FileName; // Path to and name of object. For example '../myFiles/index.js'.
  const fileStream = fs.createReadStream(file);
  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    // Add the required 'Key' parameter using the 'path' module.
    Key: path.basename(file),
    // Add the required 'Body' parameter
    Body: fileStream,
  };
  try {
    const data = await S3Client.send(new s3Client.PutObjectCommand(uploadParams));
    console.log("Success", data);
    return data; // For unit test
  } catch (err) {
    console.log("Error", err);
  }
};
var pakietIdent
function pakiet(pakietNum, lessonNum){
  pakietIdent = pakietNum+'-'+lessonNum
  return pakietIdent
}
function uploaded(req, res){
  let sampleFile;
  let uploadPath;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.send('No file selected');
}
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.myFile;
  uploadPath = __dirname+'/' + sampleFile.name;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);
    res.redirect('back');
  });

  var suffix = userID+'-' +Math.round(Math.random()*1E4)+'-'+pakiet(pakietNum, lessonNum)
  var newName = './uploads/'+suffix+ path.extname(sampleFile.name)
  var oldName = uploadPath  
  fs.rename(oldName, newName, (err) => {
    if (err) 
      res.redirect(req.get('referer'));
  })
  return newName;
}
  
app.post('/upload', function(req, res) {
  uploaded(req, res);
  //uploadFile(newName);
});

app.get("/download/:filename", (req, res) => {
  const filePath = __dirname + "/downloads/" + req.params.filename;
  res.download(
      filePath,
      (err) => {
          if (err) {
              res.send({
                  error : err,
                  msg   : "Problem downloading the file"
              })
          }
  });
});

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('join', ({ name, room_id, user_id }) => {
      const { error, user } = addUser({
          socket_id: socket.id,
          name,
          room_id,
          user_id
      })
      socket.join(room_id);
      if (error) {
          console.log('join error', error)
      } else {
          console.log('join user', user)
      }
  })
  socket.on('sendMessage', (message, room_id, callback) => {
      const user = getUser(socket.id);
      const msgToStore = {
          name: user.name,
          user_id: user.user_id,
          room_id,
          text: message
      }
      console.log('message', msgToStore)
      const msg = new Message(msgToStore);
      msg.save().then(result => {
          io.to(room_id).emit('message', result);
          callback()
      })

  })
  socket.on('get-messages-history', room_id => {
      Message.find({ room_id }).then(result => {
          socket.emit('output-messages', result)
      })
  })
  socket.on('disconnect', () => {
      const user = removeUser(socket.id);
  })
});

/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  
  }); 
});

