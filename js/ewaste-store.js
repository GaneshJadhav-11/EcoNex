function getEWasteStorePlugin() {
    const capacitor = window.Capacitor;
    if (!capacitor) return null;
    if (capacitor.Plugins && capacitor.Plugins.EWasteStore) {
        return capacitor.Plugins.EWasteStore;
    }
    if (typeof capacitor.registerPlugin === 'function') {
        return capacitor.registerPlugin('EWasteStore');
    }
    return null;
}

// Create lot offline using Room Database
async function saveLotOffline(lotData) {
    const store = getEWasteStorePlugin();
    if (store) {
        try {
            return await store.createLot(lotData);
        } catch (e) {
            console.error("Failed to save lot offline:", e);
            throw e;
        }
    } else {
        console.warn("EWasteStore plugin not available on web.");
        return { id: "web_" + Date.now(), ...lotData, syncStatus: "PENDING" };
    }
}

// Get all offline saved lots
async function getOfflineLots() {
    const store = getEWasteStorePlugin();
    if (store) {
        try {
            const res = await store.getLots();
            return res.lots || [];
        } catch (e) {
            console.error("Failed to get lots:", e);
            return [];
        }
    }
    return [];
}

// Get handover events for a lot
async function getHandoverEvents(lotId) {
    const store = getEWasteStorePlugin();
    if (store) {
        try {
            const res = await store.getHandoverEvents({ lotId });
            return res.events || [];
        } catch (e) {
            console.error("Failed to get handover events:", e);
            return [];
        }
    }
    return [];
}

// Record digital handover event
async function recordHandoverEvent(eventData) {
    const store = getEWasteStorePlugin();
    if (store) {
        try {
            return await store.recordHandoverEvent(eventData);
        } catch (e) {
            console.error("Failed to record handover event:", e);
        }
    }
}

// Get transactions and earnings
async function getTransactions(collectorId) {
    const store = getEWasteStorePlugin();
    if (store) {
        try {
            return await store.getTransactions({ collectorId: collectorId || "default_collector" });
        } catch (e) {
            console.error("Failed to get transactions:", e);
            return { transactions: [], totalEarnings: 0 };
        }
    }
    return { transactions: [], totalEarnings: 0 };
}

// Manual sync trigger
async function triggerSync() {
    const store = getEWasteStorePlugin();
    if (store) {
        try {
            return await store.syncPending();
        } catch (e) {
            console.error("Sync trigger error:", e);
        }
    }
}
