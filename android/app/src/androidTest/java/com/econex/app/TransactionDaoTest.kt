package com.econex.app

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.econex.app.database.AppDatabase
import com.econex.app.database.TransactionDao
import com.econex.app.model.TransactionEntity
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class TransactionDaoTest {

    private lateinit var db: AppDatabase
    private lateinit var transactionDao: TransactionDao

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(
            context, AppDatabase::class.java
        ).build()
        transactionDao = db.transactionDao()
    }

    @After
    fun closeDb() {
        db.close()
    }

    @Test
    fun insertAndGetTransactions() = runBlocking {
        val collectorId = "col1"
        val transaction = TransactionEntity(
            id = UUID.randomUUID().toString(),
            collectorId = collectorId,
            lotId = "lot1",
            amount = 1500.0,
            paymentStatus = "COMPLETED"
        )

        transactionDao.insertTransaction(transaction)

        val transactions = transactionDao.getTransactionsForCollector(collectorId)
        assertEquals(1, transactions.size)
        assertEquals(1500.0, transactions[0].amount, 0.0)
    }

    @Test
    fun getTotalEarningsCalculatesCorrectly() = runBlocking {
        val collectorId = "col1"
        val tx1 = TransactionEntity(
            id = UUID.randomUUID().toString(),
            collectorId = collectorId,
            lotId = "lot1",
            amount = 1000.0,
            paymentStatus = "COMPLETED"
        )
        val tx2 = TransactionEntity(
            id = UUID.randomUUID().toString(),
            collectorId = collectorId,
            lotId = "lot2",
            amount = 500.0,
            paymentStatus = "COMPLETED"
        )
        val txPending = TransactionEntity(
            id = UUID.randomUUID().toString(),
            collectorId = collectorId,
            lotId = "lot3",
            amount = 2000.0,
            paymentStatus = "PENDING"
        )
        
        transactionDao.insertTransaction(tx1)
        transactionDao.insertTransaction(tx2)
        transactionDao.insertTransaction(txPending)

        // Only COMPLETED transactions should be summed
        val totalEarnings = transactionDao.getTotalEarnings(collectorId)
        assertEquals(1500.0, totalEarnings, 0.0)
    }

    @Test
    fun getPendingTransactionsIncludesFailed() = runBlocking {
        val tx1 = TransactionEntity(
            id = UUID.randomUUID().toString(),
            collectorId = "col1",
            lotId = "lot1",
            amount = 100.0,
            syncStatus = "PENDING"
        )
        val tx2 = TransactionEntity(
            id = UUID.randomUUID().toString(),
            collectorId = "col1",
            lotId = "lot2",
            amount = 200.0,
            syncStatus = "FAILED"
        )
        val tx3 = TransactionEntity(
            id = UUID.randomUUID().toString(),
            collectorId = "col1",
            lotId = "lot3",
            amount = 300.0,
            syncStatus = "SYNCED"
        )

        transactionDao.insertTransaction(tx1)
        transactionDao.insertTransaction(tx2)
        transactionDao.insertTransaction(tx3)

        val pending = transactionDao.getPendingTransactions()
        assertEquals(2, pending.size)
    }
}
