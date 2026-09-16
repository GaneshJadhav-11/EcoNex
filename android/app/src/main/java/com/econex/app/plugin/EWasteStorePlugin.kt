package com.econex.app.plugin

import com.econex.app.model.EWasteLotEntity
import com.econex.app.model.HandoverEventEntity
import com.econex.app.repository.EWasteRepository
import com.econex.app.worker.SyncWorker
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.UUID

@CapacitorPlugin(name = "EWasteStore")
class EWasteStorePlugin : Plugin() {

    private lateinit var repository: EWasteRepository

    override fun load() {
        super.load()
        repository = EWasteRepository(context)
    }

    @PluginMethod
    fun createLot(call: PluginCall) {
        val collectorId = call.getString("collectorId") ?: "default_collector"
        val category = call.getString("category") ?: "E-Waste"
        val weightKg = call.getDouble("weightKg") ?: 1.0
        val quantity = call.getInt("quantity") ?: 1
        val imagePath = call.getString("imagePath") ?: ""
        val address = call.getString("address") ?: ""

        val lot = EWasteLotEntity(
            id = UUID.randomUUID().toString(),
            collectorId = collectorId,
            category = category,
            weightKg = weightKg,
            quantity = quantity,
            imagePath = imagePath,
            address = address,
            syncStatus = "PENDING"
        )

        CoroutineScope(Dispatchers.IO).launch {
            val savedLot = repository.createLot(lot)

            // Trigger WorkManager background sync
            SyncWorker.enqueueSync(context)

            val ret = JSObject()
            ret.put("id", savedLot.id)
            ret.put("category", savedLot.category)
            ret.put("weightKg", savedLot.weightKg)
            ret.put("syncStatus", savedLot.syncStatus)
            ret.put("createdAt", savedLot.createdAt)

            call.resolve(ret)
        }
    }

    @PluginMethod
    fun getLots(call: PluginCall) {
        CoroutineScope(Dispatchers.IO).launch {
            val lots = repository.getAllLots()
            val jsArray = JSArray()

            for (lot in lots) {
                val item = JSObject()
                item.put("id", lot.id)
                item.put("category", lot.category)
                item.put("weightKg", lot.weightKg)
                item.put("quantity", lot.quantity)
                item.put("imagePath", lot.imagePath)
                item.put("syncStatus", lot.syncStatus)
                item.put("aiCategory", lot.aiCategory ?: "")
                item.put("estimatedPrice", lot.estimatedPrice ?: 0.0)
                item.put("recyclerRecommendation", lot.recyclerRecommendation ?: "")
                item.put("createdAt", lot.createdAt)
                jsArray.put(item)
            }

            val ret = JSObject()
            ret.put("lots", jsArray)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun getHandoverEvents(call: PluginCall) {
        val lotId = call.getString("lotId") ?: return call.reject("lotId is required")

        CoroutineScope(Dispatchers.IO).launch {
            val events = repository.getHandoverEvents(lotId)
            val jsArray = JSArray()

            for (event in events) {
                val item = JSObject()
                item.put("id", event.id)
                item.put("lotId", event.lotId)
                item.put("eventType", event.eventType)
                item.put("timestamp", event.timestamp)
                item.put("notes", event.notes ?: "")
                jsArray.put(item)
            }

            val ret = JSObject()
            ret.put("events", jsArray)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun recordHandoverEvent(call: PluginCall) {
        val lotId = call.getString("lotId") ?: return call.reject("lotId is required")
        val collectorId = call.getString("collectorId") ?: "default_collector"
        val eventType = call.getString("eventType") ?: "HANDOVER"
        val notes = call.getString("notes") ?: ""

        val event = HandoverEventEntity(
            id = UUID.randomUUID().toString(),
            lotId = lotId,
            collectorId = collectorId,
            eventType = eventType,
            notes = notes
        )

        CoroutineScope(Dispatchers.IO).launch {
            repository.recordHandoverEvent(event)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun getTransactions(call: PluginCall) {
        val collectorId = call.getString("collectorId") ?: "default_collector"

        CoroutineScope(Dispatchers.IO).launch {
            val transactions = repository.getTransactions(collectorId)
            val totalEarnings = repository.getTotalEarnings(collectorId)

            val jsArray = JSArray()
            for (tx in transactions) {
                val item = JSObject()
                item.put("id", tx.id)
                item.put("lotId", tx.lotId)
                item.put("amount", tx.amount)
                item.put("paymentStatus", tx.paymentStatus)
                item.put("paymentMethod", tx.paymentMethod)
                item.put("timestamp", tx.timestamp)
                jsArray.put(item)
            }

            val ret = JSObject()
            ret.put("transactions", jsArray)
            ret.put("totalEarnings", totalEarnings)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun syncPending(call: PluginCall) {
        SyncWorker.enqueueSync(context)
        val ret = JSObject()
        ret.put("status", "SYNC_ENQUEUED")
        call.resolve(ret)
    }
}
