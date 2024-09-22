const { GOOGLE_SERVICES_JSON } = process.env

const config = {
  name: 'Yamaichi-J',
  slug: 'order-taking-system',
  version: '1.2.6',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  owner: 'if-tech',
  runtimeVersion: {
    policy: 'appVersion'
  },
  updates: {
    url: 'https://u.expo.dev/bba1d625-cc8a-4dc3-aed6-117f9f0bda6f'
  },
  ios: {
    buildNumber: '1.2.6',
    supportsTablet: true,
    // bundleIdentifier: 'com.iftech.order' // ifの組織用
    bundleIdentifier: 'com.yamaichi.order' // yamaichiの組織用
  },
  android: {
    versionCode: 9,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptiveIcon.png',
      backgroundColor: '#ffffff'
    },
    googleServicesFile: GOOGLE_SERVICES_JSON,
    // package: 'com.iftech.order', // ifの組織用
    package: 'com.yamaichi.order', // yamaichiの組織用

    // http許可　意味ない？
    config: {
      networkSecurityConfig: {
        'domain-config': {
          domain: [
            {
              subdomains: true,
              domain: 'localhost'
            },
            {
              subdomains: true,
              domain: '10.0.2.2'
            }
          ],
          'base-config': {
            cleartextTrafficPermitted: true
          }
        }
      }
    }
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png'
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#ffffff',
        defaultChannel: 'default',
        sounds: ['./assets/notification.wav']
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: 'bba1d625-cc8a-4dc3-aed6-117f9f0bda6f'
    }
  }
}

export default config
