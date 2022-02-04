import { Property, GridLayout } from '@nativescript/core/ui'

class Common extends GridLayout {
  public rtl: boolean
}
const RTLProperty = new Property({
  name: 'rtl',
  defaultValue: false,
  valueConverter(v): boolean {
    return !!v
  },
})
RTLProperty.register(Common)

export class RGridLayout extends Common {
  public initNativeView(): void {
    super.initNativeView()
    this._updateDirection()
  }
  [RTLProperty.setNative](rtl: boolean): void {
    this.rtl = rtl
    this._updateDirection()
  }
  public addChild(view): void {
    super.addChild(view)
    if (view.nativeViewProtected) {
      this._updateDirection()
    }
  }
  public removeChild(view): void {
    super.removeChild(view)
    if (view.nativeViewProtected) {
      this._updateDirection()
    }
  }
  private _updateDirection(): void {
    let v = this
    setTimeout(() => {
      let pr = /(^|\s)rtl($|\s)/.test(v.className)
      v.nativeViewProtected.setRotationY(v.rtl ? (pr ? 0 : 180) : 0)
      for (let i = 0; i < v.getChildrenCount(); i++) {
        let c = v.getChildAt(i).className
        let r = /(^|\s)rtl($|\s)/.test(c)
        let a = /(^|\s)a($|\s)/.test(c)
        if (!v.rtl) r = !r
        if (/(^|\s)a($|\s)/.test(c))
          v.getChildAt(i).horizontalAlignment = a ? 'left' : 'right'
        v.getChildAt(i).nativeView &&
          v.getChildAt(i).nativeView.setRotationY(v.rtl ? (r ? 0 : 180) : 0)
      }
    }, 1)
  }
}
