// @ts-expect-error
import { minify } from 'html-minifier-terser'
// @ts-expect-error
import { cp, readFile, writeFile } from 'node:fs/promises'
// @ts-expect-error
import { resolve } from 'node:path'

await main()

async function main() {
  const outputDir = './dist'

  await minifyHtmlFiles(`${outputDir}/index.html`)

  await cp(resolve('web-root/public'), resolve(`${outputDir}/public`), { recursive: true })
}

async function minifyHtmlFiles(filePath: string) {
  let htmlContent = await readFile(filePath, 'utf-8')
  // eslint-disable-next-line
  htmlContent = await minify(htmlContent, {
    removeComments: true,
    preserveLineBreaks: false,
    collapseWhitespace: true
  })
  await writeFile(filePath, htmlContent)
}
