<template>
  <Page
    @loaded="mLoad"
    backgroundColor="transparent"
    :class="theme"
  >
    <GridLayout rows="auto, auto, auto" class="modal">
      <RLabel class="title" :text="title | L" />
      <RStackLayout
        :rtl="RTL"
        row="1"
        orientation="horizontal"
        horizontalAlignment="center"
      >
        <ListPicker
          @loaded="onLPLoad"
          :items="hrsList"
          :selectedIndex="hrIndex"
          @selectedIndexChange="setHrs"
        ></ListPicker>
        <ListPicker
          @loaded="onLPLoad"
          :items="minsList"
          :selectedIndex="minIndex"
          @selectedIndexChange="setMins"
        ></ListPicker>
      </RStackLayout>
      <RGridLayout :rtl="RTL" row="2" columns="*, auto, auto" class="actions">
        <Button
          col="1"
          class="text tb st fb"
          :text="'cBtn' | L"
          @tap="$modal.close(0)"
        />
        <Button
          col="2"
          class="text tb st fb"
          :text="'SET' | L"
          @tap="$modal.close(selectedTime)"
        />
      </RGridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { mapState } from "vuex";
import { localize } from "@nativescript/localize";
export default {
  props: ["title", "selectedHr", "selectedMin"],
  data() {
    return {
      hrs: [],
      mins: [],
      selectedHrs: "00",
      selectedMins: "00",
    };
  },
  computed: {
    ...mapState(["icon", "theme", "RTL"]),
    hrsList() {
      let h = [...Array(24).keys()];
      this.hrs = h;
      return h.map((e) => `${e} ${localize("hr")}`);
    },
    minsList() {
      let m = [...Array(60).keys()];
      this.mins = m;
      return m.map((e) => `${e} ${localize("min")}`);
    },
    hrIndex() {
      return this.hrs.indexOf(parseInt(this.selectedHr));
    },
    minIndex() {
      return this.mins.indexOf(parseInt(this.selectedMin));
    },
    selectedTime() {
      return this.selectedHrs + ":" + this.selectedMins;
    },
  },
  methods: {
    onLPLoad({ object }) {
      object.android.setWrapSelectorWheel(true);
    },
    setHrs(args) {
      let hr = "0" + this.hrs[args.object.selectedIndex];
      this.selectedHrs = hr.slice(-2);
    },
    setMins(args) {
      let min = "0" + this.mins[args.object.selectedIndex];
      this.selectedMins = min.slice(-2);
    },
  },
};
</script>
