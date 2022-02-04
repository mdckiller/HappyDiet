<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <GridLayout rows="*, auto, auto" columns="*">
      <ScrollView
        @loaded="svLoad"
        @scroll="!edit && svScroll($event)"
        rowSpan="3"
        scrollBarIndicatorVisible="false"
      >
        <StackLayout rows="auto, auto, auto, *">
          <RGridLayout :rtl="RTL" columns="*, auto, 12">
            <Label class="pTitle tw tb a" :text="'planner' | L" />
            <Button col="1" class="ico" :text="icon.cog" @tap="navigateTo" />
          </RGridLayout>
          <GridLayout row="1" padding="0 16" columns="auto, *, auto">
            <Button class="ico si" :text="icon.left" @tap="navigate(0)" />
            <Button
              class="t3"
              @touch="mYPicker"
              col="1"
              :text="formattedDate(0)"
            />
            <Button
              class="ico si"
              col="2"
              :text="icon.right"
              @tap="navigate(1)"
            />
          </GridLayout>
          <RGridLayout
            row="2"
            :rtl="RTL"
            class="calendar"
            columns="*, *, *, *, *, *, *"
            :rows="calRows"
          >
            <Label
              class="sub rtl t5 vc tc"
              :class="{ f: RTL }"
              :col="i"
              v-for="(d, i) in getDayNames"
              :key="d + i"
              :text="d | L"
            />
            <Button
              v-for="(cal, i) in getCal"
              :key="i"
              :row="getrow(i)"
              :col="i % 7"
              :class="dayClasses(cal)"
              :text="cal.ld"
              @tap="setDate(cal)"
            />
          </RGridLayout>
          <StackLayout row="3" class="plans">
            <CollectionView
              @loaded="cvLoad"
              @scroll="cvScroll"
              for="item in mpItems"
              :height="listHeight"
            >
              <v-template if="item.type == 0">
                <RLabel class="date tb t2" :text="item.date" textWrap="true" />
              </v-template>
              <v-template if="item.type == 1">
                <Label
                  class="type t3"
                  :class="{ tb: plannerV == 'd' }"
                  :text="item.mealType | L"
                />
              </v-template>
              <v-template if="item.type == 2">
                <RGridLayout
                  :rtl="RTL"
                  class="plan vc"
                  columns="auto, *, auto"
                  @touch="!edit && touchRecipe($event)"
                  @tap="!edit && viewRecipe(item.id)"
                >
                  <Image
                    class="imgHolder"
                    verticalAlignment="middle"
                    v-if="!noImg && item.image"
                    :src="item.image"
                    stretch="none"
                    decodeWidth="48"
                    decodeHeight="48"
                    loadMode="async"
                  />
                  <Label
                    v-else-if="!noImg && !item.image"
                    verticalAlignment="middle"
                    class="ico imgHolder"
                    @loaded="centerLVH"
                    width="48"
                    height="48"
                    fontSize="23"
                    :text="icon.img"
                  />
                  <GridLayout rows="auto, auto" class="info vc" col="1">
                    <RLabel class="vc" :text="item.title" />
                    <RLabel row="1" class="t6" :text="item.size || 0" />
                  </GridLayout>
                  <Button
                    :hidden="!edit"
                    col="2"
                    class="ico si"
                    :text="icon.x"
                    @tap="removePlan(item.id)"
                  />
                </RGridLayout>
              </v-template>
              <v-template if="item.type == 3">
                <RGridLayout :rtl="RTL" class="plan vc" columns="*, auto">
                  <Label
                    class="info lh4 tw"
                    :class="{ note: !noImg }"
                    @loaded="centerLV"
                    :hidden="!item.note"
                    :text="item.note"
                  />
                  <Button
                    :hidden="!edit"
                    col="2"
                    class="ico si"
                    :text="icon.x"
                    @tap="removePlan(item.id)"
                  />
                </RGridLayout>
              </v-template>
              <v-template>
                <StackLayout class="ls"> </StackLayout>
              </v-template>
            </CollectionView>
          </StackLayout>
        </StackLayout>
      </ScrollView>
      <GridLayout rowSpan="2" rows="*, auto" v-if="!mealPlans.length">
        <StackLayout row="1" class="empty">
          <RLabel class="tb t3 tw" :text="'ehwmp' | L" />
          <RLabel class="tw" :text="'plsCrt' | L" />
        </StackLayout>
      </GridLayout>
      <RGridLayout
        :rtl="RTL"
        row="2"
        @loaded="abLoad"
        class="appbar"
        :hidden="showUndo"
        columns="auto, *,  auto, auto, auto"
        @swipe="stSwipe"
      >
        <Button class="ico rtl" :text="icon.back" @tap="navigateBack" />
        <Button
          class="ico"
          :text="icon.tod"
          :hidden="isExactlyToday"
          @tap="goToToday"
          col="2"
        />
        <Button
          :hidden="!hasRecipes"
          class="ico"
          :text="edit ? icon.done : icon.edit"
          @tap="toggleEditMode"
          col="3"
        />
        <!-- <Button
          class="ico"
          :text="hasRecipes ? (edit ? icon.done : icon.edit) : icon.madd"
          @tap="hasRecipes ? toggleEditMode() : randomMealPlan()"
          col="3"
        /> -->
        <Button
          class="ico fab end"
          :text="icon.plus"
          @tap="addMealPlan"
          col="4"
        />
      </RGridLayout>
      <SnackBar
        row="2"
        :hidden="!showUndo"
        :count="countdown"
        :msg="snackMsg"
        :undo="undoDel"
        :action="hideBar"
        :onload="sbLoad"
      />
      <Label
        rowSpan="3"
        class="edge hal"
        :class="{ 'f r': RTL }"
        @swipe="swipeBack($event, navigateBack)"
      />
      <Label
        rowSpan="3"
        class="edge har rtl"
        :class="{ r: RTL, f: !RTL }"
        @swipe="swipeBack($event, navigateBack)"
      />
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import {
  Application,
  Device,
  Frame,
  Observable,
  Screen,
  Utils,
} from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import ViewRecipe from "./ViewRecipe.vue";
import EditRecipe from "./EditRecipe.vue";
import EnRecipes from "./EnRecipes.vue";
import MPSettings from "./settings/MPSettings.vue";
import Action from "./modals/Action.vue";
import ActionWithSearch from "./modals/ActionWithSearch.vue";
import Prompt from "./modals/Prompt.vue";
import DMYPicker from "./modals/DMYPicker.vue";
import SnackBar from "./sub/SnackBar.vue";
import * as utils from "~/shared/utils";
const Intl = require("nativescript-intl");
import { localize } from "@nativescript/localize";
let barTimer;

declare const android, androidx: any;
export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      mealTypes: ["breakfast", "lunch", "dinner", "snacks"],
      year: 0,
      month: 0,
      date: 0,
      edit: 0,
      scrollPos: 1,
      cvScrollPos: 0,
      appbar: 0,
      snackbar: 0,
      scrollView: 0,
      listView: 0,
      countdown: 5,
      snackMsg: 0,
      showUndo: 0,
      undo: 0,
      temp: 0,
    };
  },
  computed: {
    ...mapState([
      "icon",
      "recipes",
      "layout",
      "mealPlans",
      "startMon",
      "RTL",
      "plannerV",
    ]),
    todaysTime() {
      return new Date(this.year, this.month, this.date, 0).getTime();
    },
    listHeight() {
      const ctx = Utils.android.getApplicationContext();
      const wm = ctx.getSystemService(android.content.Context.WINDOW_SERVICE);
      if (parseInt(Device.sdkVersion) < 30) {
        let resources = ctx.getResources();
        let idSbH = resources.getIdentifier(
          "status_bar_height",
          "dimen",
          "android"
        );
        let sbHeight = idSbH > 0 ? resources.getDimensionPixelSize(idSbH) : 0;
        const metrics = new android.util.DisplayMetrics();
        wm.getDefaultDisplay().getMetrics(metrics);
        console.log(metrics.heightPixels - sbHeight);
        return Math.floor(
          Utils.layout.toDeviceIndependentPixels(
            metrics.heightPixels - sbHeight
          )
        );
      } else {
        const metrics = wm.getCurrentWindowMetrics();
        const { top, bottom } = metrics
          .getWindowInsets()
          .getInsetsIgnoringVisibility(
            android.view.WindowInsets.Type.systemBars()
          );
        console.log(metrics.getBounds().height() - top - bottom, top, bottom);
        return metrics.getBounds().height() - top - bottom;
      }
    },
    getRecipes() {
      if (this.mealPlans.length) {
        return this.mealPlans.reduce((acc, e) => {
          if (e.date == this.todaysTime) {
            acc[e.mealType] = [...(acc[e.mealType] || []), e];
          }
          return acc;
        }, {});
      } else return {};
    },
    calRows() {
      let h = (Screen.mainScreen.widthDIPs - 32) / 8;
      if (h < 48) h = 48;
      let pv = this.plannerV;
      return pv != "d" ? `${h}, `.repeat(pv == "wk" ? 1 : 6) + h : 0;
    },
    getDayNames() {
      let dNames =
        this.plannerV != "d" &&
        this.getCal.slice(0, 7).map((d) => {
          let date = new Date(d.y, d.m, d.d);
          return new Intl.DateTimeFormat(null, {
            weekday: "short",
          }).format(date);
        });
      return dNames;
    },
    getCal() {
      const getDays = (s, e) => {
        let a = [];
        for (
          let d = new Date(s);
          d <= new Date(e);
          d.setDate(d.getDate() + 1)
        ) {
          a.push({
            d: d.getDate(),
            ld: this.localeN(d.getDate()),
            m: d.getMonth(),
            y: d.getFullYear(),
          });
        }
        return a;
      };

      let pv = this.plannerV;
      let date = new Date(
        this.year,
        this.month,
        pv == "mnth" ? 1 : this.date - this.startMon
      );
      return pv != "d"
        ? getDays(
            date.setDate(date.getDate() - date.getDay() + this.startMon),
            date.setDate(date.getDate() + (pv == "mnth" ? 41 : 6))
          )
        : [];
    },
    isExactlyToday() {
      let d = new Date();
      return (
        this.year == d.getFullYear() &&
        this.month == d.getMonth() &&
        this.date == d.getDate()
      );
    },
    hasRecipes() {
      return this.mpItems.length > 1;
    },
    noImg() {
      return /simple|minimal/.test(this.layout);
    },
    noAttr() {
      return /minimal/.test(this.layout);
    },
    mpItems() {
      let pv = this.plannerV;
      let days =
        pv == "wk"
          ? this.getCal.slice(0, 7)
          : [
              {
                d: this.date,
                m: this.month,
                y: this.year,
              },
            ];
      let meals = {};
      for (let i = 0; i < (pv == "wk" ? 7 : 1); i++)
        meals[i] = this.getRecipesOn(days[i]);
      let plans = [];
      for (const k1 in meals) {
        if (Object.keys(meals[k1]).length && pv != "d")
          plans.push({
            type: 0,
            date: this.formattedDate(1, days[k1]),
            d: days[k1].d,
          });
        if (Object.keys(meals[k1]).length) {
          this.mealTypes.forEach((e) => {
            if (meals[k1][e]) {
              plans.push({
                type: 1,
                mealType: e,
              });
              meals[k1][e].forEach(({ id, recipeID, note }) => {
                if (recipeID) {
                  plans.push({
                    type: 2,
                    id,
                    image: this.getRecipeImage(recipeID),
                    title: this.getRecipeTitle(recipeID),
                    size: this.getYield(id),
                  });
                } else {
                  plans.push({
                    type: 3,
                    id,
                    note,
                  });
                }
              });
            }
          });
        }
      }
      plans.push({});
      return plans;
    },
  },
  methods: {
    ...mapActions(["addMP", "deleteMP"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
      this.showBar();
    },
    abLoad({ object }) {
      this.appbar = object;
    },
    sbLoad({ object }) {
      this.snackbar = object;
    },
    cvLoad({ object }) {
      const View = android.view.View;
      object.android.setOverScrollMode(View.OVER_SCROLL_NEVER);
      this.listView = object;
      object.isScrollEnabled = false;
    },
    cvScroll({ object }) {
      this.scrollView.isScrollEnabled = object.scrollOffset <= 100;
    },
    svLoad({ object }) {
      this.scrollView = object;
    },
    svScroll({ object, scrollY }) {
      let scrollUp;
      let y = scrollY;
      if (y) {
        scrollUp = y < this.scrollPos;
        this.scrollPos = Math.abs(y);
        let ab = this.appbar.translateY;
        if (!scrollUp && ab == 0) this.animateBar(this.appbar, 0);
        else if (scrollUp && ab == 64) this.animateBar(this.appbar, 1);
        this.listView.isScrollEnabled = y >= object.scrollableHeight;
      }
    },

    // Helpers
    showBar() {
      this.animateBar(this.appbar, 1);
    },
    getrow(i) {
      return Math.floor(1 + i / 7);
    },
    getDate(index) {
      let date = new Date();
      date.setDate(date.getDate() + index);
      return date.getTime();
    },
    getRecipeImage(id) {
      let r = this.recipes.filter((e) => e.id === id)[0];
      return r && r.image;
    },
    getRecipeTitle(id) {
      let r = this.recipes.filter((e) => e.id === id)[0];
      return r ? r.title : `[ ${this.$options.filters.L("resNF")} ]`;
    },
    getYield(id) {
      let mp = this.mealPlans.filter((e) => e.id == id)[0];
      let r = this.recipes.filter((e) => e.id === mp.recipeID)[0];
      return r ? `${this.localeN(mp.quantity)} ${localize(r.yieldUnit)}` : 0;
    },

    // NavigationHandlers
    viewRecipe(id) {
      let mp = this.mealPlans.filter((e) => e.id == id)[0];
      let r = this.recipes.filter((e) => e.id === mp.recipeID)[0];
      if (r) {
        this.$navigateTo(ViewRecipe, {
          props: {
            filterTrylater: 1,
            recipeID: r.id,
            yieldQuantity: mp.quantity,
          },
        });
      }
    },
    navigateTo() {
      this.$navigateTo(MPSettings, {
        transition: {
          name: this.RTL ? "slideRight" : "slide",
          duration: 200,
          curve: "easeOut",
        },
      });
    },
    navigateBack() {
      Frame.topmost().backStack.length
        ? this.$navigateBack()
        : this.$navigateTo(EnRecipes, {
            clearHistory: true,
          });
    },

    // Calendar
    navigate(dir) {
      if (this.RTL) dir = !dir;
      let pv = this.plannerV;
      let date = new Date(this.year, this.month, this.date);
      let sd =
        pv == "mnth"
          ? new Date(this.year, this.month + (dir ? 1 : 0), 0).getDate()
          : pv == "wk"
          ? 7
          : 1;
      date.setDate(date.getDate() + (dir ? sd : -sd));
      this.date = date.getDate();
      this.month = date.getMonth();
      this.year = date.getFullYear();
      this.showBar();
    },
    goToToday() {
      let d = new Date();
      this.year = d.getFullYear();
      this.month = d.getMonth();
      this.date = d.getDate();
    },
    dayClasses({ d, m }) {
      let classes = "sst ";
      let dt1 = new Date();
      let dt2 = new Date(this.year, m, d, 0).getTime();
      if (
        this.year == dt1.getFullYear() &&
        this.month == dt1.getMonth() &&
        m == dt1.getMonth() &&
        d == dt1.getDate()
      )
        classes += "tb ";
      classes += this.date == d && this.month == m ? "select " : "fb ";
      if (!!this.mealPlans.filter((e) => e.date == dt2).length)
        classes += "accent ";
      if (this.month != m) classes += "sub";
      return classes;
    },
    setDate({ d, m, y }) {
      this.year = y;
      this.month = m;
      this.date = d;
      this.showBar();
    },
    toggleEditMode() {
      this.edit = !this.edit;
      this.listView.refresh();
    },
    openMonthYearPicker() {
      let monthNames = [...Array(12).keys()].map((m) =>
        new Intl.DateTimeFormat("en-IN", {
          month: "short",
        }).format(new Date(2021, m, 1, 0))
      );
      this.$showModal(DMYPicker, {
        props: {
          title: "gtD",
          monthNames,
          currentD: this.date,
          currentM: this.month,
          currentY: this.year,
        },
      }).then((res) => {
        if (res) {
          this.month = res.month;
          this.year = res.year;
          this.date = res.date;
        }
      });
    },
    stSwipe({ direction }) {
      let date = new Date(this.year, this.month, this.date);
      if (direction == 1) date.setDate(date.getDate() - 1);
      else if (direction == 2) date.setDate(date.getDate() + 1);
      this.date = date.getDate();
      this.month = date.getMonth();
      this.year = date.getFullYear();
    },
    randomMealPlan() {},

    // DataHandlers
    newMealPlan({ plan, index, inDB }) {
      this.addMP({
        plan,
        index,
        inDB,
      });
    },
    addMealPlan() {
      this.$showModal(Action, {
        props: {
          title: "add",
          list: ["rec", "no"],
        },
      }).then((type) => {
        if (type) {
          this.$showModal(Action, {
            props: {
              title: "selMT",
              list: ["breakfast", "lunch", "dinner", "snacks"],
            },
          }).then((mealType) => {
            if (mealType) {
              if (type == "rec") {
                let recipes = this.recipes.filter((e) =>
                  this.getRecipes[mealType]
                    ? this.getRecipes[mealType].every((f) => f.recipeID != e.id)
                    : 1
                );
                this.$showModal(ActionWithSearch, {
                  props: {
                    title: "selRec",
                    recipes,
                    action: "aNBtn",
                  },
                }).then((res) => {
                  if (res == "aNBtn") {
                    this.$navigateTo(EditRecipe, {
                      animated: false,
                    });
                  } else if (res) {
                    let r = this.recipes.filter((e) => e.id == res)[0];
                    this.$showModal(Prompt, {
                      props: {
                        title: `${localize("req", localize(r.yieldUnit))}`,
                        placeholder: Math.abs(parseFloat(r.yieldQuantity)),
                        action: "SET",
                      },
                    }).then((quantity) => {
                      if (quantity) {
                        let plan = {
                          id: utils.getRandomID(),
                          date: this.todaysTime,
                          mealType,
                          recipeID: res,
                          quantity,
                          note: null,
                        };
                        this.newMealPlan({
                          plan,
                          index: null,
                          inDB: 1,
                        });
                      }
                    });
                  }
                });
              } else if (type == "no") {
                this.$showModal(Prompt, {
                  props: {
                    title: "no",
                    type: "view",
                    action: "ADD",
                  },
                }).then((note) => {
                  if (note) {
                    let plan = {
                      id: utils.getRandomID(),
                      date: this.todaysTime,
                      mealType,
                      recipeID: null,
                      quantity: null,
                      note,
                    };
                    this.newMealPlan({
                      plan,
                      index: null,
                      inDB: 1,
                    });
                  }
                });
              }
            }
          });
        }
      });
    },
    deleteTempFromDB() {
      if (this.temp) {
        let { plan, index } = this.temp;
        this.deleteMP({ id: plan.id, index, inDB: 1 });
        this.temp = 0;
      }
    },
    removePlan(id) {
      this.deleteTempFromDB();
      let index = this.mealPlans.findIndex((e) => e.id == id);
      let plan = this.mealPlans.filter((e) => e.id == id)[0];
      this.temp = { plan, index };
      this.deleteMP({ id, index });
      this.showUndoBar(plan.note ? "rmN" : "recRm")
        .then(() => this.newMealPlan({ plan, index }))
        .catch(() => {
          this.deleteMP({ id, index, inDB: 1 });
        });
    },
    showUndoBar(message) {
      return new Promise((resolve, reject) => {
        this.animateBar(this.appbar, 0).then(() => {
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
      this.deleteTempFromDB();
      this.animateBar(this.snackbar, 0).then(() => {
        this.showUndo = this.undo = 0;
        this.animateBar(this.appbar, 1);
      });
    },
    undoDel() {
      this.undo = 1;
    },

    // ListHandlers
    getRecipesOn(d) {
      let date = new Date(d.y, d.m, d.d, 0, 0, 0);
      if (this.mealPlans.length) {
        return this.mealPlans.reduce((acc, e) => {
          if (e.date == date.getTime()) {
            acc[e.mealType] = [...(acc[e.mealType] || []), e];
          }
          return acc;
        }, {});
      } else return {};
    },

    // Helpers
    formattedDate(v, fd) {
      if (fd) fd = new Date(fd.y, fd.m, fd.d, 0, 0, 0);
      let dt = new Date(this.year, this.month, this.date, 0, 0, 0);
      let today = new Date();
      let myToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      let tdy = myToday.getTime();
      let ystr = myToday.setDate(today.getDate() - 1);
      let tmrw = myToday.setDate(today.getDate() + 1);
      let options: {
        year?: string;
        month?: string;
        weekday?: string;
        day?: string;
      } = {};
      if (v) {
        options.weekday = "long";
        options.day = "numeric";
        options.month = "long";
      } else {
        options.year = "numeric";
        options.month = "long";
      }
      if (this.plannerV == "d") {
        options.weekday = "long";
        options.day = "numeric";
        options.month = "short";
      }
      let date = new Intl.DateTimeFormat(null, options).format(fd || dt);
      let val;
      switch ((fd || dt).getTime()) {
        case ystr:
          val = "ystr";
          break;
        case tdy:
          val = "tdy";
          break;
        case tmrw:
          val = "tmrw";
          break;
      }
      return v
        ? [ystr, tdy, tmrw].some((e) => e == (fd || dt).getTime())
          ? localize(val)
          : date
        : date;
    },
    mYPicker({ object, action }) {
      this.touchFade(object, action);
      if (action == "up") this.openMonthYearPicker();
    },
    touchRecipe({ object, action }) {
      this.touchFade(object, action);
    },
  },
  created() {
    // if (!this.date || this.date === new Date().getDate()) this.goToToday();
    this.goToToday();
  },
};
</script>
