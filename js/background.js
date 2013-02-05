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
				endOfDate = message.value['end_of_day'];
				// set alarm min 10 minutes and scan every 2 minutes 
				chrome.alarms.create("smalltrain.schedule", {when: (endOfDate.getTime()-((timeToGo + 10) *60000)), periodInMinutes: 2});
				chrome.storage.local.set({"smalltrain.timeToCheck" : endOfDate }, function() {
					return;
				});
			}
		}
	};
	
	// Perform the correct action when an Alarm is inistiated
	var onAlarm= function(alarm) {
		var result = {};
		
		if (alarm.name === "smalltrain.schedule" && railtime !== undefined) {
			railtime.setConsumerSecret(consumerKey);
			railtime.retrieveRoutes(startStationObj.Id,
				endStationObj.Id,
				now,
				1,
				0,
				0,
				1,
				function(status, responseText) {
					var response, route, transports, transport,departure, departureDelay, 
						timeToGo = 0;
					 
					if (status == 200) {
						response = JSON.parse(responseText);
						if (response.Routes.length !== 0) {
							route = response.Routes[0];
							transports = route["Transports"];
							transport = transports[0];
							departure = (new Date(parseInt(route["DepartureDateTime"].substr(6),10)));
							departureDelay = parseInt(route["DepartureDelay"], 10);
							trainDeparture = (departure.getTime() + (departureDelay * 60000));
							chrome.alarms.create("smalltrain.show-time", 
							                     {when: (trainDeparture- (timeToGo+10 * 60000)), periodInMinutes: 1});
                     	}
					}
					else {
						// Failed to get train information
						chrome.browserAction.setBadgeText({text:"X"});
					}
				}
			);			
		}
		if (alarm.name === "smalltrain.show-time" && railtime !== undefined) {
			minutes = Math.floor((Date.now() - trainDeparture - (timeToGo+10 * 60000)) / 60000);
			chrome.browserAction.setBadgeText({text:minutes.toString()});
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
					timeToCheck = items["smalltrain.timeToGo"]; 				
				} else {
					timeToCheck = 10;
				}
				if (items["smalltrain.timeToCheck"] !== undefined) {
					timeToCheck = items["smalltrain.timeToCheck"]; 				
				} else {
					timeToCheck = Date.now();
				}
				updateData();
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
			// readConfig();
			smalstime = chrome.extension.connect('amphlkkeggmfpadglofdhapackbjmhfp');
			smalstime.onMessage.addListener(onMessage);
			smalstime.postMessage(request)
			// register alarm callback
			chrome.alarms.onAlarm.addListener(onAlarm);
			isConfigure = true;
		},
		
		setEndOfDay: function(dateTime) {
			var msg = { value: {'end_of_day': dateTime}};
			onMessage(msg);
		}
	} 		
}())

// Execute the page code when page is loaded
backgroundPage.initPage();
chrome.browserAction.setBadgeText({text:"X"});
