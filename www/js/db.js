/**
 * EcoNex SQLite Local Storage Layer (Phase E)
 * Manages offline-first lot persistence, sync states, and CRUD operations.
 */
(function (global) {
    'use strict';

    const DB_NAME = 'econex_db';
    let sqlitePlugin = null;
    let dbConnection = null;
    let isInitialized = false;

    function getSQLitePlugin() {
        if (
            global.Capacitor &&
            global.Capacitor.Plugins &&
            global.Capacitor.Plugins.CapacitorSQLite
        ) {
            return global.Capacitor.Plugins.CapacitorSQLite;
        }
        return null;
    }

    /**
     * Initialize the SQLite Database & create 'lots' table schema.
     */
    async function initDB() {
        if (isInitialized) return;

        sqlitePlugin = getSQLitePlugin();

        if (sqlitePlugin) {
            try {
                // Initialize SQLite connection on Capacitor Native
                const ret = await sqlitePlugin.createConnection({
                    database: DB_NAME,
                    version: 1,
                    encrypted: false,
                    mode: 'no-encryption'
                });

                dbConnection = ret;
                await sqlitePlugin.open({ database: DB_NAME });

                const createTableStatement = `
                    CREATE TABLE IF NOT EXISTS lots (
                        id TEXT PRIMARY KEY,
                        material TEXT NOT NULL,
                        weight REAL NOT NULL,
                        condition TEXT NOT NULL,
                        description TEXT,
                        latitude REAL,
                        longitude REAL,
                        photo_path TEXT,
                        created_at TEXT NOT NULL,
                        sync_status TEXT NOT NULL DEFAULT 'PENDING',
                        retry_count INTEGER NOT NULL DEFAULT 0,
                        server_id TEXT
                    );
                `;

                await sqlitePlugin.execute({
                    database: DB_NAME,
                    statements: createTableStatement
                });

                isInitialized = true;
                console.log('[EcoNex DB] SQLite database initialized successfully.');
            } catch (err) {
                console.warn('[EcoNex DB] SQLite Native initialization error, falling back to Web Storage:', err);
                isInitialized = true;
            }
        } else {
            console.log('[EcoNex DB] Web environment detected. Using local storage bridge for SQLite schema.');
            isInitialized = true;
        }

        // Migrate any existing localStorage lots to DB format
        await syncLocalStorageToSQLite();
    }

    /**
     * Mirror DB records to localStorage so existing team members' UI code reads seamlessly.
     */
    async function mirrorToLocalStorage() {
        try {
            const allLots = await getAllLots();
            localStorage.setItem('lots', JSON.stringify(allLots));
        } catch (e) {
            console.error('[EcoNex DB] Error mirroring to localStorage:', e);
        }
    }

    /**
     * Migrate existing localStorage lots if present.
     */
    async function syncLocalStorageToSQLite() {
        try {
            const raw = localStorage.getItem('lots');
            if (!raw) return;
            const existing = JSON.parse(raw);
            if (Array.isArray(existing) && existing.length > 0) {
                for (const lot of existing) {
                    await saveLot(lot, false);
                }
            }
        } catch (e) {
            console.warn('[EcoNex DB] LocalStorage migration skipped:', e);
        }
    }

    /**
     * Save or update a lot in the SQLite Database.
     * @param {Object} lot
     * @param {boolean} updateLocalStorageMirror
     */
    async function saveLot(lot, updateLocalStorageMirror = true) {
        await initDB();

        const lotData = {
            id: lot.id || ('LOT-' + Date.now().toString(36)),
            material: lot.material || 'Mixed E-Waste',
            weight: Number(lot.weight || 0),
            condition: lot.condition || 'Mixed',
            description: lot.description || '',
            latitude: lot.latitude !== undefined ? Number(lot.latitude) : null,
            longitude: lot.longitude !== undefined ? Number(lot.longitude) : null,
            photo_path: lot.photo_path || lot.image || '',
            created_at: lot.createdAt || lot.created_at || new Date().toLocaleString(),
            sync_status: lot.sync_status || lot.syncStatus || 'PENDING',
            retry_count: Number(lot.retry_count || lot.retryCount || 0),
            server_id: lot.server_id || lot.serverId || null
        };

        sqlitePlugin = getSQLitePlugin();

        if (sqlitePlugin && isInitialized) {
            try {
                const statement = `
                    INSERT OR REPLACE INTO lots
                    (id, material, weight, condition, description, latitude, longitude, photo_path, created_at, sync_status, retry_count, server_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;

                const values = [
                    lotData.id,
                    lotData.material,
                    lotData.weight,
                    lotData.condition,
                    lotData.description,
                    lotData.latitude,
                    lotData.longitude,
                    lotData.photo_path,
                    lotData.created_at,
                    lotData.sync_status,
                    lotData.retry_count,
                    lotData.server_id
                ];

                await sqlitePlugin.run({
                    database: DB_NAME,
                    statement: statement,
                    values: values
                });
            } catch (err) {
                console.warn('[EcoNex DB] SQLite save error, executing fallback save:', err);
            }
        }

        // Web & Mirror Fallback
        if (updateLocalStorageMirror) {
            let localLots = JSON.parse(localStorage.getItem('lots') || '[]');
            const idx = localLots.findIndex(l => l.id === lotData.id);

            // Legacy schema compatible format
            const legacyLot = {
                id: lotData.id,
                material: lotData.material,
                weight: lotData.weight,
                condition: lotData.condition,
                description: lotData.description,
                location: lotData.latitude && lotData.longitude ? (lotData.latitude.toFixed(5) + ', ' + lotData.longitude.toFixed(5)) : (lot.location || ''),
                latitude: lotData.latitude,
                longitude: lotData.longitude,
                image: lotData.photo_path,
                photo_path: lotData.photo_path,
                createdAt: lotData.created_at,
                created_at: lotData.created_at,
                status: lot.status || 'Waiting for Recycler Offers',
                sync_status: lotData.sync_status,
                retry_count: lotData.retry_count,
                server_id: lotData.server_id
            };

            if (idx >= 0) {
                localLots[idx] = legacyLot;
            } else {
                localLots.push(legacyLot);
            }
            localStorage.setItem('lots', JSON.stringify(localLots));
        }

        return lotData;
    }

    /**
     * Retrieve all lots from the Database.
     * @returns {Promise<Array>}
     */
    async function getAllLots() {
        await initDB();

        sqlitePlugin = getSQLitePlugin();

        if (sqlitePlugin && isInitialized) {
            try {
                const query = `SELECT * FROM lots ORDER BY created_at DESC;`;
                const res = await sqlitePlugin.query({
                    database: DB_NAME,
                    statement: query,
                    values: []
                });

                if (res && res.values && Array.isArray(res.values)) {
                    return res.values.map(mapDBLotToModel);
                }
            } catch (err) {
                console.warn('[EcoNex DB] SQLite query error, reading from localStorage:', err);
            }
        }

        // Fallback
        const raw = localStorage.getItem('lots') || '[]';
        return JSON.parse(raw);
    }

    /**
     * Retrieve all pending or failed lots requiring backend synchronization.
     * @returns {Promise<Array>}
     */
    async function getPendingLots() {
        await initDB();

        sqlitePlugin = getSQLitePlugin();

        if (sqlitePlugin && isInitialized) {
            try {
                const query = `SELECT * FROM lots WHERE sync_status = 'PENDING' OR sync_status = 'FAILED' ORDER BY created_at ASC;`;
                const res = await sqlitePlugin.query({
                    database: DB_NAME,
                    statement: query,
                    values: []
                });

                if (res && res.values && Array.isArray(res.values)) {
                    return res.values.map(mapDBLotToModel);
                }
            } catch (err) {
                console.warn('[EcoNex DB] SQLite query pending error:', err);
            }
        }

        // Fallback
        const all = JSON.parse(localStorage.getItem('lots') || '[]');
        return all.filter(l => l.sync_status === 'PENDING' || l.sync_status === 'FAILED');
    }

    /**
     * Update the sync state of a lot (PENDING, SYNCING, SYNCED, FAILED).
     * @param {string} id
     * @param {string} syncStatus
     * @param {string|null} serverId
     * @param {number} retryCount
     */
    async function updateLotSyncStatus(id, syncStatus, serverId = null, retryCount = 0) {
        await initDB();

        sqlitePlugin = getSQLitePlugin();

        if (sqlitePlugin && isInitialized) {
            try {
                const statement = `
                    UPDATE lots
                    SET sync_status = ?, server_id = COALESCE(?, server_id), retry_count = ?
                    WHERE id = ?;
                `;
                await sqlitePlugin.run({
                    database: DB_NAME,
                    statement: statement,
                    values: [syncStatus, serverId, retryCount, id]
                });
            } catch (err) {
                console.warn('[EcoNex DB] SQLite update status error:', err);
            }
        }

        // Update local storage mirror
        let localLots = JSON.parse(localStorage.getItem('lots') || '[]');
        const target = localLots.find(l => l.id === id);
        if (target) {
            target.sync_status = syncStatus;
            if (serverId) target.server_id = serverId;
            target.retry_count = retryCount;
            localStorage.setItem('lots', JSON.stringify(localLots));
        }
    }

    /**
     * Delete a lot from local database.
     * @param {string} id
     */
    async function deleteLot(id) {
        await initDB();

        sqlitePlugin = getSQLitePlugin();

        if (sqlitePlugin && isInitialized) {
            try {
                const statement = `DELETE FROM lots WHERE id = ?;`;
                await sqlitePlugin.run({
                    database: DB_NAME,
                    statement: statement,
                    values: [id]
                });
            } catch (err) {
                console.warn('[EcoNex DB] SQLite delete error:', err);
            }
        }

        let localLots = JSON.parse(localStorage.getItem('lots') || '[]');
        localLots = localLots.filter(l => l.id !== id);
        localStorage.setItem('lots', JSON.stringify(localLots));
    }

    /**
     * Helper to format DB row to Lot model object.
     */
    function mapDBLotToModel(row) {
        return {
            id: row.id,
            material: row.material,
            weight: Number(row.weight),
            condition: row.condition,
            description: row.description || '',
            latitude: row.latitude !== null ? Number(row.latitude) : null,
            longitude: row.longitude !== null ? Number(row.longitude) : null,
            location: (row.latitude && row.longitude) ? (Number(row.latitude).toFixed(5) + ', ' + Number(row.longitude).toFixed(5)) : '',
            photo_path: row.photo_path || '',
            image: row.photo_path || '',
            createdAt: row.created_at,
            created_at: row.created_at,
            status: 'Waiting for Recycler Offers',
            sync_status: row.sync_status || 'PENDING',
            retry_count: Number(row.retry_count || 0),
            server_id: row.server_id || null
        };
    }

    // Expose EcoNexDB API on global scope
    global.EcoNexDB = {
        initDB: initDB,
        saveLot: saveLot,
        getAllLots: getAllLots,
        getPendingLots: getPendingLots,
        updateLotSyncStatus: updateLotSyncStatus,
        deleteLot: deleteLot
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDB);
    } else {
        initDB();
    }

})(typeof window !== 'undefined' ? window : this);
