

/**
 * class for the option page
 * 
 * @class optionsPage
 **/
var optionsPage = function() {
	var stationList = null;
	
	// Set variables to elements
	var consumerKey = document.getElementById("consumer-key");
	var startStation = document.getElementById("start-station");
	var endStation = document.getElementById("end-station");
	var saveButton = document.getElementById("save-button");
	var cancelButton = document.getElementById("cancel-button");

	// set actions to the buttons
	saveButton.addEventListener('click', function() {
		if (startStation.value !== "") {
			chrome.storage.local.set({ "smalltrain.startStation" : startStation.value}, function() {
				return;
			});
		}
		if (endStation.value !== "") {
			chrome.storage.local.set({ "smalltrain.endStation" : endStation.value}, function() {
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
			searchStationList(searchValue, 1, function (name, value) {
				startStation.value = name;
			});
		}
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
				saveButton.disabled = false;
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
		var configList = [ "smalltrain.consumerkey", "smalltrain.stationlist"];
		
		chrome.storage.local.get(configList,
			function (items) {
				if (items["smalltrain.consumerkey"] !== undefined){
					consumerKey.value = items["smalltrain.consumerkey"]; 				
				} else {
					consumerKey.value = undefined;
				}
				if (items["smalltrain.stationlist"] !== undefined) {
					stationList = items["smalltrain.stationlist"]; 				
				} else {
					stationList = undefined;
				}
				enableDisable();
			}
		);
	};
	
	/**
	 * search a station in the station Array
	 * 
	 * @private
	 * @method searchStationList
	 * @param {String} searchCriteria The string to search for in the name of the station
	 * @param {String} max_values maximum number of value returns
	 * @param {String} callback function which is calledback when one result is found
	 * @return {Array} Array of objects to the station (see station object)
	 */ 
	var searchStationList = function(searchCriteria, max_values, callback) {
		var	i = 0,
			max = 0,
			result = [],
			station = null;

		for (i = 0, max = stationList.length; i < max; i++) {
			station = stationList[i];
			// Search occurences beginning of a word 
			if (station["NameEN"].search(new RegExp("^" + searchCriteria + ".*","i")) !== -1) {
				result.push(station);
				if (callback !== undefined) {
					callback(station["NameEN"], station);
				}
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