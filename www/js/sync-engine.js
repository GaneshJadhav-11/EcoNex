/**
 * EcoNex Backend Synchronization Engine (Phase H Preparation)
 * Backend-independent client-side synchronization architecture.
 * Manages lot sync states (PENDING -> SYNCING -> SYNCED/FAILED) and retry counters.
 */
(function (global) {
    'use strict';

    // FEATURE FLAG: Kept false until Spring Boot Backend API contract is provided
    const BACKEND_SYNC_ENABLED = false;
    const BACKEND_API_URL = null;

    // In-memory guard to prevent duplicate concurrent synchronization of the same lot
    const currentlySyncingLotIds = new Set();

    /**
     * Isolated Backend Adapter Function.
     * Will contain the real Spring Boot REST API endpoint call once contract is finalized.
     * @param {Object} lot
     * @returns {Promise<{success: boolean, serverId?: string, error?: string}>}
     */
    async function uploadLotToBackend(lot) {
        if (!BACKEND_SYNC_ENABLED || !BACKEND_API_URL) {
            return {
                success: false,
                error: 'BACKEND_NOT_CONFIGURED'
            };
        }

        // Future REST Endpoint Call Structure (To be connected when backend is ready)
        try {
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lot)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    serverId: data.id || data.serverId || ('SRV-' + Date.now().toString(36))
                };
            } else {
                return {
                    success: false,
                    error: `HTTP_${response.status}`
                };
            }
        } catch (netErr) {
            return {
                success: false,
                error: netErr.message || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Synchronize a single pending lot object through the state machine.
     * @param {Object} lot
     */
    async function syncLot(lot) {
        if (!lot || !lot.id) return;

        if (currentlySyncingLotIds.has(lot.id)) {
            console.log(`[EcoNex Sync Engine] Lot already being synchronized: ${lot.id}`);
            return;
        }

        if (!BACKEND_SYNC_ENABLED) {
            console.log(`[EcoNex Sync Engine] Lot ${lot.id} remains safely in status: ${lot.sync_status || 'PENDING'}`);
            return;
        }

        currentlySyncingLotIds.add(lot.id);

        try {
            // Transition state: PENDING/FAILED -> SYNCING
            await global.EcoNexDB.updateLotSyncStatus(lot.id, 'SYNCING');
            console.log(`[EcoNex Sync Engine] Lot marked SYNCING: ${lot.id}`);

            const result = await uploadLotToBackend(lot);

            if (result.success) {
                // Transition state: SYNCING -> SYNCED + server_id
                await global.EcoNexDB.updateLotSyncStatus(lot.id, 'SYNCED', result.serverId, lot.retry_count || 0);
                console.log(`[EcoNex Sync Engine] SUCCESS: Lot ${lot.id} synchronized as server_id: ${result.serverId}`);
            } else {
                // Transition state: SYNCING -> FAILED + retry_count++
                const newRetryCount = (Number(lot.retry_count) || 0) + 1;
                await global.EcoNexDB.updateLotSyncStatus(lot.id, 'FAILED', null, newRetryCount);
                console.warn(`[EcoNex Sync Engine] FAILURE: Lot ${lot.id} sync failed (${result.error}). Retry count: ${newRetryCount}`);
            }
        } catch (err) {
            console.error(`[EcoNex Sync Engine] Unexpected error synchronizing lot ${lot.id}:`, err);
            const newRetryCount = (Number(lot.retry_count) || 0) + 1;
            await global.EcoNexDB.updateLotSyncStatus(lot.id, 'FAILED', null, newRetryCount);
        } finally {
            currentlySyncingLotIds.delete(lot.id);
        }
    }

    /**
     * Main Synchronization Entry Point: Queries pending/failed lots and triggers sync flow.
     */
    async function syncPendingLots() {
        if (!global.EcoNexDB || typeof global.EcoNexDB.getPendingLots !== 'function') {
            console.warn('[EcoNex Sync Engine] EcoNexDB not available.');
            return;
        }

        try {
            const pendingLots = await global.EcoNexDB.getPendingLots();

            if (!pendingLots || pendingLots.length === 0) {
                console.log('[EcoNex Sync Engine] No pending or failed lots found.');
                return;
            }

            console.log(`[EcoNex Sync Engine] Pending lots found: ${pendingLots.length}`);

            if (!BACKEND_SYNC_ENABLED) {
                console.log('[EcoNex Sync Engine] Backend sync is not configured yet.');
                console.log('[EcoNex Sync Engine] Waiting for backend API contract.');
                return;
            }

            for (const lot of pendingLots) {
                await syncLot(lot);
            }
        } catch (err) {
            console.error('[EcoNex Sync Engine] Error in syncPendingLots:', err);
        }
    }

    /**
     * Initialize subscription to Phase G Network Sync Trigger Requests.
     */
    function initSyncEngine() {
        if (global.EcoNexSync && typeof global.EcoNexSync.onSyncRequested === 'function') {
            global.EcoNexSync.onSyncRequested(() => {
                syncPendingLots();
            });
            console.log('[EcoNex Sync Engine] Connected to EcoNexSync network trigger.');
        } else {
            setTimeout(initSyncEngine, 500);
        }
    }

    // Expose EcoNexSyncEngine API on global scope
    global.EcoNexSyncEngine = {
        syncPendingLots: syncPendingLots,
        syncLot: syncLot,
        isBackendEnabled: function () {
            return BACKEND_SYNC_ENABLED;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSyncEngine);
    } else {
        initSyncEngine();
    }

})(typeof window !== 'undefined' ? window : this);
