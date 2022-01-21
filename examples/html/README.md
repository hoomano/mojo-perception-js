# Mojo Perception API Web Example

Step by step example to run Mojo Perception API for web application.

## Get a fresh user token

Mojo Perception API is accessible through Authorization token.

First, get the user token to run your example.

In your terminal, replace `<YOUR_API_KEY_HERE>` by [one of your API Keys](https://app.mojo.ai) and run :
```
curl -X PUT -i -H 'Authorization: <YOUR_API_KEY_HERE>' -d '{"datetime": "2022-01-01T00:00:00.000000","expiration":360}' -H 'Content-Type: application/json' https://api.mojo.ai/mojo_perception_api/user
```

This will give you something like :
```
HTTP/2 200 
server: nginx
date: Tue, 18 Jan 2022 16:53:54 GMT
content-type: application/json
content-length: 350

{"user_namespace": "1165df3641ee4325872ac6e8796ea7cc", "event_pk": 1, "auth_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDI2ODMzMDcsInN1YiI6IjExNjVkZjM2LTQxZWUtNDMyNS04NzJhLWM2ZTg3OTZlYTdjYyIsImV4cCI6MTY0MjY5NzcwN30.MCJCG9Ef2nwRMgxyCTyAKnolE_q1kXMHNzlNWQ4K2KE", "host_name": "socket.mojo.ai", "port": "443"}
```
## Adjust code example `mojo-perception-web-example.js`

Use the `"auth_token"`, `"host_name"`, `"port"` and `"user_namespace"` in the following code section `mojo-perception-web-example.js`:
```
[...]
    mojoPerception = await loadMojoPerception(
        // Replace with your <auth_token>
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDI2ODMzMDcsInN1YiI6IjExNjVkZjM2LTQxZWUtNDMyNS04NzJhLWM2ZTg3OTZlYTdjYyIsImV4cCI6MTY0MjY5NzcwN30.MCJCG9Ef2nwRMgxyCTyAKnolE_q1kXMHNzlNWQ4K2KE",
        // Replace with <host>
        "socket.mojo.ai",
        // Replace with <port>
        "943",
        // Replace with <user_namespace>
        "1165df3641ee4325872ac6e8796ea7cc"
    );
[...]
```
## Run local HTTPS server

> ⚠️ HTTPS is [required by web browsers](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) to give access to the camera

## How to run locally

The project requires access to the camera. Camera usage by web browser is only allowed through HTTPS.

👉 We need to setup a local HTTPS server to run our experiments locally.

Detailed informations here :

> 💡 https://web.dev/how-to-use-local-https/

Process:

1. setup mkcert to create your local certificate
```
brew install mkcert
```

2. add mkcert to local root CAs
```
mkcert -install
```

3. create your local certificate in your workspace
```
mkdir local_cert
cd local_cert
mkcert -key-file ssl.key -cert-file ssl.crt localhost
```

4. install http-server
```
brew install http-server
```


5. launch the http-server within the project root directory
```
http-server --ssl --cert /path/to/local_cert/ssl.crt --key /path/to/local_cert/ssl.key
```

in your terminal, you should see something like :
```
(base) hoomanodeveloper@hoomano-developer FaceMeshDemos % http-server --ssl --cert ../local-CA/ssl.crt --key ../local-CA/ssl.key
Starting up http-server, serving ./ through https

http-server version: 14.0.0

http-server settings: 
CORS: disabled
Cache: 3600 seconds
Connection Timeout: 120 seconds
Directory Listings: visible
AutoIndex: visible
Serve GZIP Files: false
Serve Brotli Files: false
Default File Extension: none

Available on:
  https://127.0.0.1:8080
  https://192.168.1.15:8080
Hit CTRL-C to stop the server


```

## Navigate and enjoy the example

🎉 You're done.

You will navigate to your local page, for example through : `https://localhost:8080/index.html`
Once you press the "Start Example" button, the API is initialized and you get your realtime Face Expression.

## Customize the example

You can add callbacks on each emotions, add new emotions and enhance design to build your very own application.


## Troubleshooting

> 1️⃣ &nbsp; If you face a `"JsonWebTokenError"`, maybe that's because of the expiration.
> You can try to increase the user token duration to match your need. Default value of 360 seconds might be too short.


> 2️⃣ &nbsp; When you code your web application, you might have some issues because of browser caching. Don't forget to force refresh to stay up do date with your code.

## Check the usage of your API Key

Open the [Mojo Perception API Backoffice](https://app.mojo.ai) to check your consumption, and manage your account.


