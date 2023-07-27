const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shubham:Shubham123@cluster0.b89f86u.mongodb.net/todolistDB");

const itemSchema ={
  name:String
} 

const listSchema ={
  name:String,
  items:[]
}
const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);


const item1 = new Item({
  name: "Welcome to your todo list"
})

const item2 = new Item({
  name:"To add new item please click on + button"
})

const item3 = new Item({
  name:"<-- click to delete the item"
})

const defaultitem = [item1,item2,item3];



  
app.get("/", function(req, res) {
  Item.find()
    .then(function (founditems) {
      if(founditems.length===0){
        Item.insertMany(defaultitem)
          .then(function (items) {
            console.log("Done")
          })
          .catch(function (err) {
            console.log(err)
          })
      }
      res.render("list", { listTitle: "Today", newListItems: founditems });
      // console.log(founditems)
    })
    .catch(function (err) {
      console.log(err)
    })
});


app.get("/:customeListName",function(req,res){
  // console.log("Name of Custome list : "+req.params.customeListName);
  const customListName = _.capitalize(req.params.customeListName);

  List.findOne({name:customListName})
    .then(function(founditem){
      if(!founditem){ //check for founditem is already present or not
        // console.log("Not found")
        const list = new List({
          name: customListName,
          items: defaultitem
        })
        list.save();
        res.redirect("/"+customListName)
        
      }else{
        // console.log("found")
        res.render("list", { listTitle:customListName, newListItems: founditem.items })
      }
      
    })
    .catch(function(err){
      console.log("err")
    })
  
})

app.post("/delete", function(req,res){
  console.log("id: "+req.body.checkbox);

  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.nameOfItemToDelete;

  // console.log(nameOfItemToDelete)
  console.log("hello: "+listName);

  if (listName==="Today"){
    Item.findOneAndDelete(checkedItemId)
      .then(function (item) {
        res.redirect("/")
        console.log("item is deleted")
      })
      .catch(function (err) {
        res.redirect("/")
        console.log("err while deleteing")
      })
  }
  else{
    //we need to use $Pull method to delete this and Model.findOneAndUpdate method helps us
    console.log("entered the else")
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId }  } })
      .then(function(foundlist){
        console.log(foundlist)
        
        res.redirect("/"+listName)
      })
  }
  
})

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;

  let useritem = Item({
    name: item
  })
  if(listName==="Today"){
    //saving to database
    useritem.save()
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
      .then(function(foundList){
        foundList.items.push(useritem);
        foundList.save();
        res.redirect("/"+ listName);
      })
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});
