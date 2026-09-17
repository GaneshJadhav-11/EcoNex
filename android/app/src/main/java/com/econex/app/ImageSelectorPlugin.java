package com.econex.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.MediaStore;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.annotation.ActivityCallback;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import android.util.Base64;

@CapacitorPlugin(
    name = "ImageSelector",
    permissions = {
        @Permission(
            strings = { Manifest.permission.CAMERA },
            alias = "camera"
        )
    }
)
public class ImageSelectorPlugin extends Plugin {

    private Uri cameraImageUri;
    private PluginCall savedCall;

    @PluginMethod()
    public void showImageSelector(PluginCall call) {
        savedCall = call;
        getActivity().runOnUiThread(() -> {
            CharSequence[] items = new CharSequence[] { "📷 Take Photo", "🖼️ Choose from Gallery" };
            AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
            builder.setTitle("Add E-Waste Image");
            builder.setItems(items, (dialog, item) -> {
                if (item == 0) {
                    checkAndOpenCamera();
                } else if (item == 1) {
                    openGallery();
                } else {
                    if (savedCall != null) {
                        savedCall.reject("Cancelled");
                        savedCall = null;
                    }
                }
            });
            builder.setOnCancelListener(dialog -> {
                if (savedCall != null) {
                    savedCall.reject("Cancelled");
                    savedCall = null;
                }
            });
            builder.show();
        });
    }

    private void checkAndOpenCamera() {
        if (hasPermission("camera")) {
            launchCamera();
        } else {
            requestPermissionForAlias("camera", savedCall, "cameraPermissionCallback");
        }
    }

    @PermissionCallback
    private void cameraPermissionCallback(PluginCall call) {
        if (hasPermission("camera")) {
            launchCamera();
        } else {
            if (savedCall != null) {
                savedCall.reject("Camera permission denied. Please allow camera access in settings to take photos.");
                savedCall = null;
            }
        }
    }

    private void launchCamera() {
        try {
            File photoFile = File.createTempFile("JPEG_" + System.currentTimeMillis() + "_", ".jpg", getActivity().getCacheDir());
            cameraImageUri = FileProvider.getUriForFile(getActivity(), getActivity().getPackageName() + ".fileprovider", photoFile);

            Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);
            takePictureIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivityForResult(savedCall, takePictureIntent, "cameraResult");
        } catch (Exception e) {
            if (savedCall != null) {
                savedCall.reject("Failed to launch camera: " + e.getMessage());
                savedCall = null;
            }
        }
    }

    @ActivityCallback
    private void cameraResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK) {
            try {
                if (cameraImageUri == null) {
                    if (savedCall != null) {
                        savedCall.reject("Camera image URI is null");
                        savedCall = null;
                    }
                    return;
                }

                // Low-memory optimization for entry-level devices: Downsample bitmap
                Bitmap bitmap = decodeSampledBitmapFromUri(cameraImageUri, 1024, 1024);

                if (bitmap == null) {
                    if (savedCall != null) {
                        savedCall.reject("Failed to decode camera bitmap");
                        savedCall = null;
                    }
                    return;
                }

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 75, baos);
                byte[] bytes = baos.toByteArray();
                bitmap.recycle(); // Free native bitmap memory immediately

                String base64 = Base64.encodeToString(bytes, Base64.DEFAULT);
                String dataUrl = "data:image/jpeg;base64," + base64;

                JSObject ret = new JSObject();
                ret.put("dataUrl", dataUrl);
                if (savedCall != null) {
                    savedCall.resolve(ret);
                    savedCall = null;
                }
            } catch (Exception e) {
                if (savedCall != null) {
                    savedCall.reject("Failed to process captured photo: " + e.getMessage());
                    savedCall = null;
                }
            }
        } else {
            if (savedCall != null) {
                savedCall.reject("Cancelled");
                savedCall = null;
            }
        }
    }

    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        startActivityForResult(savedCall, intent, "galleryResult");
    }

    @ActivityCallback
    private void galleryResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Uri imageUri = result.getData().getData();
            try {
                if (imageUri == null) {
                    if (savedCall != null) {
                        savedCall.reject("Selected image URI is null");
                        savedCall = null;
                    }
                    return;
                }

                // Low-memory optimization: Downsample bitmap
                Bitmap bitmap = decodeSampledBitmapFromUri(imageUri, 1024, 1024);

                if (bitmap == null) {
                    if (savedCall != null) {
                        savedCall.reject("Failed to decode gallery bitmap");
                        savedCall = null;
                    }
                    return;
                }

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 75, baos);
                byte[] bytes = baos.toByteArray();
                bitmap.recycle(); // Free native bitmap memory immediately

                String base64 = Base64.encodeToString(bytes, Base64.DEFAULT);
                String dataUrl = "data:image/jpeg;base64," + base64;

                JSObject ret = new JSObject();
                ret.put("dataUrl", dataUrl);
                if (savedCall != null) {
                    savedCall.resolve(ret);
                    savedCall = null;
                }
            } catch (Exception e) {
                if (savedCall != null) {
                    savedCall.reject("Failed to process gallery image: " + e.getMessage());
                    savedCall = null;
                }
            }
        } else {
            if (savedCall != null) {
                savedCall.reject("Cancelled");
                savedCall = null;
            }
        }
    }

    /**
     * Efficiently decodes and downsamples bitmap from URI to avoid OutOfMemoryError on low-end Android devices.
     */
    private Bitmap decodeSampledBitmapFromUri(Uri uri, int reqWidth, int reqHeight) throws Exception {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        try (InputStream isBounds = getActivity().getContentResolver().openInputStream(uri)) {
            BitmapFactory.decodeStream(isBounds, null, options);
        }

        options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight);
        options.inJustDecodeBounds = false;

        try (InputStream isDecode = getActivity().getContentResolver().openInputStream(uri)) {
            return BitmapFactory.decodeStream(isDecode, null, options);
        }
    }

    private static int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {
            final int halfHeight = height / 2;
            final int halfWidth = width / 2;

            while ((halfHeight / inSampleSize) >= reqHeight && (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }
        return inSampleSize;
    }
}
