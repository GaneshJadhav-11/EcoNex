/**
 * EcoNex Network Utility (Phase A)
 * Provides reliable online/offline connectivity detection for Capacitor & Web environments.
 */
(function (global) {
    'use strict';

    const listeners = new Set();
    let initialized = false;

    // Helper to get Capacitor Network plugin reference if present
    function getCapacitorNetwork() {
        if (
            global.Capacitor &&
            global.Capacitor.Plugins &&
            global.Capacitor.Plugins.Network
        ) {
            return global.Capacitor.Plugins.Network;
        }
        return null;
    }

    /**
     * Get current network status.
     * @returns {Promise<{connected: boolean, connectionType: string}>}
     */
    async function getNetworkStatus() {
        const Network = getCapacitorNetwork();
        if (Network) {
            try {
                const status = await Network.getStatus();
                return {
                    connected: Boolean(status.connected),
                    connectionType: status.connectionType || 'unknown'
                };
            } catch (err) {
                console.warn('[EcoNex Network] Capacitor Network getStatus failed, falling back to navigator.onLine:', err);
            }
        }
        // Web fallback
        return {
            connected: Boolean(navigator.onLine),
            connectionType: navigator.onLine ? 'web' : 'none'
        };
    }

    /**
     * Notify all registered callbacks of a network status change.
     * @param {{connected: boolean, connectionType: string}} status
     */
    function notifyListeners(status) {
        listeners.forEach(callback => {
            try {
                callback(status);
            } catch (e) {
                console.error('[EcoNex Network] Error in status change listener:', e);
            }
        });
    }

    /**
     * Initialize event listeners once to prevent duplicates.
     */
    function init() {
        if (initialized) return;
        initialized = true;

        const Network = getCapacitorNetwork();
        if (Network && typeof Network.addListener === 'function') {
            try {
                Network.addListener('networkStatusChange', status => {
                    const mappedStatus = {
                        connected: Boolean(status.connected),
                        connectionType: status.connectionType || 'unknown'
                    };
                    notifyListeners(mappedStatus);
                });
            } catch (err) {
                console.warn('[EcoNex Network] Failed to add Capacitor networkStatusChange listener:', err);
            }
        }

        // Web Fallback listeners
        global.addEventListener('online', () => {
            notifyListeners({ connected: true, connectionType: 'web' });
        });

        global.addEventListener('offline', () => {
            notifyListeners({ connected: false, connectionType: 'none' });
        });
    }

    /**
     * Register a callback to be invoked when network status changes.
     * @param {Function} callback - Function receiving { connected: boolean, connectionType: string }
     * @returns {Function} Unsubscribe function
     */
    function onNetworkStatusChange(callback) {
        if (typeof callback !== 'function') {
            console.warn('[EcoNex Network] Callback must be a function.');
            return () => {};
        }

        init();

        // Avoid duplicate listeners
        listeners.add(callback);

        // Trigger callback with current status upon registration
        getNetworkStatus().then(status => {
            try {
                callback(status);
            } catch (e) {
                console.error('[EcoNex Network] Initial status callback error:', e);
            }
        });

        // Return unsubscribe function
        return function unsubscribe() {
            listeners.delete(callback);
        };
    }

    // Expose EcoNexNetwork on global scope
    global.EcoNexNetwork = {
        getNetworkStatus: getNetworkStatus,
        onNetworkStatusChange: onNetworkStatusChange
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(typeof window !== 'undefined' ? window : this);
