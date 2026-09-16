package com.econex.app;

import android.os.Bundle;

import com.econex.app.plugin.EWasteStorePlugin;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ImageSelectorPlugin.class);
        registerPlugin(GoogleAuthPlugin.class);
        registerPlugin(EWasteStorePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
