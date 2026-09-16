package com.econex.app.network

import com.econex.app.model.EWasteLotEntity
import com.econex.app.model.HandoverEventEntity
import com.econex.app.model.TransactionEntity
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

// Response Models for AI, RL, Pricing & Handover
data class SyncLotResponse(
    val success: Boolean,
    val lotId: String,
    val aiCategory: String?,
    val aiConfidence: Double?,
    val estimatedPrice: Double?,
    val recommendedRecyclers: List<RecyclerRecommendation>?
)

data class RecyclerRecommendation(
    val recyclerId: String,
    val recyclerName: String,
    val matchScore: Double,
    val offeredPricePerKg: Double
)

data class SyncHandoverResponse(
    val success: Boolean,
    val lotId: String,
    val currentStatus: String
)

interface ApiService {

    @POST("api/lots/sync")
    suspend fun syncLot(@Body lot: EWasteLotEntity): Response<SyncLotResponse>

    @Multipart
    @POST("api/lots/upload-image")
    suspend fun uploadLotImage(
        @Part("lotId") lotId: RequestBody,
        @Part image: MultipartBody.Part
    ): Response<SyncLotResponse>

    @POST("api/handover/sync")
    suspend fun syncHandoverEvent(@Body event: HandoverEventEntity): Response<SyncHandoverResponse>

    @GET("api/transactions/{collectorId}")
    suspend fun getTransactions(@Path("collectorId") collectorId: String): Response<List<TransactionEntity>>
}
