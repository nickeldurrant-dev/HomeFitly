# 🎯 Final iOS Setup Commands

## 📥 After Downloading from Bolt

Run these commands in Terminal on your Mac after downloading the updated project:

```bash
# Navigate to your project
cd ~/Documents/HomeFitly

# Install CocoaPods if needed
brew install cocoapods

# Install all dependencies
npm install

# Install CocoaPods dependencies
cd ios/App && pod install && cd ../..

# Build the web app
npm run build

# Sync to iOS (this should work now)
npx cap sync ios

# Open in Xcode (IMPORTANT: Use .xcworkspace, not .xcodeproj)
npx cap open ios

# OR manually open the workspace file:
open ios/App/App.xcworkspace
```

## 🔧 If You Get Any Errors

### Error: "Failed to load container for document"
```bash
# You're opening the wrong file! Use workspace instead:
open ios/App/App.xcworkspace

# NOT this: ios/App/App.xcodeproj
```

### Error: "ios platform has not been added"
```bash
npx cap add ios
npx cap sync ios
```

### Error: "CocoaPods not found"
```bash
# Install CocoaPods if not installed
brew install cocoapods

# Then run pod install
cd ios/App && pod install && cd ../..
```

### Error: "Unable to open base configuration reference file"
```bash
# Clean and reinstall pods
cd ios/App
rm -rf Pods
rm Podfile.lock
pod install
cd ../..
```

## ✅ Verification Steps

After running the commands, verify:

1. **Xcode opens** with `App.xcworkspace` (not .xcodeproj)
2. **No red errors** in the project navigator
3. **App builds successfully** when you press Play
4. **Simulator launches** with your HomeFitly app

## 🚨 **Critical: Always Use .xcworkspace**

After running `pod install`, you MUST use:
- ✅ `App.xcworkspace` 
- ❌ NOT `App.xcodeproj`

The workspace file includes all the CocoaPods dependencies.

## 🎨 Next Steps

1. **Add app icons** using the generator in `app-store-assets/icon-generator.html`
2. **Test on simulator** to ensure everything works
3. **Take screenshots** for App Store listing
4. **Set up Apple Developer account** when ready to publish

Your iOS app is now fully configured and ready for development and testing!