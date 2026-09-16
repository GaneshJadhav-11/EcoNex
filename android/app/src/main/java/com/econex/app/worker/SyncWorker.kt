package com.econex.app.worker

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.econex.app.repository.EWasteRepository

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    private val repository = EWasteRepository(applicationContext)

    override suspend fun doWork(): Result {
        val pendingLots = repository.getPendingLots()
        var allSuccess = true

        for (lot in pendingLots) {
            val success = repository.syncLot(lot)
            if (!success) {
                allSuccess = false
            }
        }

        return if (allSuccess) Result.success() else Result.retry()
    }

    companion object {
        fun enqueueSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueue(syncRequest)
        }
    }
}
