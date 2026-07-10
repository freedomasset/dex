/**
 * 将 zh-cn-translations.json 中的译文写入 src/locales/zh-CN.po（仅填充空的 msgstr）
 * 运行：node scripts/fill-zh-cn-po.mjs && yarn i18n:compile
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PO from 'pofile'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const poPath = path.join(root, 'src/locales/zh-CN.po')
const dictPath = path.join(__dirname, 'zh-cn-translations.json')

const zh = JSON.parse(fs.readFileSync(dictPath, 'utf8'))
const catalog = PO.parse(fs.readFileSync(poPath, 'utf8'))
let filled = 0
let stillMissing = 0

for (const item of catalog.items) {
  if (!item.msgid) continue
  const cur = item.msgstr[0]
  if (cur && cur.length > 0) continue
  const t = zh[item.msgid]
  if (t) {
    item.msgstr[0] = t
    filled++
  } else {
    stillMissing++
    console.warn('No translation for:', item.msgid.slice(0, 80))
  }
}

fs.writeFileSync(poPath, catalog.toString())
console.log('Filled', filled, 'entries; still missing', stillMissing)
