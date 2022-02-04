<template>
  <RGridLayout
    :rtl="RTL"
    rows="auto, auto"
    columns="auto, *, auto, auto, auto"
    class="timer"
  >
    <Button
      class="ico si rtl"
      :text="done ? icon.ring : timer.isPaused ? icon.start : icon.pause"
      @tap="!done && toggleProgress()"
    />
    <StackLayout
      col="1"
      class="info"
      :colSpan="timer.isPaused || !timer.preset ? 1 : 2"
    >
      <RLabel :text="timer.label" class="tb title tw a" />
      <RLabel
        :hidden="!timer.recipeID && done"
        @touch="!done && touch($event)"
        :text="getRecipeTitle"
        class="a accent"
      />
      <RLabel
        :text="
          progress == 0
            ? countUp
              ? getCount
              : formattedTime(timer.time)
            : getCount
        "
      />
    </StackLayout>
    <Button
      col="2"
      class="ico rtl"
      :hidden="(!timer.isPaused && timer.preset) || done || countUp"
      :text="isReset || timer.preset ? icon.reset : icon.addTo"
      @tap="isReset || timer.preset ? resetTimer() : addPreset()"
    />
    <Button
      col="3"
      class="ico"
      @tap="countUp ? addPreset() : addDelay()"
      :text="countUp ? icon.addTo : icon.delay"
    />
    <Button
      col="4"
      class="ico si"
      :text="icon.x"
      @tap="removeTimer(timer.id, done)"
    />
    <Progress @loaded="pLoaded" row="1" colSpan="5" />
  </RGridLayout>
</template>

<script>
import { ApplicationSettings, Device } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import ActionWithSearch from "../modals/ActionWithSearch";
import EditRecipe from "../EditRecipe";
import * as utils from "~/shared/utils";
import { EvtBus } from "~/main";
export default {
  props: [
    "timer",
    "formattedTime",
    "removeTimer",
    "togglePause",
    "timerAlert",
    "showToast",
  ],
  data() {
    return {
      pBar: 0,
      count: 0,
      delay: 0,
      progress: 0,
    };
  },
  computed: {
    ...mapState(["icon", "recipes", "timerD", "timerPs", "RTL"]),
    getRecipeTitle() {
      let { recipeID } = this.timer;
      if (recipeID) {
        let recipe = this.recipes.filter((e) => e.id == this.timer.recipeID)[0];
        if (recipe) return recipe.title;
        else {
          this.timer.recipeID = null;
          return localize("fwr");
        }
      } else return localize("fwr");
    },
    done() {
      return this.timer.done;
    },
    countUp() {
      return this.timer.mode == 0;
    },
    isReset() {
      return this.timer.isPaused && this.progress != 0;
    },
    getTotalTime() {
      return this.delay + this.actualTime;
    },
    actualTime() {
      let t = this.timer.time.split(":");
      return +t[0] * 60 * 60 + +t[1] * 60 + +t[2];
    },
    getCount() {
      let c = this.count;
      let s = Math.abs(c);
      return (
        (c < 0 ? "-" : "") +
        new Date(s * 1000)
          .toISOString()
          .slice(
            s < 10
              ? 18
              : s < 60
              ? 17
              : s < 600
              ? 15
              : s < 3600
              ? 14
              : s < 36000
              ? 12
              : s < 86400
              ? 11
              : 0,
            19
          )
      );
    },
    sdkv() {
      return parseInt(Device.sdkVersion);
    },
  },
  methods: {
    ...mapActions(["addTP", "sortATs"]),
    pLoaded({ object }) {
      this.pBar = object.android;
      this.pBar.setRotation(
        this.RTL && utils.sysRTL() ? 0 : this.RTL || utils.sysRTL() ? 180 : 0
      );
      this.initTimer();
    },
    attachRecipe() {
      this.$showModal(ActionWithSearch, {
        props: {
          title: "selRec",
          recipes: this.recipes,
          action: "aNBtn",
        },
      }).then((res) => {
        if (res == "aNBtn") {
          this.$navigateTo(EditRecipe, {
            animated: false,
          });
        } else if (res) {
          let timer = this.timer;
          timer.recipeID = res;
          this.sortATs();
        }
      });
    },
    setNum(type, val) {
      ApplicationSettings.setNumber(`${this.timer.id}${type}`, val);
    },
    setProgress() {
      this.progress = 100 - (this.count / this.getTotalTime) * 100;
      this.sdkv > 23
        ? this.pBar.setProgress(this.progress, true)
        : this.pBar.setProgress(this.progress);
    },
    initTimer() {
      this.resetInterval();
      this.setProgress();
      !this.timer.isPaused && this.pBar.setIndeterminate(this.countUp);
      if (this.progress < 100 || !this.timer.timerInt) {
        this.timer.timerInt = setInterval(() => {
          if (!this.timer.isPaused) {
            this.setNum("c", this.countUp ? this.count++ : --this.count);
            this.setProgress();
          } else this.resetInterval();
          if (this.progress >= 100 && this.count >= 0) {
            this.timer.done = 1;
            this.timerAlert();
          }
        }, 1000);
      }
    },
    resetInterval() {
      clearInterval(this.timer.timerInt);
      this.timer.timerInt = 0;
      this.pBar.setIndeterminate(false);
    },
    resetTimer() {
      this.count = this.actualTime;
      this.progress = this.delay = this.timer.done = 0;
      ApplicationSettings.remove(`${this.timer.id}d`);
      this.setNum("c", this.count);
      this.toggleProgress(1);
      this.sdkv > 23
        ? this.pBar.setProgress(0, true)
        : this.pBar.setProgress(0);
    },
    toggleProgress(n) {
      this.togglePause(this.timer, n);
      this.timer.isPaused ? this.resetInterval() : this.initTimer();
    },
    addPreset() {
      let exist = this.timerPs.some((e) => e.id == this.timer.id);
      this.timer.preset = 1;
      if (this.countUp) {
        this.timer.time = new Date(this.count * 1000)
          .toISOString()
          .substr(11, 8);
      }
      let timer = JSON.parse(JSON.stringify(this.timer));
      let { recipeID, timerInt, isPaused, preset, done, mode, ...presetTimer } =
        timer;
      this.addTP(presetTimer);
      exist ? this.showToast("prstTU") : this.showToast("aTPrst");
    },
    addDelay() {
      this.timer.done = 0;
      let td = this.timerD;
      let delayDur =
        this.localeN(td) + " " + localize(td > 1 ? "minutes" : "minute");
      this.showToast(localize("wDBy", this.timer.label, delayDur));
      let delay = td * 60;
      if (this.done) this.delay = delay;
      else this.delay += delay;
      if (this.count >= 0) this.count += delay;
      else this.count = this.delay;
      this.setNum("d", this.delay);
      this.setNum("c", this.count);
      this.resetInterval();
      this.initTimer();
      this.timerAlert();
    },

    // HELPERS
    touch({ object, action }) {
      this.touchFade(object, action);
      if (action == "up") this.attachRecipe();
    },
  },
  created() {
    this.delay = ApplicationSettings.getNumber(`${this.timer.id}d`, 0);
    this.count = ApplicationSettings.getNumber(
      `${this.timer.id}c`,
      this.actualTime
    );
    let bID = "timer" + this.timer.id;
    EvtBus.$off(bID);
    EvtBus.$on(bID, (e) => {
      switch (e) {
        case "delay":
          this.addDelay();
          break;
        case "dismiss":
          this.removeTimer(this.timer.id, 1);
          break;
      }
    });
  },
};
</script>
