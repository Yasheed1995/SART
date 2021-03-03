var refresh = document.querySelector('#refresh');
var map = document.querySelector('#map');

//新增API
refresh.addEventListener('click', function (e) {
    e.preventDefault();

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/map'); // 新增資料API
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xhr.send('hi i want data');


    //AJAX回傳後的結果
    xhr.onload = function () {
        var originData = JSON.parse(xhr.responseText);
        console.log(originData);

        //重載todoList
        reloadMap(originData);
    }
})

//Reload todoList
function reloadMap(originData) {

    if (originData.success === false) {
        alert(originData.message);
        return;
    }
/*
    var data = originData.result;
    var str = '';
    for (item in data) {
        str += '<li>' + data[item].content + '<input type="button" data-id="' + item + '" name="" value="刪除">' + '</li>'
    }

    list.innerHTML = str;
*/
}
