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

import { initMojoPerception } from "./mojoPerceptionAPI";

/**
 * Loads a MojoPerceptionAPI object to interact with the Mojo Emotion AI Engine.
 * `auth_token`, `host`, `port` and `user_namespace` are required.
 * Generate new parameters every time your API key is used and control their usage
 * with `expiration` parameter.
 * @see README for more details on how to generate those parameters easily with a
 * valid API Key.
 * @param  {string} auth_token     unique user token with limited duration validity
 * @param  {string} host           host name of the stream SocketIO server
 * @param  {string} port           port of the stream SocketIO server
 * @param  {string} user_namespace unique user namespace for the SocketIO broadcasting
 */
var loadMojoPerception = function (auth_token, host, port, user_namespace) {
    return initMojoPerception(auth_token, host, port, user_namespace);
};

if (typeof window !== 'undefined') {
    window.loadMojoPerception = loadMojoPerception;
}
export default loadMojoPerception;