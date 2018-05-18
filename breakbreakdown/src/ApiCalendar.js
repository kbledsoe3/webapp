const Config = {
  "clientId": "534313689390-4fq78tg8hg3ucvrr5caj7qjc6255hq77.apps.googleusercontent.com",
  "apiKey": "AIzaSyDk_qX1ujvEGokVrS6iM7BB2NyT9eFYEws",
  "scope": "https://www.googleapis.com/auth/calendar",
  "discoveryDocs": ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
};

class ApiCalendar {
    constructor() {
        this.sign = false;
        this.gapi = null;
        this.onLoadCallback = null;
        this.calendar = 'primary';
        this.updateSigninStatus = this.updateSigninStatus.bind(this);
        this.initClient = this.initClient.bind(this);
        this.handleSignoutClick = this.handleSignoutClick.bind(this);
        this.handleAuthClick = this.handleAuthClick.bind(this);
        this.createEvent = this.createEvent.bind(this);
        this.listUpcomingEvents = this.listUpcomingEvents.bind(this);
        this.createEventFromNow = this.createEventFromNow.bind(this);
        this.listenSign = this.listenSign.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.setCalendar = this.setCalendar.bind(this);
        this.handleClientLoad();
    }
    /**
     * Update connection status.
     * @param {boolean} isSignedIn
     */
    updateSigninStatus(isSignedIn) {
        this.sign = isSignedIn;
    }
    /**
     * Auth to the google Api.
     */
    initClient() {
      this.gapi = window['gapi'];
      this.gapi.client.init(Config)
          .then(() => {
          // Listen for sign-in state changes.
          this.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);
          // Handle the initial sign-in state.
          this.updateSigninStatus(this.gapi.auth2.getAuthInstance().isSignedIn.get());
          if (this.onLoadCallback) {
              this.onLoadCallback();
          }
      });
    }

    loadClientWhenGapiReady = (script) => {
      console.log('Trying To Load Client!');
      console.log(script)
      if(script.getAttribute('gapi_processed')){
        console.log('Client is ready! Now you can access gapi. :)');
        window['gapi'].load('client:auth2', this.initClient);
      }
      else{
        console.log('Client wasn\'t ready, trying again in 100ms');
        setTimeout(() => {this.loadClientWhenGapiReady(script)}, 100);
      }

    }
    /**
     * Init Google Api
     * And create gapi in global
     */
    handleClientLoad() {
      console.log('Initializing GAPI...');
      console.log('Creating the google script tag...');

      const script = document.createElement("script");
      script.onload = () => {
        console.log('Loaded script, now loading our api...')
        // Gapi isn't available immediately so we have to wait until it is to use gapi.
        this.loadClientWhenGapiReady(script);
        //window['gapi'].load('client:auth2', this.initClient);
      };
      script.src = "https://apis.google.com/js/client.js";
      document.body.appendChild(script);
    }
    /**
     * Sign in Google user account
     */
    handleAuthClick() {
        if (this.gapi) {
            this.gapi.auth2.getAuthInstance().signIn();
        } else {
            console.log("Error: this.gapi not loaded");
        }
    }
    /**
     * Set the default attribute calendar
     * @param {string} newCalendar
     */
    setCalendar(newCalendar) {
        this.calendar = newCalendar;
    }
    /**
     * Execute the callback function when a user is disconnected or connected with the sign status.
     * @param callback
     */
    listenSign(callback) {
        if (this.gapi) {
            this.gapi.auth2.getAuthInstance().isSignedIn.listen(callback);
        }
        else {
            console.log("Error: this.gapi not loaded");
        }
    }
    /**
     * Execute the callback function when gapi is loaded
     * @param callback
     */
    onLoad(callback) {
        if (this.gapi) {
            callback();
        }
        else {
            this.onLoadCallback = callback;
        }
    }
    /**
     * Sign out user google account
     */
    handleSignoutClick() {
        if (this.gapi) {
            this.gapi.auth2.getAuthInstance().signOut();
        }
        else {
            console.log("Error: this.gapi not loaded");
        }
    }
    /**
     * List all events in the calendar
     * @param {number} maxResults to see
     * @param {string} calendarId to see by default use the calendar attribute
     * @returns {any}
     */
    listUpcomingEvents(maxResults, calendarId = this.calendar) {
        if (this.gapi) {
            return this.gapi.client.calendar.events.list({
                'calendarId': calendarId,
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': maxResults,
                'orderBy': 'startTime'
            });
        }
        else {
            console.log("Error: this.gapi not loaded");
            return false;
        }
    }
    /**
     * Create an event from the current time for a certain period
     * @param {number} time in minutes for the event
     * @param {string} summary of the event
     * @param {string} description of the event
     * @param {string} calendarId
     * @returns {any}
     */
    createEventFromNow({ time, summary, description = '' }, calendarId = this.calendar) {
        const event = {
            summary,
            description,
            start: {
                dateTime: (new Date()).toISOString(),
                timeZone: "Europe/Paris",
            },
            end: {
                dateTime: (new Date(new Date().getTime() + time * 60000)),
                timeZone: "Europe/Paris",
            }
        };
        return this.gapi.client.calendar.events.insert({
            'calendarId': calendarId,
            'resource': event,
        });
    }
    /**
     * Create Calendar event
     * @param {string} calendarId for the event.
     * @param {object} event with start and end dateTime
     * @returns {any}
     */
    createEvent(event, calendarId = this.calendar) {
        return this.gapi.client.calendar.events.insert({
            'calendarId': calendarId,
            'resource': event,
        });
    }
}
const apiCalendar = new ApiCalendar();
export default apiCalendar;
