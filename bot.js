// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler,CardFactory,ActivityTypes } = require('botbuilder');
const fs = require("fs");

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
    "hello","greetings","salutations","good evening","good morning","aloha","hi","sup","good afternoon","good day","hey","howdy","heya","bonjour"
];

const thanks = [
    "thankyou","thanks","thank you", "I appreciated that","You're kind"
];

class MyBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            let cntxt = 0;
            console.log(cntxt);
            const mex = context.activity.text.toLocaleLowerCase();

            if(mex.includes("drink")&&cntxt==0){
                await context.sendActivity("\"Which one, sir?\"");
                cntxt = 1;
            }//if

            //The user wants to write in the log file.
            if(cntxt==2){
                fs.writeFile("./log/diary", mex, function(err) {
                    if(err) {
                        return console.log(err);
                    }//if
                });
                
                await context.sendActivity("\"Hope it helped you\" *takes diary from your hand and put it under the bar counter*");
                
                cntxt=1;
            }

            if(mex.includes("write")&&cntxt==0){
                await context.sendActivity("\"Here's your log file, sir. Write everything's up on your mind.\"");
                cntxt=2;
            }
            
            if(mex.includes("read")&&cntxt==0){
                let con;
                await context.sendActivity("\"I'll read your diary, sir, if you please.\" *clears throat");
                fs.readFile('DATA', 'utf8', function(err, contents) {
                   con = contents;
                });
                await context.sendActivity(con);
            }//if

            if(this.getMex(drinks,mex)&&cntxt==0){
                const drink = this.getMex(drinks,mex);
                await context.sendActivity({ attachments: [this.createAnimationCard(drinks[drink],drink)] });
                await context.sendActivity("\"Here's your "+drink+". Enjoy\"");
                cntxt = 1;
            }

            if(this.getMex(salutation,mex)&&cntxt==0){
                await context.sendActivity("\"Hello, sir. Can I take your order?\"");
                cntxt = 1;
            }

            if(this.getMex(thanks,mex)&&cntxt==0){
                await context.sendActivity("\"You're welcome.\"");
                cntxt=1;
            }//if

            if(cntxt == 0){
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
}

module.exports.MyBot = MyBot;
