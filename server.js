var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var server = app.listen(3000);

var twoWeeks = 1209600000;

app.get('/newSession/:userid', function(req, res){
	var userid = req.params.userid;
	res.status(200);
  if (!(userid in users)) {
    createUser(userid); 
    // Don't TODO: any database changes will happen inside createUser
  }
  res.cookie("userid",req.params.userid, {maxAge: twoWeeks, httpOnly: false});
	res.send();
});

app.get('/', function(req, res){
	res.status(200);
	res.sendFile(__dirname + "/index.html");
});

app.get('/:id', function(req, res){
  var userid = req.cookies.userid;
	if (req.params.id == "inventory") {
		res.set({'Content-Type': 'application/json'});
		res.status(200);
		res.send(users[userid].inventory); // TODO: get inventory from database
		return;
	}
	if(campus[req.params.id] != undefined){
		res.set({'Content-Type': 'application/json'});
    res.status(200);
    // TODO: return room info from database
    if (req.params.id != users[userid].local) {
	changeLocation(userid,req.params.id);
    }
    res.send(campus[req.params.id]);
    return;
	}
	res.status(404);
	res.send("not found, sorry");
});

// Maybe TODO: Probably not? 
app.get('/images/:name', function(req, res){
	res.status(200);
	res.sendFile(__dirname + "/" + req.params.name);
});

app.delete('/:id/:item', function(req, res){
	var userid = req.cookies.userid;
	user = users[userid];
	room = campus[req.params.id];
	res.set({'Content-Type': 'application/json'});
	res.status(200);

	// TODO: get user location from database
	// TODO: if id = user location and (item in location in database):
	//           put item in user inventory in database
	//           remove item from location in database
	//           return user inventory from database

	var ix = campus[req.params.id].what.indexOf(req.params.item);

	if ( (req.params.id == user.local) && (ix >= 0) ) {
		user.inventory.push(campus[req.params.id].what[ix]);
		res.send(user.inventory);
		campus[req.params.id].what.splice(ix,1);
		return;
	}

	res.send([]);
	return;
});

app.put('/:id/:item', function(req, res){
  var userid = req.cookies.userid;
  // TODO: Check if room id is user location in database
	if (req.params.id == users[userid].local) {
		// Check you have this
    // TODO: check if item is in user inventory in database
		var ix = users[userid].inventory.indexOf(req.params.item)
		if (ix >= 0) {
      // TODO: change parameters if necessary to work with database
			dropbox(users[userid].inventory, ix,req.params.id);
			res.set({'Content-Type': 'application/json'});
			res.status(200);
			res.send([]);
		} else {
			res.status(404);
			res.send("you do not have this");
		}
		return;
	}
	res.status(404);
	res.send("location not found");
});

var dropbox = function(inventory, ix, room) {
  // TODO: remove item from inventory in database
	var item = inventory[ix];
	inventory.splice(ix, 1);	 // remove from inventory

	if ( (room == 'allen-fieldhouse') && (item == "basketball") ) {
    // TODO: edit room text in inventory
		campus[room].text	+= " Someone found the ball so there is a game going on!"
		return;
	}

  // TODO: put item in room in database
	campus[room].what.push(item);
}

function createUser(id) {
  // TODO: create user in database
	users[id] = {"inventory": ["laptop"], "local": "strong-hall"};
        campus["strong-hall"].who.push(id);
}

function changeLocation(id,place){
	var currentLocation = users[id].local;
	var index = campus[currentLocation].who.indexOf(id);
  // TODO: remove user from oldLocation.who on database
	campus[currentLocation].who.splice(index, 1);
	
  // TODO: Add user to newLocation.who on database
	campus[place].who.push(id);
  // TODO: Change user location on database
	users[id].local = place;
}

var users = {}

var campus =
    { "lied-center" : {
	"where": "LiedCenter.jpg",
	"next": {"east": "eaton-hall", "south": "dole-institute"},
	"text": "You are outside the Lied Center.",
	"who": [],
	"what": []
    },
      "dole-institute" : {
	  "where": "DoleInstituteofPolitics.jpg",
	  "next": {"east": "allen-fieldhouse", "north": "lied-center"},
	  "text": "You take in the view of the Dole Institute of Politics. This is the best part of your walk to Nichols Hall.",
	  "who": [],
	  "what": []
      },
      "eaton-hall" : {
	  "where": "EatonHall.jpg",
	  "next": {"east": "snow-hall", "south": "allen-fieldhouse", "west": "lied-center"},
	  "text": "You are outside Eaton Hall. You should recognize here.",
	  "who": [],
	  "what": []
      },
      "snow-hall" : {
	  "where": "SnowHall.jpg",
	  "next": {"east": "strong-hall", "south": "ambler-recreation", "west": "eaton-hall"},
	  "text": "You are outside Snow Hall. Math class? Waiting for the bus?",
	  "who": [],
	  "what": []
      },
      "strong-hall" : {
	  "where": "StrongHall.jpg",
	  "next": {"east": "outside-fraser", "north": "memorial-stadium", "west": "snow-hall"},
	  "what": ["coffee"],
	  "text": "You are outside Strong Hall.",
	  "who": []
      },
      "ambler-recreation" : {
	  "where": "AmblerRecreation.jpg",
	  "next": {"west": "allen-fieldhouse", "north": "snow-hall"},
	  "text": "It's the starting of the semester, and you feel motivated to be at the Gym. Let's see about that in 3 weeks.",
	  "who": [],
	  "what": []
      },
      "outside-fraser" : {
	  "where": "OutsideFraserHall.jpg",
	  "next": {"west": "strong-hall","north":"spencer-museum"},
	  "what": ["basketball"],
	  "text": "On your walk to the Kansas Union, you wish you had class outside.",
	  "who": []
      },
      "spencer-museum" : {
	  "where": "SpencerMuseum.jpg",
	  "next": {"south": "outside-fraser","west":"memorial-stadium"},
	  "what": ["art"],
	  "text": "You are at the Spencer Museum of Art.",
	  "who": []
      },
      "memorial-stadium" : {
	  "where": "MemorialStadium.jpg",
	  "next": {"south": "strong-hall","east":"spencer-museum"},
	  "what": ["ku flag"],
	  "text": "Half the crowd is wearing KU Basketball gear at the football game.",
	  "who": []
      },
      "allen-fieldhouse" : {
	  "where": "AllenFieldhouse.jpg",
	  "next": {"north": "eaton-hall","east": "ambler-recreation","west": "dole-institute"},
	  "text": "Rock Chalk! You're at the field house.",
	  "who": [],
	  "what": []
      }
    };
