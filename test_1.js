var a = "92.840";
var b = "2192.80";

"2192.8"
  "92.84"
----------

// 10:30am

function sum (a, b) { //a = "92.840" //b = "2192.80"
    a = a.split(''); // ["9","2",".","8","4","0"];
    b = b.split(''); // ["2","1","9","2",".", "8","0"];
    // el que sea mas largo
    var el_que_sea_mas_largo = Math.max(a.length, b.length); // 7
    console.log('el_que_sea_mas_largo:', el_que_sea_mas_largo);
    for (var i = (el_que_sea_mas_largo - 1); i > 0; i--) { //i = 6
        // return suma ⚡️
    }
};