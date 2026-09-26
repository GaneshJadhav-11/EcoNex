/**
 * EcoNex Backend Synchronization Engine (Phase H)
 * Offline-first lot synchronization with Spring Boot backend.
 *
 * Flow:
 * PENDING/FAILED -> SYNCING -> SYNCED
 *                          -> FAILED
 */
(function (global) {
    'use strict';

    const BACKEND_SYNC_ENABLED = true;

    // Android Emulator -> host PC
    // Physical phone can override this using setApiUrl().
    let BACKEND_API_URL = 'http://10.0.2.2:8080/api/lots';

    const currentlySyncingLotIds = new Set();

    /**
     * Upload one lot to Spring Boot backend.
     */
    async function uploadLotToBackend(lot) {
        if (!BACKEND_SYNC_ENABLED || !BACKEND_API_URL) {
            return {
                success: false,
                error: 'BACKEND_NOT_CONFIGURED'
            };
        }

        const payload = {
            id: lot.id,
            material: lot.material,
            weight: String(lot.weight ?? ''),
            lotCondition: lot.condition ?? '',
            description: lot.description ?? '',
            location: lot.location ?? '',
            latitude: Number(lot.latitude ?? 0),
            longitude: Number(lot.longitude ?? 0),
            photoPath: lot.photo_path ?? lot.photoPath ?? '',
            createdAt: lot.created_at ?? lot.createdAt ?? '',
            status: lot.status ?? '',
            syncStatus: lot.sync_status ?? 'PENDING',
            retryCount: Number(lot.retry_count ?? 0),
            serverId: lot.server_id ?? null
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.status === 200 || response.status === 201) {
                let data = {};

                try {
                    data = await response.json();
                } catch (_) {
                    // Backend may return an empty response.
                }

                return {
                    success: true,
                    serverId: data.id || data.serverId || lot.id
                };
            }

            return {
                success: false,
                error: `HTTP_${response.status}`
            };

        } catch (err) {
            clearTimeout(timeout);

            return {
                success: false,
                error: err.name === 'AbortError'
                    ? 'REQUEST_TIMEOUT'
                    : (err.message || 'NETWORK_ERROR')
            };
        }
    }

    /**
     * Synchronize one lot.
     */
    async function syncLot(lot) {
        if (!lot || !lot.id) return;

        if (currentlySyncingLotIds.has(lot.id)) {
            console.log(
                `[EcoNex Sync] Already syncing lot: ${lot.id}`
            );
            return;
        }

        currentlySyncingLotIds.add(lot.id);

        try {
            // PENDING/FAILED -> SYNCING
            await global.EcoNexDB.updateLotSyncStatus(
                lot.id,
                'SYNCING',
                null,
                Number(lot.retry_count) || 0
            );

            console.log(
                `[EcoNex Sync] SYNCING: ${lot.id}`
            );

            const result = await uploadLotToBackend(lot);

            if (result.success) {

                // SYNCING -> SYNCED
                await global.EcoNexDB.updateLotSyncStatus(
                    lot.id,
                    'SYNCED',
                    result.serverId || lot.id,
                    Number(lot.retry_count) || 0
                );

                console.log(
                    `[EcoNex Sync] SUCCESS: ${lot.id}`
                );

            } else {

                // SYNCING -> FAILED
                const newRetryCount =
                    (Number(lot.retry_count) || 0) + 1;

                await global.EcoNexDB.updateLotSyncStatus(
                    lot.id,
                    'FAILED',
                    null,
                    newRetryCount
                );

                console.warn(
                    `[EcoNex Sync] FAILED: ${lot.id}`,
                    result.error
                );
            }

        } catch (err) {

            const newRetryCount =
                (Number(lot.retry_count) || 0) + 1;

            try {
                await global.EcoNexDB.updateLotSyncStatus(
                    lot.id,
                    'FAILED',
                    null,
                    newRetryCount
                );
            } catch (dbErr) {
                console.error(
                    '[EcoNex Sync] Failed to update SQLite:',
                    dbErr
                );
            }

            console.error(
                `[EcoNex Sync] Unexpected error for ${lot.id}:`,
                err
            );

        } finally {
            currentlySyncingLotIds.delete(lot.id);
        }
    }

    /**
     * Synchronize all PENDING/FAILED lots.
     */
    async function syncPendingLots() {

        if (!global.EcoNexDB ||
            typeof global.EcoNexDB.getPendingLots !== 'function') {

            console.warn(
                '[EcoNex Sync] EcoNexDB unavailable.'
            );
            return;
        }

        try {

            const pendingLots =
                await global.EcoNexDB.getPendingLots();

            if (!pendingLots || pendingLots.length === 0) {
                console.log(
                    '[EcoNex Sync] No pending lots.'
                );
                return;
            }

            console.log(
                `[EcoNex Sync] Found ${pendingLots.length} pending lot(s).`
            );

            for (const lot of pendingLots) {
                await syncLot(lot);
            }

        } catch (err) {

            console.error(
                '[EcoNex Sync] syncPendingLots error:',
                err
            );
        }
    }

    /**
     * Set backend API URL.
     * Useful for physical Android phone.
     */
    function setApiUrl(url) {

        if (!url || typeof url !== 'string') {
            console.warn(
                '[EcoNex Sync] Invalid API URL.'
            );
            return;
        }

        BACKEND_API_URL = url.replace(/\/+$/, '');

        console.log(
            `[EcoNex Sync] API URL set to: ${BACKEND_API_URL}`
        );
    }

    /**
     * Connect to Phase G network trigger.
     */
    function initSyncEngine() {

        if (
            global.EcoNexSync &&
            typeof global.EcoNexSync.onSyncRequested === 'function'
        ) {

            global.EcoNexSync.onSyncRequested(() => {
                syncPendingLots();
            });

            console.log(
                '[EcoNex Sync] Connected to network sync trigger.'
            );

        } else {

            setTimeout(initSyncEngine, 500);
        }
    }

    global.EcoNexSyncEngine = {

        syncPendingLots,
        syncLot,
        setApiUrl,

        isBackendEnabled: function () {
            return BACKEND_SYNC_ENABLED;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initSyncEngine
        );
    } else {
        initSyncEngine();
    }

})(typeof window !== 'undefined' ? window : this);