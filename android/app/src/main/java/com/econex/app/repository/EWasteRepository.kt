package com.econex.app.repository

import android.content.Context
import com.econex.app.database.AppDatabase
import com.econex.app.model.EWasteLotEntity
import com.econex.app.model.HandoverEventEntity
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

    suspend fun getHandoverEvents(lotId: String): List<HandoverEventEntity> = withContext(Dispatchers.IO) {
        handoverDao.getEventsForLot(lotId)
    }

    suspend fun getTransactions(collectorId: String): List<TransactionEntity> = withContext(Dispatchers.IO) {
        transactionDao.getTransactionsForCollector(collectorId)
    }

    suspend fun getTotalEarnings(collectorId: String): Double = withContext(Dispatchers.IO) {
        transactionDao.getTotalEarnings(collectorId) ?: 0.0
    }
}
