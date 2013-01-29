
// the code behind the popup page
var popupPage = (function() {
	var resources = {
		"EN" : { 
			"departure-time": "Departure&nbsp;Time",	
			"delay": "Delay",	
			"arrival-time": "Arrival&nbsp;Time",	
			"connection": "Conn",	
			"track": "Track"
			},	
		"NL" : { 
			"departure-time": "Vertrek&nbsp;tijd",	
			"delay": "Vert.",	
			"arrival-time": "Aankomst&nbsp;tijd",	
			"connection": "Conn",	
			"track": "Spoor"
			},	
		"FR" : { 
			"departure-time": "heure&nbsp;de&nbsp;d&eacute;part",	
			"delay": "Retard",	
			"arrival-time": "heure&nbsp;d&#x27;arriv&eacute;e",	
			"connection": "Lien",	
			"track": "Voie"
			},	
		"DE" : { 
			"departure-time": "Abfahrtszeit",	
			"delay": "Verzögern",	
			"arrival-time": "Ankunftszeit",	
			"connection": "Verb.",	
			"track": "Spur"
			}
	}
	var consumerKey;
	var startStationObj;
	var endStationObj;
	var language = "EN";
	
	var updateData = function() {
		var now = new Date();
		var header = document.getElementById('train-schedule').rows[0].cells;
		
		/*Prepare page*/
		header[0].innerHTML = resources[language]["departure-time"];
		header[1].innerHTML = resources[language]["delay"]; 
		header[2].innerHTML = resources[language]["arrival-time"]; 
		header[3].innerHTML = resources[language]["delay"]; 
		header[4].innerHTML = resources[language]["connection"]; 
		header[5].innerHTML = resources[language]["track"]; 
		
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
	
	var readConfig = function() {
		var configList = [ "smalltrain.consumerkey", 
		                   "smalltrain.startStation",
		                   "smalltrain.endStation",
		                   "smalltrain.language"
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
				if (items["smalltrain.language"] !== undefined) {
					language = items["smalltrain.language"]; 				
				} else {
					language = "EN";
				}
				updateData();
			}
		);
	};
	
	var openOptions = function() {
		var url = chrome.extension.getURL("options.html");
		chrome.tabs.create({url:url, selected:true});
	}
		
	return {
		/*
		 * intialized the popup pages
		 * 
		 * @method initPage
		 */ 
		initPage : function() {
			readConfig();
			options = document.getElementById('toOptions');
			options.addEventListener("click", openOptions);
		}
	} 
}());

// Execute the page code when page is loaded
document.addEventListener('DOMContentLoaded', function () {
  popupPage.initPage();
});