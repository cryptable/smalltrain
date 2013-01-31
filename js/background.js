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
				// set alarm min 10 minutes and scan every 5 minutes 
				chrome.alarms.create("smalltime", {when: (endOfDate.getTime()-60000), periodInMinutes: 50000});
				chrome.storage.local.set({"smalltrain.timeToCheck" : endOfDate }, function() {
					return;
				});
			}
		}
	},
	
	// Perform the correct action when an Alarm is inistiated
	var onAlarm= function() {
		var result = {}
		
		if (isConfigured && railtime !== undefined) {

			railtime.setConsumerSecret(consumerKey);
			railtime.retrieveRoutes(startStationObj.Id,
				endStationObj.Id,
				now,
				1,
				0,
				0,
				5,
				function(status, responseText) {
					var response,
						route, transports, transport,
						textMsg, table, tr, td1, td2, td3, td4, td5, departure, departureDelay, arrival, arrivalDelay, connections, track,
						i, max; 
					if (status == 200) {
						response = JSON.parse(responseText);
						if (response.Routes.length === 0) {
							table = document.getElementById('train-schedule');
							tr = document.createElement('TR');
							td1 = document.createElement('TD');
							td1.setAttribute("colspan", "6");
							td1.innerText = "No routes found.";
							table.appendChild(tr);
							tr.appendChild(td1);
						}
						else {
							for (i=0, max = response.Routes.length; i<max; i++) {
								route = response.Routes[i];
								transports = route["Transports"];
								transport = transports[0];
								table = document.getElementById('train-schedule');
								tr = document.createElement('TR');
								td1 = document.createElement('TD');
								td2 = document.createElement('TD');
								td3 = document.createElement('TD');
								td4 = document.createElement('TD');
								td5 = document.createElement('TD');
								td6 = document.createElement('TD');
								departure = (new Date(parseInt(route["DepartureDateTime"].substr(6),10))).toLocaleTimeString();
								departureDelay = route["DepartureDelay"];
								arrival = (new Date(parseInt(route["ArrivalDateTime"].substr(6),10))).toLocaleTimeString();
								arrivalDelay = route["ArrivalDelay"];
								connections= route["Connections"]
								track = transport["DepartureTrack"];
								td1.innerText = departure;
								td2.innerText = departureDelay;
								td2.setAttribute("class", "smalltrain-departuredelay");
								td3.innerText = arrival;
								td4.innerText = arrivalDelay;
								td4.setAttribute("class", "smalltrain-arrivaldelay");
								td5.innerText = connections;
								td5.setAttribute("class", "smalltrain-connections");
								td6.innerText = track;
								td6.setAttribute("class", "smalltrain-track");
								if (departureDelay > 0) {
									tr.setAttribute("class", "delayed");
								}
								table.appendChild(tr);
								tr.appendChild(td1);
								tr.appendChild(td2);
								tr.appendChild(td3);
								tr.appendChild(td4);
								tr.appendChild(td5);
								tr.appendChild(td6);
							}
						}
					}
					else {
						console.log("Failed to get train schedule");	
						table = document.getElementById('train-schedule');
						tr = document.createElement('TR');
						td1 = document.createElement('TD');
						td1.setAttribute("colspan", "6");
						td1.innerText = "Failed to get train schedule";
						table.appendChild(tr);
						tr.appendChild(td1);
					}
				}
			);
		}
	}

	var readConfig = function() {
		var configList = [ "smalltrain.consumerkey", 
		                   "smalltrain.startStation",
		                   "smalltrain.endStation",
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
				if (items["smalltrain.timeToCheck"] !== undefined) {
					timeToCheck = items["smalltrain.timeToCheck"]; 				
				} else {
					timeToCheck = "EN";
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
		}
	} 		
}())

// Execute the page code when page is loaded
backgroundPage.initPage();
