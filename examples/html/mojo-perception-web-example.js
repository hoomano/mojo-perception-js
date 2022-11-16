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

/**
 * API global variable scope
 * @tutorial getting-started-html
 */
var mojoPerception;

/**
 * Start MojoPerceptionAPI and recursively call compute on each frame
 * Note that the parameters of MojoPerceptionAPI are set at initialization
 * @return {nothing} recursive function
 */
var startExample = async function () {
    try {
        // Hide start button
        document.getElementById("start_button").hidden = true;
        // Show spinner loader
        document.getElementById("loading_spinner").hidden = false;

        // We start MojoPerceptionAPI
        await mojoPerception.startCameraAndConnectAPI();
        /// Process video frame only if accessible
        if (mojoPerception.initialized != true) {
            console.error(
                "mojoPerception not initialized. Maybe video access? C=isCameraAccessGranted" +
                mojoPerception.isCameraAccessGranted
            );
        } else {
            async function processVideoFrame() {
                try {
                    await mojoPerception.computeAnonymizedFaceMeshFromHTMLVideoTag();
                    /// Loop until demo state if turned to 0
                    if (mojoPerception.sending == true) {
                        document.getElementById("fps").innerHTML =
                            "FPS: " + mojoPerception.fps;
                        requestAnimationFrame(processVideoFrame);
                    }
                } catch (e) {
                    console.error("problem during processVideoFrame : " + e);
                }
            }

            if (mojoPerception.warmUpDoneCallbackDone) {
                // Hide spinner loader
                document.getElementById("loading_spinner").hidden = true;
                // Show stop button
                document.getElementById("stop_button").hidden = false;
            }
            // Compute Face Mesh locally
            mojoPerception.sending = true;
            processVideoFrame();
        }
    } catch (e) {
        console.error(e);
    }
};

/**
 * Stop MojoPerceptionAPI : release access to camera and disconnect from stream
 * @return {boolean} true
 */
var stopExample = async function () {
    await mojoPerception.stopFacialExpressionRecognitionAPI();

    /// show start button & hide stop
    document.getElementById("start_button").hidden = false;
    document.getElementById("stop_button").hidden = true;
    return true;
};

// Give scope of HTML page
window.startExample = startExample;
window.stopExample = stopExample;

// Initialization when HTML document ready
$(document).ready(async function () {
    // We initialize MojoPerceptionAPI here
    // Use your secured token and namespace to load the API.
    // See the README to generate one using your Mojo Perception API Key.
    mojoPerception = await loadMojoPerception(
        // Replace with your <auth_token>
        "auth_token",
        // Replace with <host>
        "host",
        // Replace with <port>
        "port",
        // Replace with <user_namespace>
        "user_namespace",
    );

    // We set  options
    mojoPerception.setOptions({
        // Which emotions will be calculated by the API
        emotions: ["attention"],
        // set subscribeRealtimeOutput to true to activate callbacks
        subscribeRealtimeOutput: true,
    });

    // We set a callback for attention
    mojoPerception.attentionCallback = function (val) {
        try {
            document.getElementById("attention_callback_dislay").innerHTML =
                Math.round(val["value"] * 100).toString() + "%";
        } catch (e) {
            console.error(e);
        }
    };

    // Run a callback when everything is warmed up and running
    mojoPerception.warmUpDoneCallback = function () {
        // Hide spinner loader
        document.getElementById("loading_spinner").hidden = true;
        // Show stop button
        document.getElementById("stop_button").hidden = false;
    };

    // Error callback to help troubleshoot if required
    mojoPerception.onErrorCallback = function (error) {
        try {
            // Display an error message
            document.getElementById("on_error_callback_dislay").innerHTML = "🙏 Something went wrong: " + error;
        } catch (e) {
            console.error("🙏 Something went wrong: " + e);
        }
    }

    // Check if context is HTTPS for camera access
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    if (location.protocol !== "https:") {
        const warningHTTPS = document.getElementById("warningHTTPS");
        warningHTTPS.html(
            "Important : you must deploy over HTTPS to allow webcam usage from browser.\nCheckout README for a proposition to easily local HTTPS."
        );
    }
});
