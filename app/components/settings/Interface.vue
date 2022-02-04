<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :rtl="RTL" rows="*, auto" columns="auto, *">
      <OptionsList title="intf" :items="items" />
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
import { ApplicationSettings, Observable, Frame } from "@nativescript/core";
import Action from "../modals/Action";
import OptionsList from "../sub/OptionsList";
import Prompt from "../modals/Prompt.vue";
import { mapState, mapActions } from "vuex";
import * as utils from "~/shared/utils";
import { localize } from "@nativescript/localize";

export default {
  components: { OptionsList },
  data() {
    return {
      applang: 0,
    };
  },
  computed: {
    ...mapState(["icon", "langs", "theme", "layout", "RTL"]),
    items() {
      return [
        {},
        // {
        //   type: "list",
        //   icon: "lang",
        //   rtl: 0,
        //   title: "lang",
        //   subTitle: localize(this.applang),
        //   action: this.setAppLang,
        // },
        {
          type: "list",
          icon: "theme",
          rtl: 0,
          title: "Theme",
          subTitle: localize(ApplicationSettings.getString("theme", "sysDef")),
          action: this.selectThemes,
        },
        {
          type: "list",
          icon: "layout",
          rtl: 1,
          title: "listVM",
          subTitle: localize(this.layout),
          action: this.setLayoutMode,
        },
        {
          type: "list",
          icon: "priv",
          rtl: 1,
          title: "Modalità amministratore",
          subTitle:
            ApplicationSettings.getString("adminMode") || "No",
          action: this.setAdminMode,
        },
        {},
      ];
    },
  },
  methods: {
    ...mapActions(["setT", "setL", "setRTL"]),
    pgLoad({ object }) {
      object.bindingContext = new Observable();
    },
    // LanguageSelection
    setAppLang() {
      let languages = this.langs.map((e) => e.title);
      this.$showModal(Action, {
        props: {
          title: "lang",
          list: [...languages],
          selected: this.applang,
        },
      }).then((action) => {
        if (action && this.applang !== action) {
          let currentLocale = ApplicationSettings.getString(
            "appLocale",
            "none"
          ).split("-");
          let locale = this.langs.filter((e) => e.title === action)[0].locale;
          if (currentLocale !== locale) {
            this.applang = action;
            ApplicationSettings.setString("applang", action);
            ApplicationSettings.setString("appLocale", locale);
            utils.updateLocale();
            this.setRTL();
            Frame.reloadPage();
          }
        }
      });
    },
    // ThemeSelection
    selectThemes() {
      this.$showModal(Action, {
        props: {
          title: "Theme",
          list: ["Light", "Dark", "Black", "sysDef", "sysDefB"],
          selected: ApplicationSettings.getString("theme", "sysDef"),
        },
      }).then((action) => {
        if (
          action &&
          (ApplicationSettings.getString("theme") != this.theme
            ? 1
            : this.theme != action)
        ) {
          this.setT(action);
          Frame.reloadPage();
        }
      });
    },
    // LayoutMode
    setLayoutMode() {
      this.$showModal(Action, {
        props: {
          title: "listVM",
          list: ["detailed", "grid", "photogrid", "simple", "minimal"],
          selected: this.layout,
        },
      }).then((mode) => {
        if (mode && this.layout !== mode) this.setL(mode.toLowerCase());
      });
    },
    setAdminMode() {
      const adminMode = ApplicationSettings.getString("adminMode");
      if (!adminMode || adminMode == "No") {
        this.$showModal(Prompt, {
          props: {
            title: "Password",
            type: "view",
            action: "SET",
          },
        }).then((pw) => {
          console.log("_nutriguide_ pw: ", pw);
          if (pw == "password") {
            console.log("_nutriguide_ YES");
            ApplicationSettings.setString("adminMode", "Si");
            Frame.reloadPage();
          }
        });
      } else {
        ApplicationSettings.setString("adminMode", "No");
        Frame.reloadPage();
      }
    },
  },
  created() {
    this.applang = ApplicationSettings.getString("applang", "sysDef");
  },
};
</script>
