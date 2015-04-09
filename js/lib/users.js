var User = function User(email, name, space){
    this.email = email;
    this.name = name;
    this.space = space;
}

var Space = function Space(id, name, subSpace){
    this.id = id;
    this.name = name;
    this.subSpace = subSpace;
}

var userList = [];
var user1_spaceList = [];
var user1_space1 = new Space('space_1','Thesis',[]);
var user1_space2 = new Space('space_2','Conference',[]);
var user1_space3 = new Space('space_3','Something Fun',[]);
var user1_space4 = new Space('space_4','Self',[]);
user1_spaceList.push(user1_space1,user1_space2,user1_space3,user1_space4);
var user1 = new User('welcome.easymail@gmail.com','EasyMail',user1_spaceList);
userList.push(user1);

define(function () {
    return function getUser() {
        return user1;
    };
});