<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :rtl="RTL" rows="*, auto" columns="auto, *">
      <OptionsList title="Settings" :items="items" :action="navigateTo" />
      <GridLayout row="1" class="appbar rtl" rows="*" columns="auto, *">
        <Button class="ico end" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
      <Label rowSpan="2" class="edge hal rtl" @swipe="swipeBack" />
      <Label
        rowSpan="2"
        colSpan="2"
        class="edge har rtl f"
        @swipe="swipeBack"
      />
    </RGridLayout>
  </Page>
</template>

<script lang="ts">
import { Observable,ApplicationSettings, } from "@nativescript/core";
import { mapState } from "vuex";
import Interface from "./Interface.vue";
import Options from "./Options.vue";
import Database from "./Database.vue";
import Reset from "./Reset.vue";
import About from "./About.vue";
import OptionsList from "../sub/OptionsList.vue";
export default {
  components: { OptionsList },
  data() {
    var items= [
        {},
        {
          type: "list",
          icon: "interface",
          rtl: 0,
          title: "intf",
          data: Interface,
        },
        {
          type: "list",
          icon: "opts",
          rtl: 1,
          title: "opts",
          data: Options,
        },
        {
          type: "list",
          icon: "info",
          rtl: 0,
          title: "About",
          data: About,
        },
      ]
      const adminMode = ApplicationSettings.getString("adminMode");
      if (adminMode=='Si') {
        items.push({
          type: "list",
          icon: "db",
          rtl: 0,
          title: "db",
          data: Database,
        });
        items.push( {
          type: "list",
          icon: "reset",
          rtl: 1,
          title: "rest",
          data: Reset,
        });
      }
      items.push({})
    return {
      items: items
    };
  },
  computed: {
    ...mapState(["icon", "RTL"]),
  },
  methods: {
    pgLoad({ object }) {
      object.bindingContext = new Observable();
    },
    navigateTo(view) {
      this.$navigateTo(view, {
        animated: false,
      });
    },
  },
};
</script>
