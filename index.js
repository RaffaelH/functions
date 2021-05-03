const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { error } = require('firebase-functions/lib/logger');
const { firestore } = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const doneCount = 4;
const conferenceColor = "0xFFE65100";

/**vote methode counts when collection is updated */
exports.voteTrigger = functions.firestore.document('votes/{voteId}').onUpdate((change, context)=>{

    const val = change.after.data();
                  //Count the Votes
                    if(Object.keys(val.voted).length === doneCount){
                        if(val.done){
                            let count = 0;
                            for (let [key, value] of Object.entries(val.voted)) {
                                if(value){
                                    count++;
                                }
                            }   

                            //type award
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

                            //type conference
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

                            //type other
                            if(val.voteType === "other"){
                                
                                if(count === doneCount){  

                                    const payload = {
                                        notification:{
                                            title: 'Außerordentliche Abstimmung genehmigt!',
                                            body:  'Die Abstimmung von '+ val.owner + ': '+ val.voteData.name+ ' wurde genehmigt!',
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
                                else{
                                    const payload = {
                                        notification:{
                                            title: 'Außerordentliche Abstimmung Abgelehnt!',
                                            body:  'Die Abstimmung von '+ val.owner + ': '+ val.voteData.name+ ' wurde abgelehnt!',
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

                            //type save
                            if(val.voteType === "save"){

                                if(count === doneCount){  

                                    const payload = {
                                        notification:{
                                            title: 'Schonungsantrag genehmigt!',
                                            body:  'Der Schonungsantrag von '+ val.owner + ': '+ val.voteData.reason+ ' wurde genehmigt!',
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
                                else{

                                    const payload = {
                                        notification:{
                                            title: 'Schonungsantrag abgelehnt!',
                                            body:  'Der Schonungsantrag von '+ val.owner + ': '+ val.voteData.reason+ ' wurde abgelehnt!',
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

                            //type workload
                            if(val.voteType === "workload"){
                                
                                if(count === doneCount){  
                                    return admin.database().ref("/events").push().set({
                                        'color': val.voteData.color,
                                        'description': val.voteData.reason,
                                        'from': val.voteData.from,
                                        'isAllDay': val.voteData.isAllDay,
                                        'owner': val.voteData.owner,
                                        'recurrenceRule': val.voteData.recurrenceRule,
                                        'title': val.voteData.title,
                                        'to': val.voteData.to,
                                    })    
                                }
                                else{

                                    const payload = {
                                        notification:{
                                            title: 'Antrag abgelehnt!',
                                            body:  'Antrag auf Zeitraum höherer Belastung von '+ val.owner + ' wurde abgelehnt!',
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

                            //type vacation
                            if(val.voteType === "vacation"){

                                if(count === doneCount){
                                    return admin.database().ref("/events").push().set({
                                        'color': val.voteData.color,
                                        'description': val.voteData.reason,
                                        'from': val.voteData.from,
                                        'isAllDay': val.voteData.isAllDay,
                                        'owner': val.voteData.owner,
                                        'recurrenceRule': val.voteData.recurrenceRule,
                                        'title': val.voteData.title,
                                        'to': val.voteData.to,
                                    })    
                                }
                                else{

                                    const payload = {
                                        notification:{
                                            title: 'Reisezeitraum abgelehnt!',
                                            body:  'Antrag auf Reisezeit von '+ val.owner + ' wurde abgelehnt!',
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


                        }

                        //continue here when vote is done
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

/* sends notification when Object is created in Collection Vote */
exports.voteMessageTrigger = functions.firestore.document('votes/{voteId}').onCreate((snap, context) => {

    const value = snap.data();

    // type award
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

// type conference
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

// type other
if(value.voteType === "other"){
    const payload = {
        notification:{
            title: 'Neue außerorderntliche Abstimmung!',
            body:  value.owner + ' hat eine außerordentliche Abstimmung eingereicht.',
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

//type workload
if(value.voteType === "workload"){
    const payload = {
        notification:{
            title: 'Neuer Antrag!',
            body:  value.owner + ' beantragt einen Zeitraum höherer Belastung.',
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

// type vacation
if(value.voteType === "vacation"){
    const payload = {
        notification:{
            title: 'Neuer Antrag!',
            body:  value.owner + ' beantragt einen Reisezeitraum.',
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

if(value.voteType === "save"){
    const payload = {
        notification:{
            title: 'Neuer Antrag!',
            body:  value.owner + ' beantragt Schonung zu gegebener Konferenz.',
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



