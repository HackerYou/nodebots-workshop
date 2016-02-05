# Nodebots Workshop!

<img src="imgs/nodebots.png" width="200px" />


You have been supplied with a small kit to make a 2wd robot!

You should have:

- 1 Arduino board  
- 1 Motor Driver 
- 1 2WD Robot chasis 
- 1 USB Cable
- Various jumper wires


## Putting the pieces together

For this workshop we will be spending only a little time working with the actual electronics. Lets talk through the pieces you have together!

First you have an Arduino board, this is the platform in which we will program our robots! 

You also have a motor driver that will drive the motors attached to the chassis. This driver is a special chip that allows use to control the motors in both directions. It is built specially to allow us to change the direction of the current flowing through the motors so that they can go forward or backward.

You will see on the Arduino that there are bunch of pins with number on them, we will be using these to connect out driver to the board. 

There are three types of pins on the board Digital, Analog and PWM. Let's look at Digital and PWM

A Digital input will be a signal that is either On or Off.

With a PWM signal we are able to control the signal in a broader range, not just on or off. We will be using this for the motors, so we can control the speed!

### Connect the motors

We will need to connect the motors to the four orange wires that are coming out of the motor driver. 

Make sure when you connect it the red wires are on the outside and the black wires are on the inside.

	  [][][][][][]
	 --------------
	|              |
	|    Driver    |
	|              |
	 --------------
	[  ][  ][  ][  ]
	 ||  ||	 ||  ||
	 R   B    B   R



Now lets connect it to the board.

	 	 R    B     B    R
		 ||	  ||   ||   ||
	    [  ] [  ] [  ] [  ] 
	 ------------------------
	|                        |
	|                        |
	|         Driver         |
	|                        |
	|                        |
	[a2][a1][vcc][gnd][b2][b1]
	 ||  ||   ||  ||   ||  ||
	 ||  ||   ||  ||   ||  ||
	 ||  ||   ||  ||   ||  ||
	  4	 ~5	  5v  gnd   2  ~3  <-- Adruino Ports



## Getting started with johnny-five!

In order to get our node script on the board we need to install a program on it first.

Open the Adruino IDE, Go to

Tool -> Board 

And make sure that is says the type of board you have! If not pick it from the menu.

Next go:

File -> Examples -> Firmata -> StandardFirmata

This is a program used as a protocol to communicate with the computer and the micro controller(Arduino).

When you have selected that click the Upload button in the IDE(top left arrow).

You have been provided with a simple `bot.js` file. This will be were we work!

To start we have to import `johnny-five` from npm and create a new board.

	const j5 = require('johnny-five');
	const board = new j5.Board();

The `johnny-five` board has some events on it! In order to know when our board is ready we will use the `ready` event.

	board.on('ready', function() {
		console.log('Board Ready!');
	});

Before we get too far lets make sure our boards are connected! In your terminal run `node bot.js`. If there are no errors, soon you should see `>> Board Ready!`.


### Programming our first motor

So now we have a board connected lets get one of our motors going!

Johnny-five comes with a whole bunch of available classes for us to use! We will be using the [Motor](https://github.com/rwaldron/johnny-five/blob/master/docs/motor-directional.md) class!

To create a new motor, we can do this:

	const motor = new j5.Motor({
		//Options in here
	});

This creates a new motor for us to interact with! We need to tell the motor what pins it is connected too. We already connected our motors, so lets set up the first one.

	const motor = new j5.Motor({
		pins: {
			pwm: 3,
			dir: 2
		},
		invertPWM: true
	});

The motor class accepts a bunch of options, we will use the `pins` object to set up with pins are used for our direction(`dir`) and the `pwm` pin. We also have to set `invertPWM` to true, so that it is not on right away!

#### The REPL

Now the `motor` object has quite a few methods on it, we could call them from our code, but an easy way to play around with these is to make them available in our terminal. Every board comes with a REPL that we can inject things into. Just below the motor lets add:

	this.repl.inject({
		motor: motor
	});

Running `node bot.js` again should throw no errors, and we should see our `>> Board Ready!` message. But NOW we are able to use the `motor` in our terminal. 

There are a few methods we will look at 

 Method Name | Options | Description 
------------ | ------- | -----------
 .start(speed) | 0 - 255 |  Start the motor!
 .stop() | | Stop the motor!
 .forward(speed) | 0 - 255 | Make the motor go forward
 . reverse(speed) | 0 - 255 | Make the motor reverse


Let's play with our motor's now!

#### Board Methods

The board has some methods on it as well! One that helpful is the `.wait()` method


 Method Name | Options | Description 
------------ | ------- | -----------
 .wait(time,cb()) | milliseconds, callback function |  Start the motor!

 For example we can do something like this
 	
	motor.forward(255);
	board.wait(2000,() => {
		motor.stop();
	});

#### Motor Events

The motors also emit events. These events follow the names of the methods from above!

`start`, `stop`, `forward`, `reverse`. To use these we can follow this pattern.


	motor.on('start',() => {
		board.wait(2000,() => {
			motor.stop();
		});
	});


Take some time and add the second motor!

### Socket.io

We have a functioning machine now! Lets look at a fun way to interact with it!

Socket.io is a web sockets library that allows us to create real time data flow!

I have also supplied a `socketserver.js` file and an `index.html` file for us to use.

	'use strict'

	const socket = require('socket.io');
	const express = require('express');
	const http = require('http');
	const app = express();
	const server = http.createServer(app);

	const io = socket(server);

	io.on('connection', function(socket) {
		socket.emit('test',{message: 'HI'});

	});

	io.listen('4555');


This will create a simple socket server. In our `index.html` file I have added
some code as well.

	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Socket Server</title>
	</head>
	<body>
		<script src="https://cdn.socket.io/socket.io-1.3.5.js"></script>
		<script>
		var socket = io(("http://localhost:4555"));
		socket.on('connection', function() {
			socket.on('test', function(data) {
				console.log(data);
			});
		});

		</script>
	</body>
	</html>


In our `bot.js` file we can change the code to look like this.

	const j5 = require('johnny-five');
	const board = new j5.Board();
	const io = require('socket.io-client');
	const socketIO = require('socket.io');
	const http = require('http');

	socketIO.listen('4556');
	var socket = io.connect('http://localhost:4555');
	socket.on('connect', function() {

		board.on('ready', function() {
			console.log('Board connected!');
			socket.on('test',(data) => {
				console.log(data);
			});

			//...

		});
	});

Now we are able to connect to our robots from the WEB! And you can have more than one connection to the socket server to push data!!










