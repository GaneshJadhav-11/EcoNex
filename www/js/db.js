/**
 * EcoNex SQLite Local Storage Layer (Phase E & F)
 * Primary SQLite persistence layer for offline-first lots, sync states, and CRUD operations.
 */
(function (global) {
    'use strict';

    const DB_NAME = 'econex_db';
    let sqlitePlugin = null;
    let isNativeDbReady = false;
    let initPromise = null;

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
     * Save base64 image to device filesystem and return file URI or path reference.
     * @param {string} lotId
     * @param {string} base64DataUrl
     * @returns {Promise<string>} File URI or data URL fallback
     */
    async function savePhotoToFilesystem(lotId, base64DataUrl) {
        if (!base64DataUrl || !base64DataUrl.startsWith('data:image')) {
            return base64DataUrl || '';
        }

        const Filesystem = global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.Filesystem;
        if (Filesystem) {
            try {
                const fileName = `lot_photo_${lotId}.jpg`;
                const pureBase64 = base64DataUrl.split(',')[1] || base64DataUrl;

                const savedFile = await Filesystem.writeFile({
                    path: `photos/${fileName}`,
                    data: pureBase64,
                    directory: 'DATA',
                    recursive: true
                });

                if (savedFile && savedFile.uri) {
                    console.log('[EcoNex DB] Photo saved to device filesystem:', savedFile.uri);
                    return savedFile.uri;
                }
            } catch (err) {
                console.warn('[EcoNex DB] Filesystem photo write warning, using fallback:', err.message || err);
            }
        }
        return base64DataUrl;
    }

    /**
     * Ensure SQLite database is created, open, and ready for queries on native bridge.
     * @returns {Promise<boolean>} True if native connection is ready; False otherwise.
     */
    async function ensureNativeDBConnection() {
        sqlitePlugin = getSQLitePlugin();
        if (!sqlitePlugin) return false;

        try {
            // Check connection status
            const isConn = await sqlitePlugin.isConnection({ database: DB_NAME, readonly: false });
            if (!isConn || !isConn.result) {
                try {
                    await sqlitePlugin.createConnection({
                        database: DB_NAME,
                        version: 1,
                        encrypted: false,
                        mode: 'no-encryption',
                        readonly: false
                    });
                } catch (createErr) {
                    console.log('[EcoNex DB] Connection create notice, retrieving connection:', createErr.message || createErr);
                    try {
                        await sqlitePlugin.retrieveConnection({ database: DB_NAME, readonly: false });
                    } catch (rErr) {
                        // ignore retrieve notice
                    }
                }
            }

            // Check open status
            const isOpen = await sqlitePlugin.isDBOpen({ database: DB_NAME, readonly: false });
            if (!isOpen || !isOpen.result) {
                await sqlitePlugin.open({ database: DB_NAME, readonly: false });
            }

            return true;
        } catch (err) {
            console.error('[EcoNex DB] Native connection check failed:', err.message || err);
            return false;
        }
    }

    /**
     * Initialize the SQLite Database & create 'lots' table schema safely.
     */
    function initDB() {
        if (isNativeDbReady) return Promise.resolve(true);
        if (initPromise) return initPromise;

        initPromise = (async () => {
            sqlitePlugin = getSQLitePlugin();

            if (sqlitePlugin) {
                const ready = await ensureNativeDBConnection();
                if (ready) {
                    try {
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
                                status TEXT NOT NULL DEFAULT 'Waiting for Recycler Offers',
                                sync_status TEXT NOT NULL DEFAULT 'PENDING',
                                retry_count INTEGER NOT NULL DEFAULT 0,
                                server_id TEXT
                            );
                        `;

                        await sqlitePlugin.execute({
                            database: DB_NAME,
                            statements: createTableStatement,
                            transaction: false
                        });

                        isNativeDbReady = true;
                        console.log('[EcoNex DB] SQLite database econex_db initialized & schema created successfully.');
                        return true;
                    } catch (tableErr) {
                        console.error('[EcoNex DB] Error creating lots table:', tableErr.message || tableErr);
                        isNativeDbReady = false;
                        return false;
                    }
                } else {
                    console.warn('[EcoNex DB] Native SQLite plugin available but connection could not be opened.');
                    isNativeDbReady = false;
                    return false;
                }
            } else {
                console.log('[EcoNex DB] Running in Web mode (CapacitorSQLite plugin not active).');
                isNativeDbReady = false;
                return false;
            }
        })();

        return initPromise;
    }

    /**
     * Save or update a lot in the SQLite Database.
     * @param {Object} lot
     * @param {boolean} updateLocalStorageMirror
     */
    async function saveLot(lot, updateLocalStorageMirror = true) {
        await initDB();

        const lotId = lot.id || ('LOT-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase());
        let rawPhoto = lot.photo_path || lot.image || '';

        // Save heavy Base64 image to device filesystem if running natively
        let savedPhotoPath = rawPhoto;
        if (rawPhoto.startsWith('data:image')) {
            savedPhotoPath = await savePhotoToFilesystem(lotId, rawPhoto);
        }

        const lotData = {
            id: lotId,
            material: lot.material || 'Mixed E-Waste',
            weight: Number(lot.weight || 0),
            condition: lot.condition || 'Mixed',
            description: lot.description || '',
            latitude: lot.latitude !== undefined && lot.latitude !== null ? Number(lot.latitude) : null,
            longitude: lot.longitude !== undefined && lot.longitude !== null ? Number(lot.longitude) : null,
            photo_path: savedPhotoPath,
            created_at: lot.createdAt || lot.created_at || new Date().toLocaleString(),
            status: lot.status || 'Waiting for Recycler Offers',
            sync_status: lot.sync_status || lot.syncStatus || 'PENDING',
            retry_count: Number(lot.retry_count || lot.retryCount || 0),
            server_id: lot.server_id || lot.serverId || null
        };

        sqlitePlugin = getSQLitePlugin();
        let sqliteSuccess = false;

        if (sqlitePlugin) {
            const ready = await ensureNativeDBConnection();
            if (ready) {
                try {
                    const statement = `
                        INSERT OR REPLACE INTO lots
                        (id, material, weight, condition, description, latitude, longitude, photo_path, created_at, status, sync_status, retry_count, server_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
                        lotData.status,
                        lotData.sync_status,
                        lotData.retry_count,
                        lotData.server_id
                    ];

                    const runResult = await sqlitePlugin.run({
                        database: DB_NAME,
                        statement: statement,
                        values: values,
                        transaction: false
                    });

                    sqliteSuccess = true;
                    console.log('[EcoNex DB] SUCCESS: Lot stored in SQLite database econex_db:', lotData.id, runResult);
                } catch (err) {
                    console.error('[EcoNex DB] PRIMARY SQLITE SAVE FAILURE:', err.message || err);
                    sqliteSuccess = false;
                }
            }
        }

        // Lightweight localStorage Mirror (non-fatal, path-only reference)
        if (updateLocalStorageMirror) {
            try {
                let localLots = JSON.parse(localStorage.getItem('lots') || '[]');
                const idx = localLots.findIndex(l => l.id === lotData.id);

                const legacyLot = {
                    id: lotData.id,
                    material: lotData.material,
                    weight: lotData.weight,
                    condition: lotData.condition,
                    description: lotData.description,
                    location: lotData.latitude && lotData.longitude ? (lotData.latitude.toFixed(5) + ', ' + lotData.longitude.toFixed(5)) : (lot.location || ''),
                    latitude: lotData.latitude,
                    longitude: lotData.longitude,
                    image: savedPhotoPath, // Lightweight path reference
                    photo_path: savedPhotoPath,
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
            } catch (storageErr) {
                console.warn('[EcoNex DB] LocalStorage mirror quota warning (non-fatal):', storageErr.message || storageErr);
            }
        }

        if (sqlitePlugin && !sqliteSuccess) {
            throw new Error("SQLite save operation failed in database " + DB_NAME);
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

        if (sqlitePlugin) {
            const ready = await ensureNativeDBConnection();
            if (ready) {
                try {
                    const query = `SELECT * FROM lots ORDER BY created_at DESC;`;
                    const res = await sqlitePlugin.query({
                        database: DB_NAME,
                        statement: query,
                        values: []
                    });

                    if (res && res.values && Array.isArray(res.values)) {
                        console.log('[EcoNex DB] Loaded ' + res.values.length + ' lots from SQLite database econex_db.');
                        return res.values.map(mapDBLotToModel);
                    }
                } catch (err) {
                    console.error('[EcoNex DB] SQLite query error:', err.message || err);
                }
            }
        }

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

        if (sqlitePlugin) {
            const ready = await ensureNativeDBConnection();
            if (ready) {
                try {
                    const query = `SELECT * FROM lots WHERE sync_status = 'PENDING' OR sync_status = 'FAILED' ORDER BY created_at ASC;`;
                    const res = await sqlitePlugin.query({
                        database: DB_NAME,
                        statement: query,
                        values: []
                    });

                    if (res && res.values && Array.isArray(res.values)) {
                        console.log('[EcoNex DB] Loaded ' + res.values.length + ' pending lots from SQLite database econex_db.');
                        return res.values.map(mapDBLotToModel);
                    }
                } catch (err) {
                    console.error('[EcoNex DB] SQLite query pending error:', err.message || err);
                }
            }
        }

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

        if (sqlitePlugin) {
            const ready = await ensureNativeDBConnection();
            if (ready) {
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
                    console.error('[EcoNex DB] SQLite update status error:', err.message || err);
                }
            }
        }

        try {
            let localLots = JSON.parse(localStorage.getItem('lots') || '[]');
            const target = localLots.find(l => l.id === id);
            if (target) {
                target.sync_status = syncStatus;
                if (serverId) target.server_id = serverId;
                target.retry_count = retryCount;
                localStorage.setItem('lots', JSON.stringify(localLots));
            }
        } catch (e) {
            console.warn('[EcoNex DB] LocalStorage update mirror warning:', e);
        }
    }

    /**
     * Delete a lot from local database.
     * @param {string} id
     */
    async function deleteLot(id) {
        await initDB();

        sqlitePlugin = getSQLitePlugin();

        if (sqlitePlugin) {
            const ready = await ensureNativeDBConnection();
            if (ready) {
                try {
                    const statement = `DELETE FROM lots WHERE id = ?;`;
                    await sqlitePlugin.run({
                        database: DB_NAME,
                        statement: statement,
                        values: [id]
                    });
                } catch (err) {
                    console.error('[EcoNex DB] SQLite delete error:', err.message || err);
                }
            }
        }

        try {
            let localLots = JSON.parse(localStorage.getItem('lots') || '[]');
            localLots = localLots.filter(l => l.id !== id);
            localStorage.setItem('lots', JSON.stringify(localLots));
        } catch (e) {
            console.warn('[EcoNex DB] LocalStorage delete mirror warning:', e);
        }
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
            status: row.status || 'Waiting for Recycler Offers',
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
