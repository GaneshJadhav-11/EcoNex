package com.econex.app.plugin

import com.econex.app.model.EWasteLotEntity
import com.econex.app.model.HandoverEventEntity
import com.econex.app.model.OfferEntity
import com.econex.app.model.RecyclerProfileEntity
import com.econex.app.model.TransactionEntity
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
        
        // Use supplied ID or generate a new one
        val providedId = call.getString("id")
        val lotId = if (!providedId.isNullOrEmpty()) providedId else UUID.randomUUID().toString()

        val lot = EWasteLotEntity(
            id = lotId,
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
        val recyclerId = call.getString("recyclerId")
        val eventType = call.getString("eventType") ?: "HANDOVER"
        val notes = call.getString("notes") ?: ""

        val event = HandoverEventEntity(
            id = UUID.randomUUID().toString(),
            lotId = lotId,
            collectorId = collectorId,
            recyclerId = recyclerId,
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
    fun recordTransaction(call: PluginCall) {
        val collectorId = call.getString("collectorId") ?: return call.reject("collectorId is required")
        val lotId = call.getString("lotId") ?: return call.reject("lotId is required")
        val recyclerId = call.getString("recyclerId")
        val recyclerName = call.getString("recyclerName")
        val material = call.getString("material")
        val finalWeight = call.getDouble("finalWeight") ?: 0.0
        val pricePerKg = call.getDouble("pricePerKg") ?: 0.0
        val location = call.getString("location")
        val paymentMethod = call.getString("paymentMethod") ?: "UPI"
        val paymentStatus = call.getString("paymentStatus") ?: "PENDING"
        
        // Final amount MUST be finalWeight * pricePerKg. Fallback to passed amount if fields are missing.
        var amount = call.getDouble("amount") ?: 0.0
        if (finalWeight > 0 && pricePerKg > 0) {
            amount = finalWeight * pricePerKg
        }

        if (amount <= 0.0) {
            return call.reject("Valid positive amount or weight/price must be provided")
        }

        CoroutineScope(Dispatchers.IO).launch {
            // Duplicate prevention
            val existing = repository.getTransactionByLotId(lotId)
            if (existing != null) {
                // If it already exists, just return success or update it if we are changing payment status
                if (existing.paymentStatus != paymentStatus) {
                    val updatedTx = existing.copy(paymentStatus = paymentStatus, syncStatus = "PENDING")
                    repository.recordTransaction(updatedTx)
                }
                val ret = JSObject()
                ret.put("success", true)
                ret.put("duplicate", true)
                ret.put("id", existing.id)
                call.resolve(ret)
                return@launch
            }

            val transaction = TransactionEntity(
                id = UUID.randomUUID().toString(),
                collectorId = collectorId,
                lotId = lotId,
                recyclerId = recyclerId,
                recyclerName = recyclerName,
                material = material,
                finalWeight = finalWeight,
                pricePerKg = pricePerKg,
                amount = amount,
                paymentStatus = paymentStatus,
                paymentMethod = paymentMethod,
                location = location,
                syncStatus = "PENDING"
            )

            repository.recordTransaction(transaction)
            
            SyncWorker.enqueueSync(context)

            val ret = JSObject()
            ret.put("success", true)
            ret.put("id", transaction.id)
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
                item.put("collectorId", tx.collectorId)
                item.put("recyclerId", tx.recyclerId ?: "")
                item.put("recycler", tx.recyclerName ?: "")
                item.put("material", tx.material ?: "")
                item.put("finalWeight", tx.finalWeight ?: 0.0)
                item.put("pricePerKg", tx.pricePerKg ?: 0.0)
                item.put("amount", tx.amount)
                item.put("paymentStatus", tx.paymentStatus)
                item.put("paymentMethod", tx.paymentMethod)
                item.put("location", tx.location ?: "")
                item.put("syncStatus", tx.syncStatus)
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
    fun updatePaymentStatus(call: PluginCall) {
        val lotId = call.getString("lotId") ?: return call.reject("lotId required")
        val status = call.getString("paymentStatus") ?: "COMPLETED"
        
        CoroutineScope(Dispatchers.IO).launch {
            val existing = repository.getTransactionByLotId(lotId)
            if (existing != null) {
                val updatedTx = existing.copy(paymentStatus = status, syncStatus = "PENDING")
                repository.recordTransaction(updatedTx)
                
                // We should also record a Handover event for payment if changing to COMPLETED
                if (status == "COMPLETED") {
                    // Duplicate check for PAYMENT event
                    val existingEvent = repository.getHandoverEventByTypeAndLot(existing.lotId, "PAYMENT")
                    if (existingEvent == null) {
                        val event = HandoverEventEntity(
                            id = UUID.randomUUID().toString(),
                            lotId = existing.lotId,
                            collectorId = existing.collectorId,
                            recyclerId = existing.recyclerId,
                            eventType = "PAYMENT",
                            notes = "Payment Marked as Paid (Amount: ${existing.amount})"
                        )
                        repository.recordHandoverEvent(event)
                    }
                }

                SyncWorker.enqueueSync(context)

                val ret = JSObject()
                ret.put("success", true)
                ret.put("paymentStatus", status)
                call.resolve(ret)
            } else {
                call.reject("Transaction not found for lotId")
            }
        }
    }

    @PluginMethod
    fun saveRecyclerProfile(call: PluginCall) {
        val profileId = call.getString("id") ?: UUID.randomUUID().toString()
        val name = call.getString("name") ?: ""
        val contact = call.getString("contact") ?: ""
        val location = call.getString("location") ?: ""
        val materials = call.getString("acceptedMaterials") ?: ""
        val authNumber = call.getString("authorizationNumber") ?: ""
        val pickup = call.getString("pickup") ?: ""
        val status = call.getString("verificationStatus") ?: "Pending Verification"

        val profile = RecyclerProfileEntity(
            recyclerId = profileId,
            name = name,
            contact = contact,
            location = location,
            acceptedMaterials = materials,
            authorizationNumber = authNumber,
            pickupAvailability = pickup,
            verificationStatus = status,
            syncStatus = "PENDING"
        )

        CoroutineScope(Dispatchers.IO).launch {
            repository.saveRecyclerProfile(profile)
            SyncWorker.enqueueSync(context)
            
            val ret = JSObject()
            ret.put("success", true)
            ret.put("id", profile.recyclerId)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun getRecyclerProfile(call: PluginCall) {
        val recyclerId = call.getString("id") ?: return call.reject("id is required")

        CoroutineScope(Dispatchers.IO).launch {
            val profile = repository.getRecyclerProfile(recyclerId)
            if (profile != null) {
                val ret = JSObject()
                ret.put("id", profile.recyclerId)
                ret.put("name", profile.name)
                ret.put("contact", profile.contact)
                ret.put("location", profile.location)
                ret.put("acceptedMaterials", profile.acceptedMaterials)
                ret.put("authorizationNumber", profile.authorizationNumber)
                ret.put("pickup", profile.pickupAvailability)
                ret.put("verificationStatus", profile.verificationStatus)
                call.resolve(ret)
            } else {
                call.reject("Profile not found")
            }
        }
    }

    @PluginMethod
    fun submitOffer(call: PluginCall) {
        val offerId = call.getString("id") ?: UUID.randomUUID().toString()
        val lotId = call.getString("lotId") ?: return call.reject("lotId required")
        val recyclerId = call.getString("recyclerId") ?: ""
        val recyclerName = call.getString("recyclerName") ?: ""
        val price = call.getDouble("price") ?: 0.0
        val pickup = call.getString("pickup") ?: ""

        val offer = OfferEntity(
            id = offerId,
            lotId = lotId,
            recyclerId = recyclerId,
            recyclerName = recyclerName,
            price = price,
            pickupAvailability = pickup,
            syncStatus = "PENDING"
        )

        CoroutineScope(Dispatchers.IO).launch {
            repository.saveOffer(offer)
            SyncWorker.enqueueSync(context)

            val ret = JSObject()
            ret.put("success", true)
            ret.put("id", offer.id)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun getOffersForLot(call: PluginCall) {
        val lotId = call.getString("lotId") ?: return call.reject("lotId is required")

        CoroutineScope(Dispatchers.IO).launch {
            val offers = repository.getOffersForLot(lotId)
            val jsArray = JSArray()

            for (offer in offers) {
                val item = JSObject()
                item.put("id", offer.id)
                item.put("lotId", offer.lotId)
                item.put("recyclerId", offer.recyclerId)
                item.put("recycler", offer.recyclerName)
                item.put("price", offer.price)
                item.put("pickup", offer.pickupAvailability)
                item.put("createdAt", offer.createdAt)
                jsArray.put(item)
            }

            val ret = JSObject()
            ret.put("offers", jsArray)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun getOffersByRecycler(call: PluginCall) {
        val recyclerId = call.getString("recyclerId") ?: return call.reject("recyclerId is required")

        CoroutineScope(Dispatchers.IO).launch {
            val offers = repository.getOffersByRecycler(recyclerId)
            val jsArray = JSArray()

            for (offer in offers) {
                val item = JSObject()
                item.put("id", offer.id)
                item.put("lotId", offer.lotId)
                item.put("recyclerId", offer.recyclerId)
                item.put("recycler", offer.recyclerName)
                item.put("price", offer.price)
                item.put("pickup", offer.pickupAvailability)
                item.put("createdAt", offer.createdAt)
                jsArray.put(item)
            }

            val ret = JSObject()
            ret.put("offers", jsArray)
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
