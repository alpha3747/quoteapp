import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export function FavScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const getFavorites = async () => {
      const stored = await AsyncStorage.getItem("favorites");
      if (stored) {
        setFavorites(JSON.parse(stored).reverse());
      }
    };
    getFavorites();
  }, []);

  const handleDelete = async (index) => {
    const updatedFavorites = [...favorites];
    updatedFavorites.splice(index, 1);

    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
    Toast.show({
      type: "info",
      text1: "Quote Deleted!",
      position: "bottom",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtnContainer}
      >
        <Text style={styles.backBtn}>← Go Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Your Favorite Quotes</Text>

      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No favorites added yet.</Text>
      ) : (
        favorites.map((item, index) => (
          <View key={index} style={styles.quoteBox}>
            <Text style={styles.quote}>"{item.q}"</Text>
            <Text style={styles.author}>— {item.a}</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(index)}
            >
              <Text style={styles.deleteBtnText}>Delete Quote</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#111" },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  backBtnContainer: {
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0,0.5)", // dim background
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  backBtn: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quoteBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  quote: { fontSize: 16, color: "#fff", marginBottom: 5 },
  author: {
    color: "#aaa",
    textAlign: "right",
    fontStyle: "italic",
  },
  deleteBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(128, 0, 0, 0.85)", // Soft Burgundy Red
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyText: { color: "#ccc", textAlign: "center", marginTop: 50 },
});
