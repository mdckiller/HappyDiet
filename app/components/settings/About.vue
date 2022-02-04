<template>
  <Page @loaded="pgLoad" actionBarHidden="true">
    <RGridLayout :rtl="RTL" rows="*, auto" columns="auto, *">
      <ListView rowSpan="2" colSpan="2" class="options" for="item in items">
        <v-template if="$index == 0">
          <Label class="pTitle tw tb" :text="'About' | L" />
        </v-template>
        <v-template if="$index == 1">
          <StackLayout class="appInfo">
            <Image class="logo" src="res://logo" stretch="none" />
            <Label class="name tb tc" :text="'EnRecipes' | L" />
            <Label :text="getVersion" class="tb tc" />

            <Label class="info tc tw lh4" :text="'appInfo' | L" />
          </StackLayout>
        </v-template>
        <v-template if="$index == 8">
          <StackLayout class="ls"> </StackLayout>
        </v-template>
        <v-template>
          <RGridLayout
            :rtl="RTL"
            columns="auto, *"
            class="option"
            @touch="touch($event, item.url)"
          >
            <Label
              class="ico"
              :class="{ rtl: /help|don/.test(item.icon) }"
              :text="icon[item.icon]"
            />

            <Label col="1" class="info" :text="item.title | L" />
          </RGridLayout>
        </v-template>
      </ListView>
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
import { Application, Observable, Utils } from '@nativescript/core'
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['icon', 'RTL']),
    items() {
      return [
        {},
        {},
        // {
        //   icon: 'lang',
        //   title: 'Official Website',
        //   url: 'http://dottradice.it',
        // },
        {
          icon: 'gh',
          title: 'gh',
          url: 'https://github.com/mdckiller/HappyDiet',
        },
         {
          icon: 'gh',
          title: 'Basata sul progetto EnRecipes',
          url: 'https://github.com/vishnuraghavb/EnRecipes',
        },
        // {
        //   icon: 'tg',
        //   title: 'joinTG',
        //   url: 'https://t.me/enrecipes',
        // },
        // {
        //   icon: 'help',
        //   title: 'guide',
        //   url: 'https://github.com/vishnuraghavb/EnRecipes-Wiki/wiki/User-Guide',
        // },
        // {
        //   icon: 'priv',
        //   title: 'priv',
        //   url: 'https://github.com/vishnuraghavb/EnRecipes-Wiki/blob/main/PRIVACY.md',
        // },
        // {
        //   icon: 'don',
        //   title: 'donate',
        //   url: 'https://www.vishnuraghav.com/donate',
        // },
        // {
        //   icon: "trans",
        //   title: "trnsl",
        //   url: "https://hosted.weblate.org/projects/enrecipes/app-translations",
        // },
        {},
      ]
    },
    getVersion() {
      let ctx = Application.android.context
      return (
        'v' +
        ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0)
          .versionName
      )
    },
  },
  methods: {
    pgLoad({ object }) {
      object.bindingContext = new Observable()
    },
    touch({ object, action }, url) {
      this.touchFade(object, action)
      if (action == 'up') Utils.openUrl(url)
    },
  },
}
</script>
