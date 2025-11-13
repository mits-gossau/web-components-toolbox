# BackendForFrontend

> Checkout Reminder

- [JIRA](https://jira.migros.net/browse/MIDUWEB-2137)
- [JIRA](https://jira.migros.net/browse/MIDUWEB-2161)
- [Example Page](./default-/default-.html)
- [Demo Page](https://mits-gossau.github.io/web-components-toolbox-klubschule/src/es/components/web-components-toolbox/docs/TemplateMiduweb.html?rootFolder=src&css=./src/css/variablesCustomKlubschule.css&login=./src/es/components/molecules/login/default-/default-.html&logo=./src/es/components/atoms/logo/default-/default-.html&nav=./src/es/components/web-components-toolbox/src/es/components/molecules/multiLevelNavigation/default-/default-.html&footer=./src/es/components/organisms/footer/default-/default-.html&content=./src/es/components/web-components-toolbox/src/es/components/msrc/backendForFrontend/default-/default-.html)

## CMS Integration
```
<msrc-backend-for-frontend
  mcs-api-url="string"
  endpoint-get-user="string"
  endpoint-is-logged-in="string"
  login-event="string"
  logout-event="string"
  auto-login-event="string"
></msrc-backend-for-frontend>
```
at any place within the body. Preferably at start of the ```<body>``` node

### Variations (check out example Checkout- and Any- page above):
- *mcs-api-url*: [Documentation](https://wiki.migros.net/spaces/MDCF/pages/790958744/Digital+Campaign+Factory+mit+Backend+for+Frontend+BFF#DigitalCampaignFactorymitBackendforFrontend(BFF)-FrontendConfiguration). Example Value: ```mcs-api-url="https://mypage.migros.ch/proxy/mdcf"```
- *endpoint-get-user*: The Api endpoint of get user. Example Value: ```endpoint-get-user="https://int.klubschule.ch/umbraco/api/DigitalCampaignFactory/GetUser"```
- *endpoint-is-logged-in*: The Api endpoint of is logged in. Example Value: ```endpoint-is-logged-in="https://int.klubschule.ch/umbraco/api/DigitalCampaignFactory/IsLoggedIn"```
- (optional) *login-event*: The login action function. Example Value: ```login-event="() => self.open('https://migros.account.ch/login"```
- (optional) *logout-event*: The logout action function. Example Value: ```logout-event="() => self.open('https://migros.account.ch/logout"```
- (optional) *auto-login-event*: The auto-login action function. Example Value: ```auto-login-event="() => self.open('https://migros.account.ch/auto-login"```
