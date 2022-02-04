<template>
  <Page @loaded="mLoad" backgroundColor="transparent" :class="theme">
    <GridLayout rows="auto, auto, auto" class="modal">
      <RLabel class="title" :text="title | L" />
      <StackLayout row="1">
        <StackLayout class="input">
          <TextField
            @loaded="setGravity"
            class="modalInput"
            v-model="setLabel"
            :hint="label"
            autocapitalizationType="words"
            autocorrect="true"
        /></StackLayout>
        <RStackLayout
          :rtl="RTL"
          orientation="horizontal"
          horizontalAlignment="center"
        >
          <ListPicker
            @loaded="onLPLoad"
            :items="hrsList"
            @selectedIndexChange="setHr"
          ></ListPicker>
          <ListPicker
            @loaded="onLPLoad"
            :items="minsList"
            @selectedIndexChange="setMin"
          ></ListPicker>
          <ListPicker
            @loaded="onLPLoad"
            :items="secsList"
            @selectedIndexChange="setSec"
          ></ListPicker>
        </RStackLayout>
      </StackLayout>

      <RGridLayout
        :rtl="RTL"
        row="2"
        columns="auto, *, auto, auto"
        class="actions r"
      >
        <Button
          v-if="showPreset"
          class="text tb st fb"
          :text="'prstBtn' | L"
          @tap="$modal.close('presets')"
        />
        <Button
          col="2"
          class="text tb st fb"
          :text="'cBtn' | L"
          @tap="$modal.close(0)"
        />
        <Button
          col="3"
          class="text tb st fb"
          :text="action | L"
          @tap="respond"
        />
      </RGridLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Utils } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState } from "vuex";
export default {
  props: ["title", "label", "action", "showPreset"],
  data() {
    return {
      hrs: [],
      mins: [],
      secs: [],
      selectedHrs: "00",
      selectedMins: "00",
      selectedSecs: "00",
      setLabel: null,
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
    secsList() {
      let s = [...Array(60).keys()];
      this.secs = s;
      return s.map((e) => `${e} ${localize("sec")}`);
    },
    selectedTime() {
      return `${this.selectedHrs}:${this.selectedMins}:${this.selectedSecs}`;
    },
  },
  methods: {
    onLPLoad({ object }) {
      object.android.setWrapSelectorWheel(true);
    },
    setHr(args) {
      let hr = "0" + this.hrs[args.object.selectedIndex];
      this.selectedHrs = hr.slice(-2);
    },
    setMin(args) {
      let min = "0" + this.mins[args.object.selectedIndex];
      this.selectedMins = min.slice(-2);
    },
    setSec(args) {
      let sec = "0" + this.secs[args.object.selectedIndex];
      this.selectedSecs = sec.slice(-2);
    },
    focusField({ object }) {
      object.focus();
      setTimeout(() => Utils.ad.showSoftInput(object.android), 100);
    },
    respond() {
      this.$modal.close({
        label: this.setLabel ? this.setLabel : this.label,
        time: this.selectedTime,
      });
    },
  },
};
</script>
