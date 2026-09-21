package com.econex.app

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.econex.app.database.AppDatabase
import com.econex.app.database.OfferDao
import com.econex.app.model.OfferEntity
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class OfferDaoTest {

    private lateinit var db: AppDatabase
    private lateinit var offerDao: OfferDao

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(
            context, AppDatabase::class.java
        ).build()
        offerDao = db.offerDao()
    }

    @After
    fun closeDb() {
        db.close()
    }

    @Test
    fun insertAndGetOffersForLot() = runBlocking {
        val lotId = "LOT-123"
        val offer1 = OfferEntity(
            id = UUID.randomUUID().toString(),
            lotId = lotId,
            recyclerId = "rec1@test.com",
            recyclerName = "Recycler A",
            price = 50.0,
            pickupAvailability = "Available"
        )
        val offer2 = OfferEntity(
            id = UUID.randomUUID().toString(),
            lotId = lotId,
            recyclerId = "rec2@test.com",
            recyclerName = "Recycler B",
            price = 75.0, // Higher price
            pickupAvailability = "Not Available"
        )

        offerDao.insertOffer(offer1)
        offerDao.insertOffer(offer2)

        val offers = offerDao.getOffersForLot(lotId)
        assertEquals(2, offers.size)
        // Verify it orders by price DESC
        assertEquals(75.0, offers[0].price, 0.0)
        assertEquals("Recycler B", offers[0].recyclerName)
    }

    @Test
    fun getOffersByRecycler() = runBlocking {
        val recyclerId = "my@recycler.com"
        val offer1 = OfferEntity(
            id = UUID.randomUUID().toString(),
            lotId = "LOT-1",
            recyclerId = recyclerId,
            recyclerName = "Me",
            price = 10.0,
            pickupAvailability = "Available"
        )
        val offer2 = OfferEntity(
            id = UUID.randomUUID().toString(),
            lotId = "LOT-2",
            recyclerId = "other@recycler.com",
            recyclerName = "Not Me",
            price = 20.0,
            pickupAvailability = "Available"
        )

        offerDao.insertOffer(offer1)
        offerDao.insertOffer(offer2)

        val myOffers = offerDao.getOffersByRecycler(recyclerId)
        assertEquals(1, myOffers.size)
        assertEquals("LOT-1", myOffers[0].lotId)
    }
}
