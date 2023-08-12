import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://admin_prem:Test123@cluster0.a72dc1s.mongodb.net/todoDB');
  const itemsSchema = new mongoose.Schema({
    name:String
  });

  const Item = mongoose.model("item",itemsSchema);

  const item1 = new Item({
    name:"python"
  });
  const item2 = new Item({
    name:"java"
  });
  const item3 = new Item({
    name:"c"
  });
  const defaultItems=[item1,item2,item3];
  //await Item.insertMany(defaultItems);

  const listSchema = new mongoose.Schema({
    name:String,
    items:[itemsSchema]
  });

  const List = mongoose.model("List",listSchema);

let workList=[];
app.get("/",function(req,res){
  Item.find()
  .then(function(ele){
    if(ele.length===0){
      Item.insertMany(defaultItems);
      ele=defaultItems;
    }
    res.render("home.ejs",{title:"today",items:ele});

  })
  .catch(function(err){
    console.log(err);
  });


});

app.get("/:cusName",function(req,res){
  const cusName = _.capitalize(req.params.cusName);
  List.findOne({name:cusName})
  .then(function(foundList){

      if(!foundList){
        const list = new List({
          name: cusName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+cusName);
      }else{
        res.render("home.ejs",{title:cusName,items:foundList.items})
      }
  })
  .catch(function(err){
    console.log(err);
  });

});



app.post("/",function(req,res){
  const a = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: a
  });
  if(listName=="today"){
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});



app.post("/work",function(req,res){
  const b = req.body.newItem;
  workList.push(b);
  res.redirect("/work");
});


app.post("/delete",function(req,res){
  const reItem = req.body.checkbox;
  const listName = req.body.listName;
  console.log(req.body.listname);

  if(listName=="today"){
    Item.findByIdAndRemove(reItem).exec();
    res.redirect("/");
  } else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:reItem}}})
    .then(function(foundList){
      res.redirect("/"+listName);
    })
  }
});

}

app.listen(port,function(){
  console.log('listening at port ${port}');
});
