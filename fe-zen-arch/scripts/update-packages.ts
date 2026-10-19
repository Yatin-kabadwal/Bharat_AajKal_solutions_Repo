// @ts-expect-error
import { execSync } from 'child_process'
// @ts-expect-error
import { setTimeout } from 'timers/promises'

// Add packages to ignore from auto updates
const ignoreUpdates = new Set(['tailwindcss-patch', 'tailwindcss'])

// Update to latest package only after below days of release
const updateAfterDays = 5

interface OutdatedPackage {
  current: string
  wanted: string
  latest: string
  dependencyType: 'dependencies' | 'devDependencies'
}

type PackageName = string
type OutdatedData = Record<PackageName, OutdatedPackage>

interface NpmRegistryResponse {
  time: Record<string, string>
}

async function getPackageReleaseDate(packageName: string, version: string): Promise<Date | null> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`)
  const data: NpmRegistryResponse = await response.json()
  const releaseDate = data.time[version]
  return releaseDate ? new Date(releaseDate) : null
}

function getOutdatedPackages(): OutdatedData {
  try {
    const output = execSync('pnpm outdated --recursive --format json', { encoding: 'utf8' })
    return JSON.parse(output) as OutdatedData
  } catch (error: any) {
    if (error.stdout) return JSON.parse(error.stdout) as OutdatedData
    throw error
  }
}

async function main() {
  const outdatedData = getOutdatedPackages()
  const packagesToUpdate: { name: string; version: string }[] = []
  const updateAfterDate = new Date(Date.now() - updateAfterDays * 24 * 60 * 60 * 1000)
  console.log(`Will Update package released after ${updateAfterDate.toISOString()}`)

  for (const packageName in outdatedData) {
    if (ignoreUpdates.has(packageName)) continue

    const packageInfo = outdatedData[packageName]
    const releaseDate = await getPackageReleaseDate(packageName, packageInfo.latest)
    if (releaseDate == null) {
      console.error('unable to get release date for package', packageName)
    }

    const releaseDateFormatted = releaseDate!.toISOString().split('T')[0]
    if (releaseDate && releaseDate < updateAfterDate) {
      packagesToUpdate.push({ name: packageName, version: packageInfo.latest })
      console.log(`${packageName}: ${packageInfo.current} -> ${packageInfo.latest} (released: ${releaseDateFormatted})`)
    } else {
      console.log(
        `ignoring package:${packageName} (current: ${packageInfo.current}, released: ${packageInfo.latest} on ${releaseDateFormatted})`
      )
    }

    await setTimeout(500) // Add delay to be respectful to npm API
  }

  console.log(`\nUpdating ${packagesToUpdate.length} packages...`)
  console.log(`Ignoring ${Object.keys(outdatedData).length - packagesToUpdate.length - ignoreUpdates.size} packages...`)
  if (packagesToUpdate.length > 0) {
    const updateList = packagesToUpdate.map((p) => `${p.name}@${p.version}`).join(' ')
    console.log(`Updating packages: ${updateList}`)
    execSync(`pnpm update --recursive ${updateList}`, { stdio: 'inherit' })
  } else {
    console.log('No packages to update')
  }
}

main().catch(console.error)
