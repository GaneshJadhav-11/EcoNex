package com.econex.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey
    val id: String,
    val collectorId: String,
    val lotId: String,
    val amount: Double,
    val paymentStatus: String = "PENDING",
    val paymentMethod: String = "UPI",
    val timestamp: Long = System.currentTimeMillis()
)
