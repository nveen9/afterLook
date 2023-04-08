package com.afterlook;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import 	android.telephony.SmsManager;

public class DirectSMSModule extends ReactContextBaseJavaModule {

    public DirectSMSModule(ReactApplicationContext reactContext){
        super(reactContext);
    }

    @Override
    public String getName(){
        return "DirectSMS";
    }

    @ReactMethod
    public void sendDirectSMS(String phoneNumber, String message){
        try {
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, message, null, null);
        }catch(Exception ex){
            System.out.println("Error when sending the DirectSMS message: " + ex);
        }
    }
    
}
