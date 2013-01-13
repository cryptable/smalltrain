
// the code behind the popup page
var popupPage = (function() {
	var consumerKey;
	var startStationObj;
	var endStationObj;
	
	var updateData = function() {
		var now = new Date();
		if ((consumerKey == undefined) ||
		    (startStationObj == undefined) ||
		    (endStationObj == undefined)) {
		    	return;
		}
		
		railtime.setConsumerSecret(consumerKey);
		railtime.retrieveRoutes(startStationObj.Id,
			endStationObj.Id,
			now,
			1,
			1000,
			0,
			5,
			function(status, responseText) {
				var response,
					route, transports, transport,
					textMsg, table, tr, td1, td2, td3, td4, td5, departure, departureDelay, arrival, arrivalDelay, track,
					i, max; 
				if (status == 200) {
					response = JSON.parse(responseText);
					if (response.Routes.length === 0) {
						table = document.getElementById('train-schedule');
						tr = document.createElement('TR');
						td1 = document.createElement('TD');
						td1.setAttribute("colspan", "5");
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
							departure = (new Date(parseInt(route["DepartureDateTime"].substr(6)))).toLocaleTimeString();
							departureDelay = route["DepartureDelay"];
							arrival = (new Date(parseInt(route["ArrivalDateTime"].substr(6)))).toLocaleTimeString();
							arrivalDelay = route["ArrivalDelay"];
							track = transport["DepartureTrack"];
							td1.innerText = departure;
							td2.innerText = departureDelay;
							td3.innerText = arrival;
							td4.innerText = arrivalDelay;
							td5.innerText = track;
							table.appendChild(tr);
							tr.appendChild(td1);
							tr.appendChild(td2);
							tr.appendChild(td3);
							tr.appendChild(td4);
							tr.appendChild(td5);
						}
					}
				}
				else {
					console.log("Failed to get train schedule");	
					table = document.getElementById('train-schedule');
					tr = document.createElement('TR');
					td1 = document.createElement('TD');
					td1.setAttribute("colspan", "5");
					td1.innerText = "Failed to get train schedule";
					table.appendChild(tr);
					tr.appendChild(td1);
				}
			}
		);
	}
	
	var readConfig = function() {
		var configList = [ "smalltrain.consumerkey", 
		                   "smalltrain.startStation",
		                   "smalltrain.endStation"];
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
			readConfig();
		}
	} 
}());

// Execute the page code when page is loaded
document.addEventListener('DOMContentLoaded', function () {
  popupPage.initPage();
});