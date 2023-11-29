import addLocationToFirestore from "./model/addLocationToFirestore.js";

export default function DBSaveFunction(){
  const db = firebase.firestore();
  
  areaArr.forEach((location) => {
    db.collection("store")
      .doc(location.location)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          addLocationToFirestore(location);
        }
      })
      .catch((error) => {
        console.error("Error checking document: ", error);
      });
  });
}