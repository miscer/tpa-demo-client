const apiUrl = "http://localhost:8080";

export async function getAuthUrl(redirectUrl) {
  const response = await fetch(apiUrl + "/auth/facebook", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      redirect_url: redirectUrl
    })
  })

  if (!response.ok) {
    throw new Error("Get auth URL request failed")
  }

  const data = await response.json();

  return {
    authUrl: data.authorization_url,
    state: data.state
  }
}

export async function finishAuth(redirectUrl, state, params) {
  const response = await fetch(apiUrl + "/auth/facebook/finish", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      redirect_url: redirectUrl,
      state: state,
      params: params,
    })
  })

  if (!response.ok) {
    throw new Error("Finish auth request failed")
  }

  const data = await response.json();

  if (data.error) {
    return {
      error: data.error,
      retryUrl: data.retry_url,
    }
  }

  return {
    email: data.email
  }
}