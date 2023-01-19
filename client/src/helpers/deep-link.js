const getLinker = (fallbackurl) => {
    function DeepLinker(options) {
        if (!options) throw new Error('no options');

        var hasFocus = true;
        var didHide = false;

        // window is blurred when dialogs are shown
        function onBlur() {
            hasFocus = false;
        }

        // document is hidden when native app is shown or browser is backgrounded
        function onVisibilityChange(e) {
            if (e.target.visibilityState === 'hidden') didHide = true;
        }

        // window is focused when dialogs are hidden, or browser comes into view
        function onFocus() {
            if (didHide) {
                if(options.onReturn) options.onReturn();

                didHide = false; // reset

            } else {
                // ignore duplicated focus event when returning from native app on
                // iOs safari 13.3+
                if (!hasFocus && options.onFallBack) {
                    // wait for app switch transition to fully complete - only then is
                    // 'visibilityChange' fired
                    setTimeout(function () {
                        // if browser was not hidden, the deep link failed
                        if (!didHide) options.onFallBack();

                    }, 1000);
                }
            }
        }

        hasFocus = true;

    }

    // Add/remove event listeners
    // mode can be add or remove
    function bindEvents(mode) {
        [
            [window, 'blur', onBlur],
            [document, 'visibilitychange', onVisibilityChange],
            [document, 'focus', onFocus]
        ].forEach(function(conf) {
            conf[0][mode + "EventListener"](conf[1], conf[2]);
        });
    }

    // add event listener
    bindEvents('add');

    // expose the public API
    this.destroy = bindEvents.bind(null, 'remove');
    this.openURL = function(url) {
        // it can take a while for the dialog to appear
        var dialogTimeout = 500;
        setTimeout(function() {
            if (hasFocus && options.onIgnored) options.onIgnored();
        }, dialogTimeout);

        window.location = url;
    }

    const linker = new DeepLinker({
        onIgnored: function() {
            window.open(fallbackurl);
            console.log('Browser failed to respond to the deep link');
        },
        onFallback: function() {
            console.log('Dialog hidden or user returned to tab');
        },
        onReturn: function() {
            console.log('User returned to the page from the native app');
        }
    });

    return linker;
}

export { getLinker };
