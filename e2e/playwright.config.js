// @ts-check
const { devices } = require('@playwright/test')

const config = {
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:2200',
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
  snapshotDir: '../../../../../e2e/',
  outputDir: '../../../../../e2e/tests/'
}

module.exports = config