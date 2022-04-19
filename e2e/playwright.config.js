// @ts-check
const { devices } = require('@playwright/test')

const config = {
   timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:4200',
    actionTimeout: 0,
    headless: true
  },
  projects: [
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12']
      }
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ],
  outputDir: '../../../../../test/'
}

module.exports = config
