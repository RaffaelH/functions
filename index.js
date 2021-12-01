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
    const insertDate = val.insertDate;

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
                                        },
                                        apns:{
                                            payload: {
                                                aps:{
                                                    sound: 'default',
                                                }
                                            }
                                           
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

                                  //type award
                                  if(val.voteType === "court"){       
                                    if(count === doneCount){  
                                     
                                        
                                        return db.collection('court').doc().set({
                                                'witnessId' : val.voteData.witnessId,
                                                'witnessName' : val.voteData.witnessName,
                                                'lawyerName': val.voteData.lawyerName,
                                                'accusedId': val.voteData.accusedId,
                                                'accusedName': val.voteData.accusedName,
                                                'judgeId':val.voteData.judgeId,
                                                'judgeName': val.voteData.judgeName,
                                                'location': val.voteData.location,   
                                                'paragraph': val.voteData.paragraph,   
                                                'courtReason': val.voteData.courtReason,   
                                                'offenseDate': val.voteData.offenseDate, 
                                                'markedFormalMistake': val.voteData.markedFormalMistake,  
                                                'running': val.voteData.running,  
                                                'doneLawsuit': val.voteData.doneLawsuit,  
                                                'deniedLawsuit': val.voteData.deniedLawsuit,    
                                                'score': val.voteData.score,
                                                'judgment': val.voteData.judgment,
                                                'judgmentDate': val.voteData.judgmentDate,
                                                'jonasCount': val.voteData.jonasCount,
                                                'judgmentReason': val.voteData.judgmentReason,
                                                'insertDate' : insertDate,
                                                'deniedByOwner' : val.voteData.deniedByOwner,
                                            });                                
                                    }
                                    else{
                                    const payload = {
                                            notification:{
                                                title: 'Nominierung Abgelehnt!',
                                                body:  'Abstimmung von '  + val.owner +' über die Nominierung von ' + val.voteData.awarded + ' wurde abgelehnt.',
                                                clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                                            }, apns:{
                                                payload: {
                                                    aps:{
                                                        sound: 'default',
                                                    }
                                                }
                                               
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
                                        }, apns:{
                                            payload: {
                                                aps:{
                                                    sound: 'default',
                                                }
                                            }
                                           
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
                                        }, apns:{
                                            payload: {
                                                aps:{
                                                    sound: 'default',
                                                }
                                            }
                                           
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
                                        }, apns:{
                                            payload: {
                                                aps:{
                                                    sound: 'default',
                                                }
                                            }
                                           
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

                                console.log(1);

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

                

                        }

                        //continue here when vote is done
                        if(!val.done){
                            let count = 0;
                            
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
                   
                        return null;                       
                         
                  
    });


 exports.voteEventTrigger = functions.firestore.document('votes/{voteId}').onCreate((snap, context) => {
    
    const val = snap.data();
  
    if(val.voteType === "vacation"){
   return admin.database().ref("/events").push().set({
        'color': val.voteData.color,
        'description': val.voteData.description,
        'from': val.voteData.from,
        'isAllDay': val.voteData.isAllDay,
        'owner': val.voteData.owner,
        'recurrenceRule': val.voteData.recurrenceRule,
        'title': val.voteData.title,
        'to': val.voteData.to,
    })   
}
if(val.voteType === "workload"){
    return admin.database().ref("/events").push().set({
         'color': val.voteData.color,
         'description': val.voteData.description,
         'from': val.voteData.from,
         'isAllDay': val.voteData.isAllDay,
         'owner': val.voteData.owner,
         'recurrenceRule': val.voteData.recurrenceRule,
         'title': val.voteData.title,
         'to': val.voteData.to,
     })   
 }
else{
    return null;
} 

 })   

/* sends notification when Object is created in Collection Vote */
exports.voteMessageTrigger = functions.firestore.document('votes/{voteId}').onCreate((snap, context) => {

    const value = snap.data();


    if(value.voteType === "court"){
        const payload = {
            notification:{
                title: 'Neue Klage!',
                body:  value.owner + ' hat Anklage gegen ' + value.voteData.accusedName + ' erhoben.',
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





/* court onCreate()*/

exports.courtNotificationTrigger = functions.firestore.document('court/{courtId}').onCreate((snap, context) => {
    const value = snap.data();

    const payload = {
        notification:{
            title: 'Neues Offenes Gerichtsverfahren!',
            body:  "Es wurde ein neues Gerichtsverfahren gegen "+ value.accusedName +" eröffnet.",
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



exports.courtUpdateJudgmentTrigger = functions.firestore.document('court/{courtId}').onUpdate(async(change,context)=>{
    const value = change.after.data();
        
    if(value.doneLawsuit && (!value.deniedLawsuit && !value.deniedByOwner)){


        const userRef = db.collection('users').doc(value.accusedId);
       
      await db.runTransaction( async (transaction) =>{
               const restDoc = await transaction.get(userRef);
               
               const newScore = restDoc.data().score - value.score;
   
               transaction.update(userRef, {
                   score: newScore
               });
       });
   
       await db.runTransaction( async (transaction) =>{
           const restDoc = await transaction.get(userRef);
           
           const newjCount = restDoc.data().jonasCount + value.jonasCount;
   
           transaction.update(userRef, {
               jonasCount: newjCount
           });
   });
       }

           return null;
    

});



exports.courtUpdateNotificationTrigger = functions.firestore.document('court/{courtId}').onUpdate( (change, context) => {
    const value = change.after.data();

    //case1: doneLawsuit = true; deniedByOwner = true => closed by lawyer
        //-> FCM 

    //case2: doneLawsuit = true; deniedLawsuit = true => closed by judge
        //-> FCM + transaction -> UserTable
    
    //doneLawsuit => true => case closed
    if(value.doneLawsuit && value.deniedByOwner){
        const payload = {
            notification:{
                title: 'Klage fallen gelassen!',
                body:  "Die Klage von "+ value.lawyerName+ " an "+ value.accusedName +" wurde zurückgezogen.",
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
    }


    if(value.doneLawsuit && value.deniedLawsuit){
        const payload = {
            notification:{
                title: 'Freispruch!',
                body:  "Der ehrenwerte Richter "+ value.judgeName + " hat " +  value.accusedName +" freigesprochen.",
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
    }
    if(value.doneLawsuit && (!value.deniedLawsuit && !value.deniedByOwner)){

        const payload = {
            notification:{
                title: 'Urteil gefällt!',
                body:  "Der ehrenwerte Richter "+ value.judgeName + " hat " +  value.accusedName +" verurteilt.",
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

    }

    if(value.markedFormalMistake){
        const payload = {
            notification:{
                title: 'Formfehler einer Klage gemeldet!',
                body:  "Die Klage von "+ value.lawyerName+ " an "+ value.accusedName +" wurde mit einem Formfehler markiert.",
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
    }

    if(value.deniedLawsuit){
        const payload = {
            notification:{
                title: 'Klage zurückgezogen!',
                body:  "Die Klage von "+ value.lawyerName+ " an "+ value.accusedName +" wurde vom Kläger zurückgezogen.",
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
    }
    else{
        return null;
       }

 });   




