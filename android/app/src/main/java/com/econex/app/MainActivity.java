package com.econex.app;

import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ImageSelectorPlugin.class);
        registerPlugin(GoogleAuthPlugin.class);

        super.onCreate(savedInstanceState);

        WebSettings webSettings = getBridge().getWebView().getSettings();
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
}