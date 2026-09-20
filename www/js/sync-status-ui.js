/**
 * EcoNex Reusable Sync Status UI Utility (Phase I)
 * Converts SQLite lot sync_status into Collector-facing visual badge HTML & status text.
 */
(function (global) {
    'use strict';

    /**
     * Get the formatted status label & emoji for a lot sync_status.
     * @param {string} syncStatus - PENDING | SYNCING | SYNCED | FAILED
     * @param {number} retryCount - Optional retry counter for FAILED status
     * @returns {{label: string, cssClass: string, icon: string}}
     */
    function getStatusMetadata(syncStatus, retryCount = 0) {
        const status = (syncStatus || 'PENDING').toUpperCase();

        switch (status) {
            case 'SYNCING':
                return {
                    label: 'Syncing',
                    cssClass: 'syncing',
                    icon: '🔄'
                };
            case 'SYNCED':
                return {
                    label: 'Synced',
                    cssClass: 'synced',
                    icon: '🟢'
                };
            case 'FAILED':
                const retries = Number(retryCount) || 0;
                const retryText = retries > 0 ? ` (${retries} attempts)` : '';
                return {
                    label: `Sync Failed${retryText}`,
                    cssClass: 'sync-failed',
                    icon: '🔴'
                };
            case 'PENDING':
            default:
                return {
                    label: 'Pending Sync',
                    cssClass: 'pending-sync',
                    icon: '🟡'
                };
        }
    }

    /**
     * Generate HTML badge element string for a lot sync status.
     * @param {string} syncStatus
     * @param {number} retryCount
     * @returns {string} HTML span element string
     */
    function getBadgeHtml(syncStatus, retryCount = 0) {
        const meta = getStatusMetadata(syncStatus, retryCount);
        return `<span class="sync-badge ${meta.cssClass}">${meta.icon} ${meta.label}</span>`;
    }

    /**
     * Event-based UI refresh trigger listener registration.
     * @param {Function} callback
     */
    function onSyncStatusUpdated(callback) {
        if (typeof callback === 'function') {
            global.addEventListener('econex_sync_status_changed', callback);
        }
    }

    /**
     * Dispatch lightweight sync status updated event when DB or sync status changes.
     */
    function notifySyncStatusChanged() {
        try {
            global.dispatchEvent(new CustomEvent('econex_sync_status_changed'));
        } catch (e) {
            console.warn('[EcoNex Sync UI] Event dispatch warning:', e);
        }
    }

    // Expose EcoNexSyncStatusUI on global scope
    global.EcoNexSyncStatusUI = {
        getStatusMetadata: getStatusMetadata,
        getBadgeHtml: getBadgeHtml,
        onSyncStatusUpdated: onSyncStatusUpdated,
        notifySyncStatusChanged: notifySyncStatusChanged
    };

})(typeof window !== 'undefined' ? window : this);
