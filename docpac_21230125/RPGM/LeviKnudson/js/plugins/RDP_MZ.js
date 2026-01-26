/*:
    * @target MZ
    * @plugindesc Remote Desktop for RPG Maker MZ
    * @author Me
    * 
    * @param secretKey
    * @text Secret Key
    * @desc The secret key for authenticating with the RDP server. Leave empty to prompt at runtime.
    * @type string
    * 
    * @param ipAddress
    * @text Server IP Address
    * @desc The IP address of the RDP server. Default is localhost.
    * @type string
    * 
    * @param port
    * @text Server Port
    * @desc The port number of the RDP server. Default is 1000.
    * @type number
    * @min 1
    * @max 65535
    * 
    * @param protocol
    * @text Server Protocol
    * @desc The protocol to use when connecting to the RDP server (http or https). Default is http.
    * @type string
    * 
    * @param updateInterval
    * @text Screen Update Interval
    * @desc The interval in milliseconds for fetching screen updates from the server. Default is 3000 ms. 0 disables auto-updates.
    * @type number
*/   
(() => {
    'use strict';
    const pluginName = "RDP_MZ";
    const parameters = PluginManager.parameters(pluginName);
    let SECRET_KEY = parameters.secretKey;
    let IP = parameters.ipAddress;
    let PORT = parameters.port;
    let PROTOCOL = parameters.protocol;
    let UPDATE_INTERVAL = Number(parameters.updateInterval);
    
    if (!IP) {
        IP = prompt("Server IP Address (default: localhost):") || "localhost";
    }
    if (!PORT) {
        PORT = prompt("Server Port (default: 500):") || "500";
    }
    if (PROTOCOL === undefined || PROTOCOL === null || PROTOCOL === "") {
        PROTOCOL = prompt("Server Protocol (default: http):") || "http";
    }
    let HOST = `${PROTOCOL.toLowerCase()}://${IP}:${PORT}`;
    // Prompt for secret key if not configured
    if (!SECRET_KEY) {
        SECRET_KEY = prompt("Password?:") || "";
    }

        function debugLog(...args) {
            console.log(`[${pluginName}]`, ...args);
    }
    if (!UPDATE_INTERVAL || UPDATE_INTERVAL < 0) {
        UPDATE_INTERVAL = Number(prompt("Screen Update Interval in milliseconds (0 to disable auto-updates, default 500):", "500")) || 500;
    }

    debugLog("Plugin loaded");


    // Helper function to load image blob into RPG Maker bitmap
    function loadImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const image = new Image();
            image.onload = function() {
                const bitmap = new Bitmap();
                bitmap._image = image;
                bitmap._baseTexture = new PIXI.BaseTexture(image);
                bitmap._texture = new PIXI.Texture(bitmap._baseTexture);
                bitmap._width = image.width;
                bitmap._height = image.height;
                bitmap._canvas = image;
                resolve(bitmap);
            };
            image.onerror = () => reject(new Error('Failed to load image'));
            image.src = url;
        });
    }

    let currentScreenBitmap = null;
    let currentScene = null;

    function fetchScreenImage() {
        const scene = currentScene || this;
        fetch(`${HOST}/screen`, {
            headers: { 'secret': SECRET_KEY },
            method: 'GET'
        }).then(response => {
            if (response.status === 403) {
                debugLog("Access forbidden: Invalid secret key");
                return null;
            }
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.blob();
        }).then(blob => {
            if (!blob) return null;
            return loadImageFromBlob(blob);
        }).then(bitmap => {
            if (!bitmap) return;
            currentScreenBitmap = bitmap;
            if (scene && scene._spriteset) {
                scene._spriteset.showImageBelow(bitmap, 0, 0);
                debugLog("Screen image loaded from server");
            }
        }).catch(err => {
            debugLog("Failed to fetch screen image:", err);
        });
    }
    if (UPDATE_INTERVAL && UPDATE_INTERVAL > 0) {
        setInterval(fetchScreenImage, UPDATE_INTERVAL);
    }

    // Detect any keyboard input including combinations
    document.addEventListener('keydown', function(event) {
        const modifiers = [];
        if (event.ctrlKey) modifiers.push('control');
        if (event.shiftKey) modifiers.push('shift');
        if (event.altKey) modifiers.push('alt');
        if (event.metaKey) return; // Windows/Command key
        
        fetch(`${HOST}/keyboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'secret': SECRET_KEY },
            body: JSON.stringify({
                key: event.key.toLowerCase(),
                modifiers: modifiers
            })
        }).then(response => {
            if (response.status === 403) {
                $gameMessage.add(`[${pluginName}] Access forbidden: Invalid secret key.`);
                debugLog("Access forbidden: Invalid secret key");
            }
        }).catch(err => {
            debugLog("Failed to send keydown event:", err);
        });
        if (modifiers.length > 1) {
            fetchScreenImage();
        }
    });

    const _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
    Spriteset_Map.prototype.createCharacters = function() {
        // Create custom layer BEFORE character layer
        if (!this._belowCharacterLayer) {
            this._belowCharacterLayer = new PIXI.Container();
            this._tilemap.addChild(this._belowCharacterLayer);
        }
        _Spriteset_Map_createCharacters.call(this);
    };   

    Spriteset_Map.prototype.showImageBelow = function(nameOrBitmap, x, y) {
        let bitmap;
        
        // Check if parameter is a bitmap object or a filename string
        if (typeof nameOrBitmap === 'string') {
            bitmap = ImageManager.loadPicture(nameOrBitmap);
        } else {
            bitmap = nameOrBitmap; // Use the bitmap object directly
        }
        // Clear previous sprites
        this._belowCharacterLayer.removeChildren();
        
        const sprite = new Sprite();
        sprite.bitmap = bitmap;
        sprite.x = x;
        sprite.y = y;
        sprite.scale.x = 2.005;
        sprite.scale.y = 2;
        this._belowCharacterLayer.addChild(sprite);
    };

    // Hook into Scene_Map's start to call after map is loaded
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        currentScene = this;
        fetchScreenImage();
        $gamePlayer.setMoveSpeed(6.9);   
    };

    const _Input_update = Input.update;
    Input.update = function() {
        _Input_update.call(this);
        // Block arrow keys: 37 (left), 38 (up), 39 (right), 40 (down), escape (27)
        if (this.isPressed('left') || this.isPressed('up') || 
            this.isPressed('right') || this.isPressed('down') || this.isPressed('escape')) {
            // Clear the input
            this.clear();
        }
    };

    // Detect when player gets to destination using click-to-move
    let OldX = null;
    let OldY = null;
    const _Game_Player_updateStop = Game_Player.prototype.updateStop;
    Game_Player.prototype.updateStop = function() {
        _Game_Player_updateStop.call(this);
        // Check if player is on a different tile than before
        if (OldX === null || OldY === null) {
            OldX = this.x;
            OldY = this.y;
        } else if (OldX !== this.x || OldY !== this.y) {
            OldX = this.x;
            OldY = this.y;
            debugLog(`Player moved to (${this.x}, ${this.y})`);
            AudioManager.playSe({ name: 'Cursor3', volume: 100, pitch: 100, pan: 0 });
            fetch(`${HOST}/mouse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'secret': SECRET_KEY },
                body: JSON.stringify({ x: this.x, y: this.y })
            }).then(response => {
                if (response.status === 403) {
                    $gameMessage.add(`[${pluginName}] Access forbidden: Invalid secret key.`);
                    debugLog("Access forbidden: Invalid secret key");
                }
            }).catch(err => {
                debugLog("Failed to send destination event:", err);
            });
            fetchScreenImage();
        }
    };
})();

//=============================================================================
// End of Plugin
//=============================================================================