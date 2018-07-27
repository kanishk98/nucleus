package com.nucleus;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class GoogleModule extends ReactContextBaseJavaModule {

    public GoogleModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "GoogleModule";
    }

    @ReactMethod
    public void login(final Callback callback) {

    }

    @ReactMethod
    public void logout(final Callback callback) {

    }

}