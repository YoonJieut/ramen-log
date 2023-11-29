export default function addLocationToFirestore(locationObj) {
  db.collection("store")
    .doc(locationObj.location)
    .set({})
    .then(() => {
      console.log("Document written with ID: ", locationObj.location);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}