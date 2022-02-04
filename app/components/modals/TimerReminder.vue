<template>
  <Page @loaded="pgLoad" :class="theme" backgroundColor="#ff5200">
    <GridLayout rows="*, *">
      <Button
        class="ico fab"
        fontSize="128"
        :width="screenWidth"
        :height="screenWidth"
        :text="icon.timer"
      />
      <GridLayout row="1" rows="*, auto" columns="*, auto, *">
        <ScrollView :class="theme" rowSpan="2" colSpan="3">
          <StackLayout paddingTop="8">
            <Timer
              v-for="timer in timers"
              :key="timer.id"
              :timer="timer"
              :formattedTime="formattedTime"
              :removeTimer="removeTimer"
              :togglePause="togglePause"
              :timerAlert="timerAlert"
              :showToast="showToast"
            />
            <StackLayout class="ls"> </StackLayout>
          </StackLayout>
        </ScrollView>
        <GridLayout col="1" row="1" class="appbar">
          <Button
            class="ico fab"
            margin="0"
            :text="icon.x"
            @tap="removeTimers"
            col="1"
          />
        </GridLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { Application, Screen, Device, Color, Utils } from "@nativescript/core";
import Timer from "../sub/Timer.vue";
import * as utils from "~/shared/utils";
import { mapState } from "vuex";
const windowMgr = android.view.WindowManager;

export default {
  components: { Timer },
  props: [
    "formattedTime",
    "removeTimer",
    "togglePause",
    "timerAlert",
    "showToast",
  ],
  computed: {
    ...mapState(["icon", "theme", "activeTs"]),
    screenWidth() {
      return Screen.mainScreen.widthDIPs;
    },
    timers() {
      let timers = this.activeTs.filter((e) => e.done);
      if (!timers.length) {
        this.$modal.close(1);
        this.isScreenLocked && this.turnOffScreen();
      }
      return timers;
    },
    sdkv() {
      return parseInt(Device.sdkVersion);
    },
    isScreenLocked() {
      const keyguardMgr = Utils.ad
        .getApplicationContext()
        .getSystemService(android.content.Context.KEYGUARD_SERVICE);
      return this.sdkv > 21
        ? keyguardMgr.isDeviceLocked()
        : keyguardMgr.isKeyguardLocked();
    },
  },
  methods: {
    pgLoad({ object }) {
      let dialog = object._dialogFragment.getDialog();
      let dialogWindow = dialog.getWindow();
      let decorView = dialogWindow.getDecorView();
      dialog.setCancelable(false);
      if (this.isScreenLocked) {
        const flags =
          windowMgr.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
          windowMgr.LayoutParams.FLAG_TURN_SCREEN_ON |
          windowMgr.LayoutParams.FLAG_KEEP_SCREEN_ON;
        dialogWindow.addFlags(flags);
      }
      utils.setBarColors(dialogWindow, decorView, this.theme);
      dialogWindow.setStatusBarColor(new Color("#ff5200").android);
    },
    removeTimers() {
      this.timers.forEach((timer) => this.removeTimer(timer.id, 1));
      this.isScreenLocked && this.turnOffScreen();
    },
    turnOffScreen() {
      const window = Application.android.startActivity.getWindow();
      const flags =
        windowMgr.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
        windowMgr.LayoutParams.FLAG_TURN_SCREEN_ON |
        windowMgr.LayoutParams.FLAG_KEEP_SCREEN_ON;
      window.clearFlags(flags);
    },
  },
};
</script>
