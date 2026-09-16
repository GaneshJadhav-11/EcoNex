package com.econex.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "handover_events")
data class HandoverEventEntity(
    @PrimaryKey
    val id: String,
    val lotId: String,
    val collectorId: String,
    val recyclerId: String? = null,
    val eventType: String,
    val timestamp: Long = System.currentTimeMillis(),
    val notes: String? = null,
    val syncStatus: String = "PENDING"
)
