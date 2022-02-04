import { Label, ApplicationSettings } from '@nativescript/core'

export class RLabel extends Label {
  public initNativeView(): void {
    super.initNativeView()
    this._setGravity()
  }
  private _setGravity(): void {
    this.nativeViewProtected.setGravity(
      ApplicationSettings.getNumber('RTL', 0) ? 5 : 3
    )
  }
}
