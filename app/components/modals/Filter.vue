<template>
  <Page @loaded="pgLoad" backgroundColor="transparent" :class="theme">
    <GridLayout rows="auto, auto, *, auto" columns="*" class="modal">
      <RLabel class="title a" :text="`fltr` | L" />
      <ScrollView orientation="horizontal" row="1" @loaded="onScrollLoad">
        <RStackLayout :rtl="RTL" class="filters" orientation="horizontal">
          <GridLayout
            rows="32"
            columns="32, auto"
            class="segment rtl"
            v-for="(item, index) in pathList"
            :key="index"
            :class="{ select: filter === item.type }"
            @touch="touchSelector($event, item.type)"
          >
            <Label class="ico tc vc" :text="icon[item.type]" />
            <Label
              :hidden="!item.title"
              class="v vc"
              :class="{ f: RTL }"
              :text="item.title"
              col="1"
            />
          </GridLayout>
        </RStackLayout>
      </ScrollView>
      <ListView row="2" class="options" for="item in filterList">
        <v-template>
          <RLabel
            class="listItem"
            verticalAlignment="center"
            col="1"
            :text="item | L"
            @touch="touch($event, item)"
          />
        </v-template>
      </ListView>
      <RGridLayout
        :rtl="RTL"
        row="3"
        columns="auto, *, auto, auto"
        class="actions"
      >
        <Button class="text tb st fb" :text="'rstBtn' | L" @tap="resetFilter" />
        <Button
          col="2"
          class="text tb st fb"
          :text="'cBtn' | L"
          @tap="$modal.close()"
        />
        <Button
          col="3"
          class="text tb st fb"
          :text="'apply' | L"
          @tap="applyFilter"
        />
      </RGridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { localize } from "@nativescript/localize";
import { mapActions, mapState } from "vuex";
let filterTimer;
export default {
  data() {
    return {
      filter: "cuisine",
      localCuisine: null,
      localCategory: null,
      localTag: null,
      reset: 0,
    };
  },
  computed: {
    ...mapState([
      "icon",
      "recipes",
      "cuisines",
      "categories",
      "selCuisine",
      "selCategory",
      "selTag",
      "theme",
      "RTL",
    ]),
    pathList() {
      let arr = [
        {
          type: "cuisine",
          title: localize(this.localCuisine),
        },
        {
          type: "category",
          title: localize(this.localCategory),
        },
        {
          type: "tag",
          title: localize(this.localTag),
        },
      ];
      switch (this.filter) {
        case "cuisine":
          return arr.slice(0, -2);
        case "category":
          return arr.slice(0, -1);
      }
      return arr;
    },
    filterList() {
      switch (this.filter) {
        case "cuisine":
          return this.cuisineList;
        case "category":
          return this.categoryList;
        case "tag":
          return this.tagList;
      }
    },
    cuisineList() {
      let arr = this.recipes.map((e) => e.cuisine).sort();
      return arr.length ? ["allCuis", ...new Set(arr)] : [];
    },
    categoryList() {
      let arr = this.recipes
        .map(
          (e) =>
            (this.localCuisine === "allCuis" ||
              e.cuisine === this.localCuisine) &&
            e.category
        )
        .filter((e) => e)
        .sort();
      return arr.length ? ["allCats", ...new Set(arr)] : [];
    },
    tagList() {
      let arr = this.recipes
        .map((e) => {
          if (
            this.localCuisine === "allCuis" &&
            this.localCategory === "allCats" &&
            e.tags.length
          )
            return e.tags;
          else if (
            this.localCuisine === "allCuis" &&
            e.category === this.localCategory &&
            e.tags.length
          )
            return e.tags;
          else if (
            this.localCategory === "allCats" &&
            e.cuisine === this.localCuisine &&
            e.tags.length
          )
            return e.tags;
          else if (
            e.category === this.localCategory &&
            e.cuisine === this.localCuisine &&
            e.tags.length
          )
            return e.tags;
        })
        .flat()
        .filter((e) => e)
        .sort();
      let showAllTags =
        this.localCuisine === "allCuis" && this.localCategory === "allCats";
      return arr.length
        ? [!showAllTags && "allTs", ...new Set(arr)].filter((e) => e)
        : [];
    },
  },
  methods: {
    ...mapActions(["setCuisine", "setCategory", "setTag"]),
    pgLoad(args) {
      this.mLoad(args);
      this.localCuisine = this.selCuisine;
      this.localCategory = this.selCategory;
      this.localTag = this.selTag;
      if (this.localCuisine) this.filter = "category";
      if (this.localCategory && this.localTag) this.filter = "tag";
      this.scrollToRight();
    },
    onScrollLoad(args) {
      this.scrollview = args.object;
    },
    setFilterType(type) {
      this.filter = type;
      switch (type) {
        case "cuisine":
          this.localCategory = null;
          this.localTag = null;
          break;
        case "category":
          this.localTag = null;
          break;
      }
    },
    scrollToRight() {
      setTimeout(
        () =>
          this.scrollview.scrollToHorizontalOffset(
            this.RTL ? 0 : this.scrollview.scrollableWidth,
            true
          ),
        10
      );
    },
    setRecipeFilter(item) {
      this.reset = 0;
      switch (this.filter) {
        case "cuisine":
          this.localCuisine = item;
          this.filter = "category";
          break;
        case "category":
          this.localCategory = item;
          if (this.tagList.length) this.filter = "tag";
          break;
        default:
          this.localTag = item;
          break;
      }
      this.scrollToRight();
    },
    applyFilter() {
      this.setCuisine(this.localCuisine);
      this.setCategory(this.localCategory);
      this.setTag(this.localTag);
      this.filterFavourites = this.filterTrylater = 0;
      this.$modal.close(this.reset);
    },
    resetFilter() {
      this.filter = "cuisine";
      this.localCuisine = this.localCategory = this.localTag = null;
      this.reset = 1;
    },
    touch({ object, action }, item) {
      this.touchFade(object, action);
      if (action == "up") this.setRecipeFilter(item);
    },
    touchSelector({ object, action }, type) {
      if (this.filter != type) {
        this.touchFade(object, action);
        if (action == "up") this.setFilterType(type);
      }
    },
  },
};
</script>