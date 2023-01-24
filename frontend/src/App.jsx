import { useState, useEffect } from "react";
import Login from "./components/Login";
import Header from "./components/Header";
import {
  registerOnAuthError,
  unregisterOnAuthError,
} from "./services/general.js";
import axios from "axios";
import RestaurantList from "./components/RestaurantList";
import './App.scss'

function useIsAuthorized() {
  const [authTokenValidity, setAuthTokenValidity] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // checks on startup (and on authAccessToken change) if we have a token
    // Registers a listener for auth errors that logs the user out
    const listenerId = registerOnAuthError(
      () => {
        logout();
      }
    );
    if (localStorage.getItem("token")) {
      const token = localStorage.getItem("token")
      checkTokenValidity(token).then((isValid) => {
        if (isValid) {
          const values = ['username', 'password', 'token', 'userId'].map((key) => {
            return localStorage.getItem(key)
          })
          setUserData(...values)
        }
      })
    }

    return () => {
      unregisterOnAuthError(listenerId);
    };
  }, []);

  function setUserData(username, password, token, userId) {
    const user = {
      username,
      password,
      token,
      userId
    }
    setUser(user)
    Array.from(Object.entries(user)).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })
  }

  async function checkTokenValidity(token) {
    try {
      await axios.get("/api/auth/checkTokenValidity", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuthTokenValidity(true)
      return true
    } catch (error) {
      setAuthTokenValidity(false)
      return false
    }
  }

  async function auth(endpoint, username, password) {
    console.log(username, password);

    if (!username || !password) {
      console.log("missing username or password");
      return;
    }

    try {
      const response = await axios.post("/api/auth/" + endpoint, {
        username: username,
        password: password,
      });
      const { token, userId } = response.data;

      console.log(endpoint.toUpperCase() + " SUCCESSFUL");

      const isValid = await checkTokenValidity(token);
      if (isValid) {
        console.log('Token valid!')
        setUserData(username, password, token, userId)
      } else {
        console.log('Token not valid!')
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function register(username, password) {
    auth("register", username, password);
  }

  async function login(username, password) {
    auth("login", username, password);
  }

  async function logout() {
    // removes the token and updates the App useEffect to check the token validity, were it will fail
    setAuthTokenValidity(false);
    setUserData()
  }

  return { register, login, logout, user, isAuthorized: authTokenValidity };
}

function App() {
  const { register, login, logout, user, isAuthorized } = useIsAuthorized();

  const onGetAllUsers = async () => {
    try {
      const response = await axios.get("api/auth/", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      {!isAuthorized && <Login login={login} register={register} />}

      {isAuthorized && (
        <main className="mainPage">
          <Header logout={logout} username={user.username} />
          <RestaurantList userId={user.userId} token={user.token} />
        </main>
      )}
    </div>
  );
}

export default App;
