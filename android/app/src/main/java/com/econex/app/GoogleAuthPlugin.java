package com.econex.app;

import android.app.Activity;
import android.content.Intent;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import android.util.Log;

@CapacitorPlugin(name = "GoogleAuth")
public class GoogleAuthPlugin extends Plugin {

    private static final String TAG = "GoogleAuthPlugin";
    private GoogleSignInClient googleSignInClient;
    private PluginCall savedCall;

    @Override
    public void load() {
        super.load();
        String clientId = getContext().getString(R.string.server_client_id);
        
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestIdToken(clientId)
                .build();
        googleSignInClient = GoogleSignIn.getClient(getContext(), gso);
    }

    @PluginMethod()
    public void signIn(PluginCall call) {
        Log.d(TAG, "signIn called");
        savedCall = call;
        // Make sure we always clear any previous sign-in so the account chooser ALWAYS appears.
        if (googleSignInClient != null) {
            Log.d(TAG, "googleSignInClient is not null, signing out first");
            googleSignInClient.signOut().addOnCompleteListener(getActivity(), task -> {
                Log.d(TAG, "signOut complete, starting signInIntent");
                getActivity().runOnUiThread(() -> {
                    try {
                        Intent signInIntent = googleSignInClient.getSignInIntent();
                        startActivityForResult(call, signInIntent, "authResult");
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to start Google Sign-In", e);
                        call.reject("Failed to start Google Sign-In: " + e.getMessage());
                    }
                });
            });
        } else {
            Log.e(TAG, "GoogleSignInClient is not initialized");
            call.reject("GoogleSignInClient is not initialized.");
        }
    }

    @ActivityCallback
    private void authResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            call = savedCall;
        }
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                if (account != null) {
                    String email = account.getEmail();
                    String displayName = account.getDisplayName();
                    String idToken = account.getIdToken();

                    JSObject ret = new JSObject();
                    ret.put("email", email != null ? email : "");
                    ret.put("name", displayName != null ? displayName : "");
                    ret.put("idToken", idToken != null ? idToken : "");

                    if (call != null) {
                        call.resolve(ret);
                    }
                } else {
                    if (call != null) {
                        call.reject("Google Sign-In account is null");
                    }
                }
            } catch (ApiException e) {
                if (call != null) {
                    call.reject("Google Sign-In failed with code: " + e.getStatusCode());
                }
            }
        } else {
            if (call != null) {
                call.reject("Google Sign-In cancelled or failed");
            }
        }
        savedCall = null;
    }

    @PluginMethod()
    public void signOut(PluginCall call) {
        if (googleSignInClient != null) {
            googleSignInClient.signOut().addOnCompleteListener(getActivity(), task -> call.resolve());
        } else {
            call.resolve();
        }
    }
}
