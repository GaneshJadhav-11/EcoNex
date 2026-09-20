/**
 * EcoNex Synchronization Trigger & Network Event Handler (Phase G)
 * Subscribes to network status changes and triggers offline synchronization when online.
 */
(function (global) {
    'use strict';

    let isSyncTriggerRunning = false;
    const syncRequestedListeners = new Set();
    let lastNetworkState = null;

    /**
     * Register a callback to be notified when sync is requested.
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    function onSyncRequested(callback) {
        if (typeof callback === 'function') {
            syncRequestedListeners.add(callback);
        }
        return function unsubscribe() {
            syncRequestedListeners.delete(callback);
        };
    }

    /**
     * Trigger sync process when network becomes available and pending lots exist.
     */
    async function triggerSync() {
        if (isSyncTriggerRunning) {
            console.log('[EcoNex Sync] Sync trigger already in progress, skipping duplicate request.');
            return;
        }

        isSyncTriggerRunning = true;

        try {
            if (!global.EcoNexDB || typeof global.EcoNexDB.getPendingLots !== 'function') {
                console.warn('[EcoNex Sync] EcoNexDB not available yet.');
                isSyncTriggerRunning = false;
                return;
            }

            const pendingLots = await global.EcoNexDB.getPendingLots();

            if (pendingLots && pendingLots.length > 0) {
                console.log(`[EcoNex Sync] Pending lots detected: ${pendingLots.length}`);
                console.log('[EcoNex Sync] Sync trigger requested');

                // Notify any registered sync engine handlers (Phase H)
                syncRequestedListeners.forEach(listener => {
                    try {
                        listener(pendingLots);
                    } catch (e) {
                        console.error('[EcoNex Sync] Error in sync listener:', e);
                    }
                });
            } else {
                console.log('[EcoNex Sync] No pending or failed lots requiring synchronization.');
            }
        } catch (err) {
            console.error('[EcoNex Sync] Error inspecting pending lots for sync:', err);
        } finally {
            isSyncTriggerRunning = false;
        }
    }

    /**
     * Handle network status change events from EcoNexNetwork.
     * @param {{connected: boolean, connectionType: string}} status
     */
    function handleNetworkChange(status) {
        const isConnected = Boolean(status && status.connected);
        const stateStr = isConnected ? 'ONLINE' : 'OFFLINE';

        // Log status change if state transitioned
        if (lastNetworkState !== stateStr) {
            lastNetworkState = stateStr;
            console.log(`[EcoNex Network] Status changed: ${stateStr}`);
        }

        if (isConnected) {
            triggerSync();
        }
    }

    /**
     * Initialize network listener for synchronization trigger.
     */
    function initSyncHandler() {
        if (global.EcoNexNetwork && typeof global.EcoNexNetwork.onNetworkStatusChange === 'function') {
            global.EcoNexNetwork.onNetworkStatusChange(handleNetworkChange);
        } else {
            console.warn('[EcoNex Sync] EcoNexNetwork utility not found. Retrying in 1s...');
            setTimeout(initSyncHandler, 1000);
        }
    }

    // Expose EcoNexSync API on global scope
    global.EcoNexSync = {
        triggerSync: triggerSync,
        onSyncRequested: onSyncRequested,
        isSyncRunning: function () {
            return isSyncTriggerRunning;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSyncHandler);
    } else {
        initSyncHandler();
    }

})(typeof window !== 'undefined' ? window : this);
