const API_URL = "https://forum2022.codeschool.cloud";

var app = new Vue({
  el: "#app",
  data: {
    page: "login",
    loginEmailInput: "",
    loginPasswordInput: "",

    newEmailInput: "",
    newPasswordInput: "",
    newFullNameInput: "",
  },
  methods: {
    //GET /session - Asks the server if we are logged in
    getSession: async function () {
      let response = await fetch(`${API_URL}/session`, {
        // method: "GET",
        credentials: "include",
      });
      // Are we logged in?
      if (response.status == 200) {
        // logged in
        console.log("logged in ");
        let data = await response.json();
        console.log(data);
      } else if (response.status == 401) {
        // not logged in
        console.log("Not logged in");
        let data = await response.json();
        console.log(data);
      } else {
        console.log("Some Error in GET /session", response.status, response);
      }
    },

    // POST /session - Attempt to Log in
    postSession: async function () {
      let loginCredentials = {
        username: this.loginEmailInput,
        password: this.loginPasswordInput,
      };

      let response = await fetch(`${API_URL}/session`, {
        method: "POST",
        body: JSON.stringify(loginCredentials),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // parse response body
      let body = response.json();
      console.log(body);

      // was the login successful
      if (response.status == 201) {
        console.log("Successful login attempt");

        this.loginEmailInput = "";
        this.loginPasswordInput = "";

        // take user to a home page
      } else if (response.status == 401) {
        console.log("Unsuccessful login attempt");
        alert("Unsuccessful login");

        this.loginPasswordInput = "";
      } else {
        console.log("Some error in POST /session", response.status, response);
      }
    },

    // POST /user - create a user
  },
  created: function () {
    this.getSession();
  },
});
