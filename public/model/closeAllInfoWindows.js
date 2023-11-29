export default function closeAllInfoWindows() {
  areaInfoWindows.forEach((infoWindow) => {
    infoWindow.close();
  });
}