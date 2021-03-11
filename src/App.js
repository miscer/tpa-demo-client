import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { finishAuth, getAuthUrl } from "./api";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/auth/:provider" component={AuthCallback} />
        <Route path="/" component={LoginForm} />
      </Switch>
    </Router>
  );
}

const redirectUrl = window.location.origin + "/auth/facebook";

function LoginForm(props) {
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

function AuthCallback(props) {
  const state = localStorage.getItem("state");
  const params = useMemo(() => {
    const search = new URLSearchParams(props.location.search);
    return Object.fromEntries(search.entries());
  }, [props.location.search]);
  const [result, setResult] = useState(null);

  const handleCallback = async (state, params) => {
    const result = await finishAuth(redirectUrl, state, params);
    setResult(result);
  };

  useEffect(() => {
    handleCallback(state, params);
  }, [state, params]);

  if (result == null) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return <Result {...result} />;
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

        <p>
          <Link to="/">Back</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>Email: {props.email}</p>
      <p>
        <Link to="/">Back</Link>
      </p>
    </div>
  );
}

export default App;
