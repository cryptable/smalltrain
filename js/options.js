

/**
 * class for the option page
 * 
 * @class optionsPage
 **/
var optionsPage = (function() {
	var stationList = null;
	var startStationObj = null;
	var endStationObj = null;
	
	// Set variables to elements
	var consumerKey = document.getElementById("consumer-key");
	var startStation = document.getElementById("start-station");
	var endStation = document.getElementById("end-station");
	var languageSelect = document.getElementById("train-language");
	
	// set actions to the buttons
	document.getElementById("refresh-button").addEventListener('click', function() {
		railtime.setConsumerSecret(consumerKey.value);
		railtime.retrieveStationList(null, function(status, responseText) {
			if (status === 200) {
				stationList = JSON.parse(responseText);
				chrome.storage.local.set({ "smalltrain.stationlist" : stationList }, function() {
					return;
				});
				enableDisable();
			} else {
				alert("Retrieve stations DB failed");
			}
		});				
	});
	
	consumerKey.addEventListener("keyup", function () {
		chrome.storage.local.set({"smalltrain.consumerkey" : consumerKey.value}, function() {
			return;
		});
		enableDisable();
	});	

	languageSelect.addEventListener("change", function () {
		chrome.storage.local.set({"smalltrain.language" : languageSelect.value}, function() {
			return;
		});
		enableDisable();
	});	
	
	$("#start-station").autocomplete({
		minLength: 3,
		source: function (request, response) {
			var stationsArray = []
			var stations = searchStationsInList(request.term, 10, function(name, station) {
				stationsArray.push(name);
			});
			response(stationsArray);
		},
		select: function(event, ui) {
			startStationObj = searchStationInList(ui.item.value);
			chrome.storage.local.set({ "smalltrain.startStation" : startStationObj}, function() {
				return;
			});
			enableDisable();
		}
	});

	$("#end-station").autocomplete({
		minLength: 3,
		source: function (request, response) {
			var stationsArray = []
			var stations = searchStationsInList(request.term, 10, function(name, station) {
				stationsArray.push(name);
			});
			response(stationsArray);
		},
		select: function(event, ui) {
			endStationObj = searchStationInList(ui.item.value);
			chrome.storage.local.set({ "smalltrain.endStation" : endStationObj}, function() {
				return;
			});
			enableDisable();
		}
	});
	
	/**
	 * enalbe and disable the GUI
	 * 
	 * @private
	 * @method enableDisable
	 */
	var enableDisable = function() {
		var lang = languageSelect.value;
		
		if (consumerKey.value === undefined || consumerKey.value === "") {
			startStation.disabled = true;
			endStation.disabled = true;
		} else {
			if (stationList === undefined) {
				startStation.disabled = true;
				endStation.disabled = true;
			} else {
				startStation.disabled = false;
				endStation.disabled = false;					
			}
		}
		/* Set data values */
		if (startStationObj === undefined || startStationObj === null) {
			startStation.value = "";			
		} else {
			startStation.value = startStationObj["Name"+lang]; 			
		}
		if (endStationObj === undefined || endStationObj === null) {
			endStation.value = "";			
		} else {
			endStation.value = endStationObj["Name"+lang]; 			
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
		                   "smalltrain.endStation",
		                   "smalltrain.language"];
		var lang = "";
		
		chrome.storage.local.get(configList,
			function (items) {
				if (items["smalltrain.language"] !== undefined) {
					languageSelect.value = items["smalltrain.language"]; 		
				} else {
					lang = window.navigator.language.substr(0,2).toUpperCase();
					if (lang != "EN" &&
						lang != "NL" &&
						lang != "FR" &&
						lang != "DE") {
						languageSelect.value = "EN";
					} else {
						languageSelect.value = lang;						
					}
					
				} 
				if (items["smalltrain.consumerkey"] !== undefined){
					consumerKey.value = items["smalltrain.consumerkey"]; 				
				} else {
					consumerKey.value = "";
				}
				if (items["smalltrain.stationlist"] !== undefined) {
					stationList = items["smalltrain.stationlist"]; 				
				} else {
					stationList = undefined;
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
			station = null,
			lang = languageSelect.value;

		for (i = 0, max = stationList.length; i < max; i++) {
			station = stationList[i];
			// Search occurences beginning of a word 
			if (station["Name" + lang] === searchCriteria) {
				if (callback !== undefined) {
					callback(station["Name" + lang], station);
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
			station = null,
			lang = languageSelect.value;

		for (i = 0, cnt = 0, max = stationList.length; (i < max) && (cnt < max_values); i++) {
			station = stationList[i];
			// Search occurences beginning of a word 
			if (station["Name" + lang].search(re) !== -1) {
				result.push(station);
				if (callback !== undefined) {
					callback(station["Name" + lang], station);
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
}());

document.addEventListener('DOMContentLoaded', function () {
  optionsPage.initPage();
});