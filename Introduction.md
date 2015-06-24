# Introduction #
This is a small extension to read the information of railtime to get the train-schedule from the Belgian railway.
It is mainly to learn and have fun with JavaScript.

# Details #
First you have to install it from the Google Web Store. When this is done some options must be set before you can use it:
1) Set the consumer secret. The extension is based on the Railtime Android App. The rest I leave it up to you ;-)
2) The begin station
3) The end station
4) The time to get to the station. This is used in conjunction with Small Time. At the end of the day you get a small subtle notification. These are the minutes before you have to leave the company. The delay times of the train are taken in consideration as far the extension can get the delays.

A small explanation of the departure time from the company. If you configured that you need 10 minutes to get to the station to catch the train, when the notification says 0, you still have 10 minutes to catch the train.
When you wait longer and it passes the 0, it will search for the next train.
The train schedule uses connections!