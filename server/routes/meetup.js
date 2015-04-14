var express 	= require('express');
var router 		= express.Router();
var Meetup      = require('../models/meetup');
var io 			= require('../../index').io;

// route middleware that will happen on every request
router.use(function(req, res, next) {

    // log each request to the console
    console.log(req.method, req.url);

    // continue doing what we were doing and go to the route
    next(); 
});

router.route('/meetups')
	.post(function(req, res) {
		var meetup = new Meetup();
		meetup.name = req.body.name;

		meetup.save(function(err) {
			if(err) {
				res.send(err);
			} else {
				
				io.emit('meetup', req.body);
				return res.sendStatus(200);
			}
		});

		//return res.sendStatus(200);
	})

	.get(function(req, res) {
		Meetup.find(function(err, meetups) {
			if(err) {
				res.send(err);
			} else {
				res.json(meetups);
			}

		});
	});

router.route('/meetups/:_id/edit')
	.get(function(req, res) {
		 Meetup.findById(req.params._id ,function(err, meetup) {
			if(err) {
				return console.error(err);
			} else {
				console.log('edit successful', meetup);
				res.json(meetup);
			}
		});
	})
	.post(function(req, res) {
		var name = req.body.name;
		console.log(req.body);

		//find it
		Meetup.findById(req.params._id, function(err, meetup) {
			//update it
			meetup.update({
				name: name
			}, function( err, meetupId) {
				if(err) {
					console.log(err);
				} else {
					console.log('successfully updated ' + name);
				}
			});
		});
	});

router.route('/meetups/:_id/delete')
	.delete(function(req, res) {
		 Meetup.findById(req.params._id ,function(err, meetup) {
			if(err) {
				return console.error(err);
			} else {
				meetup.remove(function(err, meetup) {
					if(err) {
						console.error(err);
					} else {
						console.log("deleted " + meetup._id);
					}
				})
			}
		})
	});

module.exports = router;