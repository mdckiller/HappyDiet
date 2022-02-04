<template>
  <Page
    @loaded="mLoad"
    backgroundColor="transparent"
    :class="theme"
  >
    <GridLayout rows="auto, auto, auto" class="modal">
      <RLabel class="title" :text="title | L" />
      <StackLayout row="1" class="input">
        <TextView
          v-if="type == 'view'"
          autocorrect="true"
          autocapitalizationType="sentences"
          class="modalInput"
          @loaded="focusField"
          v-model="text"
        />
        <TextField
          autocapitalizationType="sentences"
          autocorrect="true"
          v-else
          class="modalInput"
          @loaded="focusField"
          v-model="text"
          @returnPress="$modal.close(text)"
        />
      </StackLayout>
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
          :text="action | L"
          @tap="$modal.close(text)"
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
  props: ["title", "type", "hint", "placeholder", "action"],
  data() {
    return {
      text: null,
    };
  },
  computed: {
    ...mapState(["icon", "theme", "RTL"]),
  },
  methods: {
    focusField({ object }) {
      this.setGravity(object);
      let a = this.placeholder;
      typeof a == "number"
        ? (object.keyboardType = "number")
        : this.type
        ? ""
        : (object.autocapitalizationType = "words");
      object.hint = this.hint;
      object.focus();
      setTimeout(() => Utils.ad.showSoftInput(object.android), 100);
    },
  },
  created() {
    let a = this.placeholder;
    if (a) this.text = typeof a == "number" ? a : localize(a);
  },
};
</script>
