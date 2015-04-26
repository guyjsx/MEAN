
app.factory('socketio', ['$rootScope', function ($rootScope) {
        
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    }]);

app.controller('TestController', ['$scope','$resource', function($scope, $resource) {
	var Test = $resource('/api/test');
	Test.query(function(result) {
		console.log(result);
	});
}]);

app.controller('RegisterController', ['$scope','$resource', function($scope, $resource) {

}]);

app.controller('MeetupsController', ['$scope', '$resource', '$routeParams','socketio', 'users', function($scope, $resource, $routeParams, socketio, users){
	var Meetup = $resource('/api/meetups');
	var Users = $resource('/users/:_id')
	var meetup = new Meetup();

	$scope.userIds = [];
	$scope.attendance = [];
	$scope.userIdsByIndex = [];
	$scope.userInfo = [];
	$scope.userInfoHolder = [];
	$scope.user = users;
	//list all 
	Meetup.query({})
	.$promise.then(function(results) {
		$scope.meetups = results;
	});

	console.log('check');
	socketio.on('meetup', function(msg) {
		$scope.meetups.push(msg);
	})

	$scope.meetups = []; 	//holds initial list

	$scope.createMeetup = function(){
		meetup.name = $scope.meetupName;
		meetup.dek = $scope.meetupDek;
		meetup.user = $scope.user;
		meetup.$save(function	(result){
			$scope.meetupName = '';
			$scope.meetupDek = '';
		});
	}

	$scope.deleteMeetup = function($id, $index) {
		var meetup = $resource('/api/meetups/:_id/delete', {_id:$id});
		meetup.delete({}, 
			function(data) {
			//remove from inital array
			$scope.meetups.splice($index,1);
		}, 
			function(err) {
				console.log(err);
		});
	}

	$scope.editMeetup = function($id, $index) {
		var SingleMeetup = $resource('/api/meetups/:_id/edit');
		
		//get a single meetup
		$scope.single = SingleMeetup.get({_id:$id});
	}	

	$scope.updateMeetup = function($id, $index) {
		var UpdateMeetup = $resource('/api/meetups/:_id/edit', {_id:$id});

		//pass the entire object to be updated
		UpdateMeetup.save({_id: $id}, $scope.meetups[$index]);
	}

	$scope.attendEvent = function($index, $id) {
		var UpdateMeetup = $resource('/api/meetups/:_id/attend', {_id:$id});
		var userName = $scope.user.name;
		var userId = $scope.user._id;
		var userExists = false;
		console.log($scope.meetups[$index].attend);
		//pass the entire object to be updated
		UpdateMeetup.save({_id: $id}, $scope.user, function(data) {

		});

		for (var i = 0; i < $scope.meetups[$index].attend.length; i++) {
			if($scope.meetups[$index].attend[i].userId == userId) {
				userExists = true;
			}
		}
		if(!(userExists)) {
			$scope.meetups[$index].attend.push({'userId': userId,'userName':userName});
		} else {
			alert("You are already attending this event.");
		}

	}

	$scope.unattendEvent = function($index, $id) {
		var UpdateMeetup = $resource('/api/meetups/:_id/attend', {_id:$id});
		var userId = $scope.user._id;
		var attendeeIndex;

		UpdateMeetup.delete({_id: $id, userId: userId}, function(data) {
			//$scope.meetups[$index].attend.splice(i,1);
			for (var i = 0; i < $scope.meetups[$index].attend.length; i++) {
				if($scope.meetups[$index].attend[i].userId == $scope.user._id) {
					attendeeIndex = i;
					console.log(attendeeIndex);
					break;
				}
			};
			$scope.meetups[$index].attend.splice(i,1);
		});

	}
}]);

