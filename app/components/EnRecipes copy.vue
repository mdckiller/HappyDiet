<template>
  <Page @loaded="pgLoad" @unloaded="pgUnload" actionBarHidden="true">
    <GridLayout rows="*, auto, auto" columns="*">
      <CollectionView
        rowSpan="4"
        :spanSize="getSpanSize"
        for="recipe in getRecipes"
        @loaded="cvLoad"
        :itemTemplateSelector="getLayout"
        :colWidth="layout == 'grid' || layout == 'photogrid' ? '50%' : '100%'"
        @scroll="!selectMode && cvScroll($event)"
      >
        <v-template name="header">
          <RGridLayout :rtl="RTL" rows="auto" columns="*, auto, 12">
            <RLabel class="pTitle tw tb" :text="`${currentComp}` | L" />
            <Button
              col="1"
              class="ico"
              :text="icon.cog"
              @tap="navigateTo(AppSettings, 'Settings', 1)"
            />
          </RGridLayout>
        </v-template>
        <v-template name="lists">
          <RStackLayout :rtl="RTL" orientation="horizontal" padding="0 16 24">
            <Label
              @tap="importer.syncFileFrom($store)"
              margin="0 15 0"
              class="ico tc vc"
              :text="icon['info']"
            />

            <GridLayout
              rows="32"
              columns="32, auto"
              class="segment rtl"
              v-for="(item, index) in topmenu"
              :key="index"
              :class="{
                select: currentComp == item.title,
              }"
              @touch="touchSelector($event, item.title, item.title)"
            >
              <Label class="ico tc vc" :text="icon[item.icon]" />
              <Label
                col="1"
                class="v vc"
                :class="{ f: RTL }"
                :hidden="!getRecipeCount(item.title)"
                :text="getRecipeCount(item.title)"
              />
            </GridLayout>
            <GridLayout
              :hidden="currentComp !== 'Filtered recipes'"
              rows="32"
              columns="32, auto"
              class="segment rtl"
              :class="{
                select: currentComp === 'Filtered recipes',
              }"
            >
              <Label class="ico tc vc" :text="icon.filter" />
              <Label
                col="1"
                class="v vc"
                :class="{ f: RTL }"
                :text="getRecipeCount('filtered')"
              />
            </GridLayout>
          </RStackLayout>
        </v-template>
        <v-template name="detailed">
          <RGridLayout
            :rtl="RTL"
            class="recipe"
            :class="getItemPos(recipe.id)"
            rows="auto"
            columns="96, *"
            @longPress="
              selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
            "
            @touch="touchRecipe"
            @tap="
              selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
            "
          >
            <Label
              :hidden="recipe.image"
              verticalAlignment="center"
              class="ico imgHolder"
              @loaded="centerLVH"
              width="96"
              height="96"
              fontSize="48"
              :text="icon.img"
            />
            <Image
              class="imgHolder"
              verticalAlignment="center"
              :hidden="!recipe.image"
              :src="recipe.image"
              stretch="none"
              decodeWidth="96"
              decodeHeight="96"
              loadMode="async"
            />
            <StackLayout class="info vc" col="1">
              <RLabel :text="recipe.title" class="tb title tw" />
              <RStackLayout :rtl="RTL" class="oh"
                ><Label class="ico s rtl vc" :text="icon.cuisine" />
                <Label class="attr" :text="recipe.cuisine | L" />
                <Label class="ico s vc" :text="icon.category" />
                <Label class="attr" :text="recipe.category | L" />
              </RStackLayout>
              <RStackLayout :rtl="RTL" :hidden="!recipe.tags.length" class="oh">
                <Label class="ico s rtl vc" :text="icon.tag" />
                <Label class="attr" :text="getTags(recipe.tags)" />
              </RStackLayout>
              <RStackLayout :rtl="RTL" class="oh">
                <Label class="ico s vc" :text="icon.star" />
                <Label class="attr" :text="localeN(recipe.rating)" />
                <Label class="ico s vc" :text="icon.time" />
                <Label
                  class="attr"
                  :text="`${totalTime(recipe.prepTime, recipe.cookTime).time}`"
                />
                <Label class="ico s vc" :text="icon.diff" />
                <Label class="attr" :text="recipe.difficulty | L" />
              </RStackLayout>
            </StackLayout>
          </RGridLayout>
        </v-template>
        <v-template name="grid">
          <GridLayout
            class="recipe grid"
            :class="getItemPos(recipe.id)"
            rows="auto, auto"
            columns="*"
            @longPress="
              selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
            "
            @touch="touchRecipe"
            @tap="
              selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
            "
          >
            <Image
              class="imgHolder"
              v-if="recipe.image"
              :src="recipe.image"
              stretch="aspectFit"
              :decodeWidth="imgWidth"
              :decodeHeight="imgWidth"
              loadMode="async"
            />
            <Label
              v-else
              width="100%"
              :height="imgWidth"
              @loaded="centerLVH"
              class="ico imgHolder"
              :fontSize="imgWidth / 2"
              :text="icon.img"
            />
            <StackLayout class="info" row="1">
              <RLabel :text="recipe.title" class="tb title tw" />

              <FlexboxLayout
                flexWrap="wrap"
                :justifyContent="RTL ? 'flex-end' : 'flex-start'"
              >
                <RStackLayout :rtl="RTL" class="oh">
                  <Label class="ico s rtl vc" :text="icon.cuisine" />
                  <Label class="attr" :text="recipe.cuisine | L" />
                </RStackLayout>
                <RStackLayout :rtl="RTL" class="oh">
                  <Label class="ico s vc" :text="icon.category" />
                  <Label class="attr" :text="recipe.category | L" />
                </RStackLayout>
              </FlexboxLayout>
              <RStackLayout :rtl="RTL" :hidden="!recipe.tags.length" class="oh">
                <Label class="ico s rtl vc" :text="icon.tag" />
                <Label class="attr" :text="getTags(recipe.tags)" />
              </RStackLayout>
            </StackLayout>
          </GridLayout>
        </v-template>
        <v-template name="photogrid">
          <RGridLayout
            :rtl="RTL"
            class="recipe grid photogrid"
            :class="getItemPos(recipe.id)"
            rows="auto, auto"
            columns="*"
            @longPress="
              selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
            "
            @touch="touchRecipe"
            @tap="
              selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
            "
          >
            <Image
              class="imgHolder"
              v-if="recipe.image"
              :src="recipe.image"
              stretch="aspectFit"
              :decodeWidth="imgWidth"
              :decodeHeight="imgWidth"
              loadMode="async"
            />
            <Label
              v-else
              width="100%"
              :height="imgWidth"
              @loaded="centerLVH"
              class="ico imgHolder"
              :fontSize="imgWidth / 2"
              :text="icon.img"
            />
            <StackLayout class="info" row="1">
              <RLabel :text="recipe.title" class="tb title tw" />
            </StackLayout>
          </RGridLayout>
        </v-template>
        <v-template name="simple">
          <RGridLayout
            :rtl="RTL"
            class="recipe simple"
            :class="getItemPos(recipe.id)"
            columns="*"
            @longPress="
              selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
            "
            @touch="touchRecipe"
            @tap="
              selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
            "
          >
            <StackLayout class="info">
              <RLabel :text="recipe.title" class="tb title tw" />
              <RStackLayout :rtl="RTL" class="oh">
                <Label class="ico s rtl vc" :text="icon.cuisine" />
                <Label class="attr" :text="recipe.cuisine | L" />
                <Label class="ico s vc" :text="icon.category" />
                <Label class="attr" :text="recipe.category | L" />
              </RStackLayout>
              <RStackLayout :rtl="RTL" :hidden="!recipe.tags.length" class="oh">
                <Label class="ico s rtl vc" :text="icon.tag" />
                <Label class="attr" :text="getTags(recipe.tags)" />
              </RStackLayout>
            </StackLayout>
          </RGridLayout>
        </v-template>
        <v-template name="minimal">
          <GridLayout
            class="recipe simple minimal"
            :class="getItemPos(recipe.id)"
            columns="*"
            @longPress="
              selectMode ? viewRecipe(recipe.id) : addToSelection(recipe.id)
            "
            @touch="touchRecipe"
            @tap="
              selectMode ? addToSelection(recipe.id) : viewRecipe(recipe.id)
            "
          >
            <StackLayout class="info">
              <RLabel :text="recipe.title" class="tb title tw" />
            </StackLayout>
          </GridLayout>
        </v-template>
      </CollectionView>
      <GridLayout
        rowSpan="2"
        class="empty"
        :hidden="!empty"
        rows="*, auto, auto"
        columns="*"
      >
        <RLabel row="1" class="tb t3 tw" :text="empty.title | L" />
        <Button
          row="2"
          v-if="
            empty.action && (filterFavourites || filterTrylater || selCuisine)
          "
          class="text tb big fb"
          @loaded="setGravity"
          :text="empty.sub | L"
          @tap="empty.action"
        />
        <RLabel
          class="tw"
          row="2"
          v-else-if="!empty.action"
          :text="empty.sub | L"
        />
      </GridLayout>
      <GridLayout
        row="1"
        @loaded="tbLoad"
        :rows="tbRows"
        columns="auto"
        class="appbar toolbar hal"
        :class="{ r: RTL }"
        :visibility="showTools ? 'visible' : 'hidden'"
      >
        <RStackLayout
          v-for="(item, i) in tbItems"
          :key="i"
          :row="i"
          :rtl="RTL"
          class="tool"
          @touch="touchTool($event, item.comp, item.title)"
        >
          <Label class="ico v vc" :text="icon[item.icon]" />
          <Label col="1" class="v vc" :text="item.title | L" />
        </RStackLayout>
      </GridLayout>
      <RGridLayout
        row="2"
        @loaded="abLoad"
        :rtl="RTL"
        class="appbar"
        columns="auto, *, auto, auto, auto, auto"
        @swipe="stSwipe"
        @touch="() => null"
      >
        <Button
          class="ico rtl end"
          @tap="
            showSearch
              ? closeSearch()
              : selectMode
              ? clearSelection()
              : toggleTools()
          "
          :text="
            showSearch
              ? icon.back
              : selectMode || showTools
              ? icon.x
              : icon.menu
          "
        />
        <TextField
          id="search"
          :class="{ f: RTL }"
          @loaded="focusField"
          autocapitalizationType="words"
          autocorrect="true"
          v-if="showSearch"
          col="1"
          colSpan="5"
          :hint="'ser' | L"
          @textChange="updateList($event.value)"
        />
        <Label
          :hidden="!selectMode"
          class="tb tw vc lh4"
          :text="`${selection.length} ${$options.filters.L('sltd')}`"
          col="1"
        />
        <StackLayout
          class="rtl"
          col="2"
          colSpan="3"
          orientation="horizontal"
          :hidden="!recipes.length || selectMode || showSearch"
        >
          <Button
            class="ico"
            :class="{ f: RTL }"
            :text="selectMode ? icon.exp : icon.sear"
            @tap="selectMode ? exportSelection() : openSearch()"
          />
          <Button
            class="ico"
            :class="{ f: RTL }"
            :text="icon.sort"
            @tap="openSort"
          />
          <Button class="ico" :text="icon.filter" @tap="openFilter" />
        </StackLayout>
        <Button
          :hidden="showSearch || selectMode || !adminMode"
          class="ico fab end"
          :text="icon.plus"
          col="5"
          @tap="addR"
        />
        <Button
          :hidden="!selectMode"
          class="ico end"
          :text="icon.del"
          col="5"
          @tap="deleteSelection"
        />
      </RGridLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import {
  ApplicationSettings,
  AndroidApplication,
  Utils,
  Observable,
  Device,
  Screen,
  CoreTypes,
} from "@nativescript/core";
import { localize } from "@nativescript/localize";
import {
  startAccelerometerUpdates,
  stopAccelerometerUpdates,
} from "@triniwiz/nativescript-accelerometer";
import { mapActions, mapState } from "vuex";
import ViewRecipe from "./ViewRecipe.vue";
import EditRecipe from "./EditRecipe.vue";
import MealPlanner from "./MealPlanner.vue";
import CookingTimer from "./CookingTimer.vue";
// import GroceryList from "./GroceryList.vue";
import AppSettings from "./settings/AppSettings.vue";
import About from "./settings/About.vue";
import Action from "./modals/Action.vue";
import Confirm from "./modals/Confirm.vue";
import Filters from "./modals/Filter.vue";
import * as utils from "~/shared/utils";
import Importer from "~/shared/importer";

let lastTime = 0;
let lastShake = 0;
let lastForce = 0;
let shakeCount = 0;
let typingTimer;

export default {
  data() {
    return {
      searchQuery: "",
      showSearch: 0,
      adminMode: ApplicationSettings.getString("adminMode") == "Si",
      deletionDialogActive: 0,
      selection: [],
      selectMode: 0,
      listview: null,
      appbar: null,
      importer: new Importer(),
      toolbar: null,
      scrollPos: 1,
      filterFavourites: 0,
      filterTrylater: 0,
      AppSettings: AppSettings,
      About: About,
      MealPlanner: MealPlanner,
      CookingTimer: CookingTimer,
      // GroceryList: GroceryList,
      topmenu: [
        {
          title: "EnRecipes",
          icon: "home",
        },
        {
          title: "trylater",
          icon: "try",
        },
        {
          title: "favourites",
          icon: "fav",
        },
      ],
      showTools: 0,
      currentComp: "EnRecipes",
    };
  },
  computed: {
    ...mapState([
      "icon",
      "sortT",
      "recipes",
      "cuisines",
      "categories",
      "yieldUnits",
      "mealPlans",
      "shake",
      "layout",
      "selCuisine",
      "selCategory",
      "selTag",
      "timerS",
      "RTL",
    ]),
    filteredRecipes() {
      let vm = this;
      function getIngredients(e) {
        return e.ingredients
          .map((f) => f.item.toLowerCase())
          .join()
          .includes(vm.searchQuery);
      }
      if (this.filterFavourites) {
        return this.recipes
          .filter(
            (e) =>
              e.favorite &&
              (e.title.toLowerCase().includes(this.searchQuery) ||
                getIngredients(e))
          )
          .sort(this.sortFunction);
      } else if (this.filterTrylater) {
        return this.recipes
          .filter(
            (e) =>
              !e.tried &&
              (e.title.toLowerCase().includes(this.searchQuery) ||
                getIngredients(e))
          )
          .sort(this.sortFunction);
      } else if (this.selCuisine) {
        return this.recipes
          .filter((e) => {
            return (
              this.recipeFilter(e) &&
              (e.title.toLowerCase().includes(this.searchQuery) ||
                getIngredients(e))
            );
          })
          .sort(this.sortFunction);
      } else {
        return this.recipes
          .filter(
            (e) =>
              e.title.toLowerCase().includes(this.searchQuery) ||
              getIngredients(e)
          )
          .sort(this.sortFunction);
      }
    },
    getRecipes() {
      return [{}, {}].concat(this.filteredRecipes);
    },
    tbItems() {
      return [
        {
          title: "timer",
          icon: "timer",
          comp: CookingTimer,
        },
        {
          title: "planner",
          icon: "cal",
          comp: MealPlanner,
        },
      ];
    },
    tbRows() {
      return "52, ".repeat(this.tbItems.length) + "52";
    },
    noResultFor() {
      if (this.filterFavourites || this.filterTrylater || this.selCuisine)
        return "noRecsInL";
      return "noRecs";
    },
    imgWidth() {
      return Screen.mainScreen.widthDIPs / 2 - 24;
    },
    empty() {
      let rl = this.recipes.length;
      let fr = this.filteredRecipes.length;
      let ff = this.filterFavourites;
      let ftl = this.filterTrylater;
      let sq = this.searchQuery;
      interface EmptyState {
        title: string;
        sub: string;
        action?: Function;
      }
      let r = <EmptyState>{};
      if (!rl && !ff && !ftl) {
        if (this.adminMode) {
          r.title = "strAdd";
          r.sub = "plsAdd";
        } else {
          r.title = "Nessuna ricetta presente";
          r.sub = "Aggiorna per visualizzare nuove ricette";
        }
      } else if (!fr && ftl && !sq) {
        r.title = "aD";
        r.sub = "tLInfo";
      } else if (!fr && ff && !sq) {
        r.title = "noFavs";
        r.sub = "fsList";
      } else if (!fr && sq) {
        r.title = this.noResultFor;
        r.sub = "trySer";
        r.action = this.goToHome;
      }
      return Object.keys(r).length ? r : 0;
    },
  },
  methods: {
    ...mapActions(["setS", "setST", "deleteRs", "clearF"]),
    setComp(comp) {
      this.currentComp = comp;
    },
    pgLoad({ object }) {
      object.bindingContext = new Observable();
      this.filterFavourites
        ? this.setComp("favourites")
        : this.filterTrylater
        ? this.setComp("trylater")
        : this.selCuisine
        ? this.setComp("Filtered recipes")
        : this.setComp("EnRecipes");
      if (this.shake) {
        if (utils.hasAccelerometer())
          startAccelerometerUpdates((data) => this.onSensorData(data));
        else this.setS(0);
      }
      this.hijackBackEvent();
      setTimeout(() => {
        if (this.listview) this.listview.refresh();
      }, 1000);
    },
    pgUnload() {
      if (this.shake) stopAccelerometerUpdates();
    },
    abLoad({ object }) {
      this.appbar = object;
    },
    tbLoad({ object }) {
      this.toolbar = object;
    },

    // Collectionview
    cvLoad({ object }) {
      const View = android.view.View;
      object.android.setOverScrollMode(View.OVER_SCROLL_NEVER);
      this.listview = object;
    },
    cvScroll({ object }) {
      let scrollUp;
      let y = object.scrollOffset;
      if (y) {
        scrollUp = y < this.scrollPos;
        this.scrollPos = Math.abs(y);
        let ab = this.appbar.translateY;
        if (!scrollUp && ab == 0) this.hideBars();
        else if (scrollUp && ab == 64) this.showBars();
      }
    },
    showBars() {
      this.animateBar(this.appbar, 1);
    },
    hideBars() {
      this.showTools && this.toggleTools();
      this.animateBar(this.appbar, 0);
    },
    getSpanSize(index) {
      return (this.layout == "grid" || this.layout == "photogrid") &&
        (index == 0 || index == 1)
        ? 2
        : 1;
    },
    getLayout(args, index, items) {
      return index == 0 ? "header" : index == 1 ? "lists" : this.layout;
    },

    // Search
    openSearch() {
      this.showTools && this.toggleTools();
      this.showSearch = 1;
    },
    closeSearch() {
      this.searchQuery = "";
      Utils.ad.dismissSoftInput();
      this.showSearch = 0;
    },

    // Sort
    openSort() {
      this.showTools && this.toggleTools();
      this.releaseBackEvent();
      this.$showModal(Action, {
        props: {
          title: "srt",
          list: [
            "random",
            "title",
            "Rating",
            "Quickest first",
            "Slowest first",
            "Difficulty level",
            "Last updated",
            "Newest first",
            "Oldest first",
          ],
          selected: this.sortT,
        },
      }).then((action) => {
        if (action && this.sortT !== action) {
          this.setST(action);
          ApplicationSettings.setString("sortT", action);
          this.updateSort();
        }
        this.hijackBackEvent();
      });
    },

    // Filter
    openFilter() {
      this.setComp("EnRecipes");
      this.filterFavourites = this.filterTrylater = 0;
      this.showTools && this.toggleTools();
      this.releaseBackEvent();
      this.$showModal(Filters).then((res) => {
        this.setComp(res ? "EnRecipes" : "Filtered recipes");
        this.hijackBackEvent();
      });
    },

    // Tools
    toggleTools() {
      if (this.showTools) {
        this.toolbar
          .animate({
            height: 0,
            translate: { x: 0, y: 48 },
            duration: 200,
            curve: CoreTypes.AnimationCurve.easeIn,
          })
          .then(() => (this.showTools = 0));
      } else {
        this.toolbar.height = 1;
        this.showTools = 1;
        setTimeout(() => {
          this.toolbar.animate({
            height: 52 * this.tbItems.length + 8,
            duration: 200,
            translate: { x: 0, y: 0 },
            curve: CoreTypes.AnimationCurve.easeOut,
          });
        }, 1);
      }
    },

    // ListHandlers
    addToSelection(id) {
      this.showTools && this.toggleTools();
      this.selectMode = 1;
      this.appbar.translateY = 0;
      this.selection.includes(id)
        ? this.selection.splice(this.selection.indexOf(id), 1)
        : this.selection.push(id);
      this.selection.length ? this.listview.refresh() : this.clearSelection();
    },
    clearSelection() {
      this.selection = [];
      this.selectMode = 0;
      this.listview.refresh();
    },
    deleteSelection() {
      this.deletionDialogActive = 1;
      let hasMany = this.selection.length > 1;
      let what = hasMany
        ? `${this.selection.length} ${localize("recs")}`
        : `"${
            this.recipes[
              this.recipes.findIndex((e) => e.id === this.selection[0])
            ].title
          }"`;
      this.$showModal(Confirm, {
        props: {
          title: localize("conf"),
          description: `${localize(
            hasMany ? "delRecsInfo" : "delRecInfo",
            what
          )}`,
          cancelButtonText: "cBtn",
          okButtonText: "dBtn",
        },
      }).then((action) => {
        if (action) {
          this.deleteRs(this.selection);
          if (!this.filteredRecipes.length) this.goToHome();
          this.clearSelection();
        }
        this.deletionDialogActive = 0;
      });
    },
    exportSelection() {},

    // ShakeDetector
    onSensorData({ x, y, z }) {
      x = x.toFixed(2);
      y = y.toFixed(2);
      z = z.toFixed(2);
      const FORCE_THRESHOLD = 1;
      const TIME_THRESHOLD = 150;
      const SHAKE_TIMEOUT = 600;
      const SHAKE_THROTTLE = 600;
      const SHAKE_COUNT = 3;
      const now = Date.now();
      if (now - lastForce > SHAKE_TIMEOUT) {
        shakeCount = 0;
      }
      let timeDelta = now - lastTime;
      if (timeDelta > TIME_THRESHOLD) {
        let forceVector = Math.abs(
          Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)) - 1
        );
        if (forceVector > FORCE_THRESHOLD) {
          shakeCount++;
          if (shakeCount >= SHAKE_COUNT && now - lastShake > SHAKE_THROTTLE) {
            lastShake = now;
            shakeCount = 0;
            if (this.filteredRecipes.length) {
              utils.vibrate(100);
              this.viewRandomRecipe();
            }
          }
          lastForce = now;
        }
        lastTime = now;
      }
    },

    // Helpers
    getRecipeCount(arg) {
      let count = 0;
      let a = this.selCuisine;
      let b = this.selCategory;
      let c = this.selTag;
      let cuisine = a && a != "allCuis";
      let category = b && b != "allCats";
      let tag = c && c != "allTs";
      let allCuisines = a && a == "allCuis";
      let allCategories = b && b == "allCats";
      let allTags = c && c == "allTs";
      switch (arg) {
        case "EnRecipes":
          count = this.recipes.length;
          break;
        case "trylater":
          count = this.recipes.filter((e) => !e.tried).length;
          break;
        case "favourites":
          count = this.recipes.filter((e) => e.favorite).length;
          break;
        default:
          count = this.recipes.filter((e) => {
            let cui = e.cuisine === a;
            let cat = e.category === b;
            let t = e.tags.includes(c);
            return allCuisines
              ? allCategories
                ? tag
                  ? t
                  : 1
                : category
                ? allTags
                  ? cat
                  : tag
                  ? cat && t
                  : cat
                : 1
              : cuisine
              ? allCategories
                ? allTags
                  ? cui
                  : tag
                  ? cui && t
                  : cui
                : category
                ? allTags
                  ? cui && cat
                  : tag
                  ? cui && cat && t
                  : cui && cat
                : cui
              : 0;
          }).length;
          break;
      }
      return count && this.localeN(count);
    },

    focusField({ object }) {
      if (this.RTL) object.android.setGravity(5);
      setTimeout((e) => {
        object.focus();
        setTimeout((e) => Utils.ad.showSoftInput(object.android), 100);
      }, 100);
    },
    updateList(value) {
      clearInterval(typingTimer);
      typingTimer = setTimeout(() => {
        value = value.replace(/\s+$/, "");
        this.searchQuery = value.toLowerCase();
      }, 750);
    },

    randomRecipeID() {
      let min = 0;
      let max = this.filteredRecipes.length - 1;
      let randomIndex = Math.round(Math.random() * (max - min));
      return this.filteredRecipes[randomIndex].id;
    },
    recipeFilter(e) {
      let cuisineMatched = e.cuisine === this.selCuisine;
      let allCuisines = /allCuis/.test(this.selCuisine);
      let categoryMatched = e.category === this.selCategory;
      let allCategories = /allCats/.test(this.selCategory);
      let tagMatched = e.tags.includes(this.selTag);
      let allTags = /allTs/.test(this.selTag);
      let cuisine = cuisineMatched || allCuisines;

      return this.selTag && !allTags
        ? (categoryMatched || allCategories) && cuisine && tagMatched
        : this.selCategory && !allCategories
        ? cuisine && categoryMatched
        : cuisine;
    },
    sortFunction(a, b) {
      const titleOrder = a.title
        .toLowerCase()
        .localeCompare(b.title.toLowerCase(), Device.language, {
          ignorePunctuation: true,
        });
      let d1 = this.totalTime(a.prepTime, a.cookTime).duration;
      let d2 = this.totalTime(b.prepTime, b.cookTime).duration;
      let ld1 = new Date(a.lastModified);
      let ld2 = new Date(b.lastModified);
      let cd1 = new Date(a.created);
      let cd2 = new Date(b.created);
      let r1 = a.rating;
      let r2 = b.rating;

      function difficultyLevel(l) {
        switch (l) {
          case "Easy":
            return 1;
          case "Moderate":
            return 2;
          case "Challenging":
            return 3;
        }
      }
      let dl1 = difficultyLevel(a.difficulty);
      let dl2 = difficultyLevel(b.difficulty);
      switch (this.sortT) {
        case "random":
          return 0.5 - Math.random();
        case "title":
          return titleOrder > 0 ? 1 : titleOrder < 0 ? -1 : 0;
        case "Quickest first":
          return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
        case "Slowest first":
          return d1 > d2 ? -1 : d1 < d2 ? 1 : 0;
        case "Rating":
          return r1 > r2 ? -1 : r1 < r2 ? 1 : 0;
        case "Difficulty level":
          return dl1 > dl2 ? 1 : dl1 < dl2 ? -1 : 0;
        case "Last updated":
          return ld1 < ld2 ? 1 : ld1 > ld2 ? -1 : 0;
        case "Newest first":
          return cd1 < cd2 ? 1 : cd1 > cd2 ? -1 : 0;
        case "Oldest first":
          return cd1 < cd2 ? -1 : cd1 > cd2 ? 1 : 0;
      }
    },
    getItemPos(id) {
      let length = this.filteredRecipes.length;
      let l2 = this.layout == "grid" || this.layout == "photogrid";
      let oddOrEven = this.oddOrEven(id);
      let Rsys = utils.sysRTL();
      let itemPos =
        id == this.filteredRecipes[0].id ||
        (length > 1 && l2 && id == this.filteredRecipes[1].id)
          ? "firstItem"
          : id == this.filteredRecipes[length - 1].id ||
            (length > 1 &&
              l2 &&
              oddOrEven == (Rsys ? " even" : " odd") &&
              id == this.filteredRecipes[length - 2].id)
          ? "lastItem"
          : "";
      let selection = this.selection.includes(id) ? "select" : "deselect";
      let classes = itemPos + " " + selection;
      return l2 ? classes + oddOrEven : classes;
    },
    oddOrEven(id) {
      let c = this.filteredRecipes.findIndex((e) => e.id == id) % 2 === 0;
      if (utils.sysRTL()) c = !c;
      return c ? " odd" : " even";
    },
    getTags(tags) {
      return tags.join(" · ");
    },

    // NavigationHandlers
    hijackBackEvent() {
      AndroidApplication.on(
        AndroidApplication.activityBackPressedEvent,
        this.backEvent
      );
    },
    releaseBackEvent() {
      AndroidApplication.off(
        AndroidApplication.activityBackPressedEvent,
        this.backEvent
      );
    },
    backEvent(args) {
      if (this.showSearch) {
        args.cancel = true;
        this.closeSearch();
      } else if (this.selectMode) {
        args.cancel = true;
        this.clearSelection();
      } else if (
        ["favourites", "trylater", "Filtered recipes"].includes(
          this.currentComp
        )
      ) {
        args.cancel = true;
        this.goToHome();
      }
    },
    goToHome() {
      this.setComp("EnRecipes");
      this.filterFavourites = this.filterTrylater = null;
      this.clearF();
    },
    navigateTo(to, title, page) {
      this.showTools && this.toggleTools();
      if (page) {
        if (/Settings/.test(title))
          this.$navigateTo(to, {
            transition: {
              name: this.RTL ? "slideRight" : "slide",
              duration: 200,
              curve: "easeOut",
            },
          });
        else
          this.$navigateTo(to, {
            animated: false,
          });
      } else if (title !== this.currentComp) {
        this.showBars();
        this.setComp(title);
        this.filterFavourites = to == "favourites";
        this.filterTrylater = to == "trylater";
        this.clearF();
      }
    },
    stSwipe({ direction }) {
      const comps = ["EnRecipes", "trylater", "favourites", "Filtered recipes"];
      let index = comps.findIndex((e) => e == this.currentComp);
      switch (direction) {
        case 1:
          if (index > 0) {
            this.showBars();
            this.navigateTo(comps[index - 1], comps[index - 1]);
            this.setComp(comps[index - 1]);
            this.filterFavourites = comps[index - 1] == "favourites";
            this.filterTrylater = comps[index - 1] == "trylater";
            this.clearF();
          }
          break;
        case 2:
          if (index <= 1) {
            this.showBars();
            this.navigateTo(comps[index + 1], comps[index + 1]);
            this.setComp(comps[index + 1]);
            this.filterFavourites = comps[index + 1] == "favourites";
            this.filterTrylater = comps[index + 1] == "trylater";
          }
          break;
      }
    },
    addR() {
      this.showTools && this.toggleTools();
      this.$navigateTo(EditRecipe, {
        props: {
          filterFavourites: this.filterFavourites,
          filterTrylater: this.filterTrylater,
        },
        animated: false,
      });
    },
    viewRecipe(recipeID) {
      this.showTools && this.toggleTools();
      this.$navigateTo(ViewRecipe, {
        props: {
          filterTrylater: this.filterTrylater,
          recipeID,
        },
        animated: false,
      });
    },
    viewRandomRecipe() {
      this.showTools && this.toggleTools();
      this.$navigateTo(ViewRecipe, {
        props: {
          filterTrylater: 1,
          recipeID: this.randomRecipeID(),
        },
        animated: false,
      });
    },
    touchSelector({ object, action }, comp, title) {
      if (this.currentComp != title) {
        this.touchFade(object, action);
        if (action == "up") this.navigateTo(comp, title);
      }
    },
    touchRecipe({ object, action }) {
      if (!this.selectMode) this.touchFade(object, action);
    },
    touchTool({ object, action }, comp, value) {
      this.touchFade(object, action);
      if (action == "up") this.navigateTo(comp, value, 1);
    },
  },
};
</script>
