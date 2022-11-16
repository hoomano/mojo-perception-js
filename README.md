# Mojo Perception Javascript API

Use Mojo Perception API as a Javascript module both for web and Node.js applications.


## Installation


If you use `npm`, install mojo-perception-js module:
```
npm install mojo-perception
```

If you only need a browser usage, add the script in the `<head>` section
```
<script type="text/javascript" src="https://developer.mojo.ai/mojo-perception.min.js"></script>
```

## Usage

### `loadMojoPerception`

This function returns a `Promise` that resolves with a `MojoPerception` object once mojo-perception.js has loaded.

```
import {loadMojoPerception} from 'mojo-perception';

const mojoPerception = await loadMojoPerception('auth_token');
```

Please note that the user token 'auth_token' is different from the API Key.

> 🙏 We take a particular care with publishable user token for web applications. See below for more info and best practices.

### Best Practices : One token per web user

To make things safe and easy, we have a REST API ready to create user tokens on-the-fly.

When using the API for a web application, you should implement a backend function that will get a token for each user. We recommend to use tokens with expiration date.

To do so, you can use the REST API of Mojo Perception API.

Below, an example using `curl`:

In your terminal, replace `<YOUR_API_KEY_HERE>` by [one of your API Keys](https://app.mojo.ai) and run :
```
curl -X PUT -i -H 'Authorization: <YOUR_API_KEY_HERE>' -d '{"datetime": "2022-01-01T00:00:00.000000","expiration":360}' -H 'Content-Type: application/json' https://api.mojo.ai/mojo_perception_api/user
```

This will give you something like this, and note that we have set `expiration: 360`, for a 60 x 60 seconds duration period :
```
HTTP/2 200 
server: nginx
date: Tue, 18 Jan 2022 16:53:54 GMT
content-type: application/json
content-length: 350

{"user_namespace": "a5fa97ded6584cb4a7ff3933aa66025c", "auth_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDI1MjQ4MzQsInN1YiI6ImE1ZmE5N2RlLWQ2NTgtNGNiNC1hN2ZmLTM5MzliYTY2MDI1YyIsImV4cCI6MTY0MjUyNDg0NH0.7FuLJ6Hmozi2DbX9zooVxYvnp_f91H4vzodstDZbLzI", "host_name": "socket.mojo.ai", "port": "443"}
```

You can use the `auth_token` and given `host_name`, `port` and `user_namespace` to configure your API endpoint in the API, with the [`setOptions()` method](https://developer.mojo.ai).


## Checkout the `Tutorials`

> 💡 &nbsp; Have a look to the tutorials section


## Troubleshooting

> 1️⃣ &nbsp; If you face a `"JsonWebTokenError"`, maybe that's because of the expiration.
> You can try to increase the user token duration to match your need. Default value of 360 seconds might be too short.


> 2️⃣ &nbsp; When you code your web application, you might have some issues because of browser caching. Don't forget to force refresh to stay up do date with your code.

## mojo-perception-js Documentation

* [mojo-perception-js Docs & API References](https://developer.mojo.ai)
* [mojo-perception-js Tutorials](https://developer.mojo.ai/tutorial-getting-started-html.html)

