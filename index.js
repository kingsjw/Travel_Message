var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var jsxml = require("node-jsxml");


var Namespace = jsxml.Namespace,
  QName = jsxml.QName,
  XML = jsxml.XML,
  XMLList = jsxml.XMLList;


var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

app.get("/", function (req, res){
  res.send("Deployed!");
});


app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not ma tch.");
    res.sendStatus(403);
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  if (data.object === 'page') {

    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if(event.postback){
          receivedPostback(event);
        }
        else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    res.sendStatus(200);
  }
});



/*
전역변수임
*/

var data_title = new Array();
var data_arr = new Array();
var data_img_link = new Array();
var data_count = 0;
var data_check = 0; // 관광인지 음식인지

/*-----------------*/



function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;


  if (messageText) {
    if(messageText.indexOf('뭘') != -1 || messageText.indexOf('뭐') != -1 || messageText.indexOf('어떻게') != -1){
    sendTextMessage(senderID, "이 앱은 위치에 따라 음식점이나 관광지를 알려주는 챗봇이에요!");
    setTimeout(function(){sendCategory2(senderID);},1500);
    }
  else if(messageText.indexOf('안녕') != -1 || messageText.indexOf('하이') != -1|| messageText.indexOf('ㅎㅇ') != -1){
    sendTextMessage(senderID, "안녕하세요! 만나서 반갑습니다!");
      setTimeout(function(){sendCategory2(senderID);},1500);
  }
  else if(messageText.indexOf('음식') != -1 || messageText.indexOf('먹을') != -1 || messageText.indexOf('맛집') != -1){
    data_check = 1;
    sendCategory(senderID);
  }
  else if(messageText.indexOf('관광') != -1 || messageText.indexOf('명소') != -1 || messageText.indexOf('놀러') != -1){
    data_check = 2;
    sendCategory(senderID);
  }
  else{
      sendTextMessage(senderID, "무슨 말씀을 하시는건지 모르겠어요 ㅠㅠ ");
      setTimeout(function(){sendCategory2(senderID);},1500);
  }
    // switch (messageText) {
    //
    //   case '안녕':
    //     sendTextMessage(senderID, "안녕하세요 만나서 반갑습니다!");
    //     break;
    //
    //     case '이게 뭐야?':
    //     sendTextMessage(senderID,"이 앱은 위치를 전송하면 근처 관광지 & 음식점 을 알려주는 앱입니다.");
    //     delayText(senderID,"본 앱은 위치정보를 사용하기떄문에, GPS를 켜주세요",2000);
    //     break;
    //     case '무슨 건지 알려줘':
    //     sendTextMessage(senderID,"이 앱은 위치를 전송하면 근처 관광지 & 음식점 을 알려주는 앱입니다.");
    //     delayText(senderID,"본 앱은 위치정보를 사용하기떄문에, GPS를 켜주세요",2000);
    //     break;
    //     case '이게 뭐야?':
    //     sendTextMessage(senderID,"이 앱은 위치를 전송하면 근처 관광지 & 음식점 을 알려주는 앱입니다.");
    //     delayText(senderID,"본 앱은 위치정보를 사용하기떄문에, GPS를 켜주세요",2000);
    //     break;
    //
    //     case '관광정보 알려줘':
    //     sendCategory(senderID);
    //     break;
    //     case '관광':
    //     sendCategory(senderID);
    //     break;
    //     case '근처 관광지 알려줘':
    //     sendCategory(senderID);
    //     break;
    //     case '관광지':
    //     sendCategory(senderID);
    //     break;
    //   default:
    //     sendTextMessage(senderID, "뭐라고?");
    //     break;
    // }



  } else if (messageAttachments) {
      if(messageAttachments[0].payload.coordinates)
      {
              var  lat = messageAttachments[0].payload.coordinates.lat;
              var  long = messageAttachments[0].payload.coordinates.long;
          var msg = lat +" & "+long;
           //sendTextMessage(senderID, msg);
           sendlocation(lat,long,senderID);

     }
  else{
    sendTextMessage(senderID, "??");

    }







  }
}


function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload = event.postback.payload;


  if(payload){
    switch(payload){

      case "Get Started":
        sendTextMessage(senderID, "이봐 자네");
        delayText(senderID, "(콜록)", 1000);
        delayText(senderID, "만나서 반가워", 2500);
        delayText(senderID, "난 벤자민이라고 해", 3500)
        delayText(senderID, "편하게 자민이라고 불러", 4500)
        delayText(senderID, "힘들 때마다 나한테 찾아오면 힘을 줄게", 6000)
        delayText(senderID, "요즘 기분은 어때?", 7000)
        break;
      default:
        break;
    }
  }
}

function delayText(senderID, say, time){
  setTimeout(function() {sendTextMessage(senderID, say);}, time);
}

// 관광 & 음식
function sendCategory2(recipientId){
    var messageData = {
      recipient: {
        id: recipientId
      },
      message:{
        text:"하단의 음식점이나 관광지를 눌러, 자신 근처의 있는 장소들을 찾아보세요!",
        quick_replies:[

            {
              content_type:"text",
              title:"음식",
              payload:"morning",
              image_url:"https://saup19.github.io/food2.png"
            },
            {
              content_type:"text",
              title:"관광",
              payload:"morning",
              image_url:"https://saup19.github.io/marker.png"
            }

        ]
      }
    };
    sendTypingOn(recipientId);
    callSendAPI(messageData);
}


// 일반 위치 전송
function sendCategory(recipientId){
    var messageData = {
      recipient: {
        id: recipientId
      },
      message:{
        text:"위치를 보내주세요",
        quick_replies:[
          {
            content_type:"location",

            image_url:"http://emojipedia-us.s3.amazonaws.com/cache/7f/f8/7ff8f47f222447a9616ab1c7028cc3b5.png"
          }
        ]
      }
    };
    sendTypingOn(recipientId);
    callSendAPI(messageData);
}



function sendlocation(posX,posY,recipientId){

  var url = 'http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=umfGiqjtzOMarryKchlVrnqw7%2BGPqeV1bDPWigHtwAFpAB8d5lfQ8TXoBvRDCRecXTrmkbz24APGWQR0kPY3Ow%3D%3D'; /* Service Key*/
  queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('SERVICE_KEY'); /* 서비스인증 */
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('30'); /* 한페이지결과수 */
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 현재페이지번호 */
  queryParams += '&' + encodeURIComponent('MobileOS') + '=' + encodeURIComponent('ETC'); /* IOS(아이폰),AND(안드로이드),WIN(원도우폰),ETC */
  queryParams += '&' + encodeURIComponent('MobileApp') + '=' + encodeURIComponent('AppTest'); /* 서비스명=어플명 */
  queryParams += '&' + encodeURIComponent('arrange') + '=' + encodeURIComponent('A'); /* (A=제목순,B=조회순,C=수정일순,D=생성일순) 대표이미지 정렬 추가(O=제목순,P=조회순,Q=수정일순,R=생성일순) */
  queryParams += '&' + encodeURIComponent('contenTypeId') + '=' + encodeURIComponent('12'); /* 관광타입(관광지,숙박등) ID */
  queryParams += '&' + encodeURIComponent('mapX') + '=' + encodeURIComponent(posY); /*126.9936233190 GPS X좌표(WGS84 경도좌표) */
  queryParams += '&' + encodeURIComponent('mapY') + '=' + encodeURIComponent(posX); /* 37.534712GPS Y좌표(WGS84 경도좌표) */
  queryParams += '&' + encodeURIComponent('radius') + '=' + encodeURIComponent('500'); /* 거리반경(단위m),Max값 20000m=20Km */
  queryParams += '&' + encodeURIComponent('listYN') + '=' + encodeURIComponent('Y'); /* 목록구분(Y=목록,N=개수) */

  request({
      url: url + queryParams,
      method: 'GET'
  }, function (error, response, body) {
      //console.log('Status', response.statusCode);
      //console.log('Headers', JSON.stringify(response.headers));
      //  var a = JSON.stringify(response.body.items.item);
        //console.log(a);
  var xml = new XML(body);
      var body1 = xml.child('body');
      var items = body1.child('items');
      var item = items.child('item');
var count = body1.child('totalCount').toString();
//sendTextMessage(recipientId, count);
    item.each(function(msg, index){
    //item is an XML
    var name = msg.child('title').toString();
    var addr = msg.child('addr1').toString();
    var img = msg.child('firstimage').toString();
    var list = msg.child('cat1').toString();
    if(data_check==1&&list=="A05"){
      data_count++;
    data_title.push(name);
    data_arr.push(addr);
    data_img_link.push(img);
    }
    if(data_check==2&&list=="A01"||data_check==2&&list=="A02"){
        data_count++;
    data_title.push(name);
    data_arr.push(addr);
    data_img_link.push(img);
    }
    //sendImage(recipientId,a);
  //  sendTextMessage(recipientId,b);

  });
  //sendTextMessage(recipientId,data_title.length);
  if(data_title.length!=0){cate(recipientId);}
else{
  if(data_check==1)sendTextMessage(recipientId,"주변에 음식점이 없습니다");
  if(data_check==2)sendTextMessage(recipientId,"주변에 관광지가 없습니다");
        //sendTextMessage(recipientId ,msg);
      }

    });

  }


function sendImage(recipientId, image){

  var messageData = {
    recipient:{
      id:recipientId
    },
    message:{
      attachment:{
        type:"image",
        payload:{
          url:image
        }
      }
    }
  };
  sendTypingOn(recipientId);
  callSendAPI(messageData);
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  sendTypingOn(recipientId);
  setTimeout(function() {callSendAPI(messageData)}, 400)
  sendTypingOff(recipientId);

}

function sendTypingOn(recipientId) {

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

function sendTypingOff(recipientId) {

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  setTimeout(function() {callSendAPI(messageData)}, 400)
}

function cate(recipientId) {
  var object_title = "";
var k = data_title.length;
sendTextMessage(recipientId,"검색된 결과는 "+data_count+" 장소 입니다");
if(k>10){k=10;}

if(k==1){
var object_title = '{"title":"'+data_title[0]+'","image_url":"'+data_img_link[0]+'","subtitle":"'+data_arr[0]+'"}';
}
if(k==2){
   object_title += '{"title":"'+data_title[0]+'","image_url":"'+data_img_link[0]+'","subtitle":"'+data_arr[0]+'"},';
   object_title = '{"title":"'+data_title[1]+'","image_url":"'+data_img_link[1]+'","subtitle":"'+data_arr[1]+'"}';
}
else{
for(var i = 0;i<k-2;i++){
   object_title += '{"title":"'+data_title[i]+'","image_url":"'+data_img_link[i]+'","subtitle":"'+data_arr[i]+'"},';
}
object_title += '{"title":"'+data_title[k-1]+'","image_url":"'+data_img_link[k-1]+'","subtitle":"'+data_arr[k-1]+'"}';
}


var messageData = '{ "recipient" : { "id":'+recipientId+'}, "message":{ "attachment":{ "type":"template", "payload":{ "template_type":"generic", "elements":['+object_title+']}}}}';

messageData = JSON.parse(messageData);

// 초기화
data_title = new Array();
data_arr = new Array();
data_img_link = new Array();
data_count = 0;
data_check = 0;
  /*var messageData2 = {
  "recipient":{
    "id":recipientId
  },
  "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
           "title":data_title[0],
           "image_url":data_img_link[0],
           "subtitle":data_arr[0],

          },
          {
          "title":"Welcome to Peter\'s Hats",
          "image_url":"https://cdn.mirror.wiki/http://www.atweekly.com/news/photo/200804/9057_6699_369.jpg",
          "subtitle":"We\'ve got the right hat for everyone.",
          "default_action": {
            "type": "web_url",
            "url": "http://naver.com/",


          }

        },
        {
        "title":"Welcome to Peter\'s Hats",
        "image_url":"https://cdn.mirror.wiki/http://www.atweekly.com/news/photo/200804/9057_6699_369.jpg",
        "subtitle":"We\'ve got the right hat for everyone.",
        "default_action": {
          "type": "web_url",
          "url": "http://naver.com/",


        }

      }

        ]

      }
    }
  }
};*/
/*

{
 "title":"Welcome to Peter\'s Hats",
 "image_url":"https://cdn.mirror.wiki/http://www.atweekly.com/news/photo/200804/9057_6699_369.jpg",
 "subtitle":"We\'ve got the right hat for everyone.",
 "default_action": {
   "type": "web_url",
   "url": "http://naver.com/",


 }

},
{
"title":"Welcome to Peter\'s Hats",
"image_url":"https://cdn.mirror.wiki/http://www.atweekly.com/news/photo/200804/9057_6699_369.jpg",
"subtitle":"We\'ve got the right hat for everyone.",
"default_action": {
  "type": "web_url",
  "url": "http://naver.com/",


}

}


*/
     sendTypingOn(recipientId);
      callSendAPI(messageData);

  }





function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}
