package com.econex.app.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.econex.app.model.TransactionEntity

@Dao
interface TransactionDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertTransaction(transaction: TransactionEntity): Long

    @Query("SELECT * FROM transactions WHERE lotId = :lotId LIMIT 1")
    fun getTransactionByLotId(lotId: String): TransactionEntity?

    @Query("SELECT * FROM transactions WHERE collectorId = :collectorId ORDER BY timestamp DESC")
    fun getTransactionsForCollector(collectorId: String): List<TransactionEntity>

    @Query("SELECT * FROM transactions WHERE syncStatus IN ('PENDING', 'FAILED')")
    fun getPendingTransactions(): List<TransactionEntity>

    @Query("SELECT COALESCE(SUM(amount), 0.0) FROM transactions WHERE collectorId = :collectorId AND paymentStatus = 'COMPLETED'")
    fun getTotalEarnings(collectorId: String): Double
}
