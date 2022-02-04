import {
  ApplicationSettings,
  path,
  knownFolders,
  AndroidApplication,
  File,
  Folder,
  Observable,
  Application,
  getFileAccess,
} from "@nativescript/core";
import { localize } from "@nativescript/localize";
// import Confirm from "../modals/Confirm";
// import OptionsList from "../sub/OptionsList";
// import Toast from "../sub/Toast";
import { openOrCreate } from "@akylas/nativescript-sqlite";
import * as utils from "~/shared/utils";
import { Http } from "@nativescript/core";
 
export default class Importer {
  progress: string;
  store
  errorHandler(e, msg) {
    console.log("_nutriguide_ ERROR: ", e, msg);
  }
  async loadFileContent(dest: string, uri: string) {
    let unzippedFiles = dest + "/EnRecipes";
    const recipesDB = unzippedFiles + "/EnRecipes.db";
    const images = unzippedFiles + "/Images";
    const db = openOrCreate(recipesDB);
    const data = await db.select("SELECT * FROM recipes");
    //this.store.importRsDB(data);
    this.store.cristo(data);
  }

  loadImagesContent(dest, uri) {

  }
  async syncFileFrom(store: any) {
    try {
      this.store = store;
      knownFolders.temp().clear();
      const resultFile = await Http.getFile("https://www.example.com/nutriguide/data/data.zip")
      const uri = "file://" + resultFile.path;
      let dest = knownFolders.temp().path;
      await utils.Zip.unzip(uri, dest);
      this.loadFileContent(dest, uri)
    } catch (e) {
      this.errorHandler(e, 'Generic error')
    }
  }

  validateZipContent(dest, uri) {
    this.progress = localize("impip");
    // this.hijackBackEvent();
    let cache = dest + "/EnRecipes";
    const recipesDB = cache + "/EnRecipes.db";
    const recipes = cache + "/recipes.json";
    const images = cache + "/Images";
    const userCuisines = cache + "/userCuisines.json";
    const userCategories = cache + "/userCategories.json";
    const userYieldUnits = cache + "/userYieldUnits.json";
    const userUnits = cache + "/userUnits.json";
    const mealPlans = cache + "/mealPlans.json";
    let vm = this;
    // IMPORT IMAGES FINALLY
    function importImages() {
      const timer = setInterval(() => {
        console.log("_nutriguide_ importImages: ", JSON.stringify(vm.store.state.impSum), vm.progress);
        if (!vm.progress) clearInterval(timer);
        if (vm.progress && vm.store.state.impSum.found) {
          Folder.exists(images)
            ? vm.importImages(uri)
            : vm.showImportSummary();
        }
      }, 100);
    }
    if (Folder.exists(cache)) {
      if (File.exists(recipesDB)) {
        // IMPORT FROM DB FILE
        this.extractData(recipesDB);
        importImages();
      } else if (File.exists(recipes)) {
        // IMPORT FROM JSON FILES
        this.isFileDataValid([
          {
            path: recipes,
            db: "recipes",
            file: "recipes.json",
          },
          {
            path: userCuisines,
            db: "userCuisines",
            file: "userCuisines.json",
          },
          {
            path: userCategories,
            db: "userCategories",
            file: "userCategories.json",
          },
          {
            path: userYieldUnits,
            db: "userYieldUnits",
            file: "userYieldUnits.json",
          },
          {
            path: userUnits,
            db: "userUnits",
            file: "userUnits.json",
          },
          {
            path: mealPlans,
            db: "mealPlans",
            file: "mealPlans.json",
          },
        ]);
        importImages();
      } else this.failedImport(localize("buEmp"));
    } else this.failedImport(localize("buInc"));
  }
  isFileDataValid(file) {
    const files = file.filter((e) => File.exists(e.path));
    if (files.length) {
      let isValid = files.map(() => 0);
      files.forEach((file, i) => {
        File.fromPath(file.path)
          .readText()
          .then((data) => {
            isValid[i] = this.hasValidJSON(data);
            if (!isValid[i]) {
              this.failedImport(
                `${localize("buMod")}\n\n${localize("invFile")}: ${file.file}`
              );
              return 0;
            }
            if (isValid.every((e) => e === 1)) {
              files.forEach((file) => {
                File.fromPath(file.path)
                  .readText()
                  .then((data) => {
                    this.importData(JSON.parse(data), file.db);
                  });
              });
            }
          });
      });
    } else this.failedImport(localize("buEmp"));
  }
  failedImport(description) {
    this.progress = null;
    // this.releaseBackEvent();
    knownFolders.temp().clear();
    console.log("_nutriguide_ error: ", description);
    // this.$showModal(Confirm, {
    //   props: {
    //     title: "impFail",
    //     description,
    //     okButtonText: "OK",
    //   },
    // });
  }
  hasValidJSON(data) {
    try {
      JSON.parse(data) && Array.isArray(JSON.parse(data));
    } catch (e) {
      return 0;
    }
    return 1;
  }
  extractData(recipesDB) {
    const db = openOrCreate(recipesDB);

    // Import recipes
    db.select("SELECT * FROM recipes").then((res) => {
      this.store.importRsDB(res);
    });
    console.log("_nutriguide_ Import recipes");
    // Import listitems
    db.select(
      `SELECT cuisines, categories, yieldUnits, units FROM lists`
    ).then((res) =>
      Object.keys(res[0]).forEach((listName) =>
        this.store.importLIs({
          data: JSON.parse(res[0][listName]),
          listName,
        })
      )
    );

    // Import mealPlans
    db.select(`SELECT * FROM mealPlans`).then((res) => this.store.importMPsDB(res));

    // Import timerPs
    db.select(`SELECT * FROM timerPresets`).then((res) =>
      this.store.importTPs(res)
    );
  }
  importData(data, db) {
    switch (db) {
      case "recipes":
        this.store.importRsJSON(data);
        break;
      case "userCuisines":
        this.store.importLIs({
          data,
          listName: "cuisines",
        });
        break;
      case "userCategories":
        this.store.importLIs({
          data,
          listName: "categories",
        });
        break;
      case "userYieldUnits":
        this.store.importLIs({
          data,
          listName: "yieldUnits",
        });
        break;
      case "userUnits":
        this.store.importLIs({
          data,
          listName: "units",
        });
        break;
      case "mealPlans":
        this.store.importMPsJSON(data);
        break;
    }
  }
  importImages(uri) {
    let destPath = knownFolders.documents().path;
    Folder.fromPath(destPath);
    utils.Zip.unzip(uri, destPath).then((res) => {
      if (res) {
        // delete unzipped data files
        Folder.fromPath(path.join(destPath, "EnRecipes"))
          .getEntities()
          .then((entities) => {
            entities.forEach((entity) => {
              if (/.json|.db/.test(entity['_extension']))
                File.fromPath(entity['_path']).remove();
            });
          });
        this.showImportSummary();
        this.store.unLinkBIs();
      }
    });
  }
  showImportSummary() {
    this.progress = null;
    // this.releaseBackEvent();
    let { found, imported, updated } = this.store.state.impSum;
    let exists = Math.abs(found - imported - updated) + updated;
    let importedNote = `\n${localize("recI")} ${imported}`;
    let existsNote = `\n${localize("recE")} ${exists}`;
    let updatedNote = `\n${localize("recU")} ${updated}`;
    console.log("_nutriguide_ OK: ", importedNote, updatedNote, existsNote);
    // this.$showModal(Confirm, {
    //   props: {
    //     title: "impSuc",
    //     description: `${found} ${localize(
    //       "recF"
    //     )}\n${importedNote}${existsNote}${updatedNote}`,
    //     okButtonText: "OK",
    //   },
    // }).then(() => this.clearIS());
    this.store.clearIS()
  }

}