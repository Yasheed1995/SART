const bigText = document.getElementbyId("bigText")
const dbRef = firebase.database().ref().child("bigText")
dbRef.on("value", snap => bigText.innerText = snap.val())
