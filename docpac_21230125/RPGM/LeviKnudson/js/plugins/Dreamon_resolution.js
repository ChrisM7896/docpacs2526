/*:
 * @target MZ
 * @plugindesc v1.0 | Adds a customizable resolution option to the Options menu with Auto Detect and common presets. 
 * @author Dreamon Interactive
 *
 * @param includeAuto
 * @text Include "Auto (Detect)"
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param commandName
 * @text Command Name
 * @type text
 * @default Resolution
 *
 * @param restartText
 * @text Restart Text
 * @type text
 * @default Restart now?
 *
 * @param yesText
 * @text "Yes" Text
 * @type text
 * @default Yes
 *
 * @param noText
 * @text "No" Text
 * @type text
 * @default No
 *
 * @help
 * ----------------------------------------------------------------------------
 * 🖥 Dreamon Resolution v1.0
 * ----------------------------------------------------------------------------
 * This plugin adds a Resolution option to the Options menu. 
 * Players can choose from Auto (Detect) or a set of popular screen resolutions.
 *
 * FEATURES:
 * - Auto (Detect) will match the player's desktop resolution at game boot.
 * - Includes multiple common resolution presets.
 * - Clean Yes/No restart prompt only appears when exiting the Options menu 
 *   after a change.
 * - Prompt text is centered and clearly displayed.
 *
 * INSTRUCTIONS:
 * 1. Place this plugin in your project's /js/plugins/ folder.
 * 2. Enable it in the Plugin Manager.
 * 3. (Optional) Change the parameters to adjust text or remove Auto (Detect).
 *
 * NOTES:
 * - Changing resolution requires a game restart to take effect.
 * - Restart prompt only appears if a resolution change was made.
 *
 * TERMS OF USE:
 * Commercial and non-commercial use allowed.
 * Credit required: "Dreamon Interactive".
 * Redistribution or resale of the unmodified plugin is allowed only with 
 * permission from Dreamon Interactive.
 *
 * ----------------------------------------------------------------------------
 * Version History:
 * v1.0 - Initial release.
 * ----------------------------------------------------------------------------
 */
(() => {
    'use strict';

    let pluginName = "Dreamon_resolution";
    try {
        const m = document.currentScript && document.currentScript.src.match(/.+\/(.+)\.js/);
        if (m && m[1]) pluginName = m[1];
    } catch (_) {}

    const rawParams = PluginManager.parameters(pluginName);

    // --- Sanitizers ---
    function sanitizeLine(s, fallback, maxLen) {
        s = String(s || "").replace(/\r/g, "\n").split("\n")[0].trim();
        if (!s) s = fallback;
        if (maxLen && s.length > maxLen) s = s.slice(0, maxLen).trim();
        return s;
    }
    function sanitizeShortToken(s, fallback) {
        s = sanitizeLine(s, fallback, 12);
        if (/\s/.test(s)) s = s.split(/\s+/)[0];
        return s || fallback;
    }

    const includeAuto = String(rawParams.includeAuto || "true").toLowerCase() === "true";
    const commandName = sanitizeLine(rawParams.commandName, "Resolution", 24);
    const restartText = sanitizeLine(rawParams.restartText, "Restart now?", 80);
    const yesText = sanitizeShortToken(rawParams.yesText, "Yes");
    const noText = sanitizeShortToken(rawParams.noText, "No");

    // --- Hardcoded resolution list ---
    /** @type {{name:string,width?:number,height?:number,auto?:boolean}[]} */
    const RESOLUTION_LIST = [
        { name: "3840x2160", width: 3840, height: 2160 },
    ];
    const resolutions = includeAuto ? RESOLUTION_LIST.slice() : RESOLUTION_LIST.slice(1);

    // --- Config ---
    ConfigManager.resolutionIndex = 0;
    const _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        const config = _ConfigManager_makeData.call(this);
        config.resolutionIndex = Number(this.resolutionIndex || 0);
        return config;
    };
    const _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);
        const maxIndex = Math.max(0, resolutions.length - 1);
        const idx = Number(config?.resolutionIndex);
        const safe = isNaN(idx) ? 0 : Math.min(Math.max(0, idx), maxIndex);
        this.resolutionIndex = safe;
    };

    // --- Detect desktop resolution ---
    function detectDesktopResolution() {
        const s = window.screen || {};
        let w = Number(s.availWidth || s.width || Graphics.boxWidth || 1280);
        let h = Number(s.availHeight || s.height || Graphics.boxHeight || 720);
        return { width: Math.max(320, Math.floor(w)), height: Math.max(240, Math.floor(h)) };
    }

    // --- Apply on boot only ---
    const _Scene_Boot_resizeScreen = Scene_Boot.prototype.resizeScreen;
    Scene_Boot.prototype.resizeScreen = function() {
        _Scene_Boot_resizeScreen.call(this);
        const entry = resolutions[Number(ConfigManager.resolutionIndex) || 0];
        let target = null;
        if (entry?.auto) target = detectDesktopResolution();
        else if (entry && entry.width && entry.height) target = { width: entry.width, height: entry.height };
        if (target) {
            Graphics.boxWidth = target.width;
            Graphics.boxHeight = target.height;
            Graphics.resize(target.width, target.height);
        }
    };

    Scene_Boot.prototype.centerSprite = function(sprite) {
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
    };

    // --- Options integration ---
    const _Window_Options_initialize = Window_Options.prototype.initialize;
    Window_Options.prototype.initialize = function(rect) {
        this._originalResolutionIndex = Number(ConfigManager.resolutionIndex || 0);
        _Window_Options_initialize.call(this, rect);
    };

    const _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
    Window_Options.prototype.makeCommandList = function() {
        _Window_Options_makeCommandList.call(this);
        this.addCommand(commandName, 'resolutionIndex');
    };

    const _Window_Options_statusText = Window_Options.prototype.statusText;
    Window_Options.prototype.statusText = function(index) {
        const symbol = this.commandSymbol(index);
        if (symbol === 'resolutionIndex') {
            const value = Number(this.getConfigValue(symbol));
            const safe = isNaN(value) ? 0 : Math.min(Math.max(0, value), resolutions.length - 1);
            const entry = resolutions[safe];
            return entry ? entry.name : `Index ${safe}`;
        }
        return _Window_Options_statusText.call(this, index);
    };

    const _Window_Options_setConfigValue = Window_Options.prototype.setConfigValue;
    Window_Options.prototype.setConfigValue = function(symbol, value) {
        if (symbol === 'resolutionIndex') {
            const newVal = Number(value || 0);
            const oldVal = Number(ConfigManager.resolutionIndex || 0);
            ConfigManager.resolutionIndex = newVal;
            const idx = this.findSymbol(symbol);
            if (idx >= 0) this.redrawItem(idx);
            if (this.scene && newVal !== oldVal) this.scene._resolutionChanged = true;
            return;
        }
        _Window_Options_setConfigValue.call(this, symbol, value);
    };

    const _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function(wrap) {
        const idx = this.index();
        const symbol = this.commandSymbol(idx);
        if (symbol === 'resolutionIndex') {
            let value = Number(this.getConfigValue(symbol) || 0);
            value = (value + 1) % resolutions.length;
            this.setConfigValue(symbol, value);
        } else {
            _Window_Options_cursorRight.call(this, wrap);
        }
    };

    const _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function(wrap) {
        const idx = this.index();
        const symbol = this.commandSymbol(idx);
        if (symbol === 'resolutionIndex') {
            let value = Number(this.getConfigValue(symbol) || 0);
            value = (value - 1 + resolutions.length) % resolutions.length;
            this.setConfigValue(symbol, value);
        } else {
            _Window_Options_cursorLeft.call(this, wrap);
        }
    };

    const _Window_Options_processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function() {
        const idx = this.index();
        const symbol = this.commandSymbol(idx);
        if (symbol === 'resolutionIndex') {
            this.cursorRight();
        } else {
            _Window_Options_processOk.call(this);
        }
    };

    // --- Scene_Options: restart prompt only on exit ---
    const _Scene_Options_create = Scene_Options.prototype.create;
    Scene_Options.prototype.create = function() {
        this._resolutionChanged = false;
        _Scene_Options_create.call(this);
        this._optionsWindow.scene = this;
        this.createRestartWindow();
    };

    const _Scene_Options_popScene = Scene_Options.prototype.popScene;
    Scene_Options.prototype.popScene = function() {
        const newIndex = Number(this._optionsWindow.getConfigValue('resolutionIndex') || 0);
        const oldIndex = Number(this._optionsWindow._originalResolutionIndex || 0);
        if (this._resolutionChanged && newIndex !== oldIndex) {
            this.startRestartConfirm();
        } else {
            _Scene_Options_popScene.call(this);
        }
    };

    Scene_Options.prototype.createRestartWindow = function() {
        const width = Math.min(Graphics.boxWidth - 40, 500);
        const height = 120;
        const rect = new Rectangle((Graphics.boxWidth - width) / 2, Math.floor(Graphics.boxHeight * 0.45) - height/2, width, height);
        this._restartWindow = new Window_Confirmation(rect, restartText, yesText, noText);
        this._restartWindow.setHandler('yes', this.onRestartOk.bind(this));
        this._restartWindow.setHandler('no', this.onRestartCancel.bind(this));
        this._restartWindow.setHandler('cancel', this.onRestartCancel.bind(this));
        this._restartWindow.close();
        this._restartWindow.deactivate();
        this.addWindow(this._restartWindow);
    };

    Scene_Options.prototype.startRestartConfirm = function() {
        this._optionsWindow.deactivate();
        if (this._helpWindow) this._helpWindow.hide();
        this._restartWindow.open();
        this._restartWindow.activate();
        this._restartWindow.select(0);
    };

    Scene_Options.prototype.onRestartOk = function() {
        this._optionsWindow._originalResolutionIndex = Number(this._optionsWindow.getConfigValue('resolutionIndex') || 0);
        ConfigManager.save();
        if (Utils.isNwjs()) {
            try {
                const nw = window.require('nw.gui');
                nw.Window.get().reload(3);
            } catch (e) {
                console.error("Failed to restart with nw.gui, reloading page.", e);
                window.location.reload();
            }
        } else {
            window.location.reload();
        }
    };

    Scene_Options.prototype.onRestartCancel = function() {
        const originalIndex = Number(this._optionsWindow._originalResolutionIndex || 0);
        this._optionsWindow.setConfigValue('resolutionIndex', originalIndex);
        this._restartWindow.close();
        if (this._helpWindow) this._helpWindow.show();
        this._optionsWindow.activate();
        this._resolutionChanged = false;
    };

    // --- Clean Window_Confirmation ---
    function Window_Confirmation(rect, text, yText, nText) { this.initialize(rect, text, yText, nText); }
    Window_Confirmation.prototype = Object.create(Window_Base.prototype);
    Window_Confirmation.prototype.constructor = Window_Confirmation;

    Window_Confirmation.prototype.initialize = function(rect, text, yText, nText) {
        Window_Base.prototype.initialize.call(this, rect);
        this._text = text;
        this._yesText = yText || "Yes";
        this._noText = nText || "No";
        this._index = 0;
        this._handlers = {};
        this.refresh();
        this.active = false;
        this.open();
    };
    Window_Confirmation.prototype.select = function(index) {
        const i = Math.max(0, Math.min(1, index|0));
        if (this._index !== i) { this._index = i; this.refresh(); }
    };
    Window_Confirmation.prototype.activate = function() { this.active = true; };
    Window_Confirmation.prototype.deactivate = function() { this.active = false; };
    Window_Confirmation.prototype.setHandler = function(symbol, method) {
        this._handlers[symbol] = method;
    };
    Window_Confirmation.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (!this.isOpen() || !this.active) return;
        if (Input.isRepeated('left') || Input.isTriggered('left') || Input.isRepeated('right') || Input.isTriggered('right')) {
            this._index = 1 - this._index;
            if (typeof SoundManager !== 'undefined') SoundManager.playCursor();
            this.refresh();
        }
        if (Input.isTriggered('ok')) {
            const symbol = this._index === 0 ? 'yes' : 'no';
            if (typeof SoundManager !== 'undefined') SoundManager.playOk();
            if (this._handlers[symbol]) this._handlers[symbol]();
        } else if (Input.isTriggered('cancel')) {
            if (this._handlers['no']) {
                if (typeof SoundManager !== 'undefined') SoundManager.playCancel();
                this._handlers['no']();
            }
        }
    };
    Window_Confirmation.prototype.refresh = function() {
        this.contents.clear();
        const pad = this.standardPadding ? this.standardPadding() : 18;

        // Centered header text
        const tw = this.textWidth(String(this._text));
        const tx = Math.max(0, (this.contentsWidth() - tw) / 2);
        this.drawTextEx(String(this._text), tx, pad);

        const y = pad + this.lineHeight() + 6;
        const yesWidth = this.textWidth(this._yesText) + 24;
        const noWidth = this.textWidth(this._noText) + 24;
        const totalWidth = yesWidth + noWidth + 20;
        let x = (this.contentsWidth() - totalWidth) / 2;

        if (this._index === 0) this.contents.fillRect(x - 4, y - 2, yesWidth + 8, this.lineHeight() + 4, 'rgba(255,255,255,0.2)');
        this.drawText(this._yesText, x, y, yesWidth, 'center');

        x += yesWidth + 20;
        if (this._index === 1) this.contents.fillRect(x - 4, y - 2, noWidth + 8, this.lineHeight() + 4, 'rgba(255,255,255,0.2)');
        this.drawText(this._noText, x, y, noWidth, 'center');
    };
})();