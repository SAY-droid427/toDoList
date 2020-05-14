const express=require("express");
const app=express();
const mongoose=require("mongoose");
const bodyParser=require('body-parser');
const ejs=require('ejs');
app.use(express.static("public"));
app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB",{useUnifiedTopology:true});
const itemsSchema={
    name:String
};
const Item=mongoose.model("Item",itemsSchema);
const activity1 =new Item({
    name:"Welcome to the toDo List"
});
const activity2=new Item({
    name:"Hit the + button to add more items"
});
const activity3=new Item({
    name:"Click on the checkbox to delete the items"
});
const defaultItems=[activity1,activity2,activity3];
const listSchema={
    name:String,
    items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);
app.use(bodyParser.urlencoded({extended:true}));
app.post("/",function(req,res){
    const itemName=req.body.Input;
    const listName=req.body.list;
    const item=new Item({
        name:itemName
    });
    if(listName==="Today"){
        item.save(); 
    res.redirect("/"); 
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
   

});
app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today")
    {
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
            console.log("Successfully removed");
            res.redirect("/");
            }
         });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,found){
            if(!err)
            res.redirect("/"+listName);
        })
    }
    
});
app.get("/:customListName",function(req,res){
    const customListName=req.params.customListName;
    List.findOne({name:customListName},function(err,found){
        if(!err)
        {
            if(!found)
            {
                //Create new List
                const list=new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                //Show an existing list
                res.render("list",{Date:found.name,newItems:found.items})
            }
        }
    })
})
app.get("/",function(req,res){
    
    Item.find({},function(err,results){
        if(results.length===0)
        {
            Item.insertMany(defaultItems,function(err){
                if(err)
                console.log(err);
                else
                console.log("Success");
            });
            res.redirect("/");
        }
        else{
            res.render("list",{Date:"Today",newItems:results});

        }
       
    });
   
})
app.listen(3000,()=>console.log("Server running successfully at port 3000"));