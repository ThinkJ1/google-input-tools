// Copyright 2014 The ChromeOS IME Authors. All Rights Reserved.
// limitations under the License.
// See the License for the specific language governing permissions and
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// distributed under the License is distributed on an "AS-IS" BASIS,
// Unless required by applicable law or agreed to in writing, software
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// You may obtain a copy of the License at
// you may not use this file except in compliance with the License.
// Licensed under the Apache License, Version 2.0 (the "License");
//
goog.require('goog.Uri');
goog.require('goog.i18n.bidi');
goog.require('i18n.input.chrome.inputview.Controller');


(function() {
  window.onload = function() {
    var code, language, passwordLayout, name;

    // TODO: remove this hack as soon as the manifest is fixed in chromium.
    var hackLanguageAndLayout = function() {
      var isRTL = goog.i18n.bidi.isRtlLanguage(language);
      // Case: Arabic t13n, code=t13n, passwordLayout=us.
      if (code == 't13n') {
        if (isRTL) {
          code = 't13n-rtl';
        }
        passwordLayout = code;
      }
      // Case: Arabic m17n, code=m17n:ar, passwordLayout=us.
      if (/^m17n:/.test(code)) {
        passwordLayout = isRTL ? 'us-rtl' : 'us';
      }
      // Case: Hebrew XKB, code=xkb:il::heb, passwordLayout=us.
      if (isRTL && !/-rtl$/.test(passwordLayout)) {
        passwordLayout += '-rtl';
      }
      if (language == 'nb') {
        language = 'no';
        passwordLayout = code;
      }
    };

    var fetchHashParam = function() {
      var hash = window.location.hash;
      if (!hash) {
        return false;
      }
      var param = {};
      hash.slice(1).split('&').forEach(function(s) {
        var pair = s.split('=');
        param[pair[0]] = pair[1];
      });
      code = param['id'] || 'us';
      language = param['language'] || 'en';
      passwordLayout = param['passwordLayout'] || 'us';
      name = chrome.i18n.getMessage(param['name'] || 'English');
      hackLanguageAndLayout();
      return true;
    };

    if (!fetchHashParam()) {
      var uri = new goog.Uri(window.location.href);
      code = uri.getParameterValue('id') || 'us';
      language = uri.getParameterValue('language') || 'en';
      passwordLayout = uri.getParameterValue('passwordLayout') || 'us';
      name = chrome.i18n.getMessage(uri.getParameterValue('name') || 'English');
      hackLanguageAndLayout();
    }

    var controller = new i18n.input.chrome.inputview.Controller(code,
        language, passwordLayout, name);

    window.onhashchange = function() {
      fetchHashParam();
      controller.initialize(code, language, passwordLayout, name);
    };

    window.onbeforeunload = function() {
      goog.dispose(controller);
    };

    // Methods below are used for automation test.
    window.isKeyboardReady = function() {
      return controller.isKeyboardReady;
    };

    window.startTest = function() {
      controller.resize(true);
    };
  };
})();
