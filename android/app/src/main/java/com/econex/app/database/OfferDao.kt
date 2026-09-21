package com.econex.app.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.econex.app.model.OfferEntity

@Dao
interface OfferDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertOffer(offer: OfferEntity): Long

    @Query("SELECT * FROM offers WHERE lotId = :lotId ORDER BY price DESC")
    fun getOffersForLot(lotId: String): List<OfferEntity>

    @Query("SELECT * FROM offers WHERE recyclerId = :recyclerId ORDER BY createdAt DESC")
    fun getOffersByRecycler(recyclerId: String): List<OfferEntity>

    @Query("SELECT * FROM offers WHERE syncStatus = 'PENDING'")
    fun getPendingOffers(): List<OfferEntity>
}
