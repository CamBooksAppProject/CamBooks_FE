import { AppRegistry } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';

// Expo 환경에서는 registerRootComponent 사용
if (__DEV__) {
    registerRootComponent(App);
} else {
    // 네이티브 빌드에서는 AppRegistry 사용
    AppRegistry.registerComponent(appName, () => App);
}
