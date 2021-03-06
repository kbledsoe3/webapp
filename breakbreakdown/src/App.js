import React, { Component, PropTypes } from 'react';
import firebase from 'firebase'
import {BrowserRouter as Router, Route, browserHistory, Redirect } from 'react-router-dom'
import ApiCalendar from './ApiCalendar.js';//leave this here so it loads first
import '../node_modules/materialize-css/dist/css/materialize.css';
import '../node_modules/material-design-icons/iconfont/material-icons.css';

class App extends React.Component {
	render() {
		if (localStorage.getItem("appTokenKey")) {
    		return <Redirect to="/home" />
    	}
		firebase.auth().onAuthStateChanged(user => {
	    if (user) {
	        //console.log("User signed in: ", JSON.stringify(user));
	        localStorage.removeItem("firebaseAuthInProgress");
	        // here you could authenticate with you web server to get the
	        // application specific token so that you do not have to
	        // authenticate with firebase every time a user logs in
	        localStorage.setItem("appTokenKey", user.uid);
	        this.props.history.push("/home");
	    }
    });
		return <Redirect to="/signin" />
	}
}
export default App;
