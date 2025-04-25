import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Asset } from "expo-asset";

import Animated, { FadeIn } from "react-native-reanimated";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  ToastAndroid,
  ScrollView,
  RefreshControl,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  initNotificationHandler,
  scheduleMorningQuote,
} from "../utils/scheduleNotification";

export function HomeScreen({ navigation }) {
  // Destructure from Constants.expoConfig.extra
  const { zenApiUrl, pexelsApiUrl, pexelsApiKey } = Constants.expoConfig.extra;

  const [quote, setQuote] = useState(null);
  const [bgImg, setbgImg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
    // console.log("fetch quote triggered");
    initNotificationHandler();
    // console.log("init notification handler triggered");

    Toast.show({
      type: "info",
      text1: "Pull down to refresh!",
      position: "bottom",
    });
  }, []);

  const fetchQuote = async (forceRefresh = false) => {
    try {
      setLoading(true);

      const today = new Date().toDateString();

      if (!forceRefresh) {
        const savedData = await AsyncStorage.getItem("dailyQuote");
        if (savedData) {
          const { quote: savedQuote, date } = JSON.parse(savedData);
          if (date === today) {
            setQuote(savedQuote);
            fetchBackground();
            return;
          }
        }
      }

      const response = await fetch(zenApiUrl);
      const data = await response.json();

      const start = new Date(new Date().getFullYear(), 0, 0);
      const diff = new Date() - start;
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

      const newQuote = data[dayOfYear % data.length];
      setQuote(newQuote);

      //   await scheduleMorningQuote(newQuote.q);
      if (newQuote?.q) await scheduleMorningQuote(newQuote.q);

      await AsyncStorage.setItem(
        "dailyQuote",
        JSON.stringify({ quote: newQuote, date: today })
      );

      await fetchBackground();
    } catch (error) {
      setQuote({ q: "Failed to fetch quote. Try again.", a: "System" });
      console.log("Error fetching quote:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackground = async () => {
    try {
      const res = await fetch(
        pexelsApiUrl,

        {
          headers: {
            Authorization: pexelsApiKey,
          },
        }
      );
      const data = await res.json();
      const photos = data.photos;

      if (photos && photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * photos.length);
        setbgImg(photos[randomIndex].src.portrait);
      }
    } catch (error) {
      console.log("error fetching photo from api", error);
    }
  };

  const handleRefresh = () => {
    console.log("refresh triggered");
    fetchQuote(true);
  };

  const handleAddToFavorites = async () => {
    try {
      const existing = await AsyncStorage.getItem("favorites");
      const favs = existing ? JSON.parse(existing) : [];

      const alreadySaved = favs.some(
        (item) => item.q === quote.q && item.a === quote.a
      );
      if (!alreadySaved) {
        const updated = [...favs, quote];
        await AsyncStorage.setItem("favorites", JSON.stringify(updated));
        Toast.show({
          type: "info",
          text1: "Added to favorites!",
          position: "bottom",
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Already in favorites!",
          position: "bottom",
        });
      }
    } catch (error) {
      console.log("Error adding to favorites", error);
    }
    console.log("Add to favorites triggered");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.backgroundImage}
        resizeMode="cover"
        // source={{ uri: bgImg }}
        source={{
          uri: bgImg || Asset.fromModule(require("../assets/bg.jpg")).uri,
        }}
      >
        <View style={styles.overlay}>
          <Text style={styles.heading}>zen quotes</Text>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
            }
          >
            <Animated.View
              entering={FadeIn.duration(1000)}
              style={[
                styles.quoteItem,
                loading ? styles.loadingStyle : styles.loadedStyle,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#6C63FF" />
              ) : (
                quote && (
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ justifyContent: "center" }}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.quoteText}>
                      "{quote.q}" {"\n\n"}— {quote.a}
                    </Text>
                  </ScrollView>
                )
              )}
            </Animated.View>
          </ScrollView>

          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.favBtn}
              onPress={handleAddToFavorites}
            >
              <Text style={styles.favBtnText}>♡</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("FavScreen")}
              style={styles.bottomFavBtn}
            >
              <Text style={styles.bottomFavBtnText}> Saved Zen Quotes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
    // alignItems: "center",

    backgroundColor: "#1c2833",
    justifyContent: "center",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    // paddingHorizontal: 20,
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // dim background
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    marginTop: "10%",
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily:
      Platform.OS === "android" ? "sans-serif-light" : "Times New Roman",
    textAlign: "center",
  },
  quoteItem: {
    marginTop: "10%",
    padding: 10,
    borderRadius: 10,
    borderBottomWidth: 5,
    borderBottomColor: "#fff",
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    minWidth: "320",
  },
  quoteText: {
    fontSize: 14,
    color: "#ffffff",
    flexShrink: 1,
    textAlign: "right",
    fontFamily:
      Platform.OS === "android" ? "sans-serif-light" : "Times New Roman",
  },
  loadingStyle: {
    backgroundColor: "#1E1E1E",
    height: 80,
    width: "100%",
    minHeight: 100,
    minWidth: "95%",
  },

  loadedStyle: {
    backgroundColor: "#1E1E1E",
    marginTop: "10%",
    padding: 20,
    borderRadius: 10,
    borderBottomWidth: 5,
    borderBottomColor: "#fff",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  btnContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  favBtn: {
    backgroundColor: "rgba(0, 0, 0,0.5)", // dim background
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 50,
  },
  favBtnText: {
    color: "#fff",
    fontSize: 38,
  },
  bottomFavBtnText: {
    color: "#fff",
    fontSize: 18,
  },
  bottomFavBtn: {
    marginTop: 10,
    backgroundColor: "rgba(0, 0, 0,0.5)", // dim background
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});
