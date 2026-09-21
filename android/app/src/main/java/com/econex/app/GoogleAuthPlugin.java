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

@CapacitorPlugin(name = "GoogleAuth", requestCodes = {9001})
public class GoogleAuthPlugin extends Plugin {

    private GoogleSignInClient googleSignInClient;
    private PluginCall savedCall;

    @Override
    public void load() {
        super.load();
        String clientId = getContext().getString(R.string.server_client_id);
        
        GoogleSignInOptions.Builder gsoBuilder = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail();
                
        // Only request ID token if a real client ID was provided
        if (clientId != null && !clientId.isEmpty() && !clientId.equals("YOUR_WEB_OAUTH_CLIENT_ID_HERE")) {
            gsoBuilder.requestIdToken(clientId);
        }
        
        googleSignInClient = GoogleSignIn.getClient(getActivity(), gsoBuilder.build());
    }

    @PluginMethod()
    public void signIn(PluginCall call) {
        savedCall = call;
        if (googleSignInClient != null) {
            getActivity().runOnUiThread(() -> {
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
                    call.reject("Google Sign-In API Error: " + e.getStatusCode());
                }
            }
        } else {
            if (call != null) {
                String errorMsg = "Google Sign-In cancelled or failed. ResultCode: " + result.getResultCode();
                if (result.getResultCode() == Activity.RESULT_CANCELED) {
                    errorMsg += "\n\nCRITICAL: If the UI did not appear, your Android SHA-1 fingerprint is NOT registered in Google Cloud Console for com.econex.app!";
                }
                if (result.getData() != null && result.getData().getExtras() != null) {
                    errorMsg += " Extras: " + result.getData().getExtras().toString();
                }
                call.reject(errorMsg);
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
