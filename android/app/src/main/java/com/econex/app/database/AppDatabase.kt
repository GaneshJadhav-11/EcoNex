package com.econex.app.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.econex.app.model.EWasteLotEntity
import com.econex.app.model.HandoverEventEntity
import com.econex.app.model.TransactionEntity
import com.econex.app.model.RecyclerProfileEntity
import com.econex.app.model.OfferEntity

@Database(
    entities = [
        EWasteLotEntity::class,
        HandoverEventEntity::class,
        TransactionEntity::class,
        RecyclerProfileEntity::class,
        OfferEntity::class
    ],
    version = 3,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun eWasteLotDao(): EWasteLotDao
    abstract fun handoverDao(): HandoverDao
    abstract fun transactionDao(): TransactionDao
    abstract fun recyclerProfileDao(): RecyclerProfileDao
    abstract fun offerDao(): OfferDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "econex_offline_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
