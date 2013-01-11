

/**
 * class for the option page
 * 
 * @class optionsPage
 **/
var optionsPage = function() {
	var stationList = null;
	var startStationObj = null;
	var endStationObj = null;

	// Set variables to elements
	var consumerKey = document.getElementById("consumer-key");
	var startStation = document.getElementById("start-station");
	var endStation = document.getElementById("end-station");
	var saveButton = document.getElementById("save-button");
	var cancelButton = document.getElementById("cancel-button");

	// set actions to the buttons
	saveButton.addEventListener('click', function() {
		if (startStationObj !== null) {
			chrome.storage.local.set({ "smalltrain.startStation" : startStationObj}, function() {
				return;
			});
		}
		if (endStationObj !== null) {
			chrome.storage.local.set({ "smalltrain.endStation" : endStationObj}, function() {
				return;
			});
		}
	});
	
	cancelButton.addEventListener('click', function() {
		clearStations();	
	});
	
	document.getElementById("refresh-button").addEventListener('click', function() {
		Railtime.setConsumerSecret(consumerKey.value);
		Railtime.retrieveStationList(null, function(status, responseText) {
			if (status === 200) {
				stationList = JSON.parse(responseText);
				chrome.storage.local.set({ "smalltrain.stationlist" : stationList }, function() {
					return;
				});
			} else {
				alert("Retrieve stations DB failed");
			}
		});				
	});
	
	consumerKey.addEventListener("keyup", function () {
		chrome.storage.local.set({"smalltrain.consumerkey" : consumerKey.value}, function() {
			return;
		});
	});	
	
	startStation.addEventListener("keyup", function () {
		var searchValue = startStation.value;
		
		if (searchValue.length > 3) {
			$("#start-station").autocomplete({
				source: function (request, response) {
					var stationsArray = []
					var stations = searchStationsInList(request.term, 10, function(name, station) {
						stationsArray.push(name);
					});
					response(stationsArray);
				},
				select: function(event, ui) {
					startStationObj = searchStationInList(ui.item.value);
				}
			});
		}
		enableDisable();
	});	

	endStation.addEventListener("keyup", function () {
		var searchValue = endStation.value;
		
		if (searchValue.length > 3) {
			$("#end-station").autocomplete({
				source: function (request, response) {
					var stationsArray = []
					var stations = searchStationsInList(request.term, 10, function(name, station) {
						stationsArray.push(name);
					});
					response(stationsArray);
				},
				select: function(event, ui) {
					endStationObj = searchStationInList(ui.item.value);
				}
			});
		}
		enableDisable();
	});	
	
	/**
	 * enalbe and disable the GUI
	 * 
	 * @private
	 * @method enableDisable
	 */
	var enableDisable = function() {
		if (consumerKey.value === undefined || consumerKey.value === "") {
			saveButton.disabled = true;
			cancelButton.disabled = true;
			startStation.disabled = true;
			endStation.disabled = true;
		} else {
			if (stationList === undefined) {
				saveButton.disabled = true;
				cancelButton.disabled = true;
				startStation.disabled = true;
				endStation.disabled = true;
			} else {
				if (startStationObj && endStationObj) {
					saveButton.disabled = false;
				} else {
					saveButton.disabled = true;				
				}
				cancelButton.disabled = false;
				startStation.disabled = false;
				endStation.disabled = false;					
			}
		}
	};
	
	/** 
	 * Read config from local storage
	 * 
	 * @private
	 * @method readConfig
	 */
	var readConfig = function () {
		var configList = [ "smalltrain.consumerkey", 
		                   "smalltrain.stationlist",
		                   "smalltrain.startStation",
		                   "smalltrain.endStation"];
		
		chrome.storage.local.get(configList,
			function (items) {
				if (items["smalltrain.consumerkey"] !== undefined){
					consumerKey.value = items["smalltrain.consumerkey"]; 				
				} else {
					consumerKey.value = "";
				}
				if (items["smalltrain.stationlist"] !== undefined) {
					stationList = items["smalltrain.stationlist"]; 				
				} else {Bruu
					stationList = undefined;
				}
				if (items["smalltrain.startStation"] !== undefined) {
					startStationObj = items["smalltrain.startStation"];
					startStation.value = startStationObj["NameEN"]; 			
				} else {
					startStationObj = undefined;
					startStation.value = "";
				}
				if (items["smalltrain.endStation"] !== undefined) {
					endStationObj = items["smalltrain.endStation"]; 				
					endStation.value = endStationObj["NameEN"]; 			
				} else {
					endStationObj = undefined;
					endStation.value = ""; 			
				}
				enableDisable();
			}
		);
	};
	
	/**
	 * search one station in the station Array
	 * 
	 * @private
	 * @method searchStationList
	 * @param {String} searchCriteria The string to search for in the name of the station
	 * @param {String} callback function which is calledback when one result is found
	 * @return {Array} Array of objects to the station (see station object)
	 */ 
	var searchStationInList = function(searchCriteria, callback) {
		var	i = 0,
			max = 0,
			station = null;

		for (i = 0, max = stationList.length; i < max; i++) {
			station = stationList[i];
			// Search occurences beginning of a word 
			if (station["NameEN"] === searchCriteria) {
				if (callback !== undefined) {
					callback(station["NameEN"], station);
				}
				return station;
			}
		}
		
		return null;		
	}
	
	/**
	 * search all stations in the station Array
	 * 
	 * @private
	 * @method searchStationList
	 * @param {String} searchCriteria The string to search for in the name of the station
	 * @param {String} max_values maximum number of value returns
	 * @param {String} callback function which is calledback when one result is found
	 * @return {Array} Array of objects to the station (see station object)
	 */ 
	var searchStationsInList = function(searchCriteria, max_values, callback) {
		var	i = 0,
			max = 0,
			result = [],
			re = new RegExp("^" + searchCriteria + ".*","i");
			station = null;

		for (i = 0, cnt = 0, max = stationList.length; (i < max) && (cnt < max_values); i++) {
			station = stationList[i];
			// Search occurences beginning of a word 
			if (station["NameEN"].search(re) !== -1) {
				result.push(station);
				if (callback !== undefined) {
					callback(station["NameEN"], station);
				}
				cnt++;
			}
		}
		return result;		
	}
	
	return {
		/*
		 * intialized the option pages
		 * 
		 * @method initPage
		 */ 
		initPage: function() {
			readConfig();
		}
	};
}();

document.addEventListener('DOMContentLoaded', function () {
  optionsPage.initPage();
});