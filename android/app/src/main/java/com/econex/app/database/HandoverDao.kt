package com.econex.app.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.econex.app.model.HandoverEventEntity

@Dao
interface HandoverDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertEvent(event: HandoverEventEntity): Long

    @Query("SELECT * FROM handover_events WHERE lotId = :lotId ORDER BY timestamp ASC")
    fun getEventsForLot(lotId: String): List<HandoverEventEntity>

    @Query("SELECT * FROM handover_events WHERE syncStatus = 'PENDING'")
    fun getPendingEvents(): List<HandoverEventEntity>
}
