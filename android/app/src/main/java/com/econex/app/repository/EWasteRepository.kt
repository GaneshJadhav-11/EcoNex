package com.econex.app.repository

import android.content.Context
import com.econex.app.database.AppDatabase
import com.econex.app.model.EWasteLotEntity
import com.econex.app.model.HandoverEventEntity
import com.econex.app.model.OfferEntity
import com.econex.app.model.RecyclerProfileEntity
import com.econex.app.model.TransactionEntity
import com.econex.app.network.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class EWasteRepository(context: Context) {

    private val db = AppDatabase.getDatabase(context)
    private val lotDao = db.eWasteLotDao()
    private val handoverDao = db.handoverDao()
    private val transactionDao = db.transactionDao()
    private val api = RetrofitClient.instance

    // Create a new e-waste lot locally (Offline-First)
    suspend fun createLot(lot: EWasteLotEntity): EWasteLotEntity = withContext(Dispatchers.IO) {
        lotDao.insertLot(lot)

        // Automatically record LOT_CREATED handover event
        val handoverEvent = HandoverEventEntity(
            id = UUID.randomUUID().toString(),
            lotId = lot.id,
            collectorId = lot.collectorId,
            eventType = "LOT_CREATED",
            notes = "Lot created offline"
        )
        handoverDao.insertEvent(handoverEvent)

        lot
    }

    suspend fun getAllLots(): List<EWasteLotEntity> = withContext(Dispatchers.IO) {
        lotDao.getAllLots()
    }

    suspend fun getPendingLots(): List<EWasteLotEntity> = withContext(Dispatchers.IO) {
        lotDao.getPendingLots()
    }

    // Sync a pending lot with the backend
    suspend fun syncLot(lot: EWasteLotEntity): Boolean = withContext(Dispatchers.IO) {
        try {
            val response = api.syncLot(lot)
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                val updatedLot = lot.copy(
                    syncStatus = "SYNCED",
                    aiCategory = body.aiCategory,
                    aiConfidence = body.aiConfidence,
                    estimatedPrice = body.estimatedPrice,
                    recyclerRecommendation = body.recommendedRecyclers?.firstOrNull()?.recyclerName
                )
                lotDao.updateLot(updatedLot)
                true
            } else {
                lotDao.updateLot(lot.copy(syncStatus = "FAILED"))
                false
            }
        } catch (e: Exception) {
            lotDao.updateLot(lot.copy(syncStatus = "FAILED"))
            false
        }
    }

    // Handover & Ledger
    suspend fun recordHandoverEvent(event: HandoverEventEntity) = withContext(Dispatchers.IO) {
        handoverDao.insertEvent(event)
    }

    suspend fun getPendingHandoverEvents(): List<HandoverEventEntity> = withContext(Dispatchers.IO) {
        handoverDao.getPendingEvents()
    }

    suspend fun syncHandoverEvent(event: HandoverEventEntity): Boolean = withContext(Dispatchers.IO) {
        try {
            val response = api.syncHandoverEvent(event)
            if (response.isSuccessful && response.body()?.success == true) {
                handoverDao.insertEvent(event.copy(syncStatus = "SYNCED"))
                true
            } else {
                val newStatus = if (response.code() in 400..499) "REJECTED" else "FAILED"
                handoverDao.insertEvent(event.copy(syncStatus = newStatus))
                false
            }
        } catch (e: Exception) {
            handoverDao.insertEvent(event.copy(syncStatus = "FAILED"))
            false
        }
    }

    suspend fun getHandoverEvents(lotId: String): List<HandoverEventEntity> = withContext(Dispatchers.IO) {
        handoverDao.getEventsForLot(lotId)
    }

    suspend fun getHandoverEventByTypeAndLot(lotId: String, eventType: String): HandoverEventEntity? = withContext(Dispatchers.IO) {
        handoverDao.getEventByTypeAndLot(lotId, eventType)
    }

    suspend fun recordTransaction(transaction: TransactionEntity) = withContext(Dispatchers.IO) {
        transactionDao.insertTransaction(transaction)
    }

    suspend fun syncTransaction(transaction: TransactionEntity): Boolean = withContext(Dispatchers.IO) {
        try {
            val response = api.syncTransaction(transaction)
            if (response.isSuccessful && response.body()?.success == true) {
                transactionDao.insertTransaction(transaction.copy(syncStatus = "SYNCED"))
                true
            } else {
                val newStatus = if (response.code() in 400..499) "REJECTED" else "FAILED"
                transactionDao.insertTransaction(transaction.copy(syncStatus = newStatus))
                false
            }
        } catch (e: Exception) {
            transactionDao.insertTransaction(transaction.copy(syncStatus = "FAILED"))
            false
        }
    }

    suspend fun getTransactionByLotId(lotId: String): TransactionEntity? = withContext(Dispatchers.IO) {
        transactionDao.getTransactionByLotId(lotId)
    }

    suspend fun getTransactions(collectorId: String): List<TransactionEntity> = withContext(Dispatchers.IO) {
        transactionDao.getTransactionsForCollector(collectorId)
    }

    suspend fun getPendingTransactions(): List<TransactionEntity> = withContext(Dispatchers.IO) {
        transactionDao.getPendingTransactions()
    }

    suspend fun getTotalEarnings(collectorId: String): Double = withContext(Dispatchers.IO) {
        transactionDao.getTotalEarnings(collectorId)
    }

    // Recycler Profiles
    suspend fun saveRecyclerProfile(profile: RecyclerProfileEntity) = withContext(Dispatchers.IO) {
        db.recyclerProfileDao().insertProfile(profile)
    }

    suspend fun getRecyclerProfile(recyclerId: String): RecyclerProfileEntity? = withContext(Dispatchers.IO) {
        db.recyclerProfileDao().getProfile(recyclerId)
    }

    suspend fun getPendingRecyclerProfiles(): List<RecyclerProfileEntity> = withContext(Dispatchers.IO) {
        db.recyclerProfileDao().getPendingProfiles()
    }

    // Offers
    suspend fun saveOffer(offer: OfferEntity) = withContext(Dispatchers.IO) {
        db.offerDao().insertOffer(offer)
    }

    suspend fun getOffersForLot(lotId: String): List<OfferEntity> = withContext(Dispatchers.IO) {
        db.offerDao().getOffersForLot(lotId)
    }

    suspend fun getOffersByRecycler(recyclerId: String): List<OfferEntity> = withContext(Dispatchers.IO) {
        db.offerDao().getOffersByRecycler(recyclerId)
    }

    suspend fun getPendingOffers(): List<OfferEntity> = withContext(Dispatchers.IO) {
        db.offerDao().getPendingOffers()
    }
}
