import { NativeScriptConfig } from "@nativescript/core"

export default {
  id: "com.mdc.happydiet",
  appPath: "app",
  appResourcesPath: "app/resources",
  android: {
    v8Flags: "--expose_gc",
    markingMode: "none",
  },
  // profiling: 'timeline'
} as NativeScriptConfig
