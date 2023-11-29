
export default function addReviewToFirestore(location, reviewData, reviewerId) {
  const docRef = db.collection("store").doc(location);
  docRef
    .set({[reviewerId]: reviewData}, {merge: true}) // 새로운 문서를 생성하고 리뷰 데이터를 추가 또는 업데이트
    .then(() => {
      console.log("Review added to Firestore for: ", location);
    })
    .catch((error) => {
      console.error("Error adding review to document: ", error);
    });
}