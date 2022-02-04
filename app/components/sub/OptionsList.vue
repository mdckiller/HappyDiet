<template>
  <ListView colSpan="2" rowSpan="2" class="options" for="item in items">
    <v-template if="$index == 0">
      <Label class="pTitle tw tb" :text="title | L" />
    </v-template>
    <v-template if="item.type == 'switch'">
      <RGridLayout
        :rtl="RTL"
        columns="auto, *, auto"
        class="option"
        @touch="touch($event, item.data, item.action)"
      >
        <Label class="ico vc rtl" :text="icon[item.icon]" />
        <StackLayout col="1" class="info">
          <RLabel :text="item.title | L" class="tw" />
          <RLabel
            v-if="item.subTitle"
            :text="item.subTitle | L"
            class="sub tw"
          />
        </StackLayout>
        <Switch
          @loaded="swLoad"
          isUserInteractionEnabled="false"
          :color="item.checked ? '#ff5200' : '#adb5bd'"
          col="2"
          :checked="item.checked"
        />
      </RGridLayout>
    </v-template>
    <v-template if="item.type == 'list'">
      <RGridLayout
        :rtl="RTL"
        columns="auto, *"
        class="option"
        @touch="touch($event, item.data, item.action)"
      >
        <Label
          class="ico vc"
          :class="{ rtl: item.rtl }"
          :text="icon[item.icon]"
        />
        <StackLayout col="1" class="info">
          <RLabel :text="item.title | L" class="tw" />
          <RLabel
            :hidden="!item.subTitle"
            :text="item.subTitle"
            class="sub tw"
          />
        </StackLayout>
      </RGridLayout>
    </v-template>
    <v-template if="item.type == 'info'">
      <Label
        class="groupInfo sub tw lh4"
        :class="{ r: RTL }"
        :text="item.title | L"
      />
    </v-template>
    <v-template>
      <StackLayout class="ls"> </StackLayout>
    </v-template>
  </ListView>
</template>

<script>
import { mapState } from "vuex";
import * as utils from "~/shared/utils";

export default {
  props: ["title", "items", "action"],
  computed: {
    ...mapState(["icon", "RTL"]),
  },
  methods: {
    swLoad({ object }) {
      object.android.setRotation(
        this.RTL && utils.sysRTL() ? 0 : this.RTL || utils.sysRTL() ? 180 : 0
      );
    },
    touch({ object, action }, data, localAction) {
      this.touchFade(object, action);
      if (action == "up") localAction ? localAction(data) : this.action(data);
    },
  },
};
</script>