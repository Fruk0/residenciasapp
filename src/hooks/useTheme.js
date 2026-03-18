import { useThemeContext } from '../context/ThemeContext'

export function useTheme() {
  const { isDark, toggle, meta, setMeta } = useThemeContext()
  const d = {
    bg:          isDark ? '#16161a' : '#fafaf8',
    card:        isDark ? '#1f1f26' : '#ffffff',
    card2:       isDark ? '#252530' : '#f0f0ee',
    border:      isDark ? '#2d2d35' : '#e8e8e8',
    border2:     isDark ? '#2d2d35' : '#d8d8d8',
    text1:       isDark ? '#f0f0f0' : '#111111',
    text2:       isDark ? '#a0a0b0' : '#555555',
    text3:       isDark ? '#6a6a7a' : '#999999',
    btnBg:       isDark ? '#f0f0f0' : '#2c2c2c',
    btnText:     isDark ? '#111111' : '#ffffff',
    btnSubText:  isDark ? '#6a6a7a' : '#888888',
    track:       isDark ? '#2d2d35' : '#e8e8e8',
    input:       isDark ? '#1f1f26' : '#ffffff',
    inputBorder: isDark ? '#2d2d35' : '#d8d8d8',
  }
  return { isDark, toggle, d, meta, setMeta }
}