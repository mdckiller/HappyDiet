<template>
  <Page @loaded="mLoad" backgroundColor="transparent" :class="theme">
    <GridLayout
      columns="*"
      :rows="`auto, auto, ${stretch ? '*' : 'auto'}, auto`"
      class="modal"
    >
      <RLabel class="title" :text="title | L" />
      <ListView
        rowHeight="48"
        row="2"
        for="item in newList"
        :height="stretch ? '100%' : listHeight"
      >
        <v-template>
          <RLabel
            class="listItem"
            :class="{ select: item == selected || $index == selected }"
            :text="`${localized(item)}`"
            @touch="touch"
            @tap="tapAction(item)"
            @longPress="removeItem(item)"
          />
        </v-template>
      </ListView>
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

<script lang="ts">
import { Screen } from "@nativescript/core";
import { localize } from "@nativescript/localize";
import { mapState, mapActions } from "vuex";
import Confirm from "./Confirm.vue";

interface IData {
  newList: unknown[];
  stretch: number;
  listHeight: number;
}

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    list: {
      type: Array,
      required: true,
    },
    action: {
      type: String,
      required: false,
    },
    selected: {
      type: String,
      required: false,
    },
  },
  data(): IData {
    return {
      newList: this.list,
      stretch: 0,
      listHeight: 0,
    };
  },
  computed: {
    ...mapState(["icon", "theme", "RTL"]),
  },
  methods: {
    ...mapActions(["removeLI", "deleteTP"]),
    localized(item: string): string {
      return this.title !== "lang" ? localize(item) : item;
    },
    tapAction(item: string): void {
      this.$modal.close(item);
    },
    removeConfirmation(description: string): void {
      return this.$showModal(Confirm, {
        props: {
          title: "conf",
          description,
          cancelButtonText: "cBtn",
          okButtonText: "rBtn",
        },
      });
    },
    deletionConfirmation(description: string): void {
      return this.$showModal(Confirm, {
        props: {
          title: "conf",
          description,
          cancelButtonText: "cBtn",
          okButtonText: "dBtn",
        },
      });
    },
    removeItem(item: string): void {
      let vm = this;
      let index = this.newList.findIndex((e) => e === item);
      let localizedItem = `"${localize(item)}"`;
      function removeLI(listName: string, desc: string): void {
        vm.removeConfirmation(`${localize(desc, localizedItem)}`).then(
          (action: boolean) => {
            if (action)
              vm.removeLI({
                item,
                listName,
              });
          }
        );
      }
      function deleteTP(): void {
        vm.deletionConfirmation(`${localize("delPrst", `"${item}"`)}`).then(
          (action: boolean) => {
            if (action) {
              vm.deleteTP(index);
              vm.newList.splice(index, 1);
            }
          }
        );
      }
      switch (this.title) {
        case "cui":
          removeLI("cuisines", "rmCuiInfo");
          break;
        case "cat":
          removeLI("categories", "rmCatInfo");
          break;
        case "yieldU":
          removeLI("yieldUnits", "rmYUInfo");
          break;
        case "Unit":
          removeLI("units", "rmUInfo");
          break;
        case "prsts":
          deleteTP();
          break;
      }
    },
    touch({ object, action }): void {
      this.touchFade(object, action);
    },
  },
  created() {
    let screenHeight = Screen.mainScreen.heightDIPs;
    let usableHeight = screenHeight - 144 - 24; // margin and statusbar
    let count = this.newList.length;
    let listHeight = 48 * count;
    let modalHeight = 104 + listHeight; // header + actions height = 104
    if (modalHeight < usableHeight) {
      this.listHeight = listHeight;
    } else {
      this.stretch = 1;
    }
  },
};
</script>
