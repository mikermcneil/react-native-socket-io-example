
// Instead of:
// - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// import SocketIOClient from 'socket.io-client';
// - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// ...
// ...we have to do:
// - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// You need to set `window.navigator` to something in order to use the socket.io
// client. You have to do it like this in order to use the debugger because the
// debugger in React Native runs in a webworker and only has a getter method for
// `window.navigator`.
window.navigator.userAgent = 'ReactNative';

// Need to require instead of import so we can set the user agent first
// This must be below your `window.navigator` hack above
var SocketIOClient = require('socket.io-client');
var SailsIOClient = require('sails.io.js');
// - - - - - - - - - - - - - - - - - - - - - - - - - - - 


import React from 'react';
import { View, Text, AsyncStorage } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

const USER_ID = '@userId';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      userId: null
    };

    this.determineUser = this.determineUser.bind(this);
    this.onReceivedMessage = this.onReceivedMessage.bind(this);
    this.onSend = this.onSend.bind(this);
    this._storeMessages = this._storeMessages.bind(this);

    // // alert('here we go!');
    // // var socket = SocketIOClient('ws://noses:nossession@localhost:1337', {
    // var socket = SocketIOClient('http://localhost:1337', {
    //   transports: ['websocket'], // you need to explicitly tell it to use websockets
    //   query: {
    //     nosession: true
    //   },
    //   // transportOptions: {
    //   //   websocket: {
    //   //     extraHeaders:{
    //   //       foobar: 'asdf',
    //   //       Authorization: 'whee',
    //   //       'Sec-WebSocket-Protocol': 'bleh',
    //   //       'sec-websocket-protocol': 'blehlowercase'
    //   //     }
    //   //   }
    //   // }
    //   // extraHeaders: {
    //   //   // nosession: true,
    //   //   // 'Sec-WebSocket-Protocol': 'foobar'
    //   //   'sec-websocket-protocol': 'foobar'
    //   // }
    // });
    // socket.on('connect', function (){
    //   console.log('connected!');
    // });
    // var self = this;
    // socket.on('zone', function (msg){
    //   console.log('Received message about zone:', msg);
    // });
    // socket.on('user', function (msg){
    //   console.log('Received message about user:', msg);
    // });
    // socket.on('message', function (msg){
    //   console.log('Received something else..?', msg);
    //   self.onReceivedMessage(msg);
    // });


    // Instantiate the socket client (`io`)
    // (for now, you must explicitly pass in the socket.io client when using this library from Node.js)
    var io = SailsIOClient(SocketIOClient);

    // Set some options:
    // (you have to specify the host and port of the Sails backend when using this library from Node.js)
    io.sails.url = 'http://localhost:1337';
    io.sails.query = 'nosession=true';
    // ...

    this.socket = io.socket;

    this.determineUser();
  }

  /**
   * When a user joins the chatroom, check if they are an existing user.
   * If they aren't, then ask the server for a userId.
   * Set the userId to the component's state.
   */
  determineUser() {
    AsyncStorage.getItem(USER_ID)
      .then((userId) => {
        // If there isn't a stored userId, then fetch one from the server.
        if (!userId) {
          // this.socket.emit('userJoined', null);
          // this.socket.on('userJoined', (userId) => {
          //   AsyncStorage.setItem(USER_ID, userId);
          //   this.setState({ userId });
          // });
        } else {
          // this.socket.emit('userJoined', userId);
          this.setState({ userId });
        }
      })
      .catch((e) => alert(e));
  }

  // Event listeners
  /**
   * When the server sends a message to this.
   */
  onReceivedMessage(messages) {
    this._storeMessages(messages);
  }

  /**
   * When a message is sent, send the message to the server
   * and store it in this component's state.
   */
  onSend(messages=[]) {
    // this.socket.emit('message', messages[0]);
    this._storeMessages(messages);
  }

  render() {
    var user = { _id: this.state.userId || -1 };

    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.onSend}
        user={user}
      />
    );
  }

  // Helper functions
  _storeMessages(messages) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });
  }
}

module.exports = Main;
