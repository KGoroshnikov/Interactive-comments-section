fetch('data.json')
    .then((response) => response.json())
    .then((json) => loadData(json));
var mydata = null;
function loadData(json){
  mydata = json;
  loadComments();
}

function auto_grow(element) {
  element.style.height = "0px";
  element.style.height = (element.scrollHeight) + "px";
}

var container = document.getElementById("comment-section");
var commentTemplate = document.getElementsByClassName("comment")[0];
var threademplate = document.getElementsByClassName("thread")[0];

var myInput = document.getElementsByClassName("write-section")[0];
var inputParent = undefined;
var input_unique = undefined;
var input_parent = undefined;

var deleteUI = document.getElementById("delete-ui-container");
var deleteID = undefined;

var allComments = [];
var itsReplies = [];

var currentUserName = "";
var ratedComments = [];

function loadComments(){
  currentUserName = mydata.currentUser.username;
  for(let i = 0; i < mydata.comments.length; i++){
    addComment(mydata.comments[i], false, undefined, undefined);
  }
  putInputSection(undefined, undefined, false);
}

function addComment(comData, mini, newThread, parentCommentId){
  if (!mini){ //create comment
    var newComment = commentTemplate.cloneNode(true);
    newComment.style.display = "flex";
    container.appendChild(newComment);
  }
  else{ //create thread
    var newComment = commentTemplate.cloneNode(true);
    newComment.className += " mini";
    newComment.style.display = "flex";
    newThread.appendChild(newComment);
    itsReplies[parentCommentId].push(newComment);
  }
  allComments.push(newComment);
  itsReplies.push([]);
  ratedComments.push(0);

  // set reply and unique id's
  let allBtns = newComment.querySelectorAll(".reply-btn");
  for(let i = 0; i < allBtns.length; i++){
    allBtns[i].setAttribute("data-unique", allComments.length - 1);

    if (parentCommentId == undefined){
      allBtns[i].setAttribute("data-text", allComments.length - 1);
    }
    else{
      allBtns[i].setAttribute("data-text", parentCommentId);
    }
  }

  newComment.querySelector('.send-btn').setAttribute("data-unique", allComments.length - 1);
  let upvotebtns = newComment.getElementsByClassName("upvote-btn");
  for(let i = 0; i < upvotebtns.length; i++) upvotebtns[i].setAttribute("data-unique", allComments.length - 1);

  // load data
  let content = newComment.querySelector(".comment-message-text");
  content.textContent = "";
  if (mini){
    content.innerHTML = "<span class='replied'>@" + comData.replyingTo +" </span>" + comData.content;
  }
  else{
    content.innerHTML = comData.content;
  }

  let createdAt = newComment.querySelector("#comment-person-date");
  createdAt.textContent = comData.createdAt;

  let score = newComment.querySelector(".upvote-score");
  score.textContent = comData.score;

  let userImg = newComment.querySelector("#comment-person-img");
  userImg.style.content = "url(" + comData.user.image.webp + ")";

  let username = newComment.querySelector("#comment-person-name");
  username.textContent = "";
  if (comData.user.username == currentUserName){
    newComment.querySelectorAll(".delete").forEach(element => {
      element.style.display = "flex";
    });
    newComment.querySelectorAll(".edit").forEach(element => {
      element.style.display = "flex";
    });
    newComment.querySelectorAll(".reply").forEach(element => {
      element.style.display = "none";
    });
    //newComment.querySelector(".delete").style.display = "flex";
    //newComment.querySelector(".edit").style.display = "flex";
    //newComment.querySelector(".reply").style.display = "none";
    username.innerHTML = comData.user.username + " <span class='you-text'>you</span>";
  }
  else{
    username.textContent = comData.user.username;
  }

  // check thread
  if (comData.replies && comData.replies.length != 0){
    var newThreadObj = threademplate.cloneNode(true);
    newThreadObj.style.display = "flex";
    container.appendChild(newThreadObj);
    let k = allComments.length - 1;
    itsReplies[k].push(newThreadObj);
    for(let i = 0; i < comData.replies.length; i++){
      addComment(comData.replies[i], true, newThreadObj, k);
    }
  }
}

function putInputSection(indx, objthread, isReply){
  myInput.style.display = "flex";

  if (indx == undefined){
    container.append(myInput);
  }
  else{
    inputParent.removeChild(myInput);
    container.insertBefore(myInput, container.childNodes[indx + 2]);
  }
  inputParent = container;

  if (objthread != undefined){
    objthread.append(myInput);
    inputParent = objthread;
  }
  else if (!isReply){
    input_unique = undefined;
    input_parent = undefined;
  }

  if (myInput.classList.contains("mini")){
    myInput.classList.remove('mini');
  }
}

function replyComment(com){
  input_unique = Number(com.dataset.unique);
  input_parent = Number(com.dataset.text);

  let lastId = itsReplies[Number(com.dataset.text)].length;
  putInputSection(Number(com.dataset.text) + lastId, itsReplies[com.dataset.text][0], true);

  if (lastId > 0){
    if (!myInput.classList.contains("mini")){
      myInput.className += " mini";
    }
  }
  else if (myInput.classList.contains("mini")){
    myInput.classList.remove('mini');
  }
}

function createReply(){
  let newReply = new Object();
  newReply.content = myInput.querySelector("textarea").value;
  if (newReply.content == "") return;
  newReply.createdAt = "now";
  newReply.score = 0;
  newReply.user = mydata.currentUser;
  if (input_unique != undefined){
    newReply.replyingTo = allComments[input_unique].querySelector("#comment-person-name").innerHTML;
  }

  console.log(input_parent, input_unique, inputParent);
  if (input_parent != undefined && itsReplies[input_parent].length == 0){
    var newThreadObj = threademplate.cloneNode(true);
    newThreadObj.style.display = "flex";
    container.insertBefore(newThreadObj, container.childNodes[input_parent + 2]);
    inputParent = newThreadObj;
    itsReplies[input_parent].push(newThreadObj);
  }

  addComment(newReply, input_parent != undefined, inputParent == container ? undefined : inputParent, input_parent);

  myInput.querySelector("textarea").value = "";
  putInputSection(undefined, undefined, false);
}

function openDeleteMenu(com){
  deleteID = Number(com.dataset.unique);
  deleteUI.style.display = "flex";
}
function closeDeleteMenu(){
  deleteID = undefined;
  deleteUI.style.display = "none";
}

function deleteComment(){
  allComments[deleteID].remove();
  //allComments.splice(deleteID, 1);
  //itsReplies.splice(deleteID, 1);
  closeDeleteMenu();
}

function editComment(com){
  let indx = Number(com.dataset.unique);
  allComments[indx].querySelector(".edit-container").style.display = "flex";
  let txt = "";
  if (allComments[indx].querySelector(".replied")){
    txt = allComments[indx].querySelector(".comment-message-text").textContent.replace(allComments[indx].querySelector(".replied").textContent, "");
  }
  else{
    txt = allComments[indx].querySelector(".comment-message-text").textContent;
  }
  allComments[indx].querySelector("textarea").value = txt;
  allComments[indx].querySelector(".comment-message").style.display = "none";
}

function updateMessage(com){
  let indx = Number(com.dataset.unique);
  allComments[indx].querySelector(".edit-container").style.display = "none";
  allComments[indx].querySelector(".comment-message").style.display = "block";
  
  let content = allComments[indx].querySelector(".comment-message-text");
  if (allComments[indx].querySelector(".replied")){
    let repSave = allComments[indx].querySelector(".replied").textContent;
    content.textContent = "";
    content.innerHTML = "<span class='replied'>" + repSave +"</span>" + allComments[indx].querySelector("textarea").value;
  }
  else{
    content.textContent = "";
    content.innerHTML = allComments[indx].querySelector("textarea").value;
  }
}

function rateComment(com, vote){
  let indx = Number(com.dataset.unique);
  if (ratedComments[indx] != 0) return;

  com.style.filter = "brightness(0) saturate(100%) invert(33%) sepia(76%) saturate(600%) hue-rotate(202deg) brightness(90%) contrast(88%)";

  ratedComments[indx] = vote;
  let currentScore = Number(allComments[indx].querySelector(".upvote-score").innerHTML);
  allComments[indx].querySelector(".upvote-score").textContent = currentScore + vote;
}