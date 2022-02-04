<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <GridLayout rows="*, auto" columns="*">
      <ScrollView
        @scroll="svScroll($event)"
        rowSpan="2"
        scrollBarIndicatorVisible="false"
      >
        <StackLayout>
          <RGridLayout :rtl="RTL" rows="auto" columns="*, auto, 12">
            <RLabel class="pTitle tw tb" :text="'timer' | L" />
            <Button col="1" class="ico" :text="icon.cog" @tap="navigateTo" />
          </RGridLayout>
          <Timer
            v-for="timer in activeTs"
            :key="timer.id + key"
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
      <GridLayout v-if="!activeTs.length" rows="*, auto">
        <StackLayout row="1" class="empty">
          <RLabel class="tb t3 tw" :text="'ccwt' | L" />
          <RLabel class="tw" :text="'plsAdd' | L" />
        </StackLayout>
      </GridLayout>
      <RGridLayout
        :rtl="RTL"
        row="1"
        @loaded="abLoad"
        class="appbar"
        :hidden="showUndo"
        columns="auto, *, auto"
      >
        <Button class="ico rtl end" :text="icon.back" @tap="navigateBack" />
        <Button class="ico fab end" :text="icon.plus" @tap="addTimer" col="2" />
      </RGridLayout>
      <SnackBar
        :hidden="!showUndo || toast"
        :count="countdown"
        :msg="snackMsg"
        :undo="undoDel"
        :action="hideBar"
        :onload="sbLoad"
      />
      <Toast :onload="tbLoad" :toast="toast" :action="hideBar" />
      <Label
        rowSpan="2"
        class="edge hal"
        :class="{ 'f r': RTL }"
        @swipe="swipeBack($event, navigateBack)"
      />
      <Label
        rowSpan="2"
        class="edge har rtl"
        :class="{ r: RTL, f: !RTL }"
        @swipe="swipeBack($event, navigateBack)"
      />
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { localize } from "@nativescript/localize";
import {
  Observable,
  Application,
  Utils,
  Device,
  Frame,
} from "@nativescript/core";
import {
  getNumber,
  setNumber,
  remove,
} from "@nativescript/core/application-settings";
import { mapState, mapActions } from "vuex";
import EnRecipes from "./EnRecipes.vue";
import Action from "./modals/Action.vue";
import CTSettings from "./settings/CTSettings.vue";
import TimePickerHMS from "./modals/TimePickerHMS.vue";
import TimerReminder from "./modals/TimerReminder.vue";
import Timer from "./sub/Timer.vue";
import Toast from "./sub/Toast.vue";
import SnackBar from "./sub/SnackBar.vue";
import * as utils from "~/shared/utils";
import { EvtBus } from "~/main";
let barTimer;
declare const com, android: any;
export default {
  components: { Timer, Toast, SnackBar },
  props: ["recipeID"],
  data() {
    return {
      scrollPos: 1,
      appbar: null,
      toastbar: null,
      snackbar: null,
      scrollView: null,
      countdown: 5,
      snackMsg: null,
      showUndo: 0,
      undo: 0,
      toast: null,
      key: 99,
    };
  },
  computed: {
    ...mapState([
      "icon",
      "recipes",
      "timerS",
      "timerV",
      "timerPs",
      "activeTs",
      "FGS",
      "RTL",
    ]),
    hasBackStack() {
      return Frame.topmost().backStack.length;
    },
  },
  methods: {
    ...mapActions(["addAT", "removeAT", "clearATIs", "updateAT", "setFgS"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
      if (this.activeTs.filter((e: any) => e.done).length) this.openReminder();
      setNumber("isTimer", 1);
    },
    abLoad({ object }) {
      this.appbar = object;
    },
    tbLoad({ object }) {
      this.toastbar = object;
    },
    sbLoad({ object }) {
      this.snackbar = object;
    },
    svScroll(args) {
      this.scrollView = args.object;
      let scrollUp;
      let y = args.scrollY;
      if (y) {
        scrollUp = y < this.scrollPos;
        this.scrollPos = Math.abs(y);
        let ab = this.appbar.translateY;
        if (!scrollUp && ab == 0) this.animateBar(this.appbar, 0);
        else if (scrollUp && ab == 64) this.animateBar(this.appbar, 1);
      }
    },

    // HELPERS
    getRecipeTitle(id) {
      let recipe = this.recipes.filter((e) => e.id === id)[0];
      return recipe ? recipe.title : `[ ${localize("resNF")} ]`;
    },
    formattedTime(time) {
      let hr = localize("hr");
      let min = localize("min");
      let sec = localize("sec");

      let t = time.split(":");

      let h = parseInt(t[0]);
      let m = parseInt(t[1]);
      let s = parseInt(t[2]);

      let hasHrs = h ? `${h} ${hr}` : "";
      let hasMins = m ? `${h ? " " : ""}${m} ${min}` : "";
      let hasSecs = s ? `${h || m ? " " : ""}${s} ${sec}` : "";

      return hasHrs + hasMins + hasSecs;
    },

    // NOTIFICATION HANDLERS
    timerInfo() {
      let activeCount = this.activeTs.length;
      let pausedCount = this.activeTs.filter((e) => e.isPaused).length;
      let ongoingCount = activeCount - pausedCount;
      this.foregroundService(activeCount);
      function show() {
        utils.TimerNotif.show({
          bID: "info",
          cID: "cti",
          cName: "Cooking Timer info",
          description: localize("oAP", ongoingCount + "", pausedCount),
          nID: 6,
          priority: -2,
          sound: null,
          title: localize("timer"),
        });
      }
      if (this.FGS) setTimeout(() => this.activeTs.length && show(), 250);
      utils.wakeLock(ongoingCount);
    },
    timerAlert() {
      let title, description, bID;
      let firedTimers = this.activeTs.filter((e) => e.done);
      let timer = firedTimers[0];
      if (firedTimers.length > 1) {
        title = localize("texp", firedTimers.length);
        description = localize("ttv");
        bID = "alerts";
      } else if (firedTimers.length == 1) {
        title =
          timer.label +
          (timer.recipeID ? " - " + this.getRecipeTitle(timer.recipeID) : "");
        description = this.formattedTime(timer.time);
        bID = "timer" + timer.id;
      } else {
        utils.TimerNotif.clear(7);
        return;
      }
      utils.TimerNotif.show({
        actions: 1,
        bID,
        cID: "cta",
        cName: "Cooking Timer alerts",
        description,
        multi: firedTimers.length > 1,
        nID: 7,
        priority: 1,
        sound: this.timerS.uri,
        title,
        vibrate: this.timerV,
      });
      if (firedTimers.length == 1) {
        Application.android.registerBroadcastReceiver(bID, (ctx, intent) => {
          EvtBus.$emit(bID, intent.getStringExtra("action"));
          Application.android.unregisterBroadcastReceiver(bID);
        });
      } else {
        Application.android.unregisterBroadcastReceiver(bID);
        Application.android.registerBroadcastReceiver(bID, (ctx, intent) => {
          if (intent.getStringExtra("action") == "dismissAll") {
            firedTimers.forEach((t) => this.removeTimer(t.id, 1));
            Application.android.unregisterBroadcastReceiver(bID);
          }
        });
      }
    },
    openReminder() {
      this.clearATIs();
      this.$showModal(TimerReminder, {
        fullscreen: true,
        props: {
          formattedTime: this.formattedTime,
          removeTimer: this.removeTimer,
          togglePause: this.togglePause,
          timerAlert: this.timerAlert,
          showToast: this.showToast,
        },
      }).then(() => {
        this.clearATIs();
        this.key = Math.floor(Math.random() * 900) + 100;
      });
    },
    foregroundService(n) {
      const ctx = Utils.ad.getApplicationContext();
      const intent = new android.content.Intent(
        ctx,
        com.tns.ForegroundService.class
      );
      if (n && !this.FGS) {
        parseInt(Device.sdkVersion) < 26
          ? ctx.startService(intent)
          : ctx.startForegroundService(intent);
        this.setFgS(1);
        setNumber("FGS", 1);
      } else if (!this.activeTs.length) {
        ctx.stopService(intent);
        this.setFgS(0);
        setNumber("FGS", 0);
      }
    },

    // DATA HANDLERS
    addTimer() {
      this.$showModal(TimePickerHMS, {
        props: {
          title: "ntmr",
          label: `${localize("tmr", this.activeTs.length + 1)}`,
          action: "strtBtn",
          showPreset: this.timerPs.length,
        },
      }).then((res) => {
        if (res) {
          if (res == "presets") {
            let list = this.timerPs.map(
              (e) => `${e.label} - ${this.formattedTime(e.time)}`
            );
            this.$showModal(Action, {
              props: {
                title: "prsts",
                list,
              },
            }).then((preset) => {
              if (preset) {
                let timer = JSON.parse(
                  JSON.stringify(this.timerPs[list.indexOf(preset)])
                );
                timer.id = utils.getRandomID(1);
                timer.recipeID = this.recipeID;
                timer.timerInt = timer.isPaused = 0;
                timer.preset = timer.mode = 1;
                this.addAT({
                  timer,
                  i: this.activeTs.length,
                });
                this.timerInfo();
              }
            });
          } else {
            let mode = res.time != "00:00:00" ? 1 : 0;
            this.addAT({
              timer: {
                id: utils.getRandomID(1),
                label: res.label,
                recipeID: this.recipeID,
                time: res.time,
                timerInt: 0,
                isPaused: 0,
                preset: 0,
                done: 0,
                mode,
              },
              i: this.activeTs.length,
            });
            this.timerInfo();
          }
        }
      });
    },
    removeTimer(id, noUndo) {
      let i = this.activeTs.findIndex((e) => e.id == id);
      let temp = this.activeTs[i];
      clearInterval(temp.timerInt);
      temp.timerInt = 0;
      this.removeAT(i);
      let secs = [getNumber(`${temp.id}c`, 0), getNumber(`${temp.id}d`, 0)];
      function removeSettings() {
        remove(`${temp.id}c`);
        remove(`${temp.id}d`);
      }
      removeSettings();
      if (!noUndo) {
        this.showUndoBar("tmrRm")
          .then(() => {
            setNumber(`${temp.id}c`, secs[0]),
              setNumber(`${temp.id}d`, secs[1]),
              this.addAT({
                timer: temp,
                i,
              });
            this.timerInfo();
          })
          .catch(() => removeSettings());
      }
      this.timerAlert();
      this.timerInfo();
    },
    togglePause(timer, n) {
      timer.isPaused =
        typeof n === "number" ? n : (!timer.isPaused as boolean | 0);
      this.updateAT(timer);
      n ? 0 : this.timerInfo();
    },
    showToast(data) {
      this.animateBar(this.snackbar, 0);
      this.animateBar(this.appbar, 0).then(() => {
        this.showUndo = 0;
        this.toast = localize(data);
        this.animateBar(this.toastbar, 1, 1);
        let a = 5;
        clearInterval(barTimer);
        barTimer = setInterval(() => a-- < 1 && this.hideBar(), 1000);
      });
    },
    showUndoBar(message) {
      return new Promise((resolve, reject) => {
        this.animateBar(this.toastbar, 0);
        this.animateBar(this.appbar, 0).then(() => {
          this.toast = null;
          this.showUndo = 1;
          this.snackMsg = message;
          this.countdown = 5;
          this.animateBar(this.snackbar, 1, 1).then(() => {
            let a = 5;
            clearInterval(barTimer);
            barTimer = setInterval(() => {
              if (this.undo) {
                this.hideBar();
                resolve(1);
              }
              this.countdown = Math.round((a -= 0.1));
              if (this.countdown < 1) {
                this.hideBar();
                reject(1);
              }
            }, 100);
          });
        });
      });
    },
    hideBar() {
      clearInterval(barTimer);
      this.animateBar(this.toast ? this.toastbar : this.snackbar, 0).then(
        () => {
          this.showUndo = this.undo = 0;
          this.toast = null;
          this.animateBar(this.appbar, 1);
        }
      );
    },
    undoDel() {
      this.undo = 1;
    },

    //NAVIGATION HANDLERS
    navigateTo() {
      this.$navigateTo(CTSettings, {
        transition: {
          name: this.RTL ? "slideRight" : "slide",
          duration: 200,
          curve: "easeOut",
        },
      });
    },
    navigateBack() {
      setNumber("isTimer", 0);
      this.hasBackStack
        ? this.$navigateBack()
        : this.$navigateTo(EnRecipes, {
            clearHistory: true,
          });
    },

    // HELPERS
  },
  created() {
    this.clearATIs();
    this.recipeID && this.addTimer();
  },
  destroyed() {
    setNumber("isTimer", 0);
  },
};
</script>
