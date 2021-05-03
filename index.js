const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { error } = require('firebase-functions/lib/logger');
const { firestore } = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const doneCount = 4;
const conferenceColor = "0xFFE65100";

exports.voteTrigger = functions.firestore.document('votes/{voteId}').onUpdate((change, context)=>{

    const val = change.after.data();
                  
                    if(Object.keys(val.voted).length === doneCount){
                        if(val.done){
                            let count = 0;
                            for (let [key, value] of Object.entries(val.voted)) {
                                if(value){
                                    count++;
                                }
                            }   
                            if(val.voteType === "award"){       
                                if(count === doneCount){        
                                    return db.collection('awards').doc().set({
                                            'awardDate' : val.voteData.awardDate,
                                            'name' : val.voteData.name,
                                            'awarded': val.voteData.awarded,
                                            'awardedId': val.voteData.awardedId,
                                            'location': val.voteData.location,
                                            'score': val.voteData.score,                   
                                        });                                
                                }
                                else{
                                const payload = {
                                        notification:{
                                            title: 'Nominierung Abgelehnt!',
                                            body:  'Abstimmung von '  + val.owner +' über die Nominierung von ' + val.voteData.awarded + ' wurde abgelehnt.',
                                            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                                        }
                                    };
                                
                                const options = {
                                    priority: 'high',
                                    contentAvailable: true,
                                    timeToLive: 60*60*24
                                };

                                    return admin.messaging().sendToTopic('voteMessageTrigger', payload, options).then((response)=>{
                                        console.log('Nachricht wurde gesendet',response);
                                        return response;
                                        }).catch((error)=>{
                                            console.log("Error beim versenden der Nachricht", error);
                                        });
                                }                               
                            }
                            if(val.voteType === "conference"){
                                if(count === doneCount){      
                                    
                                    let description = "Gastgeber: "+ val.voteData.owner + "\n" +
                                                     "Konferenzort: "+val.voteData.location + "\n" +
                                                     "Verpflegung: " + val.voteData.dinner + "\n" +
                                                     "Kleiderordnung: "+ val.voteData.dresscode +"\n"+
                                                     "Musikbeauftragter: "+ val.voteData.music + "\n"+
                                                     "Getränkebeauftragter: " +val.voteData.drink + "\n"+
                                                     "Genussmittelbeauftragter: " + val.voteData.smoke +"\n";

                                    return admin.database().ref("/events").push().set({
                                        'color': conferenceColor,
                                        'description': description,
                                        'from': val.voteData.from,
                                        'isAllDay': val.voteData.isAllDay,
                                        'owner': "BlyatApp",
                                        'recurrenceRule': val.voteData.recurrenceRule,
                                        'title': val.voteData.title,
                                        'to': val.voteData.to,
                                    })                             
                                }   
                                else{
                                    const payload = {
                                        notification:{
                                            title: 'Konferenztermin Abgelehnt!',
                                            body:  'Der von '+ val.owner + ' vorgeschlagene Konferenztermin wurde abgelehnt.',
                                            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                                        }
                                    };
                                
                                const options = {
                                    priority: 'high',
                                    contentAvailable: true,
                                    timeToLice: 60*60*24
                                };

                                    return admin.messaging().sendToTopic('voteMessageTrigger', payload, options).then((response)=>{
                                        console.log('Nachricht wurde gesendet',response);
                                        return response;
                                        }).catch((error)=>{
                                            console.log("Error beim versenden der Nachricht", error);
                                        });
                                }              
                                
                            }
                        }
                        if(!val.done){
                            let count = 0;
                            if(val.voteType === "award" || val.voteType === "conference"){   
                                for (let [key, value] of Object.entries(val.voted)) {
                                    if(value){
                                        count++;
                                    }
                                }
                                if(count === doneCount){ 
                                    return change.after.ref.update(
                                        {
                                            'done' : true,
                                        }
                                    );
                                } 
                                else{
                                    return change.after.ref.update(
                                        {
                                            'done' : true,
                                            'denied':true,
                                        }
                                    );
                                }
                            }   
                        } 
                    }  
                       
                return null;          
    });

exports.voteMessageTrigger = functions.firestore.document('votes/{voteId}').onCreate((snap, context) => {

    const value = snap.data();

    if(value.voteType === "award"){
        const payload = {
            notification:{
                title: 'Neue Abstimmung!',
                body:  value.owner + ' hat ' + value.voteData.awarded + ' für eine Auszeichnung nominiert.',
                clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            }
        };
    
    const options = {
        priority: 'high',
        contentAvailable: true,
        timeToLive: 60*60*24
    };

   return admin.messaging().sendToTopic('voteMessageTrigger', payload, options).then((response)=>{
   console.log('Nachricht wurde gesendet',response);
   return response;
   }).catch((error)=>{
       console.log("Error beim versenden der Nachricht", error);
   });
}

if(value.voteType === "conference"){
    const payload = {
        notification:{
            title: 'Neuer Konferenztermin!',
            body:  value.owner + ' hat einen neuen Konferenztermin vorgeschlagen.',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        }
    };

const options = {
    priority: 'high',
    contentAvailable: true,
    timeToLive: 60*60*24
};

return admin.messaging().sendToTopic('voteMessageTrigger', payload, options).then((response)=>{
console.log('Nachricht wurde gesendet',response);
return response;
}).catch((error)=>{
   console.log("Error beim versenden der Nachricht", error);
});
}


return null;

});   

exports.scoreUpdater = functions.firestore.document('awards/{awardId}').onCreate(async (snap, context) => {
    const value = snap.data();
    const userRef = db.collection('users').doc(value.awardedId);
    
   await db.runTransaction( async (transaction) =>{
            const restDoc = await transaction.get(userRef);
            
            const newScore = restDoc.data().score + value.score;

            transaction.update(userRef, {
                score: newScore
            });
    });
 });   

 exports.awardTrigger = functions.firestore.document('awards/{awardId}').onCreate((snap, context) => {
    const value = snap.data();

    const payload = {
        notification:{
            title: 'Neue Auszeichnung!',
            body:  value.awarded + ' hat die Auszeichnung: ' + value.name + ' erhalten.',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        }
    };

    const options = {
        priority: 'high',
        contentAvailable: true,
        timeToLive: 60*60*24
    };
   return admin.messaging().sendToTopic('eventTrigger', payload, options).then((response)=>{
   console.log('Nachricht wurde gesendet',response);
   return response;
   }).catch((error)=>{
       console.log("Error beim versenden der Nachricht", error);
   });
 });   



exports.eventTrigger = functions.database.ref(
'events/{eventId}'
).onCreate((snap, context) => {
    // Grab the current value of what was written to the Realtime Database.
   
    const value = snap.val();


    const payload = {
        notification:{
            title: 'Neues Blyat-Event!',
            body:  value.owner + ` hat ein neues Event erstellt. Manifesto Magnificat!`,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        }
    };

    const options = {
        priority: 'high',
        contentAvailable: true,
        timeToLive: 60*60*24
    };
   return admin.messaging().sendToTopic('eventTrigger', payload, options).then((response)=>{
   console.log('Nachricht wurde gesendet',response);
   return response;
   }).catch((error)=>{
       console.log("Error beim versenden der Nachricht", error);
   });
});



