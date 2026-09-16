package com.econex.app.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.econex.app.model.EWasteLotEntity

@Dao
interface EWasteLotDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertLot(lot: EWasteLotEntity): Long

    @Update
    fun updateLot(lot: EWasteLotEntity): Int

    @Query("SELECT * FROM e_waste_lots ORDER BY createdAt DESC")
    fun getAllLots(): List<EWasteLotEntity>

    @Query("SELECT * FROM e_waste_lots WHERE id = :id LIMIT 1")
    fun getLotById(id: String): EWasteLotEntity?

    @Query("SELECT * FROM e_waste_lots WHERE syncStatus = 'PENDING'")
    fun getPendingLots(): List<EWasteLotEntity>

    @Query("DELETE FROM e_waste_lots WHERE id = :id")
    fun deleteLot(id: String): Int
}
