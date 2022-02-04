<template>
  <Page @loaded="mLoad" backgroundColor="transparent" :class="theme">
    <GridLayout rows="auto, auto, auto" class="modal">
      <RLabel class="title" :text="title | L" />
      <Label
        row="1"
        v-if="description"
        class="desc input tw lh4"
        :text="description"
      />
      <RGridLayout :rtl="RTL" row="2" columns="*, auto, auto" class="actions">
        <Button
          v-if="cancelButtonText"
          col="1"
          class="text tb st fb"
          :text="cancelButtonText | L"
          @tap="$modal.close(0)"
        />
        <Button
          col="2"
          class="text tb st fb"
          :text="okButtonText | L"
          @tap="$modal.close(1)"
        />
      </RGridLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { mapState } from "vuex";
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cancelButtonText: {
      type: String,
      required: false,
    },
    okButtonText: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(["icon", "theme", "RTL"]),
  },
};
</script>
