/**
 * @license
 * Copyright 2022 Hoomano SAS. All Rights Reserved.
 * Licensed under the MIT License, (the "License");
 * you may not use this file except in compliance with the License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * =============================================================================
 */

//import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

if (typeof window === "undefined") {
  const faceLandmarksDetection = require("@tensorflow-models/face-landmarks-detection");
  global.faceLandmarksDetection = faceLandmarksDetection;
}

class MojoPerceptionAPI {
  /**
   * @class Javascript Client for Mojo Perception API
   * See README for a procedure to generate the required parameters :
   *   auth_token, host, port and user_namespace
   *
   * @param  {string} auth_token     Token generated from a valid API Key.
   * @param  {string} host           API Stream host
   * @param  {string} port           API Stream port
   * @param  {string} user_namespace Namespace of the current token
   */
  constructor(auth_token, host, port, user_namespace) {
    if (
      auth_token == null ||
      host == null ||
      port == null ||
      user_namespace == null
    ) {
      console.error("Mojo Perception API : invalid inputs");
      return null;
    }
    /**
     * @readonly
     * @prop set to true when successfully loaded camera and connected to socketio stream
     * @default false
     */
    this.initialized = false;

    /**
     * @prop access key given by the API backend (access token with expiration date depending on the subscription)
     */
    this.auth_token = auth_token;

    /**
     *@prop socket io stream host
     */
    this.host = host;

    /**
     *@prop socket io stream port
     */
    this.port = port;

    /**
     *@prop namespace for the user token
     */
    this.user_namespace = user_namespace;

    /**
     *@prop Complete URI for connection to Socket IO server
     */
    this.socketIoURI =
      "https://" + this.host + ":" + this.port + "/" + this.user_namespace;

    /**
     *@prop Default emotions computed by the API
     *@default ["attention","confusion","surprise","amusement","engagement","interaction"]
     */
    this.emotions = [
      "attention",
      "confusion",
      "surprise",
      "amusement",
      "engagement",
      "interaction"
    ];

    /**
     *@prop flag to indicate if the API subscribes to real-time calculation (optional)
     */
    this.subscribeRealtimeOutput = false;

    /**
     *@prop socket io
     */
    this.apiSocket = null;

    /**
     *@prop set to false to stop sending to the API
     */
    this.sending = false;

    /**
     *@prop performance evaluated while computing
     */
    this.fps;

    /**
     *@prop Variable to use the model that extract anonymized facial keypoints
     */
    this.model;

    /**
     *@prop indicates when the asynchronous model loading procedure is done
     */
    this.modelLoaded = false;

    /**
     * @prop maximum waiting time for the model to be downloaded after a camera launch. 30 sec default.
     */
    this.maxWaitingTime = 30000; // milliseconds

    /**
     * @prop step for retrying to check if model is downloaded. 100 ms default.
     */
    this.stepWaitingTime = 100; // milliseconds

    /**
     * estimate the waiting time of the model to be downloaded in ms.
     */
    this.currentWaitingTime = 0;

    /**
     *@prop handler for real-time attention calculation received
     */
    this.attentionCallback;

    /**
     *@prop handler for real-time confusion calculation received
     */
    this.amusementCallback;

    /**
     *@prop handler for real-time surprise calculation received
     */
    this.confusionCallback;

    /**
     *@prop handler for real-time amusement calculation received
     */
    this.surpriseCallback;

    /**
     *@prop handler for real-time engagement calculation received
     */
    this.engagementCallback;

    /**
     *@prop handler for real-time interaction calculation received
     */
    this.interactionCallback;

    /**
     *@prop called when camera is loaded + socketio connected + facemesh calculation loop warmed up
     */
    this.warmUpDoneCallback;
    this.warmUpDoneCallbackDone = false;

    /**
     *@prop Default name for video tag in browser mode
     *@default "video_display"
     */
    this.videoSectionName = "video_display";

    /**
     * @prop HTML document node to attach video
     * @type {Node}
     */
    this.nodeToAttachVideo = null;

    /**
     * @prop optional parameters for the HTML video node element
     * @type {json}
     */
    this.videoNodeParameters = null;

    /**
     *@prop Indicate if the first emit has been done to the SocketIO stream server
     */
    this.firstEmitDone = false;

    /**
     *@prop called when first emit to SocketIO stream server has been done
     */
    this.firstEmitDoneCallback;

    /**
     * @prop called if an error occurs
     */
    this.onErrorCallback;

    /**
     * @prop stream of the user camera if granted, default null
     */
    this.stream = null;

    /**
     * @prop True if camera access has been successfully granted by the user, default false
     */
    this.isCameraAccessGranted = false;

    /**
     * @prop x position of the detected user's nose point
     */
    this.noseX = null;


    /**
     * @prop video image width
     */
    this.videoWidth = null;



  }

  /**
   * Set options for MojoPerceptionAPI, to change the list of emotions calculated and
   * manage subscription to realtime output
   * @param {dict} options options["emotions"] : list of emotions to be calculated by the API
   *                       options["subscribeRealtimeOutput"] : boolean, true to activate the callbacks @see attentionCallback
   */
  setOptions(options) {
    try {
      if (options["emotions"] != null) {
        this.emotions = options["emotions"];
      }
      if (options["subscribeRealtimeOutput"] != null) {
        this.subscribeRealtimeOutput = options["subscribeRealtimeOutput"];
      }
    } catch (e) {
      console.error("Could not setOptions " + options);
    }
  }

  /**
   * Return a string representing the MojoPerceptionAPI object
   * @return {string} emotions, socketIoURI, subscription status and key
   */
  toString() {
    return `\nemotions=${this.emotions}\nsocketIoURI=${this.socketIoURI}\nsubscribeRealtimeOutput=${this.subscribeRealtimeOutput}\nkey=${this.auth_token}`;
  }

  /**
   * Initialize MojoPerceptionAPI, called once. Place default callbacks on
   * calculation reception for each emotion and load the anonymization model
   * @return {bool} true
   */
  async init() {
    return new Promise(async (resolve, reject) => {
      try {
        this.attentionCallback = this.defaultCallback;
        this.amusementCallback = this.defaultCallback;
        this.confusionCallback = this.defaultCallback;
        this.surpriseCallback = this.defaultCallback;
        this.engagementCallback = this.defaultCallback;
        this.interactionCallback = this.defaultCallback;

        this.warmUpDoneCallback = this.defaultCallback;

        this.onErrorCallback = this.defaultCallback;

        this.firstEmitDoneCallback = this.defaultFirstEmitDoneFallback;

        this.fps = 0;
        // Load the model to get anonymzed facial keypoints
        this.model = await faceLandmarksDetection.load(
          faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        );

        this.modelLoaded = true;

        resolve(true);
      } catch (e) {
        this.onErrorCallback(e);
        reject(e);
      }
    });
  }

  /**
   * Used by default for all callbacks. Does nothing
   * @param  {string} message not used
   */
  defaultCallback(message) {
    return;
  }

  /**
   * Called when the first emit to the Stream SocketIO server is done
   * @param  {string} message not used
   */
  defaultFirstEmitDoneFallback(message) {
    return;
  }

  /**
   * Waiting loop for initialization purpose, if API calls done before model downloaded
   */
  waitLoadingModelFinished() {
    return new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
        reject("timeout while loading model");
      }, 10000);
      const interval = setInterval(() => {
        if (this.model != null && this.modelLoaded) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * While model is loaded, get access to the camera and connect to socketIO
   */
  async startCameraAndConnectAPI() {
    try {
      if (this.model == null || this.modelLoaded == false) {
        console.log("🔴 this.model is null or modelLoaded==false => wait for init to stop");
        await this.waitLoadingModelFinished();
      }

      /// Context browser
      if (typeof window !== "undefined") {
        // Set up front-facing camera
        try {
          await this.setupCameraFromBrowser();
        } catch (e) {
          this.onErrorCallback("Error accessing the camera: " + e);
          console.error("Error accessing the camera: " + e);
          console.error(
            "Video not available. Check if the connection is HTTPS (mandatory):\nhttps://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia"
          );
          return;
        }
      } else {
        /**
         * @todo setup camera in node library mode
         */
        console.log("TODO setup camera from node library");
      }
      if (this.isCameraAccessGranted != true) {
        this.onErrorCallback("No camera available");
        return;
      }
      // connect to socketIO
      this.apiSocket = io(this.socketIoURI, {
        transports: ["websocket", "polling"],
        auth: {
          "token": this.auth_token
        }
      });

      // callback on messages
      if (this.subscribeRealtimeOutput) {
        this.apiSocket.on("calculation", (msg) => {
          if (msg["surprise"] != null) {
            this.surpriseCallback(msg["surprise"]);
          }
          if (msg["amusement"] != null) {
            this.amusementCallback(msg["amusement"]);
          }
          if (msg["confusion"] != null) {
            this.confusionCallback(msg["confusion"]);
          }
          if (msg["attention"] != null) {
            this.attentionCallback(msg["attention"]);
          }
          if (msg["engagement"] != null) {
            this.engagementCallback(msg["engagement"]);
          }
          if (msg["interaction"] != null) {
            this.interactionCallback(msg["interaction"]);
          }
        });
      }

      // Handler if error
      this.apiSocket.on("error", async (msg) => {
        console.error("socket error : " + msg);
        this.onErrorCallback(msg);
        await this.stopFacialExpressionRecognitionAPI();
      });
      document.getElementById(this.videoSectionName).play();
      return new Promise((resolve) => {
        this.apiSocket.on("connect", () => {
          this.initialized = true;
          resolve(this.initialized);
        });
      });
    } catch (e) {
      this.onErrorCallback(e);
      console.error("Error during initialization : ${e} " + e);
    }
  }

  /**
   * Setup camera in browser context
   * @return {Future} video tag
   */
  async setupCameraFromBrowser() {
    var video = document.createElement("video");
    var isIphone = /iPhone/.test(navigator.userAgent);
    if (isIphone && this.nodeToAttachVideo == null) {
      this.nodeToAttachVideo = document.createElement("input_video");
      document.body.appendChild(this.nodeToAttachVideo);
      this.videoNodeParameters = {
        autoplay: true,
        muted: true,
        playsinline: true,
      };
      this.nodeToAttachVideo.hidden = true;
    }
    video.autoplay = true;
    video.muted = true;
    video.playsinline = true;
    video.id = this.videoSectionName;
    // Set parameters to hide video if no parent node given
    if (this.nodeToAttachVideo == null) {
      video.width = 1;
      video.style.zIndex = -1;
      video.className = "fixed-top";
      document.body.appendChild(video);
    } else {
      if (this.videoNodeParameters != null) {
        for (var paramKey in this.videoNodeParameters) {
          video.setAttribute(paramKey, this.videoNodeParameters[paramKey]);
        }
      }
      this.nodeToAttachVideo.append(video);
    }


    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    const videoTrack = this.stream.getVideoTracks()[0];
    this.videoWidth = videoTrack.getSettings().width;

    this.isCameraAccessGranted = this.stream == null ? false : true;
    video.srcObject = this.stream;
    video.style.webkitTransform = "scaleX(-1)";
    video.style.transform = "scaleX(-1)";

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });

  }

  /**
   * Compute anonymized facemesh for the current video frame, and call the emit function
   * @return {bool} true
   */
  async computeAnonymizedFaceMeshFromHTMLVideoTag() {
    try {
      if (typeof window === "undefined") {
        console.log(
          "🔴 Impossible to computeAnonymizedFaceMeshFromHTMLVideoTag if not in browser context"
        );
        return;
      }
      if (this.isCameraAccessGranted != true) {
        console.log(
          "🔴 Video not available, should not call computeAnonymizedFaceMeshFromHTMLVideoTag"
        );
        return;
      }

      // Get the video created in the init
      var video = document.getElementById(this.videoSectionName);
      if (video === undefined) {
        console.log("🔴 No video element, maybe a pb during initialization");
        return;
      }

      // Check if model already loaded
      if (this.model == null || this.modelLoaded == false) {
        console.log("🔴 model not loaded yet");
        return;
      }

      var now = performance.now();

      // Test if firstEmitDone, it means the loop is runing, warm up done call callback once
      if (this.firstEmitDone && !this.warmUpDoneCallbackDone) {
        this.warmUpDoneCallback();
        this.warmUpDoneCallbackDone = true;
      }

      // don't proceed if stopped asked
      if (this.sending == false) {
        return;
      }
      const predictions = await this.model.estimateFaces({
        input: video,
      });
      this.fps = Number(1 / (0.001 * (performance.now() - now))).toFixed(1);
      if (predictions.length > 0) {
        // If we find a face, process it
        var face = predictions[0];
        this.noseX = face.scaledMesh[6][0];
        if (face.faceInViewConfidence > 0.95) {
          this.emitFacemesh(face.scaledMesh);
        } else {
          this.emitFacemesh([]);
        }
      } else {
        this.emitFacemesh([]);
      }
      return true;
    } catch (e) {
      this.onErrorCallback(e);
      console.error(e);
    }
  }

  /**
   * Send the facemesh to the streaming SocketIO server
   * @param  {facemesh} facemesh computed facemesh from video input
   * @return {bool}     true
   */
  emitFacemesh(facemesh) {
    try {
      if (facemesh == null) {
        return;
      }
      if (this.auth_token == null) {
        return;
      }
      var d = new Date();
      this.apiSocket.emit("facemesh", {
        facemesh: facemesh,
        timestamp: d.toISOString(),
        output: this.emotions,
      });
      if (!this.firstEmitDone) {
        this.firstEmitDone = true;
        this.sending = true;
        this.firstEmitDoneCallback();
      }
      return true;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Release the camera
   * @return {bool} true
   */
  async releaseCamera() {
    try {
      // Context browser
      if (typeof window !== "undefined") {
        this.stream.getTracks().forEach(function (track) {
          track.stop();
        });
      } else {
        /**
         * @todo release camera in nodejs mode
         */
        console.log("TODO : relase camera from node library");
      }
      return true;
    } catch (e) {
      this.onErrorCallback(e);
      console.error("Error while releasing the camera: " + e);
    }
  }

  /// Stop sending to socketIO API
  /**
   * Stop sending to the API, remove video in browser mode, disconnect from the stream
   * SocketIO server and release the camera.
   * @return {bool} true
   */
  async stopFacialExpressionRecognitionAPI() {
    try {
      if (this.sending == false) {
        return;
      }
      this.sending = false;

      /// Remove the video if used in browser environment
      if (typeof window !== "undefined") {
        var video = document.getElementById(this.videoSectionName);
        if (video !== undefined) {
          if (this.nodeToAttachVideo != null) {
            this.nodeToAttachVideo.removeChild(video);
          } else {
            document.body.removeChild(video);
          }
        }
      }

      /// disconnect from API
      this.apiSocket.disconnect();

      /// turn off the camera
      await this.releaseCamera();
      return true;
    } catch (e) {
      this.onErrorCallback(e);
      console.error(e);
    }
  }
}
export default MojoPerceptionAPI;

/**
 * Main access to MojoPerceptionAPI, straightforward initialization.
 * Create a new MojoPerceptionAPI object with the given parameters.
 * Init the object created and return it to be used.
 * @param  {string} auth_token     Token generated from a valid API Key.
 * @param  {string} host           API Stream endpoint host
 * @param  {string} port           API Stream endpoint port
 * @param  {string} user_namespace Namespace of the current token
 */
export var initMojoPerception = function (
  auth_token,
  host,
  port,
  user_namespace
) {
  return new Promise(async (resolve, reject) => {
    try {
      var initilizeMojoPerception = new MojoPerceptionAPI(
        auth_token,
        host,
        port,
        user_namespace
      );
      await initilizeMojoPerception.init();
      resolve(initilizeMojoPerception);
    } catch (e) {
      reject(e);
    }
  });
};

if (typeof window !== "undefined") {
  window.initMojoPerception = initMojoPerception;
}
