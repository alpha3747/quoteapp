import React from "react";
import { HomeScreen } from "../components/homeScreen";
import { FavScreen } from "../components/favScreen";
import { createStackNavigator } from "@react-navigation/stack";
// import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { initNotificationHandler } from "../utils/scheduleNotification";

initNotificationHandler();

const App = () => {
  const Stack = createStackNavigator();
  return (
    <>
      {/* <NavigationContainer> */}
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FavScreen" component={FavScreen} />
      </Stack.Navigator>
      <Toast />
      {/* </NavigationContainer> */}
    </>
  );
};

export default App;
