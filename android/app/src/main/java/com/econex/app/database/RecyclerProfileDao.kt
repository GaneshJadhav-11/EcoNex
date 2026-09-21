package com.econex.app.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.econex.app.model.RecyclerProfileEntity

@Dao
interface RecyclerProfileDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertProfile(profile: RecyclerProfileEntity): Long

    @Update
    fun updateProfile(profile: RecyclerProfileEntity): Int

    @Query("SELECT * FROM recycler_profiles WHERE recyclerId = :recyclerId LIMIT 1")
    fun getProfile(recyclerId: String): RecyclerProfileEntity?

    @Query("SELECT * FROM recycler_profiles WHERE syncStatus = 'PENDING'")
    fun getPendingProfiles(): List<RecyclerProfileEntity>
}
