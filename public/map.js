import areaContent from "./reviewPage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxyxuRlvxV3KsA4KErPwlZCPhbsHDN-IU",
  authDomain: "ramen-log.firebaseapp.com",
  projectId: "ramen-log",
  storageBucket: "ramen-log.appspot.com",
  messagingSenderId: "292296321273",
  appId: "1:292296321273:web:bacc165856b927edff5a28",
  measurementId: "G-LZHR47DK5H",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // 이미 초기화된 앱을 가져옴
}

const db = firebase.firestore();

function addLocationToFirestore(locationObj) {
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

let areaArr = [
  {location: "멘야이토", lat: 36.35026761782584, lng: 127.37714510689068},
  {location: "멘야산다이메", lat: 36.352281017969304, lng: 127.3773707115313},
];

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

var mapOptions = {
  center: new naver.maps.LatLng(36.350411, 127.384547),
  zoom: 12,
};

var map = new naver.maps.Map("map", mapOptions);
let markers = [];
let areaInfoWindows = [];

naver.maps.Event.addListener(map, "click", function () {
  closeAllInfoWindows();
});

function closeAllInfoWindows() {
  areaInfoWindows.forEach((infoWindow) => {
    infoWindow.close();
  });
}

areaArr.forEach((location, index) => {
  var marker = new naver.maps.Marker({
    map: map,
    position: new naver.maps.LatLng(location.lat, location.lng),
    title: location.location,
  });

  var infoWindow = new naver.maps.InfoWindow();
  areaInfoWindows.push(infoWindow);

  marker.addListener("click", async function () {
    const infoWindow = areaInfoWindows[index];
    if (infoWindow.getMap()) {
      infoWindow.close();
    } else {
      const content = areaContent(location.location);
      infoWindow.setContent(content);

      const reviewData = await getReviewsForStore(location.location);
      if (reviewData) {
        const reviewsElement = document.createElement("div");
        reviewsElement.innerHTML = "<h3>리뷰 목록</h3>";
        for (const uid in reviewData) {
          const review = reviewData[uid];
          reviewsElement.innerHTML += `<p>${uid}의 리뷰: ${review.평가}</p>`;
        }
        infoWindow.setContent(content + reviewsElement.outerHTML);
      }

      infoWindow.open(map, marker);
      const submitButton = infoWindow.getContentElement().querySelector("#submitButton");
      if (submitButton) {
        submitButton.addEventListener("click", () => {
          const currentUser = firebase.auth().currentUser;
          if (currentUser) {
            const selectedLocation = location.location;

            const select1 = document.querySelector("#select1");
            const select2 = document.querySelector("#select2");
            const select3 = document.querySelector("#select3");
            const congauge = document.querySelector("#congauge");
            const saltgauge = document.querySelector("#saltgauge");
            const textArea = document.querySelector("#textArea");

            const reviewData = {
              면굵기: select1.value,
              익힘정도: select2.value,
              스프베이스: select3.value,
              농도: congauge.value,
              염도: saltgauge.value,
              평가: textArea.value,
            };
            const reviewerId = firebase.auth().currentUser.uid;
            addReviewToFirestore(selectedLocation, reviewData, reviewerId);
            alert("리뷰가 작성되었습니다.");
          } else {
            alert("로그인 해주세요.");
          }
        });
      } else {
        console.error("submitButton 없음");
      }
    }
  });

  markers.push(marker);
});

function addReviewToFirestore(location, reviewData, reviewerId) {
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

async function getReviewsForStore(storeName) {
  const docRef = db.collection("store").doc(storeName);
  const doc = await docRef.get();

  if (doc.exists) {
    return doc.data(); // 해당 가게의 리뷰 데이터 반환
  } else {
    console.log("No such document!");
    return null;
  }
}
