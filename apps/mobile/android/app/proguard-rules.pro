# Flutter Gradle Plugin pre-configures most R8 shrinking. These rules
# carry the plugin-specific gaps we hit during AAB shrink:

# Keep the Flutter embedding so plugin channels resolve at runtime.
-keep class io.flutter.embedding.android.** { *; }
-keep class io.flutter.plugins.** { *; }

# Firebase Messaging — the static analyzer can't see the FCM service
# entry points and shrinks them, killing push delivery.
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.firebase.iid.** { *; }

# QR scanner library — uses ZXing reflection internally.
-keep class com.google.zxing.** { *; }
-dontwarn com.google.zxing.**

# Suppress harmless warnings from the OkHttp / Conscrypt stack pulled
# in by the firebase_messaging plugin's transitive deps.
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**
-dontwarn org.bouncycastle.**
