package com.econex.app

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.econex.app.database.AppDatabase
import com.econex.app.database.RecyclerProfileDao
import com.econex.app.model.RecyclerProfileEntity
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class RecyclerProfileDaoTest {

    private lateinit var db: AppDatabase
    private lateinit var profileDao: RecyclerProfileDao

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(
            context, AppDatabase::class.java
        ).build()
        profileDao = db.recyclerProfileDao()
    }

    @After
    fun closeDb() {
        db.close()
    }

    @Test
    fun insertAndGetProfile() = runBlocking {
        val recyclerId = "recycler@econex.com"
        val profile = RecyclerProfileEntity(
            recyclerId = recyclerId,
            name = "Green Tech Recycling",
            contact = "9876543210",
            location = "Mumbai, India",
            acceptedMaterials = "PCB, Batteries",
            authorizationNumber = "AUTH-12345",
            pickupAvailability = "Available"
        )

        profileDao.insertProfile(profile)
        
        val retrievedProfile = profileDao.getProfile(recyclerId)
        assertNotNull(retrievedProfile)
        assertEquals("Green Tech Recycling", retrievedProfile?.name)
        assertEquals("Pending Verification", retrievedProfile?.verificationStatus)
        assertEquals("PENDING", retrievedProfile?.syncStatus)
    }

    @Test
    fun updateProfile() = runBlocking {
        val recyclerId = "recycler@econex.com"
        val profile = RecyclerProfileEntity(
            recyclerId = recyclerId,
            name = "Old Name",
            contact = "123",
            location = "Delhi",
            acceptedMaterials = "None",
            authorizationNumber = "000",
            pickupAvailability = "Not Available"
        )
        
        profileDao.insertProfile(profile)

        val updatedProfile = profile.copy(
            name = "New Name",
            verificationStatus = "Verified",
            syncStatus = "SYNCED"
        )
        profileDao.updateProfile(updatedProfile)

        val retrievedProfile = profileDao.getProfile(recyclerId)
        assertNotNull(retrievedProfile)
        assertEquals("New Name", retrievedProfile?.name)
        assertEquals("Verified", retrievedProfile?.verificationStatus)
        assertEquals("SYNCED", retrievedProfile?.syncStatus)
    }

    @Test
    fun getPendingProfiles() = runBlocking {
        val profile1 = RecyclerProfileEntity(
            recyclerId = "rec1@test.com",
            name = "Pending Recycler",
            contact = "111",
            location = "Loc1",
            acceptedMaterials = "PCB",
            authorizationNumber = "A1",
            pickupAvailability = "Available",
            syncStatus = "PENDING"
        )
        val profile2 = RecyclerProfileEntity(
            recyclerId = "rec2@test.com",
            name = "Synced Recycler",
            contact = "222",
            location = "Loc2",
            acceptedMaterials = "Cable",
            authorizationNumber = "A2",
            pickupAvailability = "Available",
            syncStatus = "SYNCED"
        )

        profileDao.insertProfile(profile1)
        profileDao.insertProfile(profile2)

        val pendingProfiles = profileDao.getPendingProfiles()
        assertEquals(1, pendingProfiles.size)
        assertEquals("Pending Recycler", pendingProfiles[0].name)
    }
}
