// const { post } = require("../server/server");

const API_URL = "http://localhost:8080";

var app = new Vue({
  el: "#app",
  data: {
    page: "login",
    loginEmailInput: "",
    loginPasswordInput: "",

    errorMessage: "",

    searchInput: "",

    newEmailInput: "",
    newPasswordInput: "",
    newFullNameInput: "",
    newRoleInput: "",

    threadTitleInput: "",
    threadDescriptionInput: "",
    threadCategoryInput: "",

    postInput: "",

    threads: [],
    currentThread: [],
    currentUser: {},
  },
  methods: {
    changeClass(index) {
      if (this.threads[index].user.role == "admin") {
        return "green";
      }
    },

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
        this.page = "logged in";
      } else if (response.status == 401) {
        // not logged in
        console.log("Not logged in");
        let data = await response.json();
        console.log(data);
      } else {
        console.log("Some Error in GET /session", response.status, response);
      }
      await this.getUser();
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

      // was the login successful
      if (response.status == 201) {
        console.log("Successful login attempt");

        this.loginEmailInput = "";
        this.loginPasswordInput = "";

        this.errorMessage = "";
        this.page = "logged in";
        // take user to a home page
        await this.getUser();
      } else if (response.status == 401) {
        console.log("Unsuccessful login attempt");
        this.errorMessage = "Unsuccessful login";

        this.loginPasswordInput = "";
      } else {
        console.log("Some error in POST /session", response.status, response);
        this.errorMessage = "Unsuccessful login";
      }
    },

    // POST /user - create a user
    postUser: async function () {
      let registrationCredentials = {
        username: this.newEmailInput,
        fullname: this.newFullNameInput,
        password: this.newPasswordInput,
        role: this.newRoleInput,
      };

      let response = await fetch(`${API_URL}/users`, {
        method: "POST",
        body: JSON.stringify(registrationCredentials),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      let body = response.json();
      console.log(body);
      if (response.status == 201) {
        console.log("sucessful create user attempt");
        this.newEmailInput = "";
        this.newPasswordInput = "";
        this.newFullNameInput = "";
        this.page = "login";
        this.errorMessage = "";
      } else {
        console.log("Some error in POST /user", response.status, response);
        this.errorMessage = "Registration Unsuccessful";
      }
    },

    getThreads: async function () {
      let response = await fetch(`${API_URL}/thread`, {
        credentials: "include",
      });
      let data = await response.json();
      this.threads = data;
      console.log(data);
    },

    getThread: async function (id) {
      let response = await fetch(`${API_URL}/thread/${id}/`);
      let data = await response.json();
      this.currentThread = data;
      console.log(data);
    },

    getUser: async function () {
      let response = await fetch(`${API_URL}/users/`);
      let data = await response.json();
      this.currentUser = data;
      console.log(data);
      console.log("user gotten: ", data);
    },

    postThread: async function () {
      let newThread = {
        name: this.threadTitleInput,
        description: this.threadDescriptionInput,
        category: this.threadCategoryInput,
      };
      let response = await fetch(`${API_URL}/thread`, {
        method: "POST",
        body: JSON.stringify(newThread),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      let data = await response.json();
      console.log(data);
      this.getThreads();
      this.threadTitleInput = "";
      this.threadDescriptionInput = "";
      this.threadCategoryInput = "";
    },

    postPosts: async function (id) {
      let newPost = {
        body: this.postInput,
        thread_id: id,
      };
      let response = await fetch(`${API_URL}/post`, {
        method: "POST",
        body: JSON.stringify(newPost),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      let data = await response.json();
      console.log(data);
      this.getThread(id);
      this.postInput = "";
    },

    deleteThread: async function (id) {
      let response = await fetch(`${API_URL}/thread/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      let data = await response.json();
      console.log(data);
      this.getThreads();
    },

    deletePost: async function (threadid, postid) {
      let response = await fetch(
        `${API_URL}/thread/${threadid}/post/${postid}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      let data = await response.json();
      console.log(data);
      this.getThread(threadid);
    },

    checkIfDeleteable: function (thread) {
      if (
        this.currentUser.id == thread.user._id ||
        this.currentUser.role == "admin"
      ) {
        return true;
      }
    },
  },
  created: function () {
    this.getSession();
    this.getThreads();
  },
  computed: {
    filteredThreads: function () {
      var threadArray = [...this.threads];
      var searchString = this.searchInput;

      searchString = searchString.trim().toLowerCase();

      threadArray = threadArray.filter((thread) => {
        if (thread.name.toLowerCase().indexOf(searchString) != -1) {
          return thread;
        }
      });
      return threadArray;
    },
  },
  // pseudocode for checking if a delete button should be shown:
  // checkIfDeletable()
  // if user.id == post.user.id || user.role == "admin" {
  //    showDeleteButton
  // }
});
