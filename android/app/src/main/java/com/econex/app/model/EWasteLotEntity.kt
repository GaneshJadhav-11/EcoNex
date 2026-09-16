package com.econex.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "e_waste_lots")
data class EWasteLotEntity(
    @PrimaryKey
    val id: String,
    val collectorId: String,
    val category: String,
    val weightKg: Double,
    val quantity: Int = 1,
    val imagePath: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val address: String = "",
    val syncStatus: String = "PENDING",
    val aiCategory: String? = null,
    val aiConfidence: Double? = null,
    val estimatedPrice: Double? = null,
    val recyclerRecommendation: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)
