var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var server = app.listen(3000);

var twoWeeks = 1209600000;

app.get('/newSession/:userid', function(req, res){
		var userid = req.params.userid;
		res.status(200);
		//console.log?
		if(userid in users){
			res.send(false);//
		}
		else{
			res.cookie("userid",req.params.userid, {maxAge: twoWeeks, httpOnly: false});
	    	res.send(true);
	    	createUser(userid);
		}
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
	    res.send(inventories[userid]);
	    return;
	}
	for (var i in campus) {
		if (req.params.id == campus[i].id) {
			exitRoom(userid);
			users[userid].local = campus[i].id;
			enterRoom[userid];
		    res.set({'Content-Type': 'application/json'});
		    res.status(200);
		    res.send(campus[i]);
                    locations[userid] = campus[i].id;
                    console.log(locations);
		    return;
		}
	}res.cookie("userid",req.params.userid, {maxAge: twoWeeks, httpOnly: false});
	    	res.send(true);
	    	createUser();
            inventories[req.params.userid] = ["laptop"];
	res.status(404);
	res.send("not found, sorry");
});

app.get('/images/:name', function(req, res){
	res.status(200);
	res.sendFile(__dirname + "/" + req.params.name);
});

app.delete('/:id/:item', function(req, res){
        var userid = req.cookies.userid;
	for (var i in campus) {
		if (req.params.id == campus[i].id) {
		    res.set({'Content-Type': 'application/json'});
		    var ix = -1;
		    if (campus[i].what != undefined) {
					ix = campus[i].what.indexOf(req.params.item);
		    }
		    if (ix >= 0) {
		       res.status(200);
			inventories[userid].push(campus[i].what[ix]); // stash
		        res.send(inventories[userid]);
			campus[i].what.splice(ix, 1); // room no longer has this
			return;
		    }
		    res.status(200);
		    res.send([]);
		    return;
		}
	}
	res.status(404);
	res.send("location not found");
});

app.put('/:id/:item', function(req, res){
        var userid = req.cookies.userid;
	for (var i in campus) {
		if (req.params.id == campus[i].id) {
				// Check you have this
				var ix = inventories[userid].indexOf(req.params.item)
				if (ix >= 0) {
					dropbox(userid, ix,campus[i]);
					res.set({'Content-Type': 'application/json'});
					res.status(200);
					res.send([]);
				} else {
					res.status(404);
					res.send("you do not have this");
				}
				return;
		}
	}
	res.status(404);
	res.send("location not found");
});

var dropbox = function(userid, ix,room) {
	var item = inventories[userid][ix];
	inventories[userid].splice(ix, 1);	 // remove from inventory
	if (room.id == 'allen-fieldhouse' && item == "basketball") {
		room.text	+= " Someone found the ball so there is a game going on!"
		return;
	}
	if (room.what == undefined) {
		room.what = [];
	}
	room.what.push(item);
}

function createUser(id) {
	users[id] = {"inventory": ["laptop"], "local": "strong-hall"};
}

function changeLocation(id,place){
	var currentLocation = users[id].local;
	var index = campus[currentLocation].who.indexOf(id);
	campus[currentLocation].who.splice(index, 1);
	
	campus[place].who.push(id);
	users[id].local = place;
}

var users = {}

var campus =
    [ { "id": "lied-center",
	"where": "LiedCenter.jpg",
	"next": {"east": "eaton-hall", "south": "dole-institute"},
	"text": "You are outside the Lied Center.",
	"who": []
      },
      { "id": "dole-institute",
	"where": "DoleInstituteofPolitics.jpg",
	"next": {"east": "allen-fieldhouse", "north": "lied-center"},
	"text": "You take in the view of the Dole Institute of Politics. This is the best part of your walk to Nichols Hall.",
	"who": []
      },
      { "id": "eaton-hall",
	"where": "EatonHall.jpg",
	"next": {"east": "snow-hall", "south": "allen-fieldhouse", "west": "lied-center"},
	"text": "You are outside Eaton Hall. You should recognize here.",
	"who": []
      },
      { "id": "snow-hall",
	"where": "SnowHall.jpg",
	"next": {"east": "strong-hall", "south": "ambler-recreation", "west": "eaton-hall"},
	"text": "You are outside Snow Hall. Math class? Waiting for the bus?",
	"who": []
      },
      { "id": "strong-hall",
	"where": "StrongHall.jpg",
	"next": {"east": "outside-fraser", "north": "memorial-stadium", "west": "snow-hall"},
	"what": ["coffee"],
	"text": "You are outside Strong Hall.",
	"who": []
      },
      { "id": "ambler-recreation",
	"where": "AmblerRecreation.jpg",
	"next": {"west": "allen-fieldhouse", "north": "snow-hall"},
	"text": "It's the starting of the semester, and you feel motivated to be at the Gym. Let's see about that in 3 weeks.",
	"who": []
      },
      { "id": "outside-fraser",
  "where": "OutsideFraserHall.jpg",
	"next": {"west": "strong-hall","north":"spencer-museum"},
	"what": ["basketball"],
	"text": "On your walk to the Kansas Union, you wish you had class outside.",
	"who": []
      },
      { "id": "spencer-museum",
	"where": "SpencerMuseum.jpg",
	"next": {"south": "outside-fraser","west":"memorial-stadium"},
	"what": ["art"],
	"text": "You are at the Spencer Museum of Art.",
	"who": []
      },
      { "id": "memorial-stadium",
	"where": "MemorialStadium.jpg",
	"next": {"south": "strong-hall","east":"spencer-museum"},
	"what": ["ku flag"],
	"text": "Half the crowd is wearing KU Basketball gear at the football game.",
	"who": []
      },
      { "id": "allen-fieldhouse",
	"where": "AllenFieldhouse.jpg",
	"next": {"north": "eaton-hall","east": "ambler-recreation","west": "dole-institute"},
	"text": "Rock Chalk! You're at the field house.",
	"who": []
      }
    ]
