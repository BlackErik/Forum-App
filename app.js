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
      console.log(response);
    },

    // POST /session - Attempt to Log in
    postSession: async function () {
      let response = await fetch(`${API_URL}/session`, {
        method: "POST",
      });
    },

    // POST /user - create a user
  },
  created: function () {
    this.getSession();
  },
});
