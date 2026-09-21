package com.econex.app

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.econex.app.database.AppDatabase
import com.econex.app.database.HandoverDao
import com.econex.app.model.HandoverEventEntity
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class HandoverDaoTest {

    private lateinit var db: AppDatabase
    private lateinit var handoverDao: HandoverDao

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(
            context, AppDatabase::class.java
        ).build()
        handoverDao = db.handoverDao()
    }

    @After
    fun closeDb() {
        db.close()
    }

    @Test
    fun insertAndGetEventsForLot() = runBlocking {
        val lotId = "lot123"
        val event = HandoverEventEntity(
            id = UUID.randomUUID().toString(),
            lotId = lotId,
            collectorId = "col1",
            eventType = "LOT_CREATED",
            syncStatus = "PENDING"
        )

        handoverDao.insertEvent(event)
        
        val events = handoverDao.getEventsForLot(lotId)
        assertEquals(1, events.size)
        assertEquals("LOT_CREATED", events[0].eventType)
        assertEquals("PENDING", events[0].syncStatus)
    }

    @Test
    fun getPendingEvents() = runBlocking {
        val lotId = "lot123"
        val eventPending = HandoverEventEntity(
            id = UUID.randomUUID().toString(),
            lotId = lotId,
            collectorId = "col1",
            eventType = "LOT_CREATED",
            syncStatus = "PENDING"
        )
        val eventSynced = HandoverEventEntity(
            id = UUID.randomUUID().toString(),
            lotId = lotId,
            collectorId = "col1",
            eventType = "RECYCLER_SELECTED",
            syncStatus = "SYNCED"
        )

        handoverDao.insertEvent(eventPending)
        handoverDao.insertEvent(eventSynced)

        val pendingEvents = handoverDao.getPendingEvents()
        assertEquals(1, pendingEvents.size)
        assertEquals("LOT_CREATED", pendingEvents[0].eventType)
        assertTrue(pendingEvents.all { it.syncStatus == "PENDING" })
    }
}
