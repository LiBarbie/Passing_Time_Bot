// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler,CardFactory,ActivityTypes, MessageFactory } = require('botbuilder');
const fs = require("fs");
const fs_dir = "./log";
let fs_path = fs_dir+"/diary";

const drinks = {
    "water" : "https://i.pinimg.com/originals/a2/c7/ba/a2c7bad51bf0fb1ccdcada8916d08774.gif",
    "coffee": "http://supacoffee.com/wp-content/uploads/2017/11/Supa_Coffee_Anim.gif",
    "soda" : "https://thumbs.gfycat.com/BewitchedAgreeableCricket-small.gif",
    "beer" : "https://mir-s3-cdn-cf.behance.net/project_modules/1400/6c9df071379043.5bc3ae398a894.gif",
    "sake" : "https://media1.tenor.com/images/312b2dc2910f6841d9ce23c18c6a03ac/tenor.gif",
    "tea" : "https://media1.tenor.com/images/4934a9c1f9713d966374bb0e4460f5f7/tenor.gif",
    "cocktail" : "https://thumbs.gfycat.com/KindheartedLeftAstrangiacoral-small.gif",
    "wine" : "https://66.media.tumblr.com/ce84f26a081c4a286f42e14a30ead133/tumblr_pvhnhn3fvc1vj2cado1_1280.gif",
    "cola" : "https://66.media.tumblr.com/98753caa208b8983dd022b973e59989b/tumblr_pv3boxpfhY1y6ld9uo2_500.gif",
    "juice" : "https://cdn.dribbble.com/users/1144520/screenshots/3515367/bebida-jugos-2_1.gif",
    "martini" : "https://media2.giphy.com/media/3JPdkGGWUMWANyrlTy/source.gif"
};

const salutation =  [
    "hello","greetings","salutations","good evening","good morning","aloha","hi","hola","sup","good afternoon","good day","hey","howdy","heya","bonjour"
];

const thanks = [
    "thankyou","thanks","thank you", "I appreciated that","You're kind"
];

class MyBot extends ActivityHandler {
    constructor() {
        super();
        //Gets the current date
        const date = this.get_this_date();
        fs_path = fs_path+date;

        //Writes - 0 : Not in writing or removing mode; 1 : The user's writing; 2 : The user wants to remove his page.
        let writes = 0;
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            //Context Flag - 0 : Context not found (or not found yet); 1 : Context found.
            let cntxt = 0;
            const mex = context.activity.text.toLocaleLowerCase();

            //Writing, Reading and Removing Session - Level 1
            //The user is currently writing on the log file.
            if(writes==1 && cntxt==0){
                fs.appendFile(fs_path, mex+"\n\n", function(err) {
                    if(err) {
                        return console.log(err);
                    }//if
                });//appendFile
                await context.sendActivity("\"Hope it helped you\"\n\n*takes the diary from your hand and puts it under the bar counter*");
                writes=0;
                cntxt=1;
            }//if-writes

            //The user wants to write in the log file.
            if(mex.includes("write") && writes==0 && cntxt==0){
                await context.sendActivity("*takes a diary from under the bar corner and lends it to you*\n\n\"Here's your diary, sir. Write everything's up on your mind.\"");
                writes=1;
                cntxt=1;
            }//if-wants-write

            if(mex.includes("read") && writes==0 && cntxt==0){
                await context.sendPages(context);
                cntxt=1;
            }//if-wants-read

            //The user wants to let the bot read his file
            if(mex.includes("read") && writes==0 && cntxt==0){
                await context.sendActivity("*Takes a diary from under the bar corner and opens it*\n\n\"I'll read your diary, sir, if you please.\"\n\n*clears throat*");
                fs.readFile(fs_path, 'utf8', function(err, contents) {
                    if(contents==undefined) contents="...";
                    context.sendActivity(contents+
                        "\n\n\"...Hope my interpretation was satisfying\"\n\n*puts the diary under the bar counter*");
                });//readfile
                await context.sendActivity("");
                cntxt=1;
            }//if-wants-read

            if(writes==2 && cntxt==0){
                if(mex.includes('yes')){
                    fs.unlink(fs_path, (err) => {
                        if (err) {
                        return console.error(err)
                        }
                        //file removed
                    })//unlink
                    await context.sendActivity("*tears the written page of the diary apart and puts the diary under the bar corner*\n\n\"Done sir. Anything else?\"");
                }//if-said-yes
                else{
                    await context.sendActivity("*puts the diary under the bar corner*\n\n\"I won't tear the written page apart, for now.\"");
                }//else-anything
                writes=0;
                cntxt =1;
            }

            //The user wants to delete his written page of the diary.
            if((mex.includes("remove") || mex.includes("delete")) && writes==0 && cntxt==0){
                await context.sendActivity("*takes the diary from under the bar corner and opens it*\n\n\"Are you sure you want me to tear this page apart, sir?\"");
                writes = 2;
                cntxt = 1;
            }//if-remove
            

            //Serving the user with the drink he asked for - Level 2
            if(this.getMex(drinks,mex) && writes==0 && cntxt==0){
                const drink = this.getMex(drinks,mex);
                await context.sendActivity({ attachments: [this.createAnimationCard(drinks[drink],drink)] });
                await context.sendActivity("\"Here's your "+drink+". Enjoy\"");
                cntxt = 1;
            }//if-asked-for-drink

            //Asking for a drink - Level 3
            if(mex.includes("drink")&&writes==0 && cntxt==0){
                await context.sendActivity("\"Which one, sir?\"");
                cntxt = 1;
            }//if-wants-drink


            //Greetings and Thanks - Level 4
            if(this.getMex(thanks,mex) && writes==0 && cntxt==0){
                await context.sendActivity("\"You're welcome.\"");
                cntxt=1;
            }//if-thanks

            if(this.getMex(salutation,mex) && writes==0 && cntxt==0){
                await context.sendActivity("\"Hello, sir. Can I take your order?\"");
                cntxt = 1;
            }//if-greetings

            //Didn't find any match - Level 0
            if(cntxt == 0 && writes==0){
                await context.sendActivity("\"We don't do that here. I'm sorry.\"");
            }//if

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                   await context.sendActivity('-*Play the video if you want to set the mood. Headphones required*-');
                   //await context.sendActivity({ attachments: [this.createVideoCard()] });
                   const reply = { type: ActivityTypes.Message };
                   reply.attachments = [this.getInlineAttachment()];
                   await context.sendActivity(reply);
                   await context.sendActivity("\"Welcome to the Feels Bar. Please take a seat if you want.\"");
                }
            }
            
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    getMex(array,mex){
        var flag = 0;
        var items = Object.keys(array)
        items.forEach(function(item){
            if(mex.includes(array[item]) || mex.includes(item)){
                flag = item;
            }
        });

        return flag;
    }//getMex

    getInlineAttachment() {
        return {
            name: 'Welcome to the Feels Bar. Please take a seat if you want.',
            contentType: 'video/mp4',
            contentUrl: 'https://www.youtube.com/watch?v=OGYwcPtDdFA'
        }
    }//getInlineAttachment
    
    createAnimationCard(urlDrink, drink) {
        return CardFactory.animationCard(
            `-*gives ${drink}*-`,
            [
                { url: urlDrink }
            ],
            [],
            {
                subtitle: ''
            }
        );
    }

    get_this_date(){
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();

        // prints date & time in YYYY-MM-DD format
        return (year + "-" + month + "-" + date);
    }//getDate()

    ifDate(mex){
        try{
            const mexDate = new Date(mex).toISOString();
            return mexDate;
        }
        catch(error){
            return false;
        }
    }//ifDate

    
    async sendPages(turnContext) {
        let reply;
        let array=[];
        fs.readdirSync(fs_dir).forEach(file => {
            file = file.replace("diary","");
            array.push(file);
        });
        reply = MessageFactory.suggestedActions(array,
        "*takes the diary from under the bar corner and opens it*\n\n\"Which page, sir?\"");
        await turnContext.sendActivity(reply);
    }//sendPages
}

module.exports.MyBot = MyBot;
