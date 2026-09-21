package com.econex.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "recycler_profiles")
data class RecyclerProfileEntity(
    @PrimaryKey
    val recyclerId: String, // This will be the Google authenticated email
    val name: String,
    val contact: String,
    val location: String,
    val acceptedMaterials: String,
    val authorizationNumber: String,
    val pickupAvailability: String,
    val documentData: String = "", // Base64 or path
    val documentName: String = "",
    val verificationStatus: String = "Pending Verification",
    val rejectionReason: String = "",
    val syncStatus: String = "PENDING",
    val createdAt: Long = System.currentTimeMillis()
)
