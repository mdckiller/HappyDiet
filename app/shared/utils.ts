import {
  Application,
  AndroidApplication,
  Utils,
  Device,
  Color,
  path,
  knownFolders,
  ApplicationSettings,
} from '@nativescript/core'
import { localize } from '@nativescript/localize'

let timerOne
declare const global, android, androidx, com, java, Array: any

const View = android.view.View
const PowerManager = android.os.PowerManager
const ctx = Utils.android.getApplicationContext()
const pm = ctx.getSystemService(android.content.Context.POWER_SERVICE)
const wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, 'Timers')
const sdkv = parseInt(Device.sdkVersion)

export function hasAccelerometer() {
  return ctx
    .getSystemService(android.content.Context.SENSOR_SERVICE)
    .getDefaultSensor(android.hardware.Sensor.TYPE_ACCELEROMETER)
}
export function vibrate(duration) {
  let vibratorService = ctx.getSystemService(
    android.content.Context.VIBRATOR_SERVICE
  )
  if (vibratorService.hasVibrator()) vibratorService.vibrate(duration)
}
export function timer(dur, callback) {
  callback(1)
  clearInterval(timerOne)
  timerOne = setInterval(() => {
    dur--
    callback(1)
    if (dur == 0) {
      clearInterval(timerOne)
      callback(0)
    }
  }, 1000)
}

function callIntent(ctx, intent, msg, pickerType) {
  return new Promise((resolve) => {
    const onEvent = function(e) {
      if (e.requestCode === pickerType) {
        resolve(e)
        Application.android.off(AndroidApplication.activityResultEvent, onEvent)
      }
    }
    Application.android.once(AndroidApplication.activityResultEvent, onEvent)
    ctx.startActivityForResult(
      android.content.Intent.createChooser(intent, msg),
      pickerType
    )
  })
}
// ImagePicker
export function getRecipePhoto() {
  const ctx =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_GET_CONTENT
  )
  intent.setType('image/*')
  return callIntent(ctx, intent, 'Select photo', DIR_CODE).then(
    ({ resultCode, intent }: any) => {
      if (resultCode === android.app.Activity.RESULT_OK)
        if (intent != null && intent.getData()) return intent.getData()
    }
  )
}

export function copyPhotoToCache(src: string, dest: string) {
  const ContentResolver = Application.android.nativeApp.getContentResolver()
  const isURI = src.includes('content://')
  console.log(src, dest, isURI)

  return new Promise((resolve) => {
    if (isURI) {
      const uri = new android.net.Uri.parse(src)
      const input = new java.io.BufferedInputStream(
        ContentResolver.openInputStream(uri)
      )
      let size = input.available()
      let buffer = Array.create('byte', size)
      const output = new java.io.BufferedOutputStream(
        new java.io.FileOutputStream(dest)
      )
      input.read(buffer)
      do {
        output.write(buffer)
      } while (input.read(buffer) != -1)
      input.close()
      output.close()
      resolve(dest)
    } else {
      const input = new java.io.FileInputStream(src)
      const output = new java.io.FileOutputStream(dest)
      let buffer = Array.create('byte', 1024)
      let len
      while ((len = input.read(buffer)) > 0) {
        output.write(buffer, 0, len)
      }
      resolve(dest)
    }
  })
}

// CopyDbFile
export function copyDBToExport() {
  const src = path.join(knownFolders.documents().path, 'EnRecipes.db')
  const dst = path.join(
    knownFolders.documents().getFolder('EnRecipes').path,
    'EnRecipes.db'
  )
  const input = new java.io.FileInputStream(src)
  try {
    const output = new java.io.FileOutputStream(dst)
    let len: number
    let buffer = Array.create('byte', 1024)
    while ((len = input.read(buffer)) > 0) output.write(buffer, 0, len)
  } catch (error) {
    console.log(error)
  } finally {
    input.close()
  }
}

// BackupFolderPicker
export function getBackupFolder() {
  const ctx =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_OPEN_DOCUMENT_TREE
  )
  return callIntent(ctx, intent, 'Select folder', DIR_CODE).then(
    ({ resultCode, intent }: any) => {
      if (resultCode === android.app.Activity.RESULT_OK)
        if (intent != null && intent.getData()) return intent.getData()
    }
  )
}

// BackupFilePicker
export function getBackupFile() {
  const ctx =
    Application.android.foregroundActivity || Application.android.startActivity
  const DIR_CODE = Math.round(Math.random() * 10000)
  const intent = new android.content.Intent(
    android.content.Intent.ACTION_GET_CONTENT
  )
  intent.addCategory(android.content.Intent.CATEGORY_OPENABLE)
  intent.setType('application/zip')
  return callIntent(ctx, intent, 'Select file to import', DIR_CODE).then(
    ({ resultCode, intent }: any) => {
      if (resultCode === android.app.Activity.RESULT_OK) {
        if (intent != null && intent.getData()) return intent.getData()
      }
    }
  )
}

// ZipOperations
export class Zip {
  static getSubFiles(src: string, isRootFolder?: number) {
    const fileList = new java.util.ArrayList()
    const sourceFile = new java.io.File(src)
    let tempList = sourceFile.listFiles()
    for (let i = 0; i < tempList.length; i++) {
      if (tempList[i].isFile()) {
        fileList.add(tempList[i])
      }
      if (tempList[i].isDirectory()) {
        if (isRootFolder) {
          fileList.add(tempList[i])
        }
        fileList.addAll(this.getSubFiles(tempList[i].getAbsolutePath()))
      }
    }
    return fileList
  }
  static zipFile(src, dest, filename) {
    return new Promise((resolve, reject) => {
        const outputStream = new java.io.FileOutputStream(dest);
        const zipOutputStream = new java.util.zip.ZipOutputStream(outputStream)
        const sourceFiles = this.getSubFiles(src, 1)
        for (let i = 0; i < sourceFiles.size(); i++) {
          let len
          let buffer = Array.create('byte', 4096)
          let file = sourceFiles.get(i)
          let entry = new java.util.zip.ZipEntry(
            'EnRecipes/' +
              new java.io.File(src)
                .toURI()
                .relativize(file.toURI())
                .getPath()
          )
          zipOutputStream.putNextEntry(entry)
          if (!file.isDirectory()) {
            let inputStream = new java.io.FileInputStream(file)
            while ((len = inputStream.read(buffer)) != -1) {
              zipOutputStream.write(buffer, 0, len)
            }
            inputStream.close()
          }
          zipOutputStream.closeEntry()
        }
        zipOutputStream.close()
        resolve(dest)
    })
  }

  static zip(src, destUri, filename) {
    const ContentResolver = Application.android.nativeApp.getContentResolver()
    const parsedUri = new android.net.Uri.parse(destUri)
    const uri = new androidx.documentfile.provider.DocumentFile.fromTreeUri(
      Application.android.context,
      parsedUri
    )
    return new Promise((resolve, reject) => {
      if (uri.exists()) {
        let destFile = uri.createFile('application/zip', filename).getUri()
        const outputStream = ContentResolver.openOutputStream(destFile)
        const zipOutputStream = new java.util.zip.ZipOutputStream(outputStream)
        const sourceFiles = this.getSubFiles(src, 1)
        for (let i = 0; i < sourceFiles.size(); i++) {
          let len
          let buffer = Array.create('byte', 4096)
          let file = sourceFiles.get(i)
          let entry = new java.util.zip.ZipEntry(
            'EnRecipes/' +
              new java.io.File(src)
                .toURI()
                .relativize(file.toURI())
                .getPath()
          )
          zipOutputStream.putNextEntry(entry)
          if (!file.isDirectory()) {
            let inputStream = new java.io.FileInputStream(file)
            while ((len = inputStream.read(buffer)) != -1) {
              zipOutputStream.write(buffer, 0, len)
            }
            inputStream.close()
          }
          zipOutputStream.closeEntry()
        }
        zipOutputStream.close()
        resolve(destFile)
      } else {
        reject('Destination file cannot be created: Path does not exist')
      }
    })
  }
  static unzip(uri, dest) {
    const ContentResolver = Application.android.nativeApp.getContentResolver()
    return new Promise((resolve) => {
      var inputStream
      console.log("_nutriguide_ start unzip", uri)
      if (/^file:\/\//.test(uri)) {
        console.log("_nutriguide_ into")
        const fn = uri.substring(7);
        console.log("_nutriguide_ fn", fn)
        inputStream = new java.io.FileInputStream(fn)
      } else {
        inputStream = ContentResolver.openInputStream(uri)
      }
      const zipInputStream = new java.util.zip.ZipInputStream(inputStream)
      let len, filepath, entry
      while ((entry = zipInputStream.getNextEntry()) != null) {
        filepath = dest + '/' + entry.getName()
        let output = new java.io.File(filepath)
        if (entry.isDirectory()) {
          output.mkdirs()
          continue
        }
        if (!output.getParentFile().exists()) output.getParentFile().mkdirs()
        const outputStream = new java.io.BufferedOutputStream(
          new java.io.FileOutputStream(output)
        )
        let buffer = Array.create('byte', 4096)
        while ((len = zipInputStream.read(buffer)) != -1)
          outputStream.write(buffer, 0, len)
        outputStream.close()
        zipInputStream.closeEntry()
      }
      zipInputStream.close()
      resolve(dest)
    })
  }
}

// ShareOperations

function share(intent, subject) {
  const shareIntent = android.content.Intent.createChooser(intent, subject)
  shareIntent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
  ctx.startActivity(shareIntent)
}
function getSendIntent(type) {
  const intent = new android.content.Intent(android.content.Intent.ACTION_SEND)
  intent.setType(type)
  return intent
}
export function shareText(text, subject) {
  const intent = getSendIntent('text/plain')
  intent.putExtra(android.content.Intent.EXTRA_TEXT, text)
  share(intent, subject)
}
export function shareImage(image, subject, title) {
  const intent = getSendIntent('image/jpeg')
  const baos = new java.io.ByteArrayOutputStream()
  image.android.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, baos)
  const tmpFile = new java.io.File(ctx.getCacheDir(), `${title}.jpg`)
  const fos = new java.io.FileOutputStream(tmpFile)
  fos.write(baos.toByteArray())
  fos.flush()
  fos.close()
  let shareUri = global.androidx.core.content.FileProvider.getUriForFile(
    ctx,
    Application.android.nativeApp.getPackageName() + '.provider',
    tmpFile
  )
  intent.putExtra(android.content.Intent.EXTRA_STREAM, shareUri)
  share(intent, subject)
}

export function keepScreenOn(n: number) {
  const ctx =
    Application.android.foregroundActivity || Application.android.startActivity
  let window = ctx.getWindow()
  let flag = android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
  n ? window.addFlags(flag) : window.clearFlags(flag)
}

interface INotification {
  multi?: boolean
  actions?: number
  bID: string
  cID: string
  nID: number
  cName: string
  description: string
  priority: number
  sound: string
  title: string
  vibrate?: number
}

// TimerNotification
export class TimerNotif {
  static getIcon(ctx, icon) {
    const packageName = ctx.getApplicationInfo().packageName
    let resources = ctx.getResources()
    return (
      resources.getIdentifier(icon, 'drawable', packageName) ||
      ctx.getApplicationInfo().icon
    )
  }
  static clear(nID) {
    const NotifySrv = ctx.getSystemService(
      android.content.Context.NOTIFICATION_SERVICE
    )
    NotifySrv.cancel(nID)
  }
  static getNotification({
    multi,
    actions,
    bID,
    cID,
    cName,
    description,
    priority,
    sound,
    title,
    vibrate,
  }: INotification) {
    let soundUri: any
    if (sound) soundUri = new android.net.Uri.parse(sound)
    const NotifyMgr = android.app.NotificationManager
    const NotifySrv = ctx.getSystemService(
      android.content.Context.NOTIFICATION_SERVICE
    )
    const NotificationCompat = androidx.core.app.NotificationCompat
    const AudioManager = android.media.AudioManager
    if (sdkv >= 26) {
      const importance =
        priority > 0 ? NotifyMgr.IMPORTANCE_HIGH : NotifyMgr.IMPORTANCE_MIN
      const AudioAttributes = android.media.AudioAttributes
      const audioAttributes = new AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_ALARM)
        .build()
      const Channel = new android.app.NotificationChannel(
        cID,
        cName,
        importance
      )
      if (description) Channel.setDescription(description)
      Channel.enableVibration(!!vibrate)
      Channel.enableLights(false)
      if (sound) Channel.setSound(soundUri, audioAttributes)
      else Channel.setSound(null, null)
      Channel.setShowBadge(true)
      Channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      NotifySrv.createNotificationChannel(Channel)
    }

    const Intent = android.content.Intent
    const PendingIntent = android.app.PendingIntent

    const mainInt = new Intent(ctx, com.tns.NativeScriptActivity.class)
    mainInt.putExtra('action', 'timer')
    const mainPInt = PendingIntent.getActivity(
      ctx,
      1,
      mainInt,
      PendingIntent.FLAG_UPDATE_CURRENT
    )

    // ActionIntent
    let actionInt1,
      actionInt2,
      actionInt3,
      actionPInt1,
      actionPInt2,
      actionPInt3
    if (actions) {
      actionInt1 = new Intent(bID)
      actionInt1.putExtra('action', 'delay')
      actionPInt1 = PendingIntent.getBroadcast(
        ctx,
        2,
        actionInt1,
        PendingIntent.FLAG_UPDATE_CURRENT
      )
      actionInt2 = new Intent(bID)
      actionInt2.putExtra('action', 'dismiss')
      actionPInt2 = PendingIntent.getBroadcast(
        ctx,
        3,
        actionInt2,
        PendingIntent.FLAG_UPDATE_CURRENT
      )
      actionInt3 = new Intent(bID)
      actionInt3.putExtra('action', 'dismissAll')
      actionPInt3 = PendingIntent.getBroadcast(
        ctx,
        4,
        actionInt3,
        PendingIntent.FLAG_UPDATE_CURRENT
      )
    }

    // CreateNotification
    let icon = this.getIcon(ctx, 'notify')
    let builder = new NotificationCompat.Builder(ctx, cID)
      .setColor(new Color('#ff5200').android)
      .setContentIntent(mainPInt)
      .setContentTitle(title)
      .setOngoing(true)
      .setPriority(priority)
      .setShowWhen(!!actions)
      .setSmallIcon(icon)
      .setTicker(title)
      .setAutoCancel(false)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
    if (sound) builder.setSound(soundUri, AudioManager.STREAM_ALARM)
    else builder.setSound(null)
    if (description) builder.setContentText(description)
    if (vibrate) builder.setVibrate([500, 1000])
    if (actions) {
      builder.setFullScreenIntent(mainPInt, true)
      if (multi) builder.addAction(null, localize('dismissAll'), actionPInt3)
      else {
        builder.addAction(null, localize('delay'), actionPInt1)
        builder.addAction(null, localize('dismiss'), actionPInt2)
      }
    }
    let notification = builder.build()
    notification.flags =
      NotificationCompat.FLAG_INSISTENT | NotificationCompat.FLAG_ONGOING_EVENT

    return notification
  }
  static show(data: INotification) {
    const NotifySrv = ctx.getSystemService(
      android.content.Context.NOTIFICATION_SERVICE
    )
    NotifySrv.notify(data.nID, this.getNotification(data))
  }
}
export class Printer {
  static PrintHelper = androidx.print.PrintHelper
  static isSupported() {
    return this.PrintHelper.systemSupportsPrint()
  }
  static print(view, fileName) {
    const ctx =
      Application.android.foregroundActivity ||
      Application.android.startActivity
    const PrintAttributes = android.print.PrintAttributes
    const PrintManager = ctx.getSystemService(
      android.content.Context.PRINT_SERVICE
    )
    return new Promise((resolve, reject) => {
      try {
        const PrintAdapter = view.android.createPrintDocumentAdapter(fileName)
        if (PrintManager != null) {
          let attributes = new PrintAttributes.Builder()
            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
            .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
            .setResolution(
              new PrintAttributes.Resolution('pdf', 'pdf', 300, 300)
            )
          PrintManager.print(fileName, PrintAdapter, attributes.build())
          resolve(true)
        }
      } catch (e) {
        reject(e)
      }
    })
  }
}

// GetRingtonesList
export function getTones() {
  const RingtoneManager = android.media.RingtoneManager
  const ringtonesMgr = new RingtoneManager(ctx)
  ringtonesMgr.setType(RingtoneManager.TYPE_ALARM)
  const cursor = ringtonesMgr.getCursor()
  let tones = []
  while (cursor.moveToNext()) {
    tones.push({
      title: cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX),
      uri:
        cursor.getString(RingtoneManager.URI_COLUMN_INDEX) +
        '/' +
        cursor.getString(RingtoneManager.ID_COLUMN_INDEX),
    })
  }

  let defaultToneUri = RingtoneManager.getActualDefaultRingtoneUri(
    ctx,
    RingtoneManager.TYPE_ALARM
  )
  let defaultTone
  if (defaultToneUri) {
    let uriString = defaultToneUri.toString()
    let tonesAvailable = tones.filter((e) => e.uri == uriString)
    let toneExist = tonesAvailable.length
    defaultTone = {
      title: toneExist ? tonesAvailable[0].title : tones[0].title,
      uri: toneExist ? uriString : tones[0].uri,
    }
  }

  return { tones, defaultTone: defaultToneUri ? defaultTone : tones[0] }
}

// WakeLock
export function wakeLock(n): void {
  n ? !wl.isHeld() && wl.acquire() : wl.isHeld() && wl.release()
}

//RandomId
export function getRandomID(n?: number) {
  if (n) return Math.floor(Math.random() * 9000000000) + 1000000000
  else {
    let res = ''
    let chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return res
  }
}

//LocaleHandlers
export function updateLocale() {
  let lang = ApplicationSettings.getString('appLocale', 'none').split('-')
  const l = lang[0]
  const c = lang[1]
  const res = ctx.getResources()
  const config = res.getConfiguration()
  if (l !== 'none') {
    const locale = c ? new java.util.Locale(l, c) : new java.util.Locale(l)
    java.util.Locale.setDefault(locale)
    config.setLocale(locale)
    config.setLayoutDirection(locale)
    ctx.createConfigurationContext(config)
    res.updateConfiguration(config, res.getDisplayMetrics())
    ApplicationSettings.setNumber('RTL', config.getLayoutDirection() | 0)
  } else {
    ApplicationSettings.setNumber('RTL', sysRTL() | 0)
  }
  ApplicationSettings.setString('sysLocale', sysLocale())
}
export function sysRTL() {
  return android.content.res.Resources.getSystem()
    .getConfiguration()
    .getLayoutDirection()
}
export function sysLocale() {
  return android.content.res.Resources.getSystem()
    .getConfiguration()
    .locale.toString()
    .replace('_', '-')
}

// SetBarColors
export function setBarColors(w, dv, t) {
  function setColors(color) {
    w.setStatusBarColor(new Color(color).android)
    sdkv >= 26 && w.setNavigationBarColor(new Color(color).android)
  }
  switch (t) {
    case 'Light':
      setColors('#f1f3f5')
      break
    case 'Dark':
      setColors('#212529')
      break
    default:
      setColors('#000000')
      break
  }
  if (sdkv >= 26)
    dv.setSystemUiVisibility(
      t == 'Light'
        ? View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR |
            View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        : View.SYSTEM_UI_FLAG_DARK_STATUS_BAR |
            View.SYSTEM_UI_FLAG_DARK_NAVIGATION_BAR
    )
  else
    dv.setSystemUiVisibility(
      t == 'Light'
        ? View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        : View.SYSTEM_UI_FLAG_DARK_STATUS_BAR
    )
}
