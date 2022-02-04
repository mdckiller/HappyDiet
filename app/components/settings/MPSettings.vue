<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :rtl="RTL" rows="*, auto" columns="auto, *">
      <OptionsList title="Settings" :items="items" />
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

<script>
import { Observable } from "@nativescript/core";
import { mapState, mapActions } from "vuex";
import Action from "../modals/Action";
import OptionsList from "../sub/OptionsList";
import { localize } from "@nativescript/localize";

export default {
  components: { OptionsList },
  computed: {
    ...mapState(["icon", "startMon", "RTL", "plannerV", "planDel"]),
    items() {
      return [
        {},
        {
          type: "list",
          icon: "calv",
          title: "calVM",
          subTitle: localize(this.plannerV),
          action: this.selectPlannerView,
        },
        {
          type: "switch",
          icon: "week",
          title: "swm",
          checked: !!this.startMon,
          action: this.toggleFirstDay,
        },
        {
          type: "list",
          icon: "mpd",
          title: "admp",
          subTitle: localize(this.planDel),
          action: this.selectDeletionTime,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setFD", "setPlannerV", "setPlanDel"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
    },
    toggleFirstDay() {
      this.setFD(!this.startMon | 0);
    },
    selectPlannerView() {
      this.$showModal(Action, {
        props: {
          title: "calVM",
          list: ["d", "wk", "mnth"],
          selected: this.plannerV,
        },
      }).then((res) => {
        if (res && this.plannerV != res) this.setPlannerV(res);
      });
    },
    selectDeletionTime() {
      this.$showModal(Action, {
        props: {
          title: "admp",
          list: ["otaw", "otam", "otay", "nvr"],
          selected: this.planDel,
        },
      }).then((res) => {
        if (res && this.planDel != res) this.setPlanDel(res);
      });
    },
  },
};
</script>
