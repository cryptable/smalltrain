/*
 * This is the background JavaScript file
 * It should make a copy of the station database into a local storage
 */

/* Small train object */
var backgroundPage = ( function() {
	var isConfigured = false;
	var consumerKey;
	var startStationObj;
	var endStationObj;
	var timeToGo = 10;
	var trainDeparture = 0;
	
	// Recieved the message from Smalltime
	// message containf
	// {version: 1, 
	//	method: "subscribe", 
	//	value: Object}
	var onMessage = function(message) {
		var endOfDate;
		
		if (isConfigure) {
			if (message.version === 1) {
				endOfDate = new Date(message.value['end_of_day']);
				console.log("Message value " + message.value['end_of_day']);
				// set alarm min 10 minutes and scan every 2 minutes 
				console.log("Set time " + endOfDate.getTime());
				resetShowTime();
				chrome.alarms.create("smalltrain.schedule", {when: (endOfDate.getTime()-((timeToGo + 10) *60000)) });
				chrome.storage.local.set({"smalltrain.timeToCheck" : endOfDate }, function() {
					return;
				});
			}
		}
	};

	var retrieveTrainSchedule = function() {
		railtime.setConsumerSecret(consumerKey);
		railtime.retrieveRoutes(startStationObj.Id,
			endStationObj.Id,
			new Date(Date.now() + (timeToGo * 60000)),
			1,
			0,
			0,
			1,
			function(status, responseText) {
				var response, route, transports, transport,departure, departureDelay;
				 
				if (status == 200) {
					response = JSON.parse(responseText);
					if (response.Routes.length !== 0) {
						route = response.Routes[0];
						transports = route["Transports"];
						transport = transports[0];
						departure = (new Date(parseInt(route["DepartureDateTime"].substr(6),10)));
						departureDelay = parseInt(route["DepartureDelay"], 10);
						trainDeparture = (departure.getTime() + (departureDelay * 60000));
						console.log("Set Alarm Time to go " + timeToGo + ":" + (new Date(trainDeparture - (timeToGo+10 * 60000))))
						// Somehow negative value -> retry in 5 minutes
						if (Math.floor(((trainDeparture - (timeToGo * 60000)) - Date.now()) / 60000) < 0) {
							chrome.alarms.create("smalltrain.schedule", {when: (Date.now()+(5 *60000)) });				
						} else {
							chrome.alarms.create("smalltrain.show-time", 
							                     {when: (trainDeparture - ((timeToGo + 10) * 60000)), periodInMinutes: 1});
						}
                 	}
				}
				else {
					// Failed to get train information
					chrome.browserAction.setBadgeText({text:"X"});
				}
			}
		);			
	}	
	
	// Perform the correct action when an Alarm is inistiated
	var onAlarm= function(alarm) {
		var result = {};
		
		if (!isConfigure) {
			console.log('Not yet configured!');
			return;
		}
		if (alarm.name === "smalltrain.schedule" && railtime !== undefined) {
			retrieveTrainSchedule();
		}
		if (alarm.name === "smalltrain.show-time" && railtime !== undefined) {
			minutes = Math.floor(((trainDeparture - (timeToGo * 60000)) - Date.now()) / 60000);
			console.log("Time to train" + minutes)
			if (minutes >= 0 && minutes <= 10) {
				chrome.browserAction.setBadgeText({text:minutes.toString()});
				chrome.browserAction.setBadgeBackgroundColor({color:'#008000'});
				if (minutes >= 0 && minutes <= 5) {
					chrome.browserAction.setBadgeBackgroundColor({color:'#FF0000'});
				}
			}
			else if (minutes < 0) {
				chrome.browserAction.setBadgeText({text:""});
				retrieveTrainSchedule();			
			}
			else {
				chrome.browserAction.setBadgeText({text:""});				
			}
		}
	};

	var resetShowTime = function() {
		try {
			chrome.browserAction.setBadgeText({text:""});				
			chrome.alarms.clear("smalltrain.show-time");
		} catch (err) {
			console.log("err: " + err);
		}
	};
	
	var readConfig = function() {
		var configList = [ "smalltrain.consumerkey", 
		                   "smalltrain.startStation",
		                   "smalltrain.endStation",
		                   "smalltrain.timeToGo",
		                   "smalltrain.timeToCheck"
		                   ];
		chrome.storage.local.get(configList,
			function (items) {
				if (items["smalltrain.consumerkey"] !== undefined){
					consumerKey = items["smalltrain.consumerkey"]; 				
				} else {
					consumerKey = undefined;
				}
				if (items["smalltrain.startStation"] !== undefined) {
					startStationObj = items["smalltrain.startStation"];
				} else {
					startStationObj = undefined;
				}
				if (items["smalltrain.endStation"] !== undefined) {
					endStationObj = items["smalltrain.endStation"]; 				
				} else {
					endStationObj = undefined;
				}
				if (items["smalltrain.timeToGo"] !== undefined) {
					timeToGo = items["smalltrain.timeToGo"]; 				
				} else {
					timeToGo = 10;
				}
				if (items["smalltrain.timeToCheck"] !== undefined) {
					timeToCheck = items["smalltrain.timeToCheck"]; 				
				} else {
					timeToCheck = Date.now();
				}
			}
		);
	};
	
	return {
		/*
		 * intialized the popup pages
		 * 
		 * @method initPage
		 */ 
		initPage : function() {
			var request = {
				version: 1,
				method: "subscribe",
				arguments: ['end_of_day']
			};
			readConfig();
			chrome.alarms.onAlarm.addListener(onAlarm);
			smalstime = chrome.extension.connect('amphlkkeggmfpadglofdhapackbjmhfp');
			smalstime.onMessage.addListener(onMessage);
			smalstime.postMessage(request)
			// register alarm callback
			isConfigure = true;
		},
		
		setEndOfDay: function(dateTime) {
			var msg = { version: 1, value: {'end_of_day': dateTime}};
			onMessage(msg);
		},
		
		disableNotification: function() {
			chrome.alarms.clear("smalltrain.schedule");
			chrome.alarms.clear("smalltrain.show-time");
		}
	} 		
}())

// Execute the page code when page is loaded
backgroundPage.disableNotification();
backgroundPage.initPage();
