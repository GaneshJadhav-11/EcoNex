package com.econex.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "offers")
data class OfferEntity(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val lotId: String,
    val recyclerId: String, // authenticated user's email
    val recyclerName: String,
    val price: Double,
    val pickupAvailability: String,
    val syncStatus: String = "PENDING",
    val createdAt: Long = System.currentTimeMillis()
)
