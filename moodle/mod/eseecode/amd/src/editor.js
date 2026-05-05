// AMD module for the eSeeCode Editor activity.
// Written in define() format so it works without a Grunt build step.

define(['core/ajax', 'core/notification'], function(Ajax, Notification) {

    const IDE_ORIGIN = 'https://play.eseecode.com';
    const IDE_URL    = 'https://play.eseecode.com';

    // Holds the resolve callback of the in-flight downloadCode request.
    let pendingDownload = null;

    /**
     * Ask the IDE iframe for its current code.
     * Returns a Promise that resolves with the code string, or rejects after 8 seconds.
     */
    function requestCode(iframe) {
        return new Promise(function(resolve, reject) {
            const nounce = Math.random();
            pendingDownload = { resolve, nounce };
            iframe.contentWindow.postMessage({action: 'downloadCode', request: nounce}, IDE_ORIGIN);
            setTimeout(function() {
                if (pendingDownload?.nounce === nounce) {
                    pendingDownload = null;
                    reject(new Error('Timed out waiting for code from the IDE.'));
                }
            }, 8000);
        });
    }

    /** Push code into the IDE iframe. */
    function uploadCode(iframe, code) {
        iframe.contentWindow.postMessage({action: 'uploadCode', parameters: [code]}, IDE_ORIGIN);
    }

    /** Show a short-lived status message next to the action buttons. */
    function showStatus(el, text, success) {
        el.textContent = text;
        el.className   = 'ml-2 small ' + (success ? 'text-success' : 'text-danger');
        setTimeout(function() { el.textContent = ''; }, 4000);
    }

    return {
        /**
         * Entry point called from view.php via $PAGE->requires->js_call_amd().
         *
         * @param {number}  cmid        Course-module ID.
         * @param {string}  savedCode   Previously saved draft code (empty if none).
         * @param {boolean} isSubmitted Whether the student already submitted.
         * @param {boolean} isTeacher   Whether the viewer is a teacher.
         */
        init: function(cmid, savedCode, isSubmitted, isTeacher) {

            const iframe    = document.getElementById('eseecode-iframe');
            const saveBtn   = document.getElementById('eseecode-save');
            const submitBtn = document.getElementById('eseecode-submit');
            const statusEl  = document.getElementById('eseecode-status');

            if (!iframe) return;

            // Receive code from the IDE in response to a downloadCode request.
            window.addEventListener('message', function(event) {
                if (event.origin !== IDE_ORIGIN || !pendingDownload) return;

                const data   = event.data;
                const nounce = data.nounce;
                let code     = null;

                if (pendingDownload.nounce !== nounce) return;

                // Handle several possible response shapes the IDE might use.
                if (data == null || typeof data !== 'object') return;

                code = data.response;

                if (code !== null) {
                    const { resolve } = pendingDownload;
                    pendingDownload = null;
                    resolve(code);
                } else {
                    pendingDownload = null;
                }
            });

            // Set src here (not in PHP) so the load event always fires after our listener.
            iframe.addEventListener('load', function() {
                if (savedCode) {
                    // Brief delay lets the IDE's own JS finish initialising.
                    setTimeout(function() { uploadCode(iframe, savedCode); }, 800);
                }
            });
            iframe.src = IDE_URL;

            // ---- Save draft ----
            if (saveBtn) {
                saveBtn.addEventListener('click', function() {
                    saveBtn.disabled   = true;
                    submitBtn.disabled = true;

                    requestCode(iframe)
                    .then(function(code) {
                        return Ajax.call([
                            {methodname: 'mod_eseecode_save_draft', args: {cmid: cmid, code: code}}
                        ])[0];
                    })
                    .then(function(result) {
                        if (statusEl) {
                            showStatus(statusEl, result.message, result.success);
                        }
                    })
                    .catch(function(err) {
                        Notification.exception(err);
                    })
                    .finally(function() {
                        saveBtn.disabled   = false;
                        submitBtn.disabled = false;
                    });
                });
            }

            // ---- Submit ----
            if (submitBtn) {
                submitBtn.addEventListener('click', function() {
                    const msg = M.util.get_string('confirmsubmit', 'mod_eseecode');
                    if (!window.confirm(msg)) {
                        return;
                    }
                    if (saveBtn) { saveBtn.disabled = true; }
                    submitBtn.disabled = true;

                    requestCode(iframe)
                    .then(function(code) {
                        return Ajax.call([
                            {methodname: 'mod_eseecode_submit_code', args: {cmid: cmid, code: code}}
                        ])[0];
                    })
                    .then(function(result) {
                        if (result.success) {
                            // Replace the button row with a success notice immediately;
                            // the notice will also appear on every subsequent page load.
                            const actionsDiv = document.getElementById('eseecode-actions');
                            if (actionsDiv) {
                                actionsDiv.innerHTML =
                                    '<div class="alert alert-success mb-0">' +
                                    result.message + '</div>';
                            }
                        } else {
                            if (statusEl) { showStatus(statusEl, result.message, false); }
                            if (saveBtn) { saveBtn.disabled = false; }
                            submitBtn.disabled = false;
                        }
                    })
                    .catch(function(err) {
                        Notification.exception(err);
                        if (saveBtn) { saveBtn.disabled = false; }
                        submitBtn.disabled = false;
                    });
                });
            }
        }
    };
});
