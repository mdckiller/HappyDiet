<template>
  <Page @loaded="mLoad" backgroundColor="transparent" :class="theme">
    <GridLayout columns="*" rows="auto, auto, *, auto" class="modal">
      <RLabel class="title" :text="title | L" />
      <StackLayout
        row="1"
        :hidden="!filteredRecipes.length && !searchQuery"
        class="input"
      >
        <TextField
          @loaded="setGravity"
          class="modalInput"
          :hint="'ser' | L"
          v-model="searchQuery"
        />
      </StackLayout>
      <ListView row="2" for="recipe in filteredRecipes">
        <v-template>
          <RLabel
            class="listItem"
            :text="recipe.title"
            @touch="touch($event, recipe)"
          />
        </v-template>
      </ListView>
      <Label
        row="2"
        padding="16"
        lineHeight="4"
        class="tc tw"
        :hidden="!noResult"
        :text="noResult | L"
      />
      <RGridLayout :rtl="RTL" row="3" columns="auto, *, auto" class="actions">
        <Button
          :hidden="!action"
          class="text tb st fb"
          :text="action | L"
          @tap="$modal.close(action)"
        />
        <Button
          col="2"
          class="text tb st fb"
          :text="'cBtn' | L"
          @tap="$modal.close(0)"
        />
      </RGridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: ["title", "recipes", "height", "action"],
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    ...mapState(["icon", "theme", "RTL"]),
    filteredRecipes() {
      return this.recipes
        .map((e, i) => {
          return {
            id: e.id,
            title: e.title,
            cuisine: e.cuisine,
            category: e.category,
            tags: e.tags.map((e) => e.toLowerCase()).join(),
            ingredients: e.ingredients.map((e) => e.item.toLowerCase()).join(),
          };
        })
        .filter((e) => this.recipeFilter(e));
    },
    noResult() {
      if (!this.recipes.length) return "recListEmp";
      else if (!this.filteredRecipes.length && this.searchQuery)
        return "noRecs";
      else 0;
    },
  },
  methods: {
    tapAction(recipe) {
      this.$modal.close(recipe.id);
    },
    recipeFilter(e) {
      let searchQuery = this.searchQuery.toLowerCase();
      return (
        e.title.includes(searchQuery) ||
        e.cuisine.includes(searchQuery) ||
        e.category.includes(searchQuery) ||
        e.tags.includes(searchQuery) ||
        e.ingredients.includes(searchQuery)
      );
    },
    touch({ object, action }, recipe) {
      this.touchFade(object, action);
      if (action == "up") this.tapAction(recipe);
    },
  },
};
</script>
