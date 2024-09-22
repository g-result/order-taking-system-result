import { extendTheme } from 'native-base'

/**
 * NativeBase theme customizationの参考リンク
 * https://docs.nativebase.io/customizing-theme
 * */

const newColorTheme = {
  brand: {
    // 900: '#8287af',
    // 800: '#7c83db',
    // 700: '#b3bef6'
  }
}
export const theme = extendTheme({ colors: newColorTheme })
