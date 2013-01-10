/**
 * Class for the different RESTful webservice calls of Railtime
 * 
 * @class railtime
 */
var railtime = function() {

	/* Construtor */
	var consumerSecret = null,
		consumerKey = "Android",
		baseURL = "http://services.infrabel.be/web/prd-irt/PublicCommunicationRestService.svc",
		language = "nl",
		connectionDelay = 1000;
	
	/* Private functions */
	/** 
	 * Create oauth signature for the request
	 * 
	 * @private
	 * @method sign 
	 * @param {String} method of http request GET or POST  
	 * @param {String} url of the webservice call
	 * @param {String} parameters for the webservice call
	 * @return {String} the OAuth authentication string
	 */
	var sign = function(method, url, parameters) {
		var accessor = {
			consumerSecret : this.consumerSecret,
			tokenSecret : ""
		};
		var message = {
			method : method,
			action : url,
			parameters : parameters === null ? [] : parameters 
		};
		var timestamp = OAuth.timestamp();
		var nonce = OAuth.nonce(18);

		message.parameters.push(["oauth_version", "1.0"]);
		message.parameters.push(["oauth_consumer_key", this.consumerKey]);
		message.parameters.push(["oauth_timestamp", timestamp]);
		message.parameters.push(["oauth_nonce", nonce]);
		message.parameters.push(["oauth_signature_method", "HMAC-SHA1"]);
		OAuth.SignatureMethod.sign(message, accessor);
		var authString = OAuth.getAuthorizationHeader("", message.parameters);
		console.log("authorizationHeader: " + authString);
		return authString;
	};

	/** 
	 * send message to server and call the callback when a response is available
	 * 
	 * @private
	 * @method send 
	 * @param {String} method of http request GET or POST  
	 * @param {String} url of the webservice call
	 * @param {String} parameters for the webservice call
	 * @param {Function} callback function when data is available. (function(http-status, http-response)
	 */
	var	send = function(method, url, parameters, callback) {
		var xhr = new XMLHttpRequest();
		
		if (typeof method !== 'string')
			throw "Ooooo, method validation failed";
		if (typeof url !== 'string')
			throw "Ooooo, url validation failed";
		
		if (typeof callback === 'function') {
			xhr.onreadystatechange = function() {
	  			if (this.readyState === 4) {
	  				console.log(this.status);
	  				console.log(this.responseText);
	  				callback(this.status, this.responseText);
	 			}
			}
		}
		else { 
			xhr.onreadystatechange = function() {
	  			if (this.readyState === 4) {
	  				console.log(this.responseText);
	 			}
			}
		}
		if (parameters === null) {
			xhr.open(method, url);
		}
		else {
			xhr.open(method, url + "?" + OAuth.formEncode(parameters));
			console.log(url + "?" + OAuth.formEncode(parameters));
		}
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.setRequestHeader("Authorization", this.sign(method, url, parameters));
		xhr.send(null);
	};

	/** 
	 * send message to server and call the callback when a response is available
	 * 
	 * @private
	 * @method convertDate 
	 * @param {Date} date in JavaScript Date format
	 * @return {String} return date string (YYYY-MM-DD hh:mm:ss) 
	 */
	var convertDate = function(date) {
	    // Calculate date parts and replace instances in format string accordingly
    	var result = date.getFullYear().toString();
    	result = result + "-" + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
    	result = result + "-" + (date.getDate() < 10 ? '0' : '') + date.getDate();
    	result = result + " " + (date.getHours() < 9 ? '0' : '') + date.getHours();
    	result = result + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    	result = result + ":" + (date.getSeconds() < 9 ? '0' : '') + date.getSeconds();
    	
    	return result;
	};

	/* public functions */
	return {

		/** 
		 * sets the OAuth consumer key
		 * 
		 * @method setConsumerKey
		 * @param {String}  the consumer key for the platform (Android (default), iPhone) 
		 */ 
		setConsumerKey : function(key) {
			this.consumerKey = typeof key === 'string' ? key : null;
		},
		
		/** 
		 * sets the OAuth consumer secret
		 * 
		 * @method setConsumerSecret
		 * @param {String}  the consumer secret for the platform (Android (default), iPhone), which has correspondense to the key. This can be found in the Android App.
		 */ 
		setConsumerSecret : function(passphrase) {
			this.consumerSecret = typeof passphrase === 'string' ? passphrase : null;
		},
	
		/** 
		 * sets the base URL for the webservice
		 * 
		 * @method setBaseURL
		 * @param {String}  string with the webservice URL.
		 */ 
		setBaseURL: function(url) {
			this.baseURL = typeof url ==='string' ? url : "";
		},
		
		/** 
		 * sets timeout for the connection
		 * 
		 * @method setConnectionDelay
		 * @param {Number} delay timeout
		 */ 
		setConnectionDelay: function(connectionDelay) {
			this.connectionDelay = typeof connectionDelay ==='number' ? lang : 1000;
		},
		
		/**
		 * Retrieve the configuration of the Railtime application
		 * 
		 * @method retrieveConfig
		 * @param {Function} callback function when the data is available (see message examples in doc) 
		 */
		retrieveConfig : function(callback) {
			var method = "GET";
			var url = this.baseURL + "/RetrieveConfig";
			var result = this.send(method, url, null, callback);
	
			return result;
		},
		
		/**
		 * Retrieve the status of the Railtime application
		 * 
		 * @method retrieveStatus
		 * @param {Function} callback function when the data is available (see message examples in doc) 
		 */
		retrieveStatus : function(callback) {
			var method = "GET";
			var url = this.baseURL + "/RetrieveStatus";
			var result = this.send(method, url, null, callback);
			
			return result;
		},

		/**
		 * Retrieve station schedule with stationId begin date and end date searchType and max number of responses
		 * 
		 * @method retrieveStationSchedule
		 * @param {Number} Id of the station
		 * @param {Date} Begin date for the search
		 * @param {Date} End date for the search
		 * @param {Number} maximum number of responses
		 * @param {Function} callback function when the data is available (see message examples in doc) 
		 */
		retrieveStationSchedule : function(stationId, beginDate, endDate, searchType, maxResponses, callback) {
			var method = "GET";
			var url = this.baseURL + "/RetrieveStationSchedule";
			var parameters = [];
			var result;
	
			/* default values */
			if (typeof beginDate === "undefined")
				beginDate = new Date();
			if (typeof endDate === "undefined")
				endDate = new Date(beginDate.getTime() + 10800000 );
			if (typeof searchType === "undefined")
				searchType = 1;
			if (typeof maxResponses === "undefined")
				maxResponses = 15;
	
			/* type verification of parameters */
			if (typeof stationId !== 'number')
				throw "Ooooo, statioId validation failed";
			if (typeof searchType !== 'number')
				throw "Ooooo, searchType validation failed";
			if (typeof maxResponses !== 'number')
				throw "Ooooo, maxResponse validation failed";
			if (Object.prototype.toString.call(beginDate) !== '[object Date]')
				throw "Ooooo, beginDate validation failed";
			if (Object.prototype.toString.call(endDate) !== '[object Date]')
				throw "Ooooo, endDate validation failed";
			
			/* function validation */
			if (beginDate > endDate)
				throw "Hmmm, beginDate greater then endDate";
			/* stationID=9&dateTimeFrom=2012-08-17+23%3A05%3A00&dateTimeTo=2012-08-18+02%3A05%3A00&searchType=1&maxResults=15 */		
			parameters.push(["stationID", stationId.toString()]);
			parameters.push(["dateTimeFrom", this.convertDate(beginDate)]);
			parameters.push(["dateTimeTo", this.convertDate(endDate)]);
			parameters.push(["searchType", searchType.toString()]);
			parameters.push(["maxResults", maxResponses.toString()]);
	
			return this.send(method, url, parameters, callback);
		},
		
		/**
		 * Retrieve list of all stations
		 * 
		 * @method retrieveStationList
		 * @param {Date} date of the last updated list
		 * @param {Function} callback function when the data is available (see message examples in doc) 
		 */
		retrieveStationList: function(lastUpdateDate, callback) {
			var method = "GET";
			var url = this.baseURL + "/RetrieveStationList";
			var parameters = [];
	
			if (Object.prototype.toString.call(lastUpdateDate) === '[object Date]') {
				parameters.push(["LastUpdateDate", this.convertDate(lastUpdateDate)])
			}
			else {
				parameters = null;
			}
					
			return this.send(method, url, parameters, callback);
		}, 
		
		/**
		 * Retrieve informations for the Smartphone
		 * 
		 * @method retrieveInfoMessagesForSmartPhone
		 * @param {Function} callback function when the data is available (see message examples in doc) 
		 */
		retrieveInfoMessagesForSmartPhone: function(callback) {
			var method = "GET";
			var url = this.baseURL + "/RetrieveInfoMessagesForSmartPhone?language=" + this.language + "&detailLevel=all";
					
			return this.send(method, url, null, callback);
		}, 
		
		/**
		 * RetrieveRoutes is used to calculate a route from the departion station to arrival station
		 * 
		 * @method retrieveInfoMessagesForSmartPhone
		 * @param {Number} Id of the departure station 
		 * @param {Number} Id of the arrival station 
		 * @param {Date} timestamp to calculate the route 
		 * @param {Number} this should be 1 
		 * @param {Number} the connection delay for a response
		 * @param {Number} how many results before the timestamp 
		 * @param {Number} how many results after the timestamp
		 * @param {Function} callback function when the data is available (see message examples in doc) 
		 */
		retrieveRoutes : function(departureStationId, arrivalStationId, dateTime, searchType, minTransferTime, resultCountBefore, resultCountAfter, callback) {
			var method = "GET";
			var url = this.baseURL + "/RetrieveRoutes";
			var parameters = [];
			var result;
			
			/* default values */
			if (typeof searchType === "undefined")
				searchType = 1;
			if (typeof minTransferTime === "undefined")
				minTransferTime = this.connectionDelay;
			if (typeof resultCountBefore === "undefined")
				resultCountBefore = 0;
			if (typeof resultCountAfter === "undefined")
				resultCountAfter = 3;
				
			/* type verification of parameters */
			if (typeof departureStationId !== 'number')
				throw "Ooooo, departureStationId validation failed";
			if (typeof arrivalStationId !== 'number')
				throw "Ooooo, arrivalStationId validation failed";
			if (Object.prototype.toString.call(dateTime) !== '[object Date]')
				throw "Ooooo, dateTime validation failed";
			if (typeof searchType !== 'number')
				throw "Ooooo, searchType validation failed";
			if (typeof minTransferTime !== 'number')
				throw "Ooooo, minTransferTime validation failed";
			if (typeof resultCountBefore !== 'number')
				throw "Ooooo, resultCountBefore validation failed";
			if (typeof resultCountAfter !== 'number')
				throw "Ooooo, resultCountAfter validation failed";
			
			parameters.push(["departureStationId", departureStationId.toString()]);
			parameters.push(["arrivalStationId", arrivalStationId.toString()]);
			parameters.push(["dateTime", this.convertDate(dateTime)]);
			parameters.push(["searchType", searchType.toString()]);
			parameters.push(["minTransferTime", minTransferTime.toString()]);
			parameters.push(["resultCountBefore", resultCountBefore.toString()]);
			parameters.push(["resultCountAfter", resultCountAfter.toString()]);
	
			return this.send(method, url, parameters, callback);
		},
	
		/**
		 * RetrieveTrainSchedule is used to have the schedule of a train according to its trainnumber on a specific date
		 * 
		 * @method retrieveInfoMessagesForSmartPhone
		 * @param {Number} Id of the train 
		 * @param {Date} timestamp to have the schedule 
		 * @param {Number} this should be 1 
		 * @param {Function} callback function when the data is available (see message examples in doc) 
		 */	
		retrieveTrainSchedule : function(trainNumber, requestedDate, dateType, callback) {
		/* RetrieveTrainSchedule?trainNumber=<train id>&requestedDate=<date for the train-schedule>&dateType=1&language=nl */
			var method = "GET";
			var url = this.baseURL + "/RetrieveTrainSchedule";
			var parameters = [];
			var result;
	
			/* default values */
			if (typeof requestedDate === "undefined")
				requestDate = new Date();
			if (typeof dateType === "undefined")
				dateType = 1;
	
			/* type verification of parameters */
			if (typeof trainNumber !== 'number')
				throw "Ooooo, trainNumber validation failed";
			if (Object.prototype.toString.call(requestedDate) !== '[object Date]')
				throw "Ooooo, requestDate validation failed";
			if (typeof dateType !== 'number')
				throw "Ooooo, dateType validation failed";
			
			parameters.push(["trainNumber", trainNumber.toString()]);
			parameters.push(["requestedDate", this.convertDate(requestedDate)]);
			parameters.push(["dateType", dateType.toString()]);
			parameters.push(["language", this.language]);
	
			return this.send(method, url, parameters, callback);
		}
	}
	/* end railtime object */
}; 