import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { finishAuth, getAuthUrl } from "./api";

function App() {
  // Result of the authentication process - either an error object, or a success object with an email address
  const [result, setResult] = useState(null);
  const logOut = () => setResult(null);

  return (
    <Router>
      <Switch>
        {/* This is where the third party will redirect the user after logging in */}
        <Route
          path="/auth/:provider"
          render={(props) => <AuthCallback {...props} onFinish={setResult} />}
        />

        <Route
          path="/"
          render={(props) => (
            <Content {...props} result={result} onLogOut={logOut} />
          )}
        />
      </Switch>
    </Router>
  );
}

// URL where the third party should redirect the user after loggin in
const redirectUrl = window.location.origin + "/auth/facebook";

function Content(props) {
  const { result, onLogOut } = props;

  if (result == null) {
    return <LoginForm />;
  }

  return <Result {...result} onLogOut={onLogOut} />;
}

function LoginForm() {
  const logInWithFacebook = async () => {
    const { authUrl, state } = await getAuthUrl(redirectUrl);
    // State needs to be saved so we can send it to backend later. In the real app other things would be saved as well,
    // for example the job opening slug, T&C version, page etc.
    localStorage.setItem("state", state);
    window.location.assign(authUrl);
  };

  return (
    <div>
      <button onClick={logInWithFacebook}>Log in with Facebook</button>
    </div>
  );
}

function Result(props) {
  if (props.error != null) {
    const retry = () => {
      window.location.assign(props.retryUrl);
    };

    return (
      <div>
        <p>Error: {props.error}</p>

        {props.retryUrl ? (
          <p>
            <button onClick={retry}>Try again</button>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p>Email: {props.email}</p>
      <p>
        <button onClick={() => props.onLogOut()}>Log out</button>
      </p>
    </div>
  );
}

function AuthCallback(props) {
  const { onFinish, location, history } = props;

  // State should have been saved when the user started logging in
  const state = localStorage.getItem("state");

  // Parse query parameters into a plain object
  const params = useMemo(() => {
    const search = new URLSearchParams(location.search);
    return Object.fromEntries(search.entries());
  }, [location.search]);

  const handleCallback = async (state, params) => {
    const result = await finishAuth(redirectUrl, state, params);
    onFinish(result);

    // Remove the current URL with authorization code from browser history and go back to app content
    history.replace("/");
  };

  useEffect(() => {
    handleCallback(state, params);
  }, [state, params]);

  // Show a loader while we are waiting for backend to fetch user info from the third party
  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}

export default App;
