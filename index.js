'use strict';
var async = require('async');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
const yelp = require('yelp-fusion');
var express = require('express');
var https = require('https');
var result = {};
var temp = {};
var app = express();
var msg;
var requestForInfo = {};
var msgs = [];
var suggestionsYelp =[];
var suggestionsGoogle = [];
var suggestionsOthers = [];

var appmethod = "get";
// Place holders for Yelp Fusion's OAuth 2.0 credentials. Grab them
 // from https://www.yelp.com/developers/v3/manage_app
 const clientId = 'GYk2sEYqbeDDlFZfOkH0Sg';
 const clientSecret = 'vADRAPeAEn3dno9fqpspZRoA0CfcFZ0dKXe7HekL7SLucSoqCxwPFmhRT61XcJWA';
 const searchRequest = {
   term:'Four Barrel Coffee',
   location: 'san francisco, ca'
 };
var conversation = watson.conversation({
  username: 'c6c1bf11-7668-49de-adfd-3d14b97b1e00',
  password: 'PG356DPRcfas',
  path: { workspace_id: 'ba4fc120-0947-4f47-878e-248cd4b8601c' },
  version: 'v1',
  version_date: '2017-05-26'
});
var messages = [{user: "person", text: "hi"}, {user: "watson", text: "hello"}];
function init(){
  // var div = app.getElementById("displaymessages");
  // var div = document.getElementById("displaymessages");
  div.innerHTML = "";
  for(var x in arr){
      if(arr[x].user == "watson"){
          div.innerHTML += "<p style='background-color: red; text-align: left'>" + arr[x].text + "-" + "</p>";
      }
      else{
          div.innerHTML += "<p style='background-color: green; text-align: right'>" + "-" + arr[x].text + "</p>";
      }
  }
}
var switch1 = false;
var switch2 = false;
var result = '';
//Gets data from Google based on location. Returns stores and restaurants
function callGoogle(location, categories){
  console.log(location);
  result = '';
  var arr = location.split(" ");
  var locWithPlus = '';
  for(var x=0; x<arr.length; x++){
    if(x != arr.length-1){
      locWithPlus += arr[x] + "+";
    }
    else{
      locWithPlus += arr[x];
    }
  }
  //Getting stores first
  console.log(locWithPlus);
  //Anything
  if(categories == ''){
    var path = '/maps/api/place/textsearch/json?query=stores+'+locWithPlus+'&key=AIzaSyAeeT9UBQzeD1vaOy9x1uELyDEVaV9BWY4';
    var storesoptions = {
    host: 'maps.googleapis.com',
    path: path,
    method: 'GET'
    };
    https.get(storesoptions, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        result += chunk;
        // console.log('BODY: ' + chunk);
      });
      res.on('end', function() {
        console.log("on end");
        var places = JSON.parse(result);
        var locations = places.results;
        suggestionsGoogle = [];
      for(var x=0; x<2; x++){
          suggestionsGoogle.push(locations[x]);
        }
        // suggestionsGoogle = places.results;
        temp.context.google1 = locations[0].name;
        temp.context.google2 = locations[1].name;
        // console.log(locations);
        //return 3 stores
        //  for(var i=0; i<3; i++){
        //    if(i != 2){
        //       temp.context.google += locations[i].name + ", ";
        //    }
        //    else{
        //      temp.context.google += locations[i].name + ", ";//same for now
        //    }

        // }
        getRestaurantsGoogle(locWithPlus);
      })
    }).on('error', function(e){
      console.log("Got error: "+e.message);
    });
  }
  else{
    var path = '/maps/api/place/textsearch/json?query=+'+categories+'+'+locWithPlus+'&key=AIzaSyAeeT9UBQzeD1vaOy9x1uELyDEVaV9BWY4';
    var storesoptions = {
    host: 'maps.googleapis.com',
    path: path,
    method: 'GET'
    };
    https.get(storesoptions, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        result += chunk;
        // console.log('BODY: ' + chunk);
      });
      res.on('end', function() {
        console.log("on end");
        var places = JSON.parse(result);
        var locations = places.results;
        suggestionsGoogle = [];
      for(var x=0; x<4; x++){
          suggestionsGoogle.push(locations[x]);
        }
        // suggestionsGoogle = places.results;
        temp.context.google1 = locations[0].name;
        temp.context.google2 = locations[1].name;
        temp.context.google3 = locations[2].name;
        temp.context.google4 = locations[3].name;

        conversation.message({
          context: temp.context
        }, processResponse);
        // console.log(locations);
        //return 3 stores
        //  for(var i=0; i<3; i++){
        //    if(i != 2){
        //       temp.context.google += locations[i].name + ", ";
        //    }
        //    else{
        //      temp.context.google += locations[i].name + ", ";//same for now
        //    }

        // }
        // getRestaurantsGoogle(locWithPlus, );
      })
    }).on('error', function(e){
      console.log("Got error: "+e.message);
    });
  }
}

app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

app.post("/", function (req, res) {
    console.log(req.body.activity)
    var jsonObj = {'activity': req.body.activity };
    jsonObj.address = req.body.address;
    jsonObj.open_hours = req.body.open_hours;
    jsonObj.website = req.body.website;
    jsonObj.phone_num = req.body.phone_num;
    suggestionsOthers[0] = jsonObj;

    console.log(jsonObj);

    res.render('index.ejs', { temp: msgs , suggestionsYelp: suggestionsYelp, suggestionsGoogle: suggestionsGoogle, suggestionsOthers: suggestionsOthers });
    // app.get('/', function (req, res) {
    //   // res.render('index.ejs', { temp: msg, });
    //   res.render('index.ejs', { temp: msgs , suggestionsYelp: suggestionsYelp, suggestionsGoogle: suggestionsGoogle, suggestionsOthers: suggestionsOthers});
    // });
    console.log(suggestionsOthers);
    console.log(suggestionsYelp);

});

function getRestaurantsGoogle(locWithPlus){
    var restsoptions = {
    host: 'maps.googleapis.com',
    path: '/maps/api/place/textsearch/json?query=restaurants+'+locWithPlus+'&key=AIzaSyAeeT9UBQzeD1vaOy9x1uELyDEVaV9BWY4',
    method: 'GET'
  };
  https.get(restsoptions, function(res) {
      result = '';
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      result += chunk;
    });
    res.on('end', function() {
      console.log("on end");
      var places = JSON.parse(result);
      var locations = places.results;
      for(var x=0; x<2; x++){
          suggestionsGoogle.push(locations[x]);
        }
        // suggestionsGoogle = places.results;
      temp.context.google3 = locations[2].name;
      temp.context.google4 = locations[3].name;
      // console.log(locations);
      //return 3 stores
      //  for(var i=0; i<3; i++){
      //    if(i != 2){
      //       temp.context.google += locations[i].name + ", ";
      //    }
      //    else{
      //      temp.context.google += locations[i].name;
      //    }
      // }
      //Settings the context so that Watson knows about the information pulled from the API.
      conversation.message({
      context: temp.context
    }, processResponse);
    console.log("A:OSJDASOFDIGAJF:OSAIJ:O");
    app.get('/', function (req, res) {
      // res.render('index.ejs', { temp: msg, });
      res.render('index.ejs', { temp: msgs , suggestionsYelp: suggestionsYelp, suggestionsGoogle: suggestionsGoogle, suggestionsOthers: suggestionsOthers});
    });
    app.post('/go', function (req, res) {
      setTimeout(res.redirect('/'), 3000);
      console.log("redirect");
      appmethod="post";
    });
    })
  }).on('error', function(e){
    console.log("Got error: "+e.message);
  });
  // switch2 = true;
  // if(switch1 && switch2){
  // }
}
//Gets info from Yelp based on location and categories
function callYelpFromConversationThenGoogle(location, categories){
  if(categories == 'anything'){
    categories = '';
  }
  var searchRequest2 = {
    term: categories,
    location: location
  }
  var apiCallResult;
  yelp.accessToken(clientId, clientSecret).then(response => {
  const client = yelp.client(response.jsonBody.access_token);
  client.search(searchRequest2).then(response => {
    // console.log(response.jsonBody.businesses.length);
    //just retrun 3 businesses from yelp
      suggestionsYelp = [];
      for(var x=0; x<4; x++){
          suggestionsYelp.push(response.jsonBody.businesses[x]);
        }
        // suggestionsGoogle = places.results;
    // suggestionsYelp = response.jsonBody.businesses;
    // console.log(response.jsonBody.businesses);
    temp.context.yelp1 = response.jsonBody.businesses[0].name;
    temp.context.yelp2 = response.jsonBody.businesses[1].name;
    temp.context.yelp3 = response.jsonBody.businesses[2].name;
    // for (var x = 0; x<3; x++) {
  // for (var x = 0; x<response.jsonBody.businesses.length; x++) {
    // const prettyJson2 = JSON.stringify(response.jsonBody.businesses[x], null, 4);
    // apiCallResult = response.jsonBody.businesses[x].name;
    // if(x != 4){
    //   temp.context.yelp += apiCallResult + ", ";
    // }
    // else{
    //   temp.context.yelp += apiCallResult;
    // }
    // console.log(apiCallResult);
  // }
  // console.log("cray" + temp.context);

  callGoogle(location, categories);
      //Passing info to API...
  // switch1 = true;
  // if(switch1 && switch2){
    // conversation.message({
    //   context: temp.context
    // }, processResponse);
  // }

  // return apiCallResult;
  // conversation.message({
  //   context: {"api": apiCallResult}
  // }, processResponse);
  // context.api =
  // foo();
  });
}).catch(e => {
   console.log(e);
});
}
//Initial call to the Yelp API, this is not needed
// yelp.accessToken(clientId, clientSecret).then(response => {
//   const client = yelp.client(response.jsonBody.access_token);
//   client.search(searchRequest, foo).then(response => {
//     console.log(response.jsonBody.businesses.length);
//   for (var x = 0; x<response.jsonBody.businesses.length; x++) {
//     const prettyJson2 = JSON.stringify(response.jsonBody.businesses[x], null, 4);
//     result.rating = response.jsonBody.businesses[x].rating;
//     result.name = response.jsonBody.businesses[x].name;
//   }
//   const firstResult = response.jsonBody.businesses[0];
//   temp = response.jsonBody.businesses;
//   const prettyJson = JSON.stringify(firstResult, null, 4);
//   console.log(prettyJson);
//   console.log(result);
//   foo();
//   });
// }).catch(e => {
//    console.log(e);
// });
//Start of program
start();
function start(){
  foo();
}

// set ejs as rendering engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended : false }));
app.use(express.static('public'));
// render the ejs page
app.get('/', function (req, res) {
  // res.render('index.ejs', { temp: msg });
  res.render('index.ejs', { temp: msgs , suggestionsYelp: suggestionsYelp, suggestionsGoogle: suggestionsGoogle, suggestionsOthers: suggestionsOthers});
});
// when submit  button is clicked
app.post('/go', function (req, res) {
  console.log(req.body.do + "is what you typed");
  msg = req.body.do
  sendToWatson(req);
  appmethod="post";
  // $(".response").append("text");
//  foo(req);
//sendToWatson(req);
  console.log("REDIRECT");
  res.redirect('/');
});
function sendToWatson(req){
  // temp.context.api = result.name;
  conversation.message({
      input: { text: req.body.do },
      context: temp.context,
    }, processResponse);
    //Pushes what user typed into message array
  msgs.push({ "user" : "You" , "msg" : req.body.do});
  app.post('/go', function (req, res) {
    setTimeout(res.redirect('/'), 3000);
    console.log("redirect");
    appmethod="post";
  });
}
function foo(){
  // Start conversation with empty message.
  // Initializes context variables
  conversation.message({
    context: {"name" : "kai"}
  }, processResponse);
}
// Process the conversation Watson response.
function processResponse(err, response) {
  console.log(response);
  if (err) {
    console.error(err); // something went wrong
    return;
  }
  // If an intent was detected, log it out to the console.
  if (response.intents.length > 0) {
    console.log('Detected intent: #' + response.intents[0].intent);
  }
  // Display the output from dialog, if any.
  if (response.output.text.length != 0) {
    for(var x in response.output.text){
      console.log(response.output.text[x]);
    }
  }
  temp = response;
  //Pulling info from response
  requestForInfo.location = response.context.location;
  requestForInfo.time = response.context.time;
  requestForInfo.categories = response.context.categories;
  if(response.output.action != undefined){
    if(response.output.action == 'get_things_to_do'){
      // if(requestForInfo.categories == 'anything'){
        console.log("calling yelp");
        // response.context.api = callYelp(requestForInfo.location, requestForInfo.categories);
        //Calls Yelp, then Google after
        var yelpres = callYelpFromConversationThenGoogle(requestForInfo.location, requestForInfo.categories);
        // var googleres = callGoogle(requestForInfo.location);
        //Pass info to Conversation
      // }
      // else if(requestForInfo.categores == 'restaurant'){
        // console.log("Getting restaurant information from Yelp and Google");
        // var yelpres
      // }
    }
  }
  //Trying to push message to msgs array to display on page
  msgs.push({ "user" : "Watson" , "msg" : response.output.text});
  app.post('/go', function (req, res) {
    setTimeout(res.redirect('/'), 3000);
    console.log("redirect");
    appmethod="post";
  });
  console.log(msgs);
  // Prompt for the next round of input.
  // Wait for submit from user on page
  // var newMessageFromUser = prompt('>> ', "hi");

  // Send back the context to maintain state.
}
 app.listen(8000);
 console.log('App is listening on PORT 8000');
