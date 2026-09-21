package com.econex.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey
    val id: String,
    val collectorId: String,
    val lotId: String,
    val recyclerId: String? = null,
    val recyclerName: String? = null,
    val material: String? = null,
    val finalWeight: Double? = null,
    val pricePerKg: Double? = null,
    val amount: Double,
    val paymentStatus: String = "PENDING",
    val paymentMethod: String = "UPI",
    val location: String? = null,
    val syncStatus: String = "PENDING",
    val timestamp: Long = System.currentTimeMillis()
)
