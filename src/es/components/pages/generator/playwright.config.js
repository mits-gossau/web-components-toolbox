// @ts-check
const { devices } = require('@playwright/test')

const config = {
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:2400',
    headless: true
  },
  projects: [
    {
      name: 'Mobile Android',
      use: {
        ...devices['Pixel 2']
      }
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ],
  snapshotDir: 'snapshots/',
  outputDir: 'tests/'
}

module.exports = config
