<template>
  <GridLayout
    :hidden="!toast"
    row="1"
    colSpan="2"
    class="appbar snackbar"
    columns="*"
    @swipe="action"
    @tap="action"
    @loaded="onload"
  >
    <StackLayout minHeight="48">
      <RLabel padding="16 20" :text="toast" />
    </StackLayout>
  </GridLayout>
</template>

<script>
export default {
  props: ["toast", "action", "onload"],
};
</script>