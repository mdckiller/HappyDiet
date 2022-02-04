import Vue from 'nativescript-vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {
  getFileAccess,
  File,
  Application,
  knownFolders,
  path,
} from '@nativescript/core'
import {
  getNumber,
  setNumber,
  getString,
  setString,
} from '@nativescript/core/application-settings'
import { openOrCreate } from '@akylas/nativescript-sqlite'
import * as utils from '~/shared/utils'

// OpenDatabaseFile
const db = openOrCreate(
  path.join(knownFolders.documents().path, 'EnRecipes.db')
)

// Create"recipes"Table
db.execute(
  'CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, image TEXT, title TEXT, cuisine TEXT, category TEXT, tags TEXT, prepTime TEXT, cookTime TEXT, yieldQuantity TEXT, yieldUnit TEXT, difficulty TEXT, rating INT, ingredients TEXT, instructions TEXT, combinations TEXT, notes TEXT, favorite INT, tried INT, lastTried INT, lastModified INT, created INT)'
)

// Create"lists"Table
db.execute(
  'CREATE TABLE IF NOT EXISTS lists (cuisines TEXT, categories TEXT, yieldUnits TEXT, units TEXT)'
)

// Create"mealPlans"Table
db.execute(
  'CREATE TABLE IF NOT EXISTS mealPlans (id TEXT PRIMARY KEY, date INT, mealType TEXT, recipeID TEXT, quantity INT, note TEXT)'
)

// Create"timerPresets"Table
db.execute(
  'CREATE TABLE IF NOT EXISTS timerPresets (id INT PRIMARY KEY, label TEXT, time TEXT)'
)

const defCuisines = [
  'American',
  'Brazilian',
  'British',
  'Chinese',
  'Danish',
  'Egyptian',
  'Filipino',
  'French',
  'German',
  'Greek',
  'Indian',
  'Irish',
  'Italian',
  'Jamaican',
  'Japanese',
  'Jewish',
  'Kenyan',
  'Korean',
  'Mexican',
  'Nigerian',
  'Portuguese',
  'Russian',
  'Scottish',
  'Spanish',
  'Sri Lankan',
  'Swedish',
  'Thai',
  'Turkish',
  'Vietnamese',
]
const defCategories = [
  'Appetizers',
  'Barbecue',
  'Beverages',
  'Breads',
  'breakfast',
  'Desserts',
  'dinner',
  'Healthy',
  'lunch',
  'Main dishes',
  'Meat',
  'Noodles',
  'Pasta',
  'Poultry',
  'Rice',
  'Salads',
  'Sauces',
  'Seafood',
  'Side dishes',
  'snacks',
  'Soups',
  'Undefined',
  'Vegan',
  'Vegetarian',
]
const defYieldUnits = [
  'Serving',
  'Piece',
  'Teaspoon',
  'Tablespoon',
  'Fluid Ounce',
  'Ounce',
  'Pound',
  'Gram',
  'Kilogram',
  'Cup',
  'Gallon',
  'Millilitre',
  'Litre',
  'Roll',
  'Patty',
  'Loaf',
]
const defUnits = [
  'unit',
  'tsp',
  'dsp',
  'tbsp',
  'fl oz',
  'cup',
  'pt',
  'qt',
  'gal',
  'ml',
  'l',
  'oz',
  'lb',
  'mg',
  'g',
  'kg',
  'cm',
  'in',
  'leaf',
  'clove',
  'piece',
  'pinch',
  'drop',
  'dozen',
  'stick',
  'small',
  'medium',
  'large',
]

const listItems = {
  cuisines: {
    sort: 1,
    defs: defCuisines,
  },
  categories: {
    sort: 1,
    defs: defCategories,
  },
  yieldUnits: {
    sort: 0,
    defs: defYieldUnits,
  },
  units: {
    sort: 0,
    defs: defUnits,
  },
}

interface IRecipe {
  id: string
  image: string
  title: string
  cuisine: string
  category: string
  tags: string[]
  prepTime: string
  cookTime: string
  yieldQuantity: number
  yieldUnit: string
  difficulty: string
  rating: number
  ingredients: string[]
  instructions: string[]
  combinations: string[]
  notes: string[]
  favorite: 0 | 1
  tried: 0 | 1
  lastTried: number | null
  lastModified: number | null
  created: number | null
}
interface IMealPlan {
  id: string
  date: number
  mealType: string
  recipeID: string
  quantity: number
  note: string
}
interface IMealPlanOld {
  title: string
  startDate: number
  type: string
  eventColor: string
}

export default new Vuex.Store({
  state: {
    recipes: [],
    cuisines: [],
    categories: [],
    yieldUnits: [],
    units: [],
    mealPlans: [],
    icon: {
      cog: '\ue900',
      home: '\ue901',
      try: '\ue902',
      tried: '\ue903',
      fav: '\ue904',
      faved: '\ue905',
      menu: '\ue906',
      cuisine: '\ue907',
      category: '\ue908',
      tag: '\ue909',
      star: '\ue90a',
      starred: '\ue90b',
      time: '\ue90c',
      diff: '\ue90d',
      bag: '\ue90e',
      bagged: '\ue90f',
      price: '\ue910',
      sear: '\ue911',
      sort: '\ue912',
      filter: '\ue913',
      plus: '\ue914',
      done: '\ue915',
      back: '\ue916',
      x: '\ue917',
      del: '\ue918',
      save: '\ue919',
      undo: '\ue91a',
      edit: '\ue91b',
      cal: '\ue91c',
      tod: '\ue91d',
      left: '\ue91e',
      right: '\ue91f',
      img: '\ue920',
      uncheck: '\ue921',
      check: '\ue922',
      share: '\ue923',
      timer: '\ue924',
      start: '\ue925',
      pause: '\ue926',
      addTo: '\ue927',
      sound: '\ue928',
      vibrate: '\ue929',
      interface: '\ue92a',
      opts: '\ue92b',
      db: '\ue92c',
      reset: '\ue92d',
      info: '\ue92e',
      lang: '\ue92f',
      theme: '\ue930',
      layout: '\ue931',
      shuf: '\ue932',
      week: '\ue933',
      folder: '\ue934',
      exp: '\ue935',
      imp: '\ue936',
      gh: '\ue937',
      tg: '\ue938',
      help: '\ue939',
      priv: '\ue93a',
      don: '\ue93b',
      trans: '\ue93c',
      delay: '\ue93d',
      ring: '\ue93e',
      print: '\ue93f',
      dup: '\ue940',
      calv: '\ue941',
      mpd: '\ue942',
      madd: '\ue943',
      awake: '\ue944',
      edge: '\ue945',
      more: '\ue946',
      less: '\ue947',
    },
    sortT: 'random', // SortType
    langs: [
      {
        locale: 'ar',
        title: 'العربية',
        rtl: 1,
      },
      {
        locale: 'da',
        title: 'Dansk',
      },
      {
        locale: 'de',
        title: 'Deutsch',
      },
      {
        locale: 'en-IN',
        title: 'English (India)',
      },
      {
        locale: 'en-GB',
        title: 'English (United Kingdom)',
      },
      {
        locale: 'en-US',
        title: 'English (United States)',
      },
      {
        locale: 'es',
        title: 'Español',
      },
      {
        locale: 'fr',
        title: 'Français',
      },
      {
        locale: 'fr-BE',
        title: 'Français (Belgium)',
      },
      {
        locale: 'fr-CA',
        title: 'Français (Canada)',
      },
      {
        locale: 'fr-CH',
        title: 'Français (Switzerland)',
      },
      {
        locale: 'hi',
        title: 'हिंदी',
      },
      {
        locale: 'id',
        title: 'Indonesia',
      },
      {
        locale: 'it',
        title: 'Italiano',
      },
      {
        locale: 'ja',
        title: '日本語',
      },
      {
        locale: 'ml',
        title: 'മലയാളം',
      },
      {
        locale: 'nb-NO',
        title: 'Norsk bokmål',
      },
      {
        locale: 'nl',
        title: 'Nederlands',
      },
      {
        locale: 'pt',
        title: 'Português',
      },
      {
        locale: 'pt-BR',
        title: 'Português (Brazil)',
      },
      {
        locale: 'ru',
        title: 'Русский',
      },
      {
        locale: 'ta',
        title: 'தமிழ்',
      },
      {
        locale: 'te',
        title: 'తెలుగు',
      },
    ],
    shake: getNumber('shake', 1), // ShakeViewRandomRecipe
    impSum: {
      // ImportSummary
      found: 0,
      imported: 0,
      updated: 0,
    },
    layout: getString('layout', 'detailed'),
    selCuisine: null, // SelectedCuisine
    selCategory: null, // SelectedCategory
    selTag: null, // SelectedTag
    theme: 'sysDef',
    startMon: getNumber('startMon', 0), // StartWithMonday
    timerD: getNumber('timerD', 1), // TimerDelay
    timerS: {}, // TimerSound
    timerV: getNumber('timerV', 0), // TimerVibrate
    timerPs: [], // TimerPresets
    activeTs: [], // ActiveTimers
    FGS: 0, // ForeGroundService
    RTL: getNumber('RTL', 0),
    plannerV: getString('plannerV', 'wk'), // PlannerViewMode
    planDel: getString('planDel', 'nvr'), // PlanDeletionCriteria
    edgeS: getNumber('edgeS', 1), // EdgeSwipe
    awakeV: getNumber('awakeV', 1), // AwakeViewer
  },
  mutations: {
    // ToggleKeepAwakeOnRecipeViewer
    toggleAwakeV(state) {
      state.awakeV = +!state.awakeV
      setNumber('awakeV', state.awakeV)
    },
    // ToggleEdgeSwipe
    toggleEdgeS(state) {
      state.edgeS = +!state.edgeS
      setNumber('edgeS', state.edgeS)
    },
    // SetPlanDeletionCriteria
    setPlanDel(state, s: string) {
      state.planDel = s
      setString('planDel', s)
    },
    // SetPlannerViewMode
    setPlannerV(state, s: string) {
      state.plannerV = s
      setString('plannerV', s)
    },
    // SetRTLLayout
    setRTL(state) {
      state.RTL = getNumber('RTL', 0)
    },
    // SetForegroundService
    setFgS(state, n: number) {
      state.FGS = n
    },
    // AddTimerPreset
    addTP(state, o) {
      let i = state.timerPs.findIndex((e) => e.id == o.id)
      if (state.timerPs.some((e) => e.id == o.id)) {
        state.timerPs.splice(i, 1, o)
      } else state.timerPs.push(o)
      db.execute(
        `REPLACE INTO timerPresets (id, label, time) VALUES (?, ?, ?)`,
        [o.id, o.label, o.time]
      )
    },
    // DeleteTimerPreset
    deleteTP(state, n: number) {
      let id = state.timerPs[n]
      state.timerPs.splice(n, 1)
      db.execute(`DELETE FROM timerPresets WHERE id = ${id}`)
    },
    // InitialiseTimerPreset
    initTPs(state) {
      if (!state.timerPs.length)
        db.select(`SELECT * FROM timerPresets`).then((res) => {
          res.forEach((t) => {
            t.recipeID = 0
            t.timerInt = 0
            t.isPaused = 0
            t.preset = 1
            t.done = 0
            state.timerPs.push(t)
          })
        })
    },
    // ImportTimerPresets
    importTPs(state, ao) {
      let newPresets = ao.filter(
        (e) => !state.timerPs.some((f) => f.id === e.id)
      )
      newPresets.forEach((t) => {
        db.execute(
          `INSERT INTO timerPresets (id, label, time) VALUES (?, ?, ?)`,
          [t.id, t.label, t.time]
        )
        state.timerPs.push(t)
      })
    },
    // ClearActiveTimerInterval
    clearATIs(state) {
      state.activeTs.forEach((e) => {
        clearInterval(e.timerInt)
        e.timerInt = 0
      })
    },
    // AddActiveTimer
    addAT(state, { timer, i }) {
      state.activeTs.splice(i, 0, timer)
    },
    // SortActiveTimers
    sortATs(state) {
      let a = state.activeTs.reduce((acc, e) => {
        ; (acc[e.recipeID] = acc[e.recipeID] || []).push(e)
        return acc
      }, {})
      state.activeTs = [...(<any>Object).values(a).flat(2)]
    },
    // UpdateActiveTimer
    updateAT(state, o) {
      let i = state.activeTs.findIndex((e) => e.id == o.id)
      state.activeTs.splice(i, 1, o)
    },
    // RemoveActiveTimer
    removeAT(state, n: number) {
      state.activeTs.splice(n, 1)
    },
    // SetTimerDelay
    setTD(state, n: number) {
      state.timerD = n
      setNumber('timerD', n)
    },
    // SetTimerSound
    setTS(state, s: string) {
      state.timerS = s
      setString('timerS', JSON.stringify(s))
    },
    // SetTimerVibrate
    setTV(state, n: number) {
      state.timerV = n
      setNumber('timerV', n)
    },
    // ClearImportSummary
    clearIS(state) {
      for (const key in state.impSum) state.impSum[key] = 0
    },
    // SetFirstDayMonday
    setFD(state, n: number) {
      state.startMon = n
      setNumber('startMon', n)
    },
    // SetTheme
    setT(state, s: string) {
      switch (s) {
        case 'sysDef':
          state.theme =
            Application.systemAppearance() == 'dark' ? 'Dark' : 'Light'
          break
        case 'sysDefB':
          state.theme =
            Application.systemAppearance() == 'dark' ? 'Black' : 'Light'
          break
        default:
          state.theme = s
          break
      }
      setString('theme', s)
    },
    // ClearFilter
    clearF(state) {
      state.selCuisine = state.selCategory = state.selTag = null
    },
    // SetLayout
    setL(state, s: string) {
      state.layout = s
      setString('layout', s)
    },
    // SetSortType
    setST(state, s: string) {
      state.sortT = s
    },
    // InitialiseRecipes
    initRs(state) {
      if (!state.recipes.length) {
        db.select('SELECT * FROM recipes').then((res) => {
          res.forEach((e) => {
            Object.keys(e).forEach(
              (f) =>
                f.match(/tags|ingredients|instructions|combinations|notes/) &&
                (e[f] = JSON.parse(e[f]))
            )
            state.recipes.push(e)
          })
        })
      }
      state.shake = getNumber('shake', 1)
      state.sortT = getString('sortT', 'random')
    },
    // ImportRecipesFromJSON
    importRsJSON(state, ao) {
      let localRecipesIDs, partition
      let imported = 0
      let updated = 0
      function getUpdatedData(data) {
        return data.map((recipe) => {
          let r = Object.assign({}, recipe)
          if (r.timeRequired) {
            r.prepTime = '00:00'
            r.cookTime = r.timeRequired
            delete r.timeRequired
          }
          if (r.imageSrc) {
            r.image = r.imageSrc.replace('enrecipes', 'EnRecipes')
            delete r.imageSrc
          }
          if (!r.hasOwnProperty('cuisine')) r.cuisine = 'Undefined'
          if (!r.hasOwnProperty('tags')) r.tags = []
          if (!r.hasOwnProperty('difficulty')) r.difficulty = 'Easy'
          if (!r.hasOwnProperty('rating')) r.rating = 0
          if (!r.hasOwnProperty('created')) r.created = r.lastModified
          r.yieldQuantity = r.yield.quantity
          r.yieldUnit = r.yield.unit
          delete r.yield
          function getTime(d) {
            return new Date(d).getTime()
          }
          r.lastTried = getTime(r.lastTried)
          r.lastModified = getTime(r.lastModified)
          r.created = getTime(r.created)
          r.favorite = r.favorite | 0
          r.tried = r.tried | 0
          return r
        })
      }
      function createDocuments(data) {
        data = getUpdatedData(data)
        state.recipes = [...state.recipes, ...data]
        data.forEach((r) => {
          imported++
          db.execute(
            `INSERT INTO recipes (id, image, title, cuisine, category, tags, prepTime, cookTime, yieldQuantity, yieldUnit, difficulty, rating, ingredients, instructions, combinations, notes, favorite, tried, lastTried, lastModified, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              r.id,
              r.image,
              r.title,
              r.cuisine,
              r.category,
              JSON.stringify(r.tags),
              r.prepTime,
              r.cookTime,
              r.yieldQuantity,
              r.yieldUnit,
              r.difficulty,
              r.rating,
              JSON.stringify(r.ingredients),
              JSON.stringify(r.instructions),
              JSON.stringify(r.combinations),
              JSON.stringify(r.notes),
              r.favorite,
              r.tried,
              r.lastTried,
              r.lastModified,
              r.created,
            ]
          )
        })
      }
      function updateDocuments(data) {
        data = getUpdatedData(data)
        data.forEach((r) => {
          let recipeIndex = state.recipes
            .map((e, i) => {
              let d1 = new Date(e.lastModified).getTime()
              let d2 = new Date(r.lastModified).getTime()
              return e.id === r.id && d1 < d2 ? i : -1
            })
            .filter((e) => e >= 0)[0]
          if (recipeIndex >= 0) {
            updated++
            Object.assign(state.recipes[recipeIndex], r)
            db.execute(
              `REPLACE INTO recipes (id, image, title, cuisine, category, tags, prepTime, cookTime, yieldQuantity, yieldUnit, difficulty, rating, ingredients, instructions, combinations, notes, favorite, tried, lastTried, lastModified, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                r.id,
                r.image,
                r.title,
                r.cuisine,
                r.category,
                JSON.stringify(r.tags),
                r.prepTime,
                r.cookTime,
                r.yieldQuantity,
                r.yieldUnit,
                r.difficulty,
                r.rating,
                JSON.stringify(r.ingredients),
                JSON.stringify(r.instructions),
                JSON.stringify(r.combinations),
                JSON.stringify(r.notes),
                r.favorite,
                r.tried,
                r.lastTried,
                r.lastModified,
                r.created,
              ]
            )
          }
        })
      }
      if (state.recipes.length) {
        localRecipesIDs = state.recipes.map((e) => e.id)
        partition = ao.reduce(
          (result, recipe) => {
            localRecipesIDs.indexOf(recipe.id) < 0
              ? result[0].push(recipe) // create candidates
              : result[1].push(recipe) // update candidates
            return result
          },
          [[], []]
        )
        if (partition[0].length) createDocuments(partition[0])
        if (partition[1].length) updateDocuments(partition[1])
      } else {
        createDocuments(ao)
      }
      state.impSum.found = ao.length
      state.impSum.imported = imported
      state.impSum.updated = updated
    },
    // ImportRecipesFromDB
    importRsDB(state, ao) {
      let localRecipesIDs: string[], partition: any[]
      let imported = 0
      let updated = 0
      function createDocuments(data: any[]) {
        data.forEach((r) => {
          const cols = Object.keys(r).join(', ')
          const placeholder = Object.keys(r)
            .fill('?')
            .join(', ')
          imported++
          db.execute(
            `REPLACE INTO recipes (${cols}) VALUES (${placeholder})`,
            Object.values(r)
          )
          Object.keys(r).forEach(
            (f) =>
              f.match(/tags|ingredients|instructions|combinations|notes/) &&
              (r[f] = JSON.parse(r[f]))
          )
          state.recipes.push(r)
        })
      }
      function updateDocuments(data: any[]) {
        data.forEach((r) => {
          let recipeIndex = state.recipes
            .map((e, i) => {
              let d1 = new Date(e.lastModified).getTime()
              let d2 = new Date(r.lastModified).getTime()
              return e.id === r.id && d1 < d2 ? i : -1
            })
            .filter((e) => e >= 0)[0]
          if (recipeIndex >= 0) {
            updated++
            const recipesKeys = Object.keys(r)
            //rating INT, favorite INT, tried INT, lastTried INT
            // console.log("_nutriguide_ post: ", JSON.stringify(recipesKeys));
            const cols = recipesKeys.join(', ')
            const placeholder = recipesKeys
              .fill('?')
              .join(', ')
            const recipesValues = Object.values(r)
            const old = state.recipes[recipeIndex]
            for (const tr of ['rating', 'favorite', 'tried', 'lastTried']) {
              const i = recipesKeys.indexOf(tr);
              recipesValues[i] = old[tr];
            }
            db.execute(
              `REPLACE INTO recipes (${cols}) VALUES (${placeholder})`,
              recipesValues
            )
            Object.keys(r).forEach(
              (f) =>
                f.match(/tags|ingredients|instructions|combinations|notes/) &&
                (r[f] = JSON.parse(r[f]))
            )
            Object.assign(state.recipes[recipeIndex], r)
          }
        })
      }
      if (state.recipes.length) {
        localRecipesIDs = state.recipes.map((e) => e.id)
        partition = ao.reduce(
          (result, recipe) => {
            localRecipesIDs.indexOf(recipe.id) < 0
              ? result[0].push(recipe) // create candidates
              : result[1].push(recipe) // update candidates
            return result
          },
          [[], []]
        )
        if (partition[0].length) createDocuments(partition[0])
        if (partition[1].length) updateDocuments(partition[1])
      } else createDocuments(ao)
      state.impSum.found = ao.length
      state.impSum.imported = imported
      state.impSum.updated = updated
    },
    // AddRecipe
    addR(state, o: IRecipe) {
      let r = JSON.parse(JSON.stringify(o))
      Object.keys(o).forEach((e) => {
        if (e.match(/tags|ingredients|instructions|combinations|notes/))
          r[e] = JSON.stringify(r[e])
        if (e.match(/favorite|tried/)) r[e] = r[e] ? 1 : 0
      })
      const cols = Object.keys(o).join(', ')
      const placeholder = Object.keys(o)
        .fill('?')
        .join(', ')
      db.execute(
        `REPLACE INTO recipes (${cols}) VALUES (${placeholder})`,
        Object.values(r)
      )
      let i: number
      function exist({ id }, index: number) {
        if (id === o.id) {
          i = index
          return 1
        }
        return 0
      }
      state.recipes.some(exist)
        ? Object.assign(state.recipes[i], o)
        : state.recipes.push(o)
    },
    // DeleteRecipes
    deleteRs(state, a) {
      a.forEach((id: string) => {
        let i = state.recipes.findIndex((e) => e.id === id)
        getFileAccess().deleteFile(state.recipes[i].image)
        state.recipes.splice(i, 1)
        db.execute(`DELETE FROM recipes WHERE id = '${id}'`)
        state.recipes.forEach((e, i) => {
          if (e.combinations.includes(id)) {
            state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1)
            db.execute(
              `UPDATE recipes SET combinations = '${JSON.stringify(
                state.recipes[i].combinations
              )}' WHERE id = '${id}'`
            )
          }
        })
      })
    },
    // InitialiseListItems
    initLIs(state) {
      if (!state.cuisines.length) {
        db.select(`SELECT * FROM lists`).then((res) => {
          if (!res.length) {
            db.execute(
              `INSERT INTO lists (cuisines, categories, yieldUnits, units) VALUES (?, ?, ?, ?)`,
              [null, null, null, null]
            )
          }

          db.select(`SELECT * FROM lists`).then((res) => {
            Object.keys(res[0]).forEach((list) => {
              let userItems: string[]
              let defs = listItems[list].defs
              if (res[0][list]) {
                userItems = JSON.parse(res[0][list])
                state[list] = userItems.some((e: string) => defs.includes(e))
                  ? userItems
                  : [...defs, ...userItems]
              } else {
                state[list] = defs
                listItems[list].sort && state[list].sort()
              }
            })
          })
        })
      }
    },
    // ImportListItems
    importLIs(state, { data, listName }) {
      state[listName] = [...new Set([...state[listName], ...data])]
      if (listItems[listName].sort) state[listName].sort()
      db.execute(
        `UPDATE lists SET ${listName} = '${JSON.stringify(state[listName])}'`
      )
    },
    // AddListItem
    addLI(state, { item, listName }) {
      let lowercase = state[listName].map((e: string) => e.toLowerCase())
      if (lowercase.indexOf(item.toLowerCase()) == -1) {
        state[listName].push(item)
        if (listItems[listName].sort)
          state[listName].sort((a: string, b: string) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          )
        db.execute(
          `UPDATE lists SET ${listName} = '${JSON.stringify(state[listName])}'`
        )
      }
    },
    // RemoveListItem
    removeLI(state, { item, listName }) {
      state[listName].splice(state[listName].indexOf(item), 1)
      db.execute(
        `UPDATE lists SET ${listName} = '${JSON.stringify(state[listName])}'`
      )
    },
    // ResetListItems
    resetLIs(state, listName) {
      let defs = listItems[listName].defs
      state[listName] = [...defs]
      if (listItems[listName].sort)
        state[listName].sort((a: string, b: string) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        )
      db.execute(
        `UPDATE lists SET ${listName} = '${JSON.stringify(state[listName])}'`
      )
    },
    // InitialiseMealPlans
    initMPs(state) {
      if (!state.mealPlans.length) {
        let c = state.planDel
        let date = new Date()
        let d = new Date()
        d.setHours(0, 0, 0, 0)
        let ld =
          c == 'otay'
            ? 365
            : c == 'otam'
              ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
              : 7
        d.setDate(d.getDate() - ld)

        db.select(`SELECT * FROM mealPlans`).then((res) =>
          res.forEach((p: any) =>
            c !== 'nvr' && p.date < d.getTime()
              ? db.execute(`DELETE FROM mealPlans WHERE id = '${p.id}'`)
              : state.mealPlans.push(p)
          )
        )
      }
    },
    // ImportMealPlansFromJSON
    importMPsJSON(state, ao) {
      let updatedMealPlans = []
      let newMealPlans = ao.filter((e) => {
        if (e.hasOwnProperty('eventColor')) {
          return !state.mealPlans.some((f) => {
            let d = new Date(e.startDate)
            let date = new Date(
              d.getFullYear(),
              d.getMonth(),
              d.getDate(),
              0
            ).getTime()
            let type
            switch (d.getHours()) {
              case 0:
                type = 'breakfast'
                break
              case 5:
                type = 'lunch'
                break
              case 10:
                type = 'dinner'
                break
              case 15:
                type = 'snacks'
                break
            }
            return f.recipeID == e.title && f.date == date && f.mealType == type
          })
        } else {
          return !state.mealPlans.some(
            (f) =>
              f.recipeID == e.title && f.date == e.date && f.mealType == e.type
          )
        }
      })
      newMealPlans.forEach((p) => {
        p.id = utils.getRandomID()
        p.recipeID = p.title
        p.quantity = 1
        p.note = null
        if (p.hasOwnProperty('eventColor')) {
          let d = new Date(p.startDate)
          p.date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            0
          ).getTime()
          switch (d.getHours()) {
            case 0:
              p.mealType = 'breakfast'
              break
            case 5:
              p.mealType = 'lunch'
              break
            case 10:
              p.mealType = 'dinner'
              break
            case 15:
              p.mealType = 'snacks'
              break
          }
          delete p.title
          delete p.startDate
          delete p.endDate
          delete p.eventColor
        } else {
          p.mealType = p.type
          delete p.type
          delete p.title
        }
        updatedMealPlans.push(p)
      })
      state.mealPlans = [...state.mealPlans, ...updatedMealPlans]
      updatedMealPlans.forEach((p) => {
        db.execute(
          `INSERT INTO mealPlans (id, date, mealType, recipeID, quantity, note) VALUES (?, ?, ?, ?, ?, ?)`,
          [p.id, p.date, p.mealType, p.recipeID, p.quantity, p.note]
        )
      })
    },
    // ImportMealPlansFromDB
    importMPsDB(state, ao: IMealPlan[]) {
      let newMealPlans = ao.filter(
        (e) =>
          !state.mealPlans.some((f) =>
            Object.keys(f).every((key) => f[key] == e[key])
          )
      )
      state.mealPlans = [...state.mealPlans, ...newMealPlans]
      newMealPlans.forEach((p) => {
        db.execute(
          `INSERT INTO mealPlans (id, date, mealType, recipeID, quantity, note) VALUES (?, ?, ?, ?, ?, ?)`,
          [p.id, p.date, p.mealType, p.recipeID, p.quantity, p.note]
        )
      })
    },
    // AddMealPlan
    addMP(
      state,
      { plan, index, inDB }: { plan: IMealPlan; index: number; inDB: number }
    ) {
      let mealPlan = {
        id: plan.id,
        date: plan.date,
        mealType: plan.mealType,
        recipeID: plan.recipeID,
        quantity: plan.quantity,
        note: plan.note,
      }
      if (inDB) {
        const cols = Object.keys(mealPlan).join(', ')
        const placeholder = Object.keys(mealPlan)
          .fill('?')
          .join(', ')
        db.execute(
          `REPLACE INTO mealPlans (${cols}) VALUES (${placeholder})`,
          Object.values(mealPlan)
        )
        if (index === null) state.mealPlans.push(mealPlan)
      } else {
        state.mealPlans.splice(index, 0, mealPlan)
      }
    },
    // DeleteMealPlan
    deleteMP(
      state,
      { id, index, inDB }: { id: string; index: number; inDB?: number }
    ) {
      if (inDB) {
        db.execute(`DELETE FROM mealPlans WHERE id = '${id}'`)
      } else {
        state.mealPlans.splice(index, 1)
        state.mealPlans = [...state.mealPlans]
      }
    },
    toggleState(state, { id, key, setDate }) {
      let i = state.recipes.findIndex((e) => e.id == id)
      state.recipes[i][key] = state.recipes[i][key] ? 0 : 1
      db.execute(
        `UPDATE recipes SET ${key} = ${state.recipes[i][key]} WHERE id = '${id}'`
      )
      if (setDate) {
        state.recipes[i].lastTried = new Date().getTime()
        db.execute(
          `UPDATE recipes SET lastTried = ${state.recipes[i].lastTried} WHERE id = '${id}'`
        )
      }
    },
    // UnLinkCombinations
    unLinkCs(state, { id, combs }) {
      state.recipes.forEach((e, i) => {
        if (combs.includes(e.id)) {
          state.recipes[i].combinations.splice(e.combinations.indexOf(id), 1)
          db.execute(
            `UPDATE recipes SET combinations = '${JSON.stringify(
              state.recipes[i].combinations
            )}' WHERE id = '${id}'`
          )
        }
      })
    },
    // SetShake
    setS(state, n: number) {
      state.shake = n
      setNumber('shake', n)
    },
    // SetRating
    setR(state, { id, r }) {
      let i = state.recipes.findIndex((e) => e.id == id)
      state.recipes[i].rating = r
      db.execute(`UPDATE recipes SET rating = ${r} WHERE id = '${id}'`)
    },
    // UnLinkBrokenImages
    unLinkBIs(state) {
      state.recipes.forEach((r, i) => {
        if (r.image && !File.exists(r.image)) {
          r.image = null
          Object.assign(state.recipes[i], r)
          db.execute(`UPDATE recipes SET image = null WHERE id = '${r.id}'`)
        }
      })
    },
    setCuisine(state, s: string) {
      state.selCuisine = s
    },
    setCategory(state, s: string) {
      state.selCategory = s
    },
    setTag(state, s: string) {
      state.selTag = s
    },
  },
  actions: {
    toggleAwakeV({ commit }) {
      commit('toggleAwakeV')
    },
    toggleEdgeS({ commit }) {
      commit('toggleEdgeS')
    },
    setPlanDel({ commit }, s: string) {
      commit('setPlanDel', s)
    },
    setPlannerV({ commit }, s: string) {
      commit('setPlannerV', s)
    },
    setRTL({ commit }) {
      commit('setRTL')
    },
    sortATs({ commit }) {
      commit('sortATs')
    },
    setFgS({ commit }, n: number) {
      commit('setFgS', n)
    },
    addTP({ commit }, o) {
      commit('addTP', o)
    },
    deleteTP({ commit }, o) {
      commit('deleteTP', o)
    },
    initTPs({ commit }) {
      commit('initTPs')
    },
    importTPs({ commit }, ao) {
      commit('importTPs', ao)
    },
    clearATIs({ commit }) {
      commit('clearATIs')
    },
    addAT({ commit }, o) {
      commit('addAT', o)
    },
    updateAT({ commit }, o) {
      commit('updateAT', o)
    },
    removeAT({ commit }, n: number) {
      commit('removeAT', n)
    },
    setTD({ commit }, n: number) {
      commit('setTD', n)
    },
    setTS({ commit }, s: string) {
      commit('setTS', s)
    },
    setTV({ commit }, n: number) {
      commit('setTV', n)
    },
    clearIS({ commit }) {
      commit('clearIS')
    },
    setFD({ commit }, n: number) {
      commit('setFD', n)
    },
    setT({ commit }, s: string) {
      commit('setT', s)
    },
    clearF({ commit }) {
      commit('clearF')
    },
    setL({ commit }, s: string) {
      commit('setL', s)
    },
    setST({ commit }, s: string) {
      commit('setST', s)
    },
    initRs({ commit }) {
      commit('initRs')
    },
    importRsJSON({ commit }, ao) {
      commit('importRsJSON', ao)
    },
    importRsDB({ commit }, ao) {
      commit('importRsDB', ao)
    },
    addR({ commit }, o) {
      commit('addR', o)
    },
    deleteRs({ commit }, a) {
      commit('deleteRs', a)
    },
    initLIs({ commit }) {
      commit('initLIs')
    },
    importLIs({ commit }, ao) {
      commit('importLIs', ao)
    },
    addLI({ commit }, s: string) {
      commit('addLI', s)
    },
    removeLI({ commit }, s: string) {
      commit('removeLI', s)
    },
    resetLIs({ commit }, s: string) {
      commit('resetLIs', s)
    },
    initMPs({ commit }) {
      commit('initMPs')
    },
    importMPsJSON({ commit }, ao) {
      commit('importMPsJSON', ao)
    },
    importMPsDB({ commit }, ao) {
      commit('importMPsDB', ao)
    },
    addMP({ commit }, o) {
      commit('addMP', o)
    },
    deleteMP({ commit }, o) {
      commit('deleteMP', o)
    },
    toggleState({ commit }, o) {
      commit('toggleState', o)
    },
    unLinkCs({ commit }, a) {
      commit('unLinkCs', a)
    },
    setS({ commit }, n: number) {
      commit('setS', n)
    },
    setR({ commit }, n: number) {
      commit('setR', n)
    },
    unLinkBIs({ commit }) {
      commit('unLinkBIs')
    },
    setCuisine({ commit }, s: string) {
      commit('setCuisine', s)
    },
    setCategory({ commit }, s: string) {
      commit('setCategory', s)
    },
    setTag({ commit }, s: string) {
      commit('setTag', s)
    },
  },
})
