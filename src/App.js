import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { finishAuth, getAuthUrl } from "./api";

function App() {
  const [result, setResult] = useState(null);
  const logOut = () => setResult(null);

  return (
    <Router>
      <Switch>
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

  const state = localStorage.getItem("state");
  const params = useMemo(() => {
    const search = new URLSearchParams(location.search);
    return Object.fromEntries(search.entries());
  }, [location.search]);

  const handleCallback = async (state, params) => {
    const result = await finishAuth(redirectUrl, state, params);
    onFinish(result);

    history.replace("/");
  };

  useEffect(() => {
    handleCallback(state, params);
  }, [state, params]);

  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}

export default App;
