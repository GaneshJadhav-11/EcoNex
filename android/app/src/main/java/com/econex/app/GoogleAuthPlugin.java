package com.econex.app;

import android.app.Activity;
import android.content.Intent;

import androidx.activity.result.ActivityResult;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GoogleAuth")
public class GoogleAuthPlugin extends Plugin {

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

    @PluginMethod
    public void signIn(PluginCall call) {
        call.setKeepAlive(true);
        savedCall = call;

        // Sign out first so the account chooser appears each time
        if (googleSignInClient != null) {
            googleSignInClient.signOut().addOnCompleteListener(task -> {
                try {
                    Intent signInIntent = googleSignInClient.getSignInIntent();
                    startActivityForResult(call, signInIntent, "authResult");
                } catch (Exception e) {
                    call.reject("Failed to start Google Sign-In: " + e.getMessage());
                }
            });
        } else {
            call.reject("GoogleSignInClient is not initialized.");
        }
    }

    @ActivityCallback
    public void authResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            call = savedCall;
        }

        Intent data = result != null ? result.getData() : null;
        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
        
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
                int statusCode = e.getStatusCode();
                if (statusCode == 12501) {
                    call.reject("User cancelled");
                } else {
                    call.reject("Google Sign-In failed with code: " + statusCode);
                }
            }
        }

        savedCall = null;
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        if (googleSignInClient != null && getActivity() != null) {
            googleSignInClient.signOut().addOnCompleteListener(getActivity(), task -> call.resolve());
        } else {
            call.resolve();
        }
    }
}
