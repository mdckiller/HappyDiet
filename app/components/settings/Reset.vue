<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :rtl="RTL" rows="*, auto" columns="auto, *">
      <OptionsList title="rest" :items="items" :action="reset" />
      <GridLayout
        :hidden="toast"
        row="1"
        class="appbar rtl"
        @loaded="abLoad"
        columns="auto, *"
      >
        <Button class="ico end" :text="icon.back" @tap="$navigateBack()" />
      </GridLayout>
      <Toast :onload="tbLoad" :toast="toast" :action="hideToast" />
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

<script>
import { Observable } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";
import OptionsList from "../sub/OptionsList";
import Toast from "../sub/Toast";
let barTimer;

export default {
  components: { OptionsList, Toast },
  data() {
    return {
      toast: 0,
      appbar: 0,
      toastbar: 0,
    };
  },
  computed: {
    ...mapState(["icon", "RTL"]),
    items() {
      return [
        {},
        {
          type: "list",
          icon: "reset",
          rtl: 1,
          title: "restCuiL",
          data: "cuisines",
        },
        {
          type: "list",
          icon: "reset",
          rtl: 1,
          title: "restCatL",
          data: "categories",
        },
        {
          type: "list",
          icon: "reset",
          rtl: 1,
          title: "restYUL",
          data: "yieldUnits",
        },
        {
          type: "list",
          icon: "reset",
          rtl: 1,
          title: "restUL",
          data: "units",
        },
        {
          type: "info",
          title: "restInfo",
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["resetLIs"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
    },
    abLoad({ object }) {
      this.appbar = object;
    },
    tbLoad({ object }) {
      this.toastbar = object;
    },
    reset(list) {
      this.resetLIs(list);
      this.showToast();
    },
    showToast() {
      this.animateBar(this.appbar, 0).then(() => {
        this.toast = localize("restDone");
        this.animateBar(this.toastbar, 1, 1);
      });
      utils.timer(5, (val) => !val && this.hideToast());
    },
    hideToast() {
      this.animateBar(this.toastbar, 0).then(() => {
        this.toast = null;
        this.animateBar(this.appbar, 1);
      });
    },
  },
};
</script>
