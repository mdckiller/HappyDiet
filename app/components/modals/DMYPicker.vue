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
          :items="days"
          :selectedIndex="dIndex"
          @selectedIndexChange="setD"
        ></ListPicker>
        <ListPicker
          @loaded="onLPLoad"
          :items="months"
          :selectedIndex="currentM"
          @selectedIndexChange="setM"
        ></ListPicker>
        <ListPicker
          :items="years"
          :selectedIndex="yIndex"
          @selectedIndexChange="setY"
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
          @tap="$modal.close(selected)"
        />
      </RGridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { mapState } from "vuex";
import { localize } from "@nativescript/localize";
export default {
  props: ["title", "monthNames", "currentD", "currentM", "currentY"],
  data() {
    return {
      selectedD: 0,
      selectedM: 0,
      selectedY: 0,
    };
  },
  computed: {
    ...mapState(["icon", "theme", "RTL"]),
    days() {
      let ld = new Date(this.selectedY, this.selectedM + 1, 0).getDate();
      return Array.from({ length: ld }, (v, i) => i + 1);
    },
    dIndex() {
      return this.days.indexOf(this.selectedD || this.currentD);
    },
    months() {
      return this.monthNames.map((e) => localize(e));
    },
    years() {
      let min = 1900;
      let max = min + 200;
      let years = [];
      for (let i = min; i <= max; i++) years.push(i);
      return years;
    },
    yIndex() {
      return this.years.indexOf(this.currentY);
    },
    selected() {
      return {
        date: this.selectedD,
        month: this.selectedM,
        year: this.selectedY,
      };
    },
  },
  methods: {
    onLPLoad({ object }) {
      object.android.setWrapSelectorWheel(true);
    },
    setD(args) {
      this.selectedD = args.object.selectedIndex + 1;
    },
    setM(args) {
      this.selectedM = args.object.selectedIndex;
    },
    setY(args) {
      this.selectedY = this.years[args.object.selectedIndex];
    },
  },
};
</script>
